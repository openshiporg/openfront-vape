
import { list } from "@keystone-6/core";
import { allowAll, denyAll } from "@keystone-6/core/access";
import { json, text, relationship, image, integer } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductImage = list({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
    filter: { query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }) ? true : { OR: [{ products: { some: { status: { equals: "published" } } } }, { productVariants: { some: { product: { status: { equals: "published" } } } } }] } },
  },
  hooks: {
    afterOperation: async ({ operation, item, inputData, context }: any) => {
      // Only a media change invalidates marketing review; alt text does not.
      if (operation !== "update" || (inputData?.image === undefined && inputData?.imagePath === undefined)) return;
      const sudo = context.sudo();
      const image = await sudo.query.ProductImage.findOne({ where: { id: item.id }, query: "products { id } productVariants { id product { id } }" });
      const ids = [...new Set([...(image?.products || []).map((p: any) => p.id), ...(image?.productVariants || []).map((v: any) => v.product?.id)].filter(Boolean))];
      if (!ids.length) return;
      const products = await sudo.query.Product.findMany({ where: { id: { in: ids }, regulatedCommerceRequired: { equals: true } }, query: "id" });
      if (products.length) {
        await sudo.db.Product.updateMany({ data: products.map((product: any) => ({ where: { id: product.id }, data: { status: "draft" } })) });
      }
      // Approved classifications are immutable evidence: revoke them so a new revision
      // is recorded. Unapproved ones lose their marketing review.
      const classifications = await sudo.query.RegulatedProductClassification.findMany({ where: { variant: { product: { id: { in: ids } } } }, query: "id status" });
      if (classifications.length) {
        await sudo.db.RegulatedProductClassification.updateMany({
          data: classifications.map((classification: any) => ({
            where: { id: classification.id },
            data: classification.status === "approved"
              ? { status: "revoked" }
              : { marketingReviewStatus: "revoked", marketingReviewedAt: null },
          })),
        });
      }
    },
  },
  fields: {
    image: image({ storage: "my_images" }),
    imagePath: text(),
    altText: text(),
    order: integer({
      defaultValue: 0,
    }),
    products: relationship({ ref: "Product.productImages", many: true }),
    productVariants: relationship({ ref: "ProductVariant.primaryImage", many: true }),
    metadata: json(),
    ...trackingFields,
  },
  ui: {
    listView: {
      initialColumns: ["image", "imagePath", "altText", "products"],
    },
  },
});
