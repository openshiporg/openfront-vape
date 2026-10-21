import { toJsonValue } from "../utils/json-value";
import type { OrderPricingProjection, ProductEligibilityProjection, DiscountConditionProjection } from './commerce-projections';
import type { KeystoneContext } from '@keystone-6/core/types';
import type { Lists } from '.keystone/types';

import { graphql, group, list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  checkbox,
  integer,
  json,
  float,
  select,
  text,
  timestamp,
  relationship,
  virtual,
} from "@keystone-6/core/fields";
import { trackingFieldsFor } from "./trackingFields";
import { permissions } from "../access";

// Add these helper functions at the top
const formatCurrency = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

async function regulatedOrderTax(context: any, orderId: string) {
  const quotes = await context.sudo().query.RegulatedTaxQuote.findMany({
    where: { order: { id: { equals: orderId } }, status: { in: ["committed", "reversed"] } },
    take: 2,
    query: "salesTaxAmount exciseTaxAmount localFeeAmount",
  });
  if (quotes.length > 1) throw new Error("Order has ambiguous regulated tax evidence");
  const quote = quotes[0];
  return quote ? quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount : 0;
}

export const Order = list<Lists.Order.TypeInfo>({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }) || Boolean(session?.customerToken),
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canReadOrders({ session }) || permissions.canManageOrders({ session })) return true;
        if (session?.customerToken && session?.itemId) {
          return { user: { id: { equals: session.itemId } } };
        }
        return false;
      },
    },
  },
  fields: {
    status: select({
      type: "enum",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Completed",
          value: "completed",
        },
        {
          label: "Archived",
          value: "archived",
        },
        {
          label: "Canceled",
          value: "canceled",
        },
        {
          label: "Requires Action",
          value: "requires_action",
        },
      ],
      defaultValue: "pending",
      validation: {
        isRequired: true,
      },
      access: {
        update: () => false,
      },
    }),
    displayId: integer({
      validation: {
        isRequired: true,
      },
    }),
    email: text({
      validation: {
        isRequired: true,
      },
    }),
    taxRate: float(),
    canceledAt: timestamp(),
    metadata: json(),
    idempotencyKey: text(),
    noNotification: checkbox(),
    externalId: text(),
    shippingAddress: relationship({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false,
    }),
    billingAddress: relationship({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false,
    }),
    currency: relationship({
      ref: "Currency.orders",
    }),
    draftOrder: relationship({
      ref: "DraftOrder.order",
    }),
    cart: relationship({
      ref: "Cart.order",
    }),
    user: relationship({
      ref: "User.orders",
    }),
    region: relationship({
      ref: "Region.orders",
    }),
    claimOrders: relationship({
      ref: "ClaimOrder.order",
      many: true,
    }),
    fulfillments: relationship({
      ref: "Fulfillment.order",
      many: true,
      // Lifecycle commands append transactional OrderEvent records.
    }),
    giftCards: relationship({
      ref: "GiftCard.order",
      many: true,
    }),
    giftCardTransactions: relationship({
      ref: "GiftCardTransaction.order",
      many: true,
    }),
    lineItems: relationship({
      ref: "OrderLineItem.order",
      many: true,
    }),
    discounts: relationship({
      ref: "Discount.orders",
      many: true,
    }),
    payments: relationship({
      ref: "Payment.order",
      many: true,
      // Lifecycle commands append transactional OrderEvent records.
    }),
    returns: relationship({
      ref: "Return.order",
      many: true,
      // Lifecycle commands append transactional OrderEvent records.
    }),
    shippingMethods: relationship({
      ref: "ShippingMethod.order",
      many: true,
    }),
    swaps: relationship({
      ref: "Swap.order",
      many: true,
    }),
    
    // Account relationship for Openship integration
    account: relationship({
      ref: 'Account.orders',
      many: false,
    }),
    
    accountLineItems: relationship({
      ref: 'AccountLineItem.order',
      many: true,
    }),
    secretKey: text({
      hooks: {
        resolveInput: ({ operation }) => {
          // Only generate secretKey on creation
          if (operation === "create") {
            const randomBytes = require("crypto").randomBytes(32);
            return randomBytes.toString("hex");
          }
          // Don't allow updates to secretKey
          return undefined;
        },
      },
    }),

    ...group({
      label: "Virtual Fields",
      description: "Calculated fields for order display and totals",
      fields: {
        subtotal: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              if (!order?.lineItems?.length) return "0";

              let subtotal = 0;
              for (const lineItem of order.lineItems) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(subtotal / divisor, currencyCode);
            },
          }),
        }),

        shipping: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              if (!order?.shippingMethods?.length) return "0";

              const total = order.shippingMethods.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              );

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),

        discount: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              if (!order?.discounts?.length) return null;

              // Calculate subtotal for percentage discounts
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate total discount amount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              if (totalDiscountAmount === 0) return null;

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(totalDiscountAmount / divisor, currencyCode);
            },
          }),
        }),

        tax: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                }
              }

              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0) +
                await regulatedOrderTax(context, item.id);

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(tax / divisor, currencyCode);
            },
          }),
        }),

        total: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              // Calculate shipping
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;

              // Calculate tax
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);

              // Regulated tax is committed by the external tax adapter and is
              // separate from the generic region rate (which must be zero).
              const total = subtotal - totalDiscountAmount + shipping + tax +
                await regulatedOrderTax(context, item.id);

              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;

              return formatCurrency(total / divisor, currencyCode);
            },
          }),
        }),

        rawTotal: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item: Lists.Order.Item, args, context) {
              const sudoContext = context.sudo();
              const order: OrderPricingProjection | null = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              // Calculate subtotal
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }

              // Calculate discount
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;

                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * 
                      (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }

              // Calculate shipping
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;

              // Calculate tax
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);

              // Calculate total, including immutable provider-committed regulated tax evidence.
              return Math.round(subtotal - totalDiscountAmount + shipping + tax +
                await regulatedOrderTax(context, item.id));
            },
          }),
        }),
        fulfillmentDetails: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item: Lists.Order.Item, args, context) {
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  fulfillments {
                    id
                    createdAt
                    canceledAt
                    shippingLabels {
                      id
                      trackingNumber
                      trackingUrl
                      carrier
                      labelUrl
                    }
                    fulfillmentItems {
                      id
                      quantity
                      lineItem {
                        id
                        title
                        thumbnail
                        quantity
                        formattedUnitPrice
                        formattedTotal
                        sku
                        variantTitle
                        productData
                        variantData
                      }
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              return toJsonValue(order.fulfillments?.map(fulfillment => ({
                id: fulfillment.id,
                createdAt: fulfillment.createdAt,
                canceledAt: fulfillment.canceledAt,
                shippingLabels: fulfillment.shippingLabels?.map(label => ({
                  id: label.id,
                  trackingNumber: label.trackingNumber,
                  url: label.trackingUrl,
                  carrier: label.carrier,
                  labelUrl: label.labelUrl
                })) || [],
                items: fulfillment.fulfillmentItems?.map(fi => ({
                  id: fi.id,
                  quantity: fi.quantity,
                  lineItem: {
                    id: fi.lineItem.id,
                    title: fi.lineItem.title,
                    thumbnail: fi.lineItem.thumbnail,
                    sku: fi.lineItem.sku,
                    variantTitle: fi.lineItem.variantTitle,
                    formattedUnitPrice: fi.lineItem.formattedUnitPrice,
                    formattedTotal: fi.lineItem.formattedTotal,
                    productData: fi.lineItem.productData,
                    variantData: fi.lineItem.variantData
                  }
                })) || []
              })) || []);
            },
          }),
        }),

        unfulfilled: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item: Lists.Order.Item, args, context) {
              // First get the order with line items and active fulfillments
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    title
                    thumbnail
                    quantity
                    formattedUnitPrice
                    formattedTotal
                    sku
                    variantTitle
                    productData
                    variantData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  fulfillments {
                    canceledAt
                    fulfillmentItems {
                      quantity
                      lineItem {
                        id
                      }
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              // Calculate fulfilled quantities per line item from active fulfillments
              const fulfilledQuantities: Record<string, number> = {};
              order.fulfillments
                ?.filter(f => !f.canceledAt)
                ?.forEach(fulfillment => {
                  fulfillment.fulfillmentItems?.forEach(fi => {
                    const lineItemId = fi.lineItem.id;
                    fulfilledQuantities[lineItemId] = (fulfilledQuantities[lineItemId] || 0) + fi.quantity;
                  });
                });

              // Map line items with their fulfillment status
              const result = order.lineItems?.map(lineItem => {
                const fulfilledQuantity = fulfilledQuantities[lineItem.id] || 0;
                const remainingQuantity = lineItem.quantity - fulfilledQuantity;

                return {
                  id: lineItem.id,
                  title: lineItem.title,
                  thumbnail: lineItem.thumbnail,
                  sku: lineItem.sku,
                  quantity: remainingQuantity,
                  totalQuantity: lineItem.quantity,
                  fulfilledQuantity,
                  formattedUnitPrice: lineItem.formattedUnitPrice,
                  formattedTotal: lineItem.formattedTotal,
                  variantTitle: lineItem.variantTitle,
                  productData: lineItem.productData,
                  variantData: lineItem.variantData,
                  moneyAmount: lineItem.moneyAmount
                };
              }).filter(item => item.quantity > 0) || [];

              return toJsonValue(result);
            },
          }),
        }),

        fulfillmentStatus: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item: Lists.Order.Item, args, context) {
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    quantity
                  }
                  fulfillments {
                    canceledAt
                    shippingLabels {
                      id
                    }
                    fulfillmentItems {
                      quantity
                    }
                  }
                `,
              }) as OrderPricingProjection | null;
              if (!order) return null;

              const totalQuantity = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
              const activeFulfillments = order.fulfillments.filter(f => !f.canceledAt);
              
              const fulfilledQuantity = activeFulfillments.reduce((sum, f) => 
                sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0), 0
              );

              const shippedQuantity = activeFulfillments
                .filter(f => f.shippingLabels?.length > 0)
                .reduce((sum, f) => 
                  sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0), 0
                );

              return {
                totalQuantity,
                fulfilledQuantity, 
                shippedQuantity,
                remainingQuantity: totalQuantity - fulfilledQuantity,
                status: fulfilledQuantity === 0 ? 'not_fulfilled' :
                        fulfilledQuantity === totalQuantity ? 'fulfilled' :
                        'partially_fulfilled',
                shippingStatus: shippedQuantity === 0 ? 'not_shipped' :
                               shippedQuantity === totalQuantity ? 'shipped' :
                               'partially_shipped'
              };
            },
          }),
        }),
        paymentDetails: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item: Lists.Order.Item, args, context) {
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    id
                    amount
                    status
                    data
                    createdAt
                    paymentCollection {
                      paymentSessions {
                        id
                        amount
                        isSelected
                        paymentProvider {
                          name
                        }
                      }
                    }
                  }
                  currency {
                    code
                    symbol
                  }
                `
              }) as OrderPricingProjection | null;
              if (!order) return null;
    
              if (!order?.payments?.length) return null;
    
              return toJsonValue(order.payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                formattedAmount: order.currency ? 
                  `${order.currency.symbol}${(payment.amount / 100).toFixed(2)}` :
                  `${(payment.amount / 100).toFixed(2)}`,
                status: payment.status,
                createdAt: payment.createdAt,
                provider: payment.data?.provider,
                cardLast4: payment.data?.cardLast4,
                paymentSession: payment.paymentCollection?.paymentSessions?.find(s => s.isSelected)
              })));
            }
          })
        }),
    
        totalPaid: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item: Lists.Order.Item, args, context) {
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                `
              }) as OrderPricingProjection | null;
              if (!order) return null;
    
              // Check direct order payments first (normal checkout)
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === 'captured') {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;

              // If no direct payments, check if this order was paid through an invoice
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                // Check if any account line items for this order are marked as paid
                const hasPaidLineItems = order.accountLineItems.some(lineItem => 
                  lineItem.paymentStatus === 'paid'
                );
                
                if (hasPaidLineItems) {
                  // If paid through invoice, sum the account line item amounts
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === 'paid') {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }

              return totalPaid;
            }
          })
        }),
    
        formattedTotalPaid: virtual<Lists.Order.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Order.Item, args, context) {
              const order: OrderPricingProjection | null = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                  currency {
                    code
                    symbol
                  }
                `
              }) as OrderPricingProjection | null;
              if (!order) return null;
    
              // Check direct order payments first (normal checkout)
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === 'captured') {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;

              // If no direct payments, check if this order was paid through an invoice
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                // Check if any account line items for this order are marked as paid
                const hasPaidLineItems = order.accountLineItems.some(lineItem => 
                  lineItem.paymentStatus === 'paid'
                );
                
                if (hasPaidLineItems) {
                  // If paid through invoice, sum the account line item amounts
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === 'paid') {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }
    
              if (!order.currency) return `${(totalPaid / 100).toFixed(2)}`;
    
              return `${order.currency.symbol}${(totalPaid / 100).toFixed(2)}`;
            }
          })
        }),
      },
    }),

    events: relationship({
      ref: "OrderEvent.order",
      many: true,
    }),

    note: text({
      label: 'Note',
    }),
    shippingLabels: relationship({
      ref: "ShippingLabel.order",
      many: true,
    }),
    ...trackingFieldsFor<Lists.Order.TypeInfo>(),



  },
});

