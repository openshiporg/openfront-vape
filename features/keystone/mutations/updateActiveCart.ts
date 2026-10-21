import { assertAddressAccess, withCartMutationLock } from "../security/cart-access";
import { cartQuantity, parseCartUpdate } from "../security/cart-input";
import { assertVariantPublicationEvidence, invalidateCartCompliance } from "../regulated/enforcement";
import { shippingDestinationWithinRegion } from "../security/shipping-eligibility";

export default async function updateActiveCart(_root: unknown, { cartId, data: input }: { cartId: string; data: unknown }, context: any) {
  // Reject the entire recursive shape before a nested resolver can write anything.
  const data = parseCartUpdate(input);
  return withCartMutationLock(context, cartId, async tx => {
    const sudo = tx.sudo();
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: "id region { id countries { iso2 } } shippingAddress { id country { iso2 } } lineItems { id quantity productVariant { id } }",
    });
    if (!cart) throw new Error("Cart not found");
    if (data.region && cart.lineItems.length) throw new Error("Region cannot change after items are added; start a new cart");

    let targetRegion = cart.region;
    if (data.region) {
      targetRegion = await sudo.query.Region.findOne({
        where: { id: data.region.connect.id },
        query: "id countries { iso2 }",
      });
      if (!targetRegion) throw new Error("Region not found");
    }

    let targetShippingAddress = cart.shippingAddress;
    for (const field of ["shippingAddress", "billingAddress"]) {
      if (!data[field]) continue;
      const address = await assertAddressAccess(tx, data[field].connect.id);
      if (field === "shippingAddress") targetShippingAddress = address;
    }
    if ((data.region || data.shippingAddress) && targetShippingAddress &&
      !shippingDestinationWithinRegion(
        targetRegion?.countries?.map((country: any) => country.iso2),
        targetShippingAddress.country?.iso2,
      )) {
      throw new Error("Shipping address is not available in this region");
    }
    const lines = data.lineItems;
    if (lines) {
      const removed = new Set((lines.disconnect || []).map((entry: any) => entry.id));
      for (const id of removed) if (!cart.lineItems.some((line: any) => line.id === id)) throw new Error("Line item not found");
      const creates = new Map<string, number>();
      for (const line of lines.create || []) {
        const id = line.productVariant.connect.id;
        creates.set(id, cartQuantity((creates.get(id) || 0) + line.quantity));
      }
      lines.create = [];
      for (const [variantId, quantity] of creates) {
        const variant = await sudo.query.ProductVariant.findOne({ where: { id: variantId }, query: "id product { status }" });
        if (variant?.product?.status !== "published") throw new Error("Product variant is not available");
        await assertVariantPublicationEvidence(tx, variantId);
        const existing = cart.lineItems.find((line: any) => line.productVariant?.id === variantId);
        if (existing) {
          if (removed.has(existing.id)) throw new Error("A line may be changed only once per command");
          await sudo.db.LineItem.updateOne({ where: { id: existing.id }, data: { quantity: cartQuantity(existing.quantity + quantity) } });
        } else lines.create.push({ productVariant: { connect: { id: variantId } }, quantity });
      }
    }
    const updated = await sudo.db.Cart.updateOne({ where: { id: cartId }, data: { ...data, paymentCollection: { disconnect: true } } });
    await invalidateCartCompliance(tx, cartId, "CART_CHANGED", true);
    return updated;
  }, [data.shippingAddress?.connect.id, data.billingAddress?.connect.id].filter(Boolean));
}
