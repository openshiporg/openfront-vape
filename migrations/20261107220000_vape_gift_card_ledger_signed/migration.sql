-- The gift card ledger is signed (redemptions negative, refund credits positive): a row must move value, so never zero.
ALTER TABLE "GiftCardTransaction" DROP CONSTRAINT "GiftCardTransaction_amount_positive_check";
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_amount_nonzero_check" CHECK ("amount" <> 0);
