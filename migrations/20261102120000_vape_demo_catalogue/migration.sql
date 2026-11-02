-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "demoCatalogue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "demoCatalogueChangedAt" TIMESTAMP(3),
ADD COLUMN     "demoCatalogueChangedBy" TEXT NOT NULL DEFAULT '';

