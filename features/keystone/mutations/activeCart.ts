import type { KeystoneContext } from "@keystone-6/core/types";
import { assertCartAccess } from "../security/cart-access";
import { currentRegulatedTaxQuote, evaluateCartCompliance } from "../regulated/enforcement";

async function activeCart(root: unknown, { cartId }: { cartId: string }, context: KeystoneContext<any>) {
  await assertCartAccess(context, cartId, { allowCompleted: true });

  const sudoContext = context.sudo();

  // Get cart with sudo
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      type
      checkoutStep
      region {
        id
        name
        countries {
          id
          name
          iso2
          region {
            id
          }
        }
        currency {
          code
          noDivisionCurrency
        }
        taxRate
      }
      subtotal
      total
      rawTotal
      discount
      giftCardTotal
      tax
      shipping
      lineItems(orderBy:  {
         createdAt: asc
      }) {
        id
        quantity
        title
        thumbnail
        description
        unitPrice
        originalPrice
        total
        percentageOff
        productVariant {
          id
          title
          product {
            id
            title
            thumbnail
            handle
          }
        }
      }
      giftCards {
        id
        code
        balance
      }
      discountsById
      discounts {
        id
        code
        isDynamic
        isDisabled
        discountRule {
          id
          type
          value
          allocation
        }
      }
      shippingMethods {
        id
        price
        shippingOption {
          id
          name
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
      addresses {
        id
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
        }
        phone
      }
      shippingAddress {
        id
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
        }
        phone
      }
      billingAddress {
        id
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
        }
        phone
      }
    `,
  });

  if (!cart) return null;

  const compliance = await evaluateCartCompliance({ context, cartId, purpose: "cart" });
  if (compliance.regulated) {
    const quote = await currentRegulatedTaxQuote(context, cartId, ["quoted", "committed"]);
    if (quote) {
      const regulatedTaxAmount = quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;
      const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
      const currency = String(cart.region?.currency?.code || "USD").toUpperCase();
      const format = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / divisor);
      cart.regulatedTax = format(regulatedTaxAmount);
      cart.rawTotal += regulatedTaxAmount;
      cart.total = format(cart.rawTotal);
    } else {
      cart.regulatedTax = "Calculated at checkout";
    }
    cart.regulatedCompliance = compliance.decision;
  }

  return cart;
}

export default activeCart;
