import type { KeystoneContext } from "@keystone-6/core/types";
import { canReadCustomerOrder, hasCustomerOrderCredential } from "../security/customer-order-access";

async function getCustomerOrder(root: unknown, { orderId, secretKey }: { orderId: string; secretKey?: string | null }, context: KeystoneContext<any>) {
  if (!hasCustomerOrderCredential(context.session?.itemId, secretKey)) {
    throw new Error("Order not found");
  }
  const sudoContext = context.sudo();

  const order = await sudoContext.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      secretKey
      displayId
      status
      fulfillmentStatus
      fulfillmentDetails
      paymentDetails
      total
      formattedTotalPaid
      subtotal
      shipping
      discount
      tax
      createdAt
      email
      unfulfilled
      fulfillments {
        id
        createdAt
        canceledAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            quantity
            title
            sku
            thumbnail
            metadata
            variantTitle
            formattedUnitPrice
            formattedTotal
            productData
            variantData
          }
        }
        shippingLabels {
          id
          labelUrl
          trackingNumber
          trackingUrl
          carrier
        }
      }
      user {
        id
        name
        email
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      billingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
        }
      }
      payments {
        id
        amount
        status
        createdAt
        paymentCollection {
          paymentSessions {
            id
            isSelected
            paymentProvider {
              id
              code
            }
          }
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
        variantTitle
        formattedUnitPrice
        formattedTotal
        variantData
        productData
      }
      region {
        id
        name
        currency {
          code
        }
      }
    `
  });

  if (!canReadCustomerOrder(
    order ? { userId: order.user?.id, secretKey: order.secretKey } : null,
    context.session?.itemId,
    secretKey,
  )) {
    // Keep absent, foreign, unauthenticated and invalid-secret outcomes identical.
    throw new Error("Order not found");
  }

  return order;
}

export default getCustomerOrder;