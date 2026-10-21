-- Generated with declared Prisma 6.10.1; separated from implicit-join reconciliation.
-- Preserve legacy NULL tracking values before strengthening their constraints.
BEGIN;
UPDATE "WebhookEndpoint" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "WebhookEndpoint" SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP) WHERE "updatedAt" IS NULL;
UPDATE "WebhookEvent" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;

-- AlterTable
ALTER TABLE "TaxProvider" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "WebhookEndpoint" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET NOT NULL;
COMMIT;
