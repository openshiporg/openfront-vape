-- Record invariants the app relies on, backed in the database so no writer (dashboard, Admin UI,
-- raw GraphQL, scripts) can break them. Production data was checked for violations first: none.

-- Order numbers: checkout draws from this sequence instead of stamping unix seconds, which two
-- checkouts in the same second could share. Start above every existing number so none is reused.
CREATE SEQUENCE "Order_displayId_seq" AS integer OWNED BY "Order"."displayId";
SELECT setval('"Order_displayId_seq"', GREATEST(COALESCE((SELECT MAX("displayId") FROM "Order"), 0), 1000));
CREATE UNIQUE INDEX "Order_displayId_key" ON "Order"("displayId");

-- Checkout posts account orders to the user's single active business account (take: 1).
CREATE UNIQUE INDEX "Account_single_active_business_key" ON "Account"("user")
  WHERE "accountType" = 'business' AND "status" = 'active' AND "user" IS NOT NULL;

-- Stock: only a backorder-enabled variant may go below zero.
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_inventory_nonnegative_check"
  CHECK ("inventoryQuantity" >= 0 OR "allowBackorder" OR NOT "manageInventory");
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_specs_nonnegative_check"
  CHECK (("batteryCapacityMah" IS NULL OR "batteryCapacityMah" >= 0) AND ("variantRank" IS NULL OR "variantRank" >= 0));

-- Prices and quantities.
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_amounts_nonnegative_check"
  CHECK ("amount" >= 0 AND ("compareAmount" IS NULL OR "compareAmount" >= 0));
ALTER TABLE "MoneyAmount" ADD CONSTRAINT "MoneyAmount_quantity_range_check"
  CHECK (("minQuantity" IS NULL OR "minQuantity" >= 1) AND ("maxQuantity" IS NULL OR "maxQuantity" >= 1)
    AND ("minQuantity" IS NULL OR "maxQuantity" IS NULL OR "maxQuantity" >= "minQuantity"));
ALTER TABLE "OrderMoneyAmount" ADD CONSTRAINT "OrderMoneyAmount_amounts_nonnegative_check"
  CHECK ("amount" >= 0 AND "originalAmount" >= 0);
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_quantity_positive_check" CHECK ("quantity" > 0);
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_quantity_positive_check" CHECK ("quantity" > 0);
ALTER TABLE "ShippingOption" ADD CONSTRAINT "ShippingOption_amount_nonnegative_check" CHECK ("amount" IS NULL OR "amount" >= 0);
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_price_nonnegative_check" CHECK ("price" >= 0);

-- Tax rates are fractions (0.08 = 8%).
ALTER TABLE "Region" ADD CONSTRAINT "Region_taxRate_fraction_check" CHECK ("taxRate" IS NULL OR ("taxRate" >= 0 AND "taxRate" <= 1));
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_rate_fraction_check" CHECK ("rate" IS NULL OR ("rate" >= 0 AND "rate" <= 1));
ALTER TABLE "Order" ADD CONSTRAINT "Order_taxRate_fraction_check" CHECK ("taxRate" IS NULL OR ("taxRate" >= 0 AND "taxRate" <= 1));

-- Discounts: usage never exceeds the cap, windows run forwards, percentages stay within 100.
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_usage_within_limit_check"
  CHECK ("usageCount" >= 0 AND ("usageLimit" IS NULL OR ("usageLimit" >= 0 AND "usageCount" <= "usageLimit")));
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_window_order_check" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");
ALTER TABLE "DiscountRule" ADD CONSTRAINT "DiscountRule_value_range_check"
  CHECK ("value" >= 0 AND ("type" <> 'percentage' OR "value" <= 100));

-- Gift cards.
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_balance_within_value_check" CHECK ("value" >= 0 AND "balance" >= 0 AND "balance" <= "value");
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_amount_positive_check" CHECK ("amount" > 0);

-- Payments, refunds and returns: never refund more than was captured.
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_refund_within_amount_check"
  CHECK ("amount" >= 0 AND "amountRefunded" >= 0 AND "amountRefunded" <= "amount");
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_amount_positive_check" CHECK ("amount" > 0);
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_amount_nonnegative_check" CHECK ("amount" >= 0);
ALTER TABLE "Return" ADD CONSTRAINT "Return_refundAmount_nonnegative_check" CHECK ("refundAmount" >= 0);
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_quantities_check"
  CHECK ("quantity" > 0 AND ("requestedQuantity" IS NULL OR "requestedQuantity" >= 0) AND ("receivedQuantity" IS NULL OR "receivedQuantity" >= 0));

-- Business account ledger.
ALTER TABLE "Account" ADD CONSTRAINT "Account_amounts_nonnegative_check"
  CHECK ("creditLimit" >= 0 AND ("totalAmount" IS NULL OR "totalAmount" >= 0) AND ("paidAmount" IS NULL OR "paidAmount" >= 0));
ALTER TABLE "AccountLineItem" ADD CONSTRAINT "AccountLineItem_amounts_nonnegative_check" CHECK ("amount" >= 0 AND "itemCount" >= 0);
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_totalAmount_nonnegative_check" CHECK ("totalAmount" >= 0);
