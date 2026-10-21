import { requireRelationship } from "./requiredRelationship";
import type { Lists } from '.keystone/types';
import { list, graphql } from "@keystone-6/core";
import { json, text, relationship, checkbox, virtual } from "@keystone-6/core/fields";
import { permissions, isSignedIn } from "../access";
import { trackingFieldsFor } from "./trackingFields";
import { resolveCustomerAddressData } from "../security/address-input";
import { denyAll } from "@keystone-6/core/access";
import { assertAddressUnreferenced } from "../security/address-command";

const canManageAddresses = ({ session }: { session?: any }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  // Users can manage addresses where they are the owner
  return { user: { id: { equals: session?.itemId } } };
};

export const Address = list<Lists.Address.TypeInfo>({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: isSignedIn,
      delete: isSignedIn,
    },
    filter: {
      query: canManageAddresses,
      update: canManageAddresses,
      delete: canManageAddresses,
    }
  },
  hooks: {
    validateInput: async ({ operation, item, inputData, context, addValidationError }: any) => {
      if (operation !== 'update' || !item?.id) return;
      try { await assertAddressUnreferenced(context, item.id); }
      catch { addValidationError("Address could not be updated"); }
    },
    validateDelete: async ({ item, context, addValidationError }: any) => {
      try { await assertAddressUnreferenced(context, item.id); }
      catch { addValidationError("Address could not be deleted"); }
    },
    resolveInput: ({ operation, inputData, resolvedData, context }) => {
      if (Object.keys(inputData || {}).some(key => ["cart", "cartsUsingBilling", "cartsUsingShipping", "ordersUsingBilling", "ordersUsingShipping"].includes(key))) throw new Error("Address could not be updated");
      if (
        (operation === "create" || operation === "update") &&
        !permissions.canManageUsers({ session: context.session })
      ) {
        return resolveCustomerAddressData({
          inputData,
          resolvedData,
          userId: context.session.itemId,
        });
      }
      return resolvedData;
    },
  },
  fields: {
    label: virtual<Lists.Address.TypeInfo>({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Lists.Address.Item) {
          const parts = [];
          
          // Company or Name
          if (item.company) {
            parts.push(item.company);
          }
          if (item.firstName || item.lastName) {
            parts.push(`${item.firstName || ''} ${item.lastName || ''}`.trim());
          }
          
          // Address lines
          if (item.address1) {
            parts.push(item.address1);
          }
          if (item.address2) {
            parts.push(item.address2);
          }
          
          // City, Province Postal
          const cityProvince = [];
          if (item.city) cityProvince.push(item.city);
          if (item.province) cityProvince.push(item.province);
          if (cityProvince.length > 0) {
            parts.push(cityProvince.join(', ') + (item.postalCode ? ` ${item.postalCode}` : ''));
          } else if (item.postalCode) {
            parts.push(item.postalCode);
          }
          
          return parts.join(' • ');
        }
      }),
    }),
    company: text(),
    firstName: text(),
    lastName: text(),
    address1: text(),
    address2: text(),
    city: text(),
    province: text(),
    postalCode: text(),
    phone: text(),
    isBilling: checkbox({ defaultValue: false }),
    metadata: json(),
    country: relationship({
      ref: "Country.addresses",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    user: relationship({
      ref: "User.addresses",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (
            (operation === "create" || operation === "update") &&
            context.session?.itemId &&
            !permissions.canManageUsers({ session: context.session })
          ) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        },
      },
    }),
    shippingProviders: relationship({
      ref: 'ShippingProvider.fromAddress',
      many: true,
    }),
    cart: relationship({
      ref: "Cart.addresses",
      access: { create: denyAll, update: denyAll },
      many: false,
    }),
    claimOrders: relationship({
      ref: "ClaimOrder.address",
      many: true,
    }),
    ordersUsingAsBillingAddress: relationship({
      ref: "Order.billingAddress",
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    ordersUsingAsShippingAddress: relationship({
      ref: "Order.shippingAddress",
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    cartsUsingAsBillingAddress: relationship({
      ref: 'Cart.billingAddress',
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    cartsUsingAsShippingAddress: relationship({
      ref: 'Cart.shippingAddress',
      access: { create: denyAll, update: denyAll },
      many: true,
    }),
    swaps: relationship({
      ref: "Swap.address",
      many: true,
    }),
    ...trackingFieldsFor<Lists.Address.TypeInfo>(),
  },
  ui: {
    labelField: 'label',
  },
});
