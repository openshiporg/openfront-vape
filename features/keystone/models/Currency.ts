import type { Lists } from '.keystone/types';

import { graphql, group, list } from "@keystone-6/core";
import { text, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFieldsFor } from "./trackingFields";

const NO_DIVISION_CURRENCIES = ["jpy", "krw", "vnd"];

export const Currency = list<Lists.Currency.TypeInfo>({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    code: text({
      isIndexed: "unique",
      validation: { isRequired: true },
    }),
    symbol: text({
      validation: { isRequired: true },
    }),
    symbolNative: text({
      validation: { isRequired: true },
    }),
    name: text({
      validation: { isRequired: true },
    }),
    moneyAmounts: relationship({
      ref: "MoneyAmount.currency",
      many: true,
    }),
    orders: relationship({
      ref: "Order.currency",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.currency",
      many: true,
    }),
    regions: relationship({
      ref: "Region.currency",
      many: true,
    }),
    stores: relationship({
      ref: "Store.currencies",
      many: true,
    }),
    accounts: relationship({
      ref: "Account.currency",
      many: true,
    }),
    invoices: relationship({
      ref: "Invoice.currency",
      many: true,
    }),
    ...group({
      label: "Virtual Fields",
      description: "Virtual fields for currency",
      fields: {
        noDivisionCurrency: virtual<Lists.Currency.TypeInfo>({
          field: graphql.field({
            type: graphql.Boolean,
            resolve(item: Lists.Currency.Item) {
              return NO_DIVISION_CURRENCIES.includes(item.code.toLowerCase());
            },
          }),
        }),
      },
    }),
    ...trackingFieldsFor<Lists.Currency.TypeInfo>(),
  },
});
