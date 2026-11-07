
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  text,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Discount = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    code: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    isDynamic: checkbox(),
    isDisabled: checkbox(),
    stackable: checkbox({
      defaultValue: false,
    }),
    startsAt: timestamp({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true,
      },
    }),
    endsAt: timestamp({
      validation: {
        isRequired: false,
      },
    }),
    metadata: json(),
    usageLimit: integer({ validation: { min: 0 } }),
    // Checkout reserves and releases uses atomically; a hand edit would let a capped code be reused.
    usageCount: integer({
      defaultValue: 0,
      access: { create: () => false, update: () => false },
      validation: {
        isRequired: true,
        min: 0,
      },
    }),
    validDuration: text(),
    discountRule: relationship({
      ref: "DiscountRule.discounts",
    }),
    carts: relationship({
      ref: "Cart.discounts",
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    lineItemAdjustments: relationship({
      ref: "LineItemAdjustment.discount",
      many: true,
    }),
    regions: relationship({
      ref: "Region.discounts",
      many: true,
    }),
    orders: relationship({
      ref: "Order.discounts",
      many: true,
    }),
    ...trackingFields,
  },
  hooks: {
    validateInput: ({ resolvedData, item, addValidationError }: any) => {
      const startsAt = resolvedData.startsAt ?? item?.startsAt;
      const endsAt = resolvedData.endsAt !== undefined ? resolvedData.endsAt : item?.endsAt;
      if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
        addValidationError("The discount must end after it starts.");
      }
      const usageLimit = resolvedData.usageLimit !== undefined ? resolvedData.usageLimit : item?.usageLimit;
      if (typeof usageLimit === "number" && typeof item?.usageCount === "number" && usageLimit < item.usageCount) {
        addValidationError(`This discount has already been used ${item.usageCount} times, so its limit cannot be lower than that.`);
      }
    },
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const discount = await sudoContext.query.Discount.findOne({
          where: { id: String(item.id) },
          query: 'carts { id }'
        });
        
        if (discount?.carts?.length) {
          for (const cart of discount.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  },
});
