import type { KeystoneContext } from "@keystone-6/core/types";
async function getCustomerOrders(root: unknown, { limit = 10, offset = 0 }: { limit?: number | null; offset?: number | null }, context: KeystoneContext<any>) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const orders = await sudoContext.query.Order.findMany({
    where: { 
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit ?? 10, 1), 100),
    skip: Math.max(offset ?? 0, 0),
    query: `
      id
      displayId
      status
      fulfillmentStatus
      total
      formattedTotalPaid
      createdAt
      shippingAddress {
        country {
          id
          iso2
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
      }
      region {
        id
        currency {
          code
        }
      }
    `
  });

  return orders;
}

export default getCustomerOrders; 