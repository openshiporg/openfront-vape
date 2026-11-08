-- Money invariants the checkout relies on, backed in the database (review r2, 2026-11-08). Every predicate was
-- run read-only against production first: 0 duplicate intents on Payment, 0 refunded > amount, 0 gift cards out
-- of range or off their ledger (balance = value + ledger - open holds), 0 duplicate reversal rows. The only open
-- orders without held money were 1793953737 and 1793953738, the review's finding 1, which the reconcile path cancels.

-- 1. One Payment per processor intent: a charge backs at most one order.
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment" ((data->>'paymentIntentId'))
  WHERE data->>'paymentIntentId' IS NOT NULL AND data->>'paymentIntentId' <> '';

-- 2. An intent the checkout refunded on its own is on the auto-refund ledger (IdempotencyKey "auto-refund:<id>").
--    No captured Payment and no new or re-pointed payment session may reference it: an order exists only when its
--    money is held.
CREATE FUNCTION vape_refuse_auto_refunded_intent() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE intent text := COALESCE(NULLIF(NEW.data->>'paymentIntentId', ''), split_part(NEW.data->>'clientSecret', '_secret_', 1));
BEGIN
  IF intent IS NULL OR intent = '' THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'Payment' THEN
    IF NEW.status::text <> 'captured' THEN RETURN NEW; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- an existing session keeps its own (spent) intent; only pointing a session at one is refused
    IF COALESCE(NULLIF(OLD.data->>'paymentIntentId', ''), split_part(OLD.data->>'clientSecret', '_secret_', 1)) = intent THEN
      RETURN NEW;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM "IdempotencyKey" WHERE "idempotencyKey" = 'auto-refund:' || intent) THEN
    RAISE EXCEPTION 'Payment % was refunded automatically and cannot back an order or a new payment session', intent
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Payment_refuse_auto_refunded_intent" BEFORE INSERT OR UPDATE OF status, data ON "Payment"
  FOR EACH ROW EXECUTE FUNCTION vape_refuse_auto_refunded_intent();
CREATE TRIGGER "PaymentSession_refuse_auto_refunded_intent" BEFORE INSERT OR UPDATE OF data ON "PaymentSession"
  FOR EACH ROW EXECUTE FUNCTION vape_refuse_auto_refunded_intent();

-- 3. Recorded refunds never exceed the payment ("Payment_refund_within_amount_check" already bounds amountRefunded).
CREATE FUNCTION vape_refunds_within_payment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE total int; cap int;
BEGIN
  IF NEW.payment IS NULL THEN RETURN NEW; END IF;
  SELECT amount INTO cap FROM "Payment" WHERE id = NEW.payment FOR UPDATE;
  SELECT COALESCE(SUM(amount), 0) INTO total FROM "Refund" WHERE payment = NEW.payment AND id <> NEW.id;
  IF total + NEW.amount > cap THEN
    RAISE EXCEPTION 'Refunds on payment % would exceed its amount', NEW.payment USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Refund_within_payment" BEFORE INSERT OR UPDATE OF amount, payment ON "Refund"
  FOR EACH ROW EXECUTE FUNCTION vape_refunds_within_payment();

-- 4. Gift cards: balance = value + signed ledger - open checkout holds, after every statement that moves either.
--    ("GiftCard_balance_within_value_check" already keeps 0 <= balance <= value.) Deferred to commit, because a
--    redemption debits the balance in the hold step and writes its ledger row when the order commits.
CREATE FUNCTION vape_gift_card_ledger_balanced() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE card text; expected int; actual int;
BEGIN
  IF TG_TABLE_NAME = 'GiftCard' THEN
    card := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    card := OLD."giftCard";
  ELSE
    card := NEW."giftCard";
  END IF;
  IF card IS NULL THEN RETURN NULL; END IF;
  SELECT g.value + COALESCE((SELECT SUM(t.amount) FROM "GiftCardTransaction" t WHERE t."giftCard" = g.id), 0)
         - COALESCE((SELECT SUM((e->>'amount')::int) FROM "IdempotencyKey" k, jsonb_array_elements(k."responseBody"->'applied') e
                     WHERE k."idempotencyKey" LIKE 'giftcard-hold:%' AND k."recoveryPoint" = 'held' AND e->>'id' = g.id), 0),
         g.balance
    INTO expected, actual FROM "GiftCard" g WHERE g.id = card;
  IF actual IS NOT NULL AND actual <> expected THEN
    RAISE EXCEPTION 'Gift card % balance % is off its ledger (expected %)', card, actual, expected USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER "GiftCard_ledger_balanced" AFTER INSERT OR UPDATE OF balance, value ON "GiftCard"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION vape_gift_card_ledger_balanced();
CREATE CONSTRAINT TRIGGER "GiftCardTransaction_ledger_balanced" AFTER INSERT OR UPDATE OR DELETE ON "GiftCardTransaction"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION vape_gift_card_ledger_balanced();

-- 5. Tax quotes: a committed quote never changes except to be reversed in place by the stale-cart path (which
--    records the acknowledgement) or bound to its order at checkout. Reversal rows are unique per order and reference.
CREATE FUNCTION vape_committed_tax_quote_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Committed tax quote % cannot be deleted', OLD.id USING ERRCODE = 'check_violation';
  END IF;
  IF (OLD."salesTaxAmount", OLD."exciseTaxAmount", OLD."localFeeAmount", OLD."currencyCode", OLD."providerReference",
      OLD."providerCode", OLD."evidenceDigest", OLD."committedAt", OLD."idempotencyKey")
     IS DISTINCT FROM
     (NEW."salesTaxAmount", NEW."exciseTaxAmount", NEW."localFeeAmount", NEW."currencyCode", NEW."providerReference",
      NEW."providerCode", NEW."evidenceDigest", NEW."committedAt", NEW."idempotencyKey")
     -- Links only go from unset to set (binding) or to NULL (ON DELETE SET NULL of the parent row).
     OR (NEW.cart IS NOT NULL AND NEW.cart IS DISTINCT FROM OLD.cart)
     OR (NEW.jurisdiction IS NOT NULL AND NEW.jurisdiction IS DISTINCT FROM OLD.jurisdiction)
     OR (OLD."order" IS NOT NULL AND NEW."order" IS NOT NULL AND NEW."order" IS DISTINCT FROM OLD."order")
     OR (NEW.status::text <> OLD.status::text AND NOT (NEW.status::text = 'reversed' AND OLD."order" IS NULL AND NEW."reversalReference" <> '')) THEN
    RAISE EXCEPTION 'Committed tax quote % is immutable', OLD.id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "RegulatedTaxQuote_committed_immutable" BEFORE UPDATE OR DELETE ON "RegulatedTaxQuote"
  FOR EACH ROW WHEN (OLD.status::text = 'committed') EXECUTE FUNCTION vape_committed_tax_quote_immutable();
CREATE UNIQUE INDEX "RegulatedTaxQuote_order_reversal_key" ON "RegulatedTaxQuote" ("order", "providerReference")
  WHERE status = 'reversed' AND "order" IS NOT NULL;
