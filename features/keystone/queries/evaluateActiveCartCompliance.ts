import { evaluateCartCompliance } from "../regulated/enforcement";
import { assertCartAccess } from "../security/cart-access";

const purposes = new Set(["cart", "shipping", "payment", "checkout"]);

export default async function evaluateActiveCartCompliance(
  _root: unknown,
  { cartId, purpose = "cart", paymentProviderId }: { cartId: string; purpose?: string; paymentProviderId?: string },
  context: any,
) {
  await assertCartAccess(context, cartId);
  if (!purposes.has(purpose)) throw new Error("Unsupported storefront compliance purpose");
  const result = await evaluateCartCompliance({
    context,
    cartId,
    purpose: purpose as "cart" | "shipping" | "payment" | "checkout",
    paymentProviderId,
  });
  if (!result.regulated) return { regulated: false, result: "not_applicable", reasonCodes: [] };
  return {
    regulated: true,
    result: result.decision?.result,
    reasonCodes: result.decision?.reasonCodes,
    policyVersion: result.decision?.policyVersion,
    evaluatedAt: result.decision?.evaluatedAt,
  };
}
