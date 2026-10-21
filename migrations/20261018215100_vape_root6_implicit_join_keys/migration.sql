-- Reconcile 29 legacy implicit joins with the DECLARED Prisma/client 6.10.1.
-- Adapted from Salon's restore_relation_join_primary_keys migrations after
-- inspecting every Vape index, A/B non-null pair and generated ROOT6 diff.
-- Promote existing indexes in place; preserve rows, uniqueness and index OIDs.
-- The already-correct regulated launch-jurisdictions primary key is NOT changed.
BEGIN;
DO $preflight$
DECLARE target text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    '_Cart_discounts',
    '_Cart_giftCards',
    '_ClaimItem_claimTags',
    '_Currency_stores',
    '_CustomerGroup_discountConditions',
    '_CustomerGroup_priceLists',
    '_CustomerGroup_users',
    '_DiscountCondition_productCategories',
    '_DiscountCondition_productCollections',
    '_DiscountCondition_productTags',
    '_DiscountCondition_productTypes',
    '_DiscountCondition_products',
    '_DiscountRule_products',
    '_Discount_orders',
    '_Discount_regions',
    '_FulfillmentProvider_regions',
    '_MoneyAmount_priceRules',
    '_Notification_otherNotifications',
    '_PaymentProvider_regions',
    '_PriceSet_ruleTypes',
    '_ProductOptionValue_productVariants',
    '_ProductType_taxRates',
    '_Product_productCategories',
    '_Product_productCollections',
    '_Product_productImages',
    '_Product_productTags',
    '_Product_taxRates',
    '_Region_shippingProviders',
    '_ShippingOption_taxRates'
  ] LOOP
    IF (SELECT count(*) FROM pg_attribute WHERE attrelid = format('%I', target)::regclass
        AND attname IN ('A', 'B') AND attnotnull AND NOT attisdropped) <> 2 THEN
      RAISE EXCEPTION 'Expected non-null A/B pair on %', target;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_index i JOIN pg_class idx ON idx.oid = i.indexrelid
      JOIN pg_am am ON am.oid = idx.relam
      WHERE i.indrelid = format('%I', target)::regclass
        AND idx.relname = target || '_AB_unique'
        AND i.indisunique AND i.indisvalid AND i.indisready AND i.indimmediate
        AND i.indpred IS NULL AND i.indexprs IS NULL
        AND i.indnkeyatts = 2 AND i.indnatts = 2 AND am.amname = 'btree'
        AND ARRAY(SELECT pg_get_indexdef(i.indexrelid, n, true) FROM generate_series(1, 2) n) = ARRAY['"A"', '"B"']
    ) THEN RAISE EXCEPTION 'Expected valid exact unique A/B index on %', target;
    END IF;
  END LOOP;
END
$preflight$;

ALTER TABLE "_Cart_discounts" ADD CONSTRAINT "_Cart_discounts_AB_pkey" PRIMARY KEY USING INDEX "_Cart_discounts_AB_unique";
ALTER TABLE "_Cart_giftCards" ADD CONSTRAINT "_Cart_giftCards_AB_pkey" PRIMARY KEY USING INDEX "_Cart_giftCards_AB_unique";
ALTER TABLE "_ClaimItem_claimTags" ADD CONSTRAINT "_ClaimItem_claimTags_AB_pkey" PRIMARY KEY USING INDEX "_ClaimItem_claimTags_AB_unique";
ALTER TABLE "_Currency_stores" ADD CONSTRAINT "_Currency_stores_AB_pkey" PRIMARY KEY USING INDEX "_Currency_stores_AB_unique";
ALTER TABLE "_CustomerGroup_discountConditions" ADD CONSTRAINT "_CustomerGroup_discountConditions_AB_pkey" PRIMARY KEY USING INDEX "_CustomerGroup_discountConditions_AB_unique";
ALTER TABLE "_CustomerGroup_priceLists" ADD CONSTRAINT "_CustomerGroup_priceLists_AB_pkey" PRIMARY KEY USING INDEX "_CustomerGroup_priceLists_AB_unique";
ALTER TABLE "_CustomerGroup_users" ADD CONSTRAINT "_CustomerGroup_users_AB_pkey" PRIMARY KEY USING INDEX "_CustomerGroup_users_AB_unique";
ALTER TABLE "_DiscountCondition_productCategories" ADD CONSTRAINT "_DiscountCondition_productCategories_AB_pkey" PRIMARY KEY USING INDEX "_DiscountCondition_productCategories_AB_unique";
ALTER TABLE "_DiscountCondition_productCollections" ADD CONSTRAINT "_DiscountCondition_productCollections_AB_pkey" PRIMARY KEY USING INDEX "_DiscountCondition_productCollections_AB_unique";
ALTER TABLE "_DiscountCondition_productTags" ADD CONSTRAINT "_DiscountCondition_productTags_AB_pkey" PRIMARY KEY USING INDEX "_DiscountCondition_productTags_AB_unique";
ALTER TABLE "_DiscountCondition_productTypes" ADD CONSTRAINT "_DiscountCondition_productTypes_AB_pkey" PRIMARY KEY USING INDEX "_DiscountCondition_productTypes_AB_unique";
ALTER TABLE "_DiscountCondition_products" ADD CONSTRAINT "_DiscountCondition_products_AB_pkey" PRIMARY KEY USING INDEX "_DiscountCondition_products_AB_unique";
ALTER TABLE "_DiscountRule_products" ADD CONSTRAINT "_DiscountRule_products_AB_pkey" PRIMARY KEY USING INDEX "_DiscountRule_products_AB_unique";
ALTER TABLE "_Discount_orders" ADD CONSTRAINT "_Discount_orders_AB_pkey" PRIMARY KEY USING INDEX "_Discount_orders_AB_unique";
ALTER TABLE "_Discount_regions" ADD CONSTRAINT "_Discount_regions_AB_pkey" PRIMARY KEY USING INDEX "_Discount_regions_AB_unique";
ALTER TABLE "_FulfillmentProvider_regions" ADD CONSTRAINT "_FulfillmentProvider_regions_AB_pkey" PRIMARY KEY USING INDEX "_FulfillmentProvider_regions_AB_unique";
ALTER TABLE "_MoneyAmount_priceRules" ADD CONSTRAINT "_MoneyAmount_priceRules_AB_pkey" PRIMARY KEY USING INDEX "_MoneyAmount_priceRules_AB_unique";
ALTER TABLE "_Notification_otherNotifications" ADD CONSTRAINT "_Notification_otherNotifications_AB_pkey" PRIMARY KEY USING INDEX "_Notification_otherNotifications_AB_unique";
ALTER TABLE "_PaymentProvider_regions" ADD CONSTRAINT "_PaymentProvider_regions_AB_pkey" PRIMARY KEY USING INDEX "_PaymentProvider_regions_AB_unique";
ALTER TABLE "_PriceSet_ruleTypes" ADD CONSTRAINT "_PriceSet_ruleTypes_AB_pkey" PRIMARY KEY USING INDEX "_PriceSet_ruleTypes_AB_unique";
ALTER TABLE "_ProductOptionValue_productVariants" ADD CONSTRAINT "_ProductOptionValue_productVariants_AB_pkey" PRIMARY KEY USING INDEX "_ProductOptionValue_productVariants_AB_unique";
ALTER TABLE "_ProductType_taxRates" ADD CONSTRAINT "_ProductType_taxRates_AB_pkey" PRIMARY KEY USING INDEX "_ProductType_taxRates_AB_unique";
ALTER TABLE "_Product_productCategories" ADD CONSTRAINT "_Product_productCategories_AB_pkey" PRIMARY KEY USING INDEX "_Product_productCategories_AB_unique";
ALTER TABLE "_Product_productCollections" ADD CONSTRAINT "_Product_productCollections_AB_pkey" PRIMARY KEY USING INDEX "_Product_productCollections_AB_unique";
ALTER TABLE "_Product_productImages" ADD CONSTRAINT "_Product_productImages_AB_pkey" PRIMARY KEY USING INDEX "_Product_productImages_AB_unique";
ALTER TABLE "_Product_productTags" ADD CONSTRAINT "_Product_productTags_AB_pkey" PRIMARY KEY USING INDEX "_Product_productTags_AB_unique";
ALTER TABLE "_Product_taxRates" ADD CONSTRAINT "_Product_taxRates_AB_pkey" PRIMARY KEY USING INDEX "_Product_taxRates_AB_unique";
ALTER TABLE "_Region_shippingProviders" ADD CONSTRAINT "_Region_shippingProviders_AB_pkey" PRIMARY KEY USING INDEX "_Region_shippingProviders_AB_unique";
ALTER TABLE "_ShippingOption_taxRates" ADD CONSTRAINT "_ShippingOption_taxRates_AB_pkey" PRIMARY KEY USING INDEX "_ShippingOption_taxRates_AB_unique";
COMMIT;
