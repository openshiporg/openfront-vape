import { requireRelationship } from "./requiredRelationship";
import type { Lists } from '.keystone/types';
import { list, group, graphql } from '@keystone-6/core';
import { 
  relationship,
  virtual
} from '@keystone-6/core/fields';
import { trackingFieldsFor } from './trackingFields';
import { permissions } from '../access';

export const InvoiceLineItem = list<Lists.InvoiceLineItem.TypeInfo>({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },
  fields: {
    // Junction table relationships
    invoice: relationship({
      ref: 'Invoice.lineItems',
      many: false,
      hooks: { validateInput: requireRelationship },
    }),
    
    accountLineItem: relationship({
      ref: 'AccountLineItem.invoiceLineItems',
      many: false,
      hooks: { validateInput: requireRelationship },
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields from related account line item',
      fields: {
        orderDisplayId: virtual<Lists.InvoiceLineItem.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.InvoiceLineItem.Item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDisplayId
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.orderDisplayId || '';
            },
          }),
        }),

        formattedAmount: virtual<Lists.InvoiceLineItem.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            async resolve(item: Lists.InvoiceLineItem.Item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    formattedAmount
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.formattedAmount || '$0.00';
            },
          }),
        }),

        orderDetails: virtual<Lists.InvoiceLineItem.TypeInfo>({
          field: graphql.field({
            type: graphql.JSON,
            async resolve(item: Lists.InvoiceLineItem.Item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDetails
                  }
                `,
              });

              return invoiceLineItem?.accountLineItem?.orderDetails || null;
            },
          }),
        }),
      },
    }),

    ...trackingFieldsFor<Lists.InvoiceLineItem.TypeInfo>(),
  },
});