
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  text,
  checkbox,
  json,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const GiftCard = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadGiftCards({ session }) ||
        permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards,
    },
  },
  hooks: {
    validateInput: ({ resolvedData, item, addValidationError }: any) => {
      const value = resolvedData.value ?? item?.value;
      const balance = resolvedData.balance ?? item?.balance;
      if (typeof value === "number" && typeof balance === "number" && balance > value) {
        addValidationError("A gift card balance cannot be more than its value.");
      }
    },
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const giftCard = await sudoContext.query.GiftCard.findOne({
          where: { id: String(item.id) },
          query: 'carts { id }'
        });
        
        if (giftCard?.carts?.length) {
          for (const cart of giftCard.carts) {
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
  fields: {
    code: text({
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    value: integer({
      validation: {
        isRequired: true,
        min: 0,
      },
    }),
    balance: integer({
      validation: {
        isRequired: true,
        min: 0,
      },
    }),
    isDisabled: checkbox(),
    endsAt: timestamp(),
    metadata: json(),
    order: relationship({
      ref: "Order.giftCards",
    }),
    carts: relationship({
      ref: "Cart.giftCards",
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    giftCardTransactions: relationship({
      ref: "GiftCardTransaction.giftCard",
      many: true,
    }),
    region: relationship({
      ref: "Region.giftCards",
    }),
    ...trackingFields,
  },
});
