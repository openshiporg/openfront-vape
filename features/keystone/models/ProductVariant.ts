import type { Lists } from '.keystone/types';

import { graphql, list } from "@keystone-6/core";
import {
  checkbox,
  integer,
  json,
  text,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { hasRegulatedVariantReviewChange, shouldBlockVariantEvidenceMutation } from "../regulated/variant-review";
import { trackingFieldsFor } from "./trackingFields";

export const ProductVariant = list<Lists.ProductVariant.TypeInfo>({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    filter: { query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }) ? true : { product: { status: { equals: "published" } } } },
  },
  fields: {
    fullTitle: virtual<Lists.ProductVariant.TypeInfo>({
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Lists.ProductVariant.Item, args, context) => {
          const { product } = await context.query.ProductVariant.findOne({
            where: { id: item.id.toString() },
            query: "product { title }",
          });
          return `${product?.title ? `${product.title} - ` : ""}${item.title}`;
        },
      }),
    }),
    title: text({
      validation: {
        isRequired: true,
      },
    }),
    sku: text(),
    barcode: text(),
    ean: text(),
    upc: text(),
    inventoryQuantity: integer({
      validation: {
        isRequired: true,
      },
    }),
    allowBackorder: checkbox(),
    manageInventory: checkbox({
      defaultValue: true,
    }),
    hsCode: text(),
    originCountry: text(),
    midCode: text(),
    material: text(),
    metadata: json(),
    variantRank: integer({
      defaultValue: 0,
    }),
    product: relationship({
      ref: "Product.productVariants",
    }),
    claimItems: relationship({
      ref: "ClaimItem.productVariant",
      many: true,
    }),
    lineItems: relationship({
      ref: "LineItem.productVariant",
      many: true,
    }),
    prices: relationship({
      ref: "MoneyAmount.productVariant",
      many: true,
    }),
    productOptionValues: relationship({
      ref: "ProductOptionValue.productVariants",
      many: true,
    }),
    location: relationship({
      ref: "Location.variants",
    }),
    stockMovements: relationship({
      ref: "StockMovement.variant",
      many: true,
    }),
    measurements: relationship({
      ref: "Measurement.productVariant",
      many: true,
    }),
    primaryImage: relationship({
      ref: "ProductImage.productVariants",
      many: false,
    }),
    regulatedClassification: relationship({
      ref: "RegulatedProductClassification.variant",
      many: false,
      ui: { description: "Reviewed ENDS classification required for publication and sale" },
    }),
    ...trackingFieldsFor<Lists.ProductVariant.TypeInfo>(),
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, context, addValidationError }: any) => {
      const currentProductId = typeof item?.product === "string" ? item.product : item?.product?.id || item?.productId;
      const nextProductId = resolvedData?.product?.connect?.id || resolvedData?.product?.set?.id;
      const productIds = [...new Set([currentProductId, nextProductId].filter((id): id is string => typeof id === "string" && id.length > 0))];
      if (!productIds.length || (operation === "update" && !hasRegulatedVariantReviewChange(resolvedData))) return;
      const products = await Promise.all(productIds.map(id => context.sudo().query.Product.findOne({
        where: { id },
        query: "id status regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt",
      })));
      const currentExemption = products.some(product => product?.regulatedCommerceRequired === false && product.regulatedExemptionReference &&
        /^[a-f0-9]{64}$/i.test(product.regulatedExemptionDigest || "") && product.regulatedExemptionReviewedAt &&
        new Date(product.regulatedExemptionExpiresAt || 0).getTime() > Date.now());
      const publishedProduct = products.some(product => product?.status === "published");
      const productStatus = publishedProduct ? "published" : products.find(Boolean)?.status;
      if (!shouldBlockVariantEvidenceMutation(operation, resolvedData, productStatus, currentExemption)) return;
      addValidationError(publishedProduct
        ? "Unpublish products before changing reviewed variant identity or media"
        : "Clear the reviewed exemption and reclassify the product before changing variant identity or media");
    },
    afterOperation: async ({ operation, inputData, item, context }: any) => {
      if (operation !== "update") return;
      const changed = hasRegulatedVariantReviewChange(inputData);
      if (!changed) return;
      // Identity/media changes revoke review, including changes while draft.
      await context.sudo().prisma.regulatedProductClassification.updateMany({
        where: { variant: { id: item.id } },
        data: { status: "review", marketingReviewStatus: "revoked", marketingReviewedAt: null },
      });
    },
  },
  ui: {
    labelField: "fullTitle",
  },
});