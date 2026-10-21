import type { Lists } from '.keystone/types';
import { list, graphql } from '@keystone-6/core';
import { integer, relationship, text, json, virtual } from '@keystone-6/core/fields';
import { permissions } from '../access';
import { trackingFieldsFor } from './trackingFields';
import { orderSnapshotThumbnail } from '../orders/snapshot-thumbnail';

const isS3SignedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.has('X-Amz-Date') && parsedUrl.searchParams.has('X-Amz-Expires');
  } catch (e) {
    return false;
  }
};

const isS3UrlExpired = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const dateStr = parsedUrl.searchParams.get('X-Amz-Date') || '';
    const expiresSeconds = parseInt(parsedUrl.searchParams.get('X-Amz-Expires') || '', 10);

    // AWS Date format: YYYYMMDDTHHMMSSZ
    const date = new Date(
      dateStr.slice(0, 4) + '-' +
      dateStr.slice(4, 6) + '-' +
      dateStr.slice(6, 8) + 'T' +
      dateStr.slice(9, 11) + ':' +
      dateStr.slice(11, 13) + ':' +
      dateStr.slice(13, 15) + 'Z'
    );

    const expirationTime = new Date(date.getTime() + (expiresSeconds * 1000));
    return expirationTime < new Date();
  } catch (e) {
    return true; // If we can't parse the URL or date, assume it's expired
  }
};

const checkUrlIsAccessible = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const OrderLineItem = list<Lists.OrderLineItem.TypeInfo>({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },
  fields: {
    quantity: integer({ validation: { isRequired: true } }),
    title: text({ validation: { isRequired: true } }),
    sku: text(),
    thumbnail: virtual<Lists.OrderLineItem.TypeInfo>({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Lists.OrderLineItem.Item, args, context) {
          // First try the checkout-time snapshot (sanitised: no credentials, http(s) or local only).
          const thumbnail = orderSnapshotThumbnail(item.productData);
          if (thumbnail) {
            // Local images are returned directly.
            if (thumbnail.startsWith('/')) return thumbnail;
            // Signed S3 URLs expire; check parameters first, then reachability.
            if (isS3SignedUrl(thumbnail)) {
              if (!isS3UrlExpired(thumbnail) && await checkUrlIsAccessible(thumbnail)) return thumbnail;
            } else if (await checkUrlIsAccessible(thumbnail)) {
              return thumbnail;
            }
          }

          // If the snapshot image is expired or unreachable, fall back to the variant or product.
          const orderLineItem = await context.sudo().query.OrderLineItem.findOne({
            where: { id: item.id },
            query: `
              productVariant {
                id
                primaryImage {
                  image { url }
                  imagePath
                }
                product {
                  thumbnail
                }
              }
            `,
          });

          // Prioritize variant's primaryImage, fall back to product thumbnail
          const primaryImage = orderLineItem?.productVariant?.primaryImage;
          if (primaryImage) {
            return primaryImage.image?.url || primaryImage.imagePath || null;
          }

          return orderLineItem?.productVariant?.product?.thumbnail || null;
        },
      }),
    }),
    metadata: json(),
    productData: json({ ui: { description: 'Snapshot of product data at time of order' } }),
    variantData: json({ ui: { description: 'Snapshot of variant data at time of order' } }),
    variantTitle: text(),
    formattedUnitPrice: text(),
    formattedTotal: text(),
    order: relationship({ ref: 'Order.lineItems' }),
    productVariant: relationship({ ref: 'ProductVariant', ui: { description: 'Optional historical product reference' } }),
    moneyAmount: relationship({ ref: 'OrderMoneyAmount.orderLineItem' }),
    originalLineItem: relationship({ ref: 'LineItem', ui: { description: 'Original cart line item reference' } }),
    fulfillmentItems: relationship({ ref: 'FulfillmentItem.lineItem', many: true }),
    ...trackingFieldsFor<Lists.OrderLineItem.TypeInfo>(),
  },
});
