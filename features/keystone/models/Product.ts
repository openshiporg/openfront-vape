interface MeasurementProjection { type: string; unit: string; value: number | null }

import type { Lists } from '.keystone/types';
import { graphql, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  json,
  select,
  text,
  relationship,
  timestamp,
  virtual,
} from "@keystone-6/core/fields";
import { document } from "@keystone-6/fields-document";
import { permissions } from "../access";
import { trackingFieldsFor } from "./trackingFields";
import { assertProductPublicationEvidence } from "../regulated/enforcement";

export const Product = list<Lists.Product.TypeInfo>({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canReadProducts({ session }) || permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          status: {
            equals: "published",
          },
        };
      },
    },
  },
  fields: {
    title: text({
      validation: {
        isRequired: true,
      },
    }),
    description: document({
      formatting: true,
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1],
      ],
    }),
    handle: text({
      isIndexed: "unique",
    }),
    subtitle: text(),
    isGiftcard: checkbox(),
    thumbnail: virtual<Lists.Product.TypeInfo>({
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Lists.Product.Item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: "productImages(take: 1) { image { url } imagePath }",
          });
          return (
            product.productImages[0]?.image?.url ||
            product.productImages[0]?.imagePath ||
            null
          );
        },
      }),
    }),
    dimensionsRange: virtual<Lists.Product.TypeInfo>({
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item: Lists.Product.Item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants {
                measurements {
                  value
                  unit
                  type
                }
              }
            `,
          }) as { productVariants: Array<{ measurements: MeasurementProjection[] }> } | null;

          if (!product?.productVariants?.length) return null;

          const dimensions: Record<string, { min: number | null; max: number | null }> = {
            weight: { min: null, max: null },
            length: { min: null, max: null },
            height: { min: null, max: null },
            width: { min: null, max: null },
          };

          product.productVariants.forEach((variant) => {
            variant.measurements?.forEach((measurement) => {
              const dim = measurement.type;
              if (
                dimensions[dim] &&
                measurement.value !== null &&
                measurement.value !== undefined
              ) {
                // TODO: Handle unit conversion if needed
                if (
                  dimensions[dim].min === null ||
                  measurement.value < dimensions[dim].min
                ) {
                  dimensions[dim].min = measurement.value;
                }
                if (
                  dimensions[dim].max === null ||
                  measurement.value > dimensions[dim].max
                ) {
                  dimensions[dim].max = measurement.value;
                }
              }
            });
          });

          return dimensions;
        },
      }),
    }),
    defaultDimensions: virtual<Lists.Product.TypeInfo>({
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item: Lists.Product.Item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants(take: 1) {
                measurements {
                  value
                  unit
                  type
                }
              }
            `,
          }) as { productVariants: Array<{ measurements: MeasurementProjection[] }> } | null;

          if (!product?.productVariants?.[0]?.measurements) return null;

          const dimensions: Record<string, { value: number | null; unit: string }> = {};
          product.productVariants[0].measurements.forEach((measurement) => {
            dimensions[measurement.type] = {
              value: measurement.value,
              unit: measurement.unit,
            };
          });

          return dimensions;
        },
      }),
    }),
    metadata: json(),
    discountable: checkbox({
      defaultValue: true,
    }),
    regulatedCommerceRequired: checkbox({
      defaultValue: true,
      access: {
        create: permissions.canManageCompliance,
        update: permissions.canManageCompliance,
      },
      ui: {
        description: "On by default. Turn off only after a compliance reviewer documents that the product is outside regulated scope.",
      },
    }),
    regulatedExemptionReference: text({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance },
      ui: { description: "Required when a compliance reviewer records that this product is outside regulated scope." },
    }),
    regulatedExemptionDigest: text({
      access: { read: denyAll, create: permissions.canManageCompliance, update: permissions.canManageCompliance },
    }),
    regulatedExemptionReviewedAt: timestamp({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance },
    }),
    regulatedExemptionExpiresAt: timestamp({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance },
    }),
    status: select({
      type: "enum",
      options: [
        {
          label: "Draft",
          value: "draft",
        },
        {
          label: "Proposed",
          value: "proposed",
        },
        {
          label: "Published",
          value: "published",
        },
        {
          label: "Rejected",
          value: "rejected",
        },
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true,
      },
    }),
    externalId: text(),
    productCollections: relationship({
      ref: "ProductCollection.products",
      many: true,
    }),
    productCategories: relationship({
      ref: "ProductCategory.products",
      many: true,
    }),
    shippingProfile: relationship({
      ref: "ShippingProfile.products",
    }),
    productType: relationship({
      ref: "ProductType.products",
    }),
    discountConditions: relationship({
      ref: "DiscountCondition.products",
      many: true,
    }),
    discountRules: relationship({
      ref: "DiscountRule.products",
      many: true,
    }),
    productImages: relationship({
      ref: "ProductImage.products",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["image", "altText", "imagePath"],
        inlineCreate: { fields: ["image", "altText", "imagePath"] },
        inlineEdit: { fields: ["image", "altText", "imagePath"] },
        inlineConnect: true,
        removeMode: "disconnect",
        linkToItem: false,
      },
    }),
    productOptions: relationship({
      ref: "ProductOption.product",
      many: true,
    }),
    productTags: relationship({
      ref: "ProductTag.products",
      many: true,
    }),
    taxRates: relationship({
      ref: "TaxRate.products",
      many: true,
    }),
    productVariants: relationship({
      ref: "ProductVariant.product",
      many: true,
    }),
    ...trackingFieldsFor<Lists.Product.TypeInfo>(),
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, context, addValidationError }: any) => {
      const nextStatus = resolvedData.status ?? item?.status;
      const regulated = resolvedData.regulatedCommerceRequired ?? item?.regulatedCommerceRequired ?? true;
      const marketingChanged = ["title", "subtitle", "description", "metadata"].some(key => resolvedData[key] !== undefined);
      if (!regulated) {
        const reference = resolvedData.regulatedExemptionReference ?? item?.regulatedExemptionReference;
        const digest = resolvedData.regulatedExemptionDigest ?? item?.regulatedExemptionDigest;
        const reviewedAt = resolvedData.regulatedExemptionReviewedAt ?? item?.regulatedExemptionReviewedAt;
        const expiresAt = resolvedData.regulatedExemptionExpiresAt ?? item?.regulatedExemptionExpiresAt;
        if (!reference || !/^[a-f0-9]{64}$/i.test(digest || "") || !reviewedAt ||
            !expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
          addValidationError("A reviewed exemption reference and evidence digest are required to disable regulated controls");
          return;
        }
      }
      if (operation === "update" && nextStatus === "published" && regulated && marketingChanged) {
        addValidationError("Unpublish regulated products before changing customer-facing claims");
        return;
      }
      if (nextStatus !== "published" || !regulated) return;
      if (operation === "create" || !item?.id) {
        addValidationError("Create regulated products as draft, add reviewed variant evidence, then publish");
        return;
      }
      try {
        await assertProductPublicationEvidence(context, item.id);
      } catch (error) {
        addValidationError(error instanceof Error ? error.message : "Regulated publication evidence is required");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }: any) => {
      // Keystone supplies no resolvedData for delete. Do not report failure
      // after it has already committed the deletion.
      if (operation !== "update") return;
      const marketingChanged = ["title", "subtitle", "description", "metadata"].some(key => resolvedData[key] !== undefined);
      if (!marketingChanged || item?.status === "published" || item?.regulatedCommerceRequired === false) return;
      const product = await context.sudo().query.Product.findOne({
        where: { id: item.id },
        query: "productVariants { regulatedClassification { id } }",
      });
      const ids = product?.productVariants
        ?.map((variant: any) => variant.regulatedClassification?.id)
        .filter(Boolean) ?? [];
      if (ids.length) {
        await context.sudo().prisma.regulatedProductClassification.updateMany({
          where: { id: { in: ids } },
          data: { status: "review", marketingReviewStatus: "revoked", marketingReviewedAt: null },
        });
      }
    },
  },
  ui: {
    labelField: "title",
  },
});
