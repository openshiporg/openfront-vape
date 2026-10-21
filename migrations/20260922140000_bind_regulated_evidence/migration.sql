-- Expand-only: preserve every existing record. Blank legacy fingerprints remain
-- deliberately ineligible; no historical age, tax or carrier authority is invented.
-- Generated from the Keystone schema against a disposable migration replay.
-- Unrelated canonical join-table unique-index/primary-key drift is excluded.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE "Cart" ADD COLUMN "complianceRevision" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AgeVerificationAttempt" ADD COLUMN "cartFingerprint" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CarrierEligibilityDecision"
  ADD COLUMN "cartFingerprint" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "packageDigest" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "rateId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ComplianceDecision" ADD COLUMN "cartFingerprint" TEXT NOT NULL DEFAULT '';
ALTER TABLE "RegulatedTaxQuote" ADD COLUMN "cartFingerprint" TEXT NOT NULL DEFAULT '';
ALTER TABLE "RegulatedProductClassification" ADD COLUMN "liquidVolumeMl" DECIMAL(18,3);
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_complianceRevision_nonnegative" CHECK ("complianceRevision" >= 0);
ALTER TABLE "RegulatedProductClassification" ADD CONSTRAINT "RegulatedProductClassification_liquidVolumeMl_nonnegative" CHECK ("liquidVolumeMl" IS NULL OR "liquidVolumeMl" >= 0);
COMMIT;
