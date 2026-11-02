import { withCartMutationLock } from "../security/cart-access";
import { cartQuantity } from "../security/cart-input";
import { assertVariantPublicationEvidence, invalidateCartCompliance } from "../regulated/enforcement";

export default async function updateActiveCartLineItem(_root: unknown, { cartId, lineId, quantity: input }: { cartId: string; lineId: string; quantity: number }, context: any) {
  const quantity = cartQuantity(input);
  return withCartMutationLock(context, cartId, async tx => {
    const sudo = tx.sudo();
    const line = await sudo.query.LineItem.findOne({ where: { id: lineId }, query: "id quantity cart { id } productVariant { id }" });
    if (line?.cart?.id !== cartId || !line.productVariant?.id) throw new Error("Line item not found");
    await assertVariantPublicationEvidence(tx, line.productVariant.id);
    if (line.quantity === quantity) {
      return sudo.db.Cart.findOne({ where: { id: cartId } });
    }
    await sudo.db.LineItem.updateOne({ where: { id: lineId }, data: { quantity } });
    await sudo.db.Cart.updateOne({ where: { id: cartId }, data: { paymentCollection: { disconnect: true } } });
    await invalidateCartCompliance(tx, cartId, "CART_CHANGED", true);
    return sudo.db.Cart.findOne({ where: { id: cartId } });
  });
}
