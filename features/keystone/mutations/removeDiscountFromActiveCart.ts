import type { KeystoneContext } from "@keystone-6/core/types";
import { assertCartAccess, withCartMutationLock } from "../security/cart-access";
import { invalidateCartCompliance } from "../regulated/enforcement";
import { shopperError } from "../lib/shopperError";

async function removeDiscountFromActiveCart(root: unknown, { cartId, code }: { cartId: string; code: string }, context: KeystoneContext<any>) {
  return withCartMutationLock(context, cartId, async context => {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: 'id'
  });

  if (!discount) {
    throw shopperError(`No discount found with code: ${code}`, "DISCOUNT_NOT_FOUND");
  }

  const cart = await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: {
        disconnect: [{ id: discount.id }]
      },
      paymentCollection: { disconnect: true }
    },
  });
  await invalidateCartCompliance(context, cartId, "DISCOUNT_CHANGED", true);
  return cart;
  });
}

export default removeDiscountFromActiveCart; 