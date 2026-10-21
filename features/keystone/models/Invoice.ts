import { requireRelationship } from "./requiredRelationship";
import type { Lists } from '.keystone/types';
import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  select,
  timestamp,
  relationship,
  json,
  virtual
} from '@keystone-6/core/fields';
import { trackingFieldsFor } from './trackingFields';
import { permissions } from '../access';

export const Invoice = list<Lists.Invoice.TypeInfo>({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },
  fields: {
    // Core invoice data
    user: relationship({
      ref: 'User.invoices',
      many: false,
      hooks: { validateInput: requireRelationship },
    }),
    
    invoiceNumber: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),

    title: text({
      validation: { isRequired: true },
      defaultValue: 'Payment Invoice',
    }),

    description: text({
      ui: { displayMode: 'textarea' },
      defaultValue: 'Invoice for selected orders payment',
    }),

    // Financial fields (amounts in cents)
    totalAmount: integer({
      validation: { isRequired: true },
      defaultValue: 0,
    }),
    
    currency: relationship({
      ref: 'Currency.invoices',
      many: false,
      hooks: { validateInput: requireRelationship },
    }),

    // Status and dates
    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'paid', // Most invoices will be immediately paid
      validation: { isRequired: true },
    }),
    
    dueDate: timestamp(),
    paidAt: timestamp({
      defaultValue: { kind: 'now' }, // Default to now since most are paid immediately
    }),
    
    // Metadata for payment details
    metadata: json({
      defaultValue: {},
    }),

    // Relationships
    account: relationship({
      ref: 'Account.invoices',
      many: false,
      hooks: { validateInput: requireRelationship },
    }),
    
    lineItems: relationship({
      ref: 'InvoiceLineItem.invoice',
      many: true,
    }),

    paymentCollection: relationship({
      ref: 'PaymentCollection.invoice',
      db: { foreignKey: true },
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for invoice display',
      fields: {
        formattedTotal: virtual<Lists.Invoice.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.Invoice.Item, args, context) {
              try {
                // Always fetch the currency if not already populated
                let currency: { code: string; noDivisionCurrency?: boolean } | null = null;
                if (!currency && item.currencyId) {
                  const invoice = await context.sudo().query.Invoice.findOne({
                    where: { id: item.id },
                    query: `
                      currency {
                        id
                        code
                        symbol
                        noDivisionCurrency
                      }
                    `,
                  });
                  currency = invoice?.currency;
                }

                if (!currency || !item.totalAmount) {
                  return '$0.00';
                }

                const divisor = currency.noDivisionCurrency ? 1 : 100;
                const amount = (item.totalAmount || 0) / divisor;
                
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency.code,
                }).format(amount);
              } catch (error) {
                return '$0.00';
              }
            },
          }),
        }),

        itemCount: virtual<Lists.Invoice.TypeInfo>({
          field: graphql.field({
            type: graphql.Int,
            async resolve(item: Lists.Invoice.Item, args, context) {
              try {
                
                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    lineItems {
                      id
                    }
                  `,
                });

                return invoice?.lineItems?.length || 0;
              } catch (error) {
                return 0;
              }
            },
          }),
        }),

        paymentSessions: virtual<Lists.Invoice.TypeInfo>({
          field: graphql.field({
            type: graphql.list(graphql.nonNull(graphql.JSON)),
            async resolve(item: Lists.Invoice.Item, args, context) {
              try {

                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    paymentCollection {
                      id
                      paymentSessions {
                        id
                        paymentProvider {
                          id
                          code
                        }
                        data
                        isSelected
                        isInitiated
                        amount
                      }
                    }
                  `,
                });

                return invoice?.paymentCollection?.paymentSessions || [];
              } catch (error) {
                return [];
              }
            },
          }),
        }),
      },
    }),

    ...trackingFieldsFor<Lists.Invoice.TypeInfo>(),
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === 'create' && !resolvedData.invoiceNumber) {
        const timestamp = Date.now();
        resolvedData.invoiceNumber = `INV-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
      }
      return resolvedData;
    },
  },
});