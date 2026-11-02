-- The storefront sells; the demo catalogue switch is removed.
ALTER TABLE "Store" DROP COLUMN "demoCatalogue",
DROP COLUMN "demoCatalogueChangedAt",
DROP COLUMN "demoCatalogueChangedBy";
