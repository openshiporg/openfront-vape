import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";

/** Server-only digest of the exact subject, full addresses, contents and price inputs.
 * Never persist or log the input projection as identity evidence. Legacy blank
 * digests deliberately do not match. Provider handlers must capture this BEFORE
 * the external request and supply that same digest when recording its result.
 */
export async function cartEvidenceFingerprint(context: any, cartId: string): Promise<string> {
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: `id complianceRevision email user { id }
      region { id taxRate currency { id code } }
      shippingAddress { firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      billingAddress { firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      lineItems(orderBy: [{ id: asc }]) { id quantity productVariant {
        id sku updatedAt product { id updatedAt regulatedCommerceRequired }
        regulatedClassification { id updatedAt }
        prices(orderBy: [{ id: asc }]) { id amount compareAmount updatedAt region { id } currency { code } }
      } }
      discounts(orderBy: [{ id: asc }]) { id updatedAt discountRule { id updatedAt } }
      shippingMethods(orderBy: [{ id: asc }]) { id price shippingOption { id updatedAt } }`,
  });
  if (!cart) throw new Error("Cart not found");
  return evidenceDigest(cart);
}

export async function assertCartEvidenceFingerprint(context: any, cartId: string, expected: unknown) {
  if (typeof expected !== "string" || !/^[a-f0-9]{64}$/.test(expected) || expected !== await cartEvidenceFingerprint(context, cartId)) {
    throw new Error("Provider evidence does not match the current cart, customer and address");
  }
}
