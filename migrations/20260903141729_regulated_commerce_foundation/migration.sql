/*
  Warnings:

  - A unique constraint covering the columns `[regulatedClassification]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "JurisdictionLevelType" AS ENUM ('country', 'state', 'county', 'municipality', 'postal');

-- CreateEnum
CREATE TYPE "JurisdictionStatusType" AS ENUM ('draft', 'active', 'retired');

-- CreateEnum
CREATE TYPE "MerchantLicenseStatusType" AS ENUM ('draft', 'active', 'conditioned', 'suspended', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "ProviderApprovalPurposeType" AS ENUM ('identity', 'payment', 'tax', 'registry', 'carrier');

-- CreateEnum
CREATE TYPE "ProviderApprovalStatusType" AS ENUM ('unconfigured', 'review', 'active', 'suspended', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "RegulatedMerchantProfileStatusType" AS ENUM ('draft', 'review', 'active', 'suspended', 'revoked');

-- CreateEnum
CREATE TYPE "RegulatedRuleSetStatusType" AS ENUM ('draft', 'approved', 'active', 'retired', 'emergency_disabled');

-- CreateEnum
CREATE TYPE "ProductAuthorizationAuthorizationTypeType" AS ENUM ('federal_marketing_order', 'preexisting_status', 'state_directory', 'local_directory');

-- CreateEnum
CREATE TYPE "ProductAuthorizationStatusType" AS ENUM ('pending', 'authorized', 'suspended', 'delisted', 'denied', 'expired');

-- CreateEnum
CREATE TYPE "RegulatedProductClassificationCategoryType" AS ENUM ('ends_device', 'e_liquid', 'component', 'accessory', 'tobacco_derived_nicotine', 'synthetic_nicotine');

-- CreateEnum
CREATE TYPE "RegulatedProductClassificationNicotineSourceType" AS ENUM ('none', 'tobacco', 'synthetic', 'other', 'unknown');

-- CreateEnum
CREATE TYPE "RegulatedProductClassificationStatusType" AS ENUM ('draft', 'review', 'approved', 'rejected', 'revoked');

-- CreateEnum
CREATE TYPE "RegulatedProductClassificationMarketingReviewStatusType" AS ENUM ('pending', 'approved', 'rejected', 'revoked');

-- CreateEnum
CREATE TYPE "AgeVerificationAttemptPurposeType" AS ENUM ('checkout', 'delivery');

-- CreateEnum
CREATE TYPE "AgeVerificationAttemptResultType" AS ENUM ('pending', 'passed', 'failed', 'manual_review', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "AgeVerificationAttemptAddressMatchType" AS ENUM ('not_checked', 'matched', 'mismatched', 'indeterminate');

-- CreateEnum
CREATE TYPE "CarrierEligibilityDecisionResultType" AS ENUM ('allow', 'deny', 'manual_review', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "ComplianceDecisionPurposeType" AS ENUM ('catalog_publication', 'cart', 'shipping', 'payment', 'checkout', 'fulfillment');

-- CreateEnum
CREATE TYPE "ComplianceDecisionResultType" AS ENUM ('allow', 'deny', 'manual_review');

-- CreateEnum
CREATE TYPE "RegulatedTaxQuoteStatusType" AS ENUM ('quoted', 'committed', 'voided', 'reversed', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "ComplianceReportRunStatusType" AS ENUM ('generated', 'reviewed', 'submitted', 'accepted', 'rejected', 'corrected');

-- AlterTable
ALTER TABLE "Product"
  ADD COLUMN "regulatedCommerceRequired" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "regulatedExemptionReference" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "regulatedExemptionDigest" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "regulatedExemptionReviewedAt" TIMESTAMP(3),
  ADD COLUMN "regulatedExemptionExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PaymentProvider" ADD COLUMN "credentialReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ShippingProvider" ADD COLUMN "credentialReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "regulatedClassification" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "canAccessIdentityEvidence" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageCompliance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageComplianceReports" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canReviewComplianceDecisions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canOperateComplianceKillSwitch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canReadCompliance" BOOLEAN NOT NULL DEFAULT false;

-- Preserve full-admin operability without granting compliance access to narrower roles.
UPDATE "Role"
SET "canReadCompliance" = true,
    "canManageCompliance" = true,
    "canAccessIdentityEvidence" = true,
    "canReviewComplianceDecisions" = true,
    "canManageComplianceReports" = true,
    "canOperateComplianceKillSwitch" = true
WHERE "name" = 'Admin'
  AND "canAccessDashboard" = true
  AND "canManageProducts" = true
  AND "canManageOrders" = true;

-- Brand defaults affect new stores only; existing merchant branding is preserved.
ALTER TABLE "Store"
  ALTER COLUMN "name" SET DEFAULT 'Openfront Vape',
  ALTER COLUMN "homepageTitle" SET DEFAULT 'Regulated commerce, configured deliberately',
  ALTER COLUMN "homepageDescription" SET DEFAULT 'A transaction-disabled ENDS storefront foundation. Availability requires recorded external authority.';

-- Safety backfill: copied/imported catalog records require fresh regulated evidence review.
UPDATE "Product" SET "status" = 'draft' WHERE "status" = 'published';

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "level" "JurisdictionLevelType" NOT NULL DEFAULT 'state',
    "parent" TEXT,
    "postalScope" JSONB DEFAULT '[]',
    "authoritySources" JSONB DEFAULT '[]',
    "status" "JurisdictionStatusType" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantLicense" (
    "id" TEXT NOT NULL,
    "profile" TEXT,
    "jurisdiction" TEXT,
    "licenseType" TEXT NOT NULL DEFAULT '',
    "licenseNumber" TEXT NOT NULL DEFAULT '',
    "issuingAuthority" TEXT NOT NULL DEFAULT '',
    "authorityReference" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "verificationSource" TEXT NOT NULL DEFAULT '',
    "status" "MerchantLicenseStatusType" NOT NULL DEFAULT 'draft',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderApproval" (
    "id" TEXT NOT NULL,
    "profile" TEXT,
    "purpose" "ProviderApprovalPurposeType" NOT NULL DEFAULT 'identity',
    "providerCode" TEXT NOT NULL DEFAULT '',
    "paymentProvider" TEXT,
    "shippingProvider" TEXT,
    "coveredCategories" JSONB DEFAULT '[]',
    "coveredJurisdictionCodes" JSONB DEFAULT '[]',
    "capabilities" JSONB DEFAULT '[]',
    "approvalReference" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "status" "ProviderApprovalStatusType" NOT NULL DEFAULT 'unconfigured',
    "effectiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatedMerchantProfile" (
    "id" TEXT NOT NULL,
    "store" TEXT,
    "legalName" TEXT NOT NULL DEFAULT '',
    "enabledCategories" JSONB DEFAULT '[]',
    "originJurisdiction" TEXT,
    "complianceOwner" TEXT NOT NULL DEFAULT '',
    "escalationContacts" JSONB DEFAULT '[]',
    "counselApprovalReference" TEXT NOT NULL DEFAULT '',
    "insuranceReference" TEXT NOT NULL DEFAULT '',
    "pactRegistered" BOOLEAN NOT NULL DEFAULT false,
    "pactRegistrationReference" TEXT NOT NULL DEFAULT '',
    "pactEvidenceDigest" TEXT NOT NULL DEFAULT '',
    "status" "RegulatedMerchantProfileStatusType" NOT NULL DEFAULT 'draft',
    "effectiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "killSwitch" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatedMerchantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatedRuleSet" (
    "id" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "packName" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT '',
    "policyHash" TEXT NOT NULL DEFAULT '',
    "authorityCitations" JSONB DEFAULT '[]',
    "rules" JSONB DEFAULT '[]',
    "status" "RegulatedRuleSetStatusType" NOT NULL DEFAULT 'draft',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "signatureDigest" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatedRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAuthorization" (
    "id" TEXT NOT NULL,
    "classification" TEXT,
    "jurisdiction" TEXT,
    "authority" TEXT NOT NULL DEFAULT '',
    "authorizationType" "ProductAuthorizationAuthorizationTypeType" NOT NULL DEFAULT 'federal_marketing_order',
    "authorizationIdentifier" TEXT NOT NULL DEFAULT '',
    "evidenceUrl" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "claimRestrictions" TEXT NOT NULL DEFAULT '',
    "status" "ProductAuthorizationStatusType" NOT NULL DEFAULT 'pending',
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "delistedAt" TIMESTAMP(3),
    "sellThroughEndsAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatedProductClassification" (
    "id" TEXT NOT NULL,
    "category" "RegulatedProductClassificationCategoryType" NOT NULL DEFAULT 'ends_device',
    "nicotineSource" "RegulatedProductClassificationNicotineSourceType" NOT NULL DEFAULT 'unknown',
    "nicotineConcentrationMgMl" DECIMAL(18,3),
    "flavor" TEXT NOT NULL DEFAULT '',
    "packageUnits" INTEGER NOT NULL DEFAULT 1,
    "manufacturer" TEXT NOT NULL DEFAULT '',
    "brand" TEXT NOT NULL DEFAULT '',
    "sourceReference" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "marketingReviewStatus" "RegulatedProductClassificationMarketingReviewStatusType" NOT NULL DEFAULT 'pending',
    "marketingEvidenceDigest" TEXT NOT NULL DEFAULT '',
    "marketingReviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "status" "RegulatedProductClassificationStatusType" NOT NULL DEFAULT 'draft',
    "effectiveAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatedProductClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgeVerificationAttempt" (
    "id" TEXT NOT NULL,
    "cart" TEXT,
    "order" TEXT,
    "subjectDigest" TEXT NOT NULL DEFAULT '',
    "purpose" "AgeVerificationAttemptPurposeType" NOT NULL DEFAULT 'checkout',
    "thresholdAge" INTEGER NOT NULL,
    "verifiedAge" INTEGER NOT NULL,
    "providerCode" TEXT NOT NULL DEFAULT '',
    "providerTransactionId" TEXT NOT NULL DEFAULT '',
    "result" "AgeVerificationAttemptResultType" NOT NULL DEFAULT 'pending',
    "addressMatch" "AgeVerificationAttemptAddressMatchType" NOT NULL DEFAULT 'not_checked',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "consentPolicyVersion" TEXT NOT NULL DEFAULT '',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deleteAfter" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgeVerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrierEligibilityDecision" (
    "id" TEXT NOT NULL,
    "cart" TEXT,
    "order" TEXT,
    "providerApproval" TEXT,
    "shippingOption" TEXT,
    "carrierCode" TEXT NOT NULL DEFAULT '',
    "serviceCode" TEXT NOT NULL DEFAULT '',
    "originJurisdictionCode" TEXT NOT NULL DEFAULT '',
    "destinationJurisdictionCode" TEXT NOT NULL DEFAULT '',
    "regulatedCategories" JSONB DEFAULT '[]',
    "quantities" JSONB DEFAULT '[]',
    "adultSignature" BOOLEAN NOT NULL DEFAULT false,
    "packageMarkings" JSONB DEFAULT '[]',
    "result" "CarrierEligibilityDecisionResultType" NOT NULL DEFAULT 'deny',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarrierEligibilityDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDecision" (
    "id" TEXT NOT NULL,
    "cart" TEXT,
    "order" TEXT,
    "merchantProfile" TEXT,
    "jurisdiction" TEXT,
    "purpose" "ComplianceDecisionPurposeType" NOT NULL DEFAULT 'cart',
    "result" "ComplianceDecisionResultType" NOT NULL DEFAULT 'deny',
    "policyPack" TEXT NOT NULL DEFAULT '',
    "policyVersion" TEXT NOT NULL DEFAULT '',
    "policyHash" TEXT NOT NULL DEFAULT '',
    "ruleIds" JSONB DEFAULT '[]',
    "reasonCodes" JSONB DEFAULT '[]',
    "evidenceReferences" JSONB DEFAULT '[]',
    "snapshot" JSONB DEFAULT '{}',
    "snapshotDigest" TEXT NOT NULL DEFAULT '',
    "diagnosticData" JSONB DEFAULT '{}',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "revokedAt" TIMESTAMP(3),
    "supersededBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceEvent" (
    "id" TEXT NOT NULL,
    "decision" TEXT,
    "order" TEXT,
    "eventType" TEXT NOT NULL DEFAULT '',
    "resourceType" TEXT NOT NULL DEFAULT '',
    "resourceId" TEXT NOT NULL DEFAULT '',
    "actorId" TEXT NOT NULL DEFAULT '',
    "reasonCode" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "data" JSONB DEFAULT '{}',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatedTaxQuote" (
    "id" TEXT NOT NULL,
    "cart" TEXT,
    "order" TEXT,
    "jurisdiction" TEXT,
    "providerCode" TEXT NOT NULL DEFAULT '',
    "providerReference" TEXT NOT NULL DEFAULT '',
    "idempotencyKey" TEXT NOT NULL DEFAULT '',
    "status" "RegulatedTaxQuoteStatusType" NOT NULL DEFAULT 'quoted',
    "salesTaxAmount" INTEGER NOT NULL,
    "exciseTaxAmount" INTEGER NOT NULL,
    "localFeeAmount" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT '',
    "breakdown" JSONB DEFAULT '[]',
    "stampRequirements" JSONB DEFAULT '[]',
    "sourceVersion" TEXT NOT NULL DEFAULT '',
    "evidenceDigest" TEXT NOT NULL DEFAULT '',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "committedAt" TIMESTAMP(3),
    "reversalReference" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatedTaxQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceReportRun" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT '',
    "jurisdiction" TEXT,
    "merchantProfile" TEXT,
    "periodStartsAt" TIMESTAMP(3) NOT NULL,
    "periodEndsAt" TIMESTAMP(3) NOT NULL,
    "sourceTransactionIds" JSONB DEFAULT '[]',
    "policyVersions" JSONB DEFAULT '[]',
    "contentDigest" TEXT NOT NULL DEFAULT '',
    "content" JSONB DEFAULT '{}',
    "artifactReference" TEXT NOT NULL DEFAULT '',
    "status" "ComplianceReportRunStatusType" NOT NULL DEFAULT 'generated',
    "generatedBy" TEXT,
    "submittedBy" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "filingReceiptReference" TEXT NOT NULL DEFAULT '',
    "supersedes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceReportRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RegulatedMerchantProfile_launchJurisdictions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RegulatedMerchantProfile_launchJurisdictions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_code_key" ON "Jurisdiction"("code");

-- CreateIndex
CREATE INDEX "Jurisdiction_parent_idx" ON "Jurisdiction"("parent");

-- CreateIndex
CREATE INDEX "MerchantLicense_profile_idx" ON "MerchantLicense"("profile");

-- CreateIndex
CREATE INDEX "MerchantLicense_jurisdiction_idx" ON "MerchantLicense"("jurisdiction");

-- CreateIndex
CREATE INDEX "ProviderApproval_profile_idx" ON "ProviderApproval"("profile");

-- CreateIndex
CREATE INDEX "ProviderApproval_paymentProvider_idx" ON "ProviderApproval"("paymentProvider");

-- CreateIndex
CREATE INDEX "ProviderApproval_shippingProvider_idx" ON "ProviderApproval"("shippingProvider");

-- CreateIndex
CREATE INDEX "RegulatedMerchantProfile_store_idx" ON "RegulatedMerchantProfile"("store");

-- CreateIndex
CREATE INDEX "RegulatedMerchantProfile_originJurisdiction_idx" ON "RegulatedMerchantProfile"("originJurisdiction");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatedRuleSet_policyHash_key" ON "RegulatedRuleSet"("policyHash");

-- CreateIndex
CREATE INDEX "RegulatedRuleSet_jurisdiction_idx" ON "RegulatedRuleSet"("jurisdiction");

-- CreateIndex
CREATE INDEX "RegulatedRuleSet_reviewedBy_idx" ON "RegulatedRuleSet"("reviewedBy");

-- CreateIndex
CREATE INDEX "ProductAuthorization_classification_idx" ON "ProductAuthorization"("classification");

-- CreateIndex
CREATE INDEX "ProductAuthorization_jurisdiction_idx" ON "ProductAuthorization"("jurisdiction");

-- CreateIndex
CREATE INDEX "RegulatedProductClassification_reviewedBy_idx" ON "RegulatedProductClassification"("reviewedBy");

-- CreateIndex
CREATE UNIQUE INDEX "AgeVerificationAttempt_providerTransactionId_key" ON "AgeVerificationAttempt"("providerTransactionId");

-- CreateIndex
CREATE INDEX "AgeVerificationAttempt_cart_idx" ON "AgeVerificationAttempt"("cart");

-- CreateIndex
CREATE INDEX "AgeVerificationAttempt_order_idx" ON "AgeVerificationAttempt"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CarrierEligibilityDecision_idempotencyKey_key" ON "CarrierEligibilityDecision"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CarrierEligibilityDecision_cart_idx" ON "CarrierEligibilityDecision"("cart");

-- CreateIndex
CREATE INDEX "CarrierEligibilityDecision_order_idx" ON "CarrierEligibilityDecision"("order");

-- CreateIndex
CREATE INDEX "CarrierEligibilityDecision_providerApproval_idx" ON "CarrierEligibilityDecision"("providerApproval");

-- CreateIndex
CREATE INDEX "CarrierEligibilityDecision_shippingOption_idx" ON "CarrierEligibilityDecision"("shippingOption");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceDecision_idempotencyKey_key" ON "ComplianceDecision"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ComplianceDecision_cart_idx" ON "ComplianceDecision"("cart");

-- CreateIndex
CREATE INDEX "ComplianceDecision_order_idx" ON "ComplianceDecision"("order");

-- CreateIndex
CREATE INDEX "ComplianceDecision_merchantProfile_idx" ON "ComplianceDecision"("merchantProfile");

-- CreateIndex
CREATE INDEX "ComplianceDecision_jurisdiction_idx" ON "ComplianceDecision"("jurisdiction");

-- CreateIndex
CREATE INDEX "ComplianceDecision_supersededBy_idx" ON "ComplianceDecision"("supersededBy");

-- CreateIndex
CREATE INDEX "ComplianceEvent_decision_idx" ON "ComplianceEvent"("decision");

-- CreateIndex
CREATE INDEX "ComplianceEvent_order_idx" ON "ComplianceEvent"("order");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatedTaxQuote_idempotencyKey_key" ON "RegulatedTaxQuote"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RegulatedTaxQuote_cart_idx" ON "RegulatedTaxQuote"("cart");

-- CreateIndex
CREATE INDEX "RegulatedTaxQuote_order_idx" ON "RegulatedTaxQuote"("order");

-- CreateIndex
CREATE INDEX "RegulatedTaxQuote_jurisdiction_idx" ON "RegulatedTaxQuote"("jurisdiction");

-- CreateIndex
CREATE INDEX "ComplianceReportRun_jurisdiction_idx" ON "ComplianceReportRun"("jurisdiction");

-- CreateIndex
CREATE INDEX "ComplianceReportRun_merchantProfile_idx" ON "ComplianceReportRun"("merchantProfile");

-- CreateIndex
CREATE INDEX "ComplianceReportRun_generatedBy_idx" ON "ComplianceReportRun"("generatedBy");

-- CreateIndex
CREATE INDEX "ComplianceReportRun_submittedBy_idx" ON "ComplianceReportRun"("submittedBy");

-- CreateIndex
CREATE INDEX "ComplianceReportRun_supersedes_idx" ON "ComplianceReportRun"("supersedes");

-- CreateIndex
CREATE INDEX "_RegulatedMerchantProfile_launchJurisdictions_B_index" ON "_RegulatedMerchantProfile_launchJurisdictions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_regulatedClassification_key" ON "ProductVariant"("regulatedClassification");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_regulatedClassification_fkey" FOREIGN KEY ("regulatedClassification") REFERENCES "RegulatedProductClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jurisdiction" ADD CONSTRAINT "Jurisdiction_parent_fkey" FOREIGN KEY ("parent") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantLicense" ADD CONSTRAINT "MerchantLicense_profile_fkey" FOREIGN KEY ("profile") REFERENCES "RegulatedMerchantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantLicense" ADD CONSTRAINT "MerchantLicense_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_profile_fkey" FOREIGN KEY ("profile") REFERENCES "RegulatedMerchantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_paymentProvider_fkey" FOREIGN KEY ("paymentProvider") REFERENCES "PaymentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderApproval" ADD CONSTRAINT "ProviderApproval_shippingProvider_fkey" FOREIGN KEY ("shippingProvider") REFERENCES "ShippingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedMerchantProfile" ADD CONSTRAINT "RegulatedMerchantProfile_store_fkey" FOREIGN KEY ("store") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedMerchantProfile" ADD CONSTRAINT "RegulatedMerchantProfile_originJurisdiction_fkey" FOREIGN KEY ("originJurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedRuleSet" ADD CONSTRAINT "RegulatedRuleSet_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedRuleSet" ADD CONSTRAINT "RegulatedRuleSet_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuthorization" ADD CONSTRAINT "ProductAuthorization_classification_fkey" FOREIGN KEY ("classification") REFERENCES "RegulatedProductClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuthorization" ADD CONSTRAINT "ProductAuthorization_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedProductClassification" ADD CONSTRAINT "RegulatedProductClassification_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgeVerificationAttempt" ADD CONSTRAINT "AgeVerificationAttempt_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgeVerificationAttempt" ADD CONSTRAINT "AgeVerificationAttempt_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierEligibilityDecision" ADD CONSTRAINT "CarrierEligibilityDecision_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierEligibilityDecision" ADD CONSTRAINT "CarrierEligibilityDecision_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierEligibilityDecision" ADD CONSTRAINT "CarrierEligibilityDecision_providerApproval_fkey" FOREIGN KEY ("providerApproval") REFERENCES "ProviderApproval"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrierEligibilityDecision" ADD CONSTRAINT "CarrierEligibilityDecision_shippingOption_fkey" FOREIGN KEY ("shippingOption") REFERENCES "ShippingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDecision" ADD CONSTRAINT "ComplianceDecision_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDecision" ADD CONSTRAINT "ComplianceDecision_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDecision" ADD CONSTRAINT "ComplianceDecision_merchantProfile_fkey" FOREIGN KEY ("merchantProfile") REFERENCES "RegulatedMerchantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDecision" ADD CONSTRAINT "ComplianceDecision_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDecision" ADD CONSTRAINT "ComplianceDecision_supersededBy_fkey" FOREIGN KEY ("supersededBy") REFERENCES "ComplianceDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvent" ADD CONSTRAINT "ComplianceEvent_decision_fkey" FOREIGN KEY ("decision") REFERENCES "ComplianceDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceEvent" ADD CONSTRAINT "ComplianceEvent_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedTaxQuote" ADD CONSTRAINT "RegulatedTaxQuote_cart_fkey" FOREIGN KEY ("cart") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedTaxQuote" ADD CONSTRAINT "RegulatedTaxQuote_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatedTaxQuote" ADD CONSTRAINT "RegulatedTaxQuote_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReportRun" ADD CONSTRAINT "ComplianceReportRun_jurisdiction_fkey" FOREIGN KEY ("jurisdiction") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReportRun" ADD CONSTRAINT "ComplianceReportRun_merchantProfile_fkey" FOREIGN KEY ("merchantProfile") REFERENCES "RegulatedMerchantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReportRun" ADD CONSTRAINT "ComplianceReportRun_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReportRun" ADD CONSTRAINT "ComplianceReportRun_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReportRun" ADD CONSTRAINT "ComplianceReportRun_supersedes_fkey" FOREIGN KEY ("supersedes") REFERENCES "ComplianceReportRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegulatedMerchantProfile_launchJurisdictions" ADD CONSTRAINT "_RegulatedMerchantProfile_launchJurisdictions_A_fkey" FOREIGN KEY ("A") REFERENCES "Jurisdiction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegulatedMerchantProfile_launchJurisdictions" ADD CONSTRAINT "_RegulatedMerchantProfile_launchJurisdictions_B_fkey" FOREIGN KEY ("B") REFERENCES "RegulatedMerchantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
