import { assertCartAccess } from "../security/cart-access";
import { submitAgeCheck } from "../regulated/checkout-evidence";

// Age step of regulated checkout: records the age result, the carrier decision
// and the committed tax quote for the cart as it stands.
export default async function submitActiveCartAgeCheck(
  _root: unknown,
  { cartId, dateOfBirth, idNameMatchesShipping }: { cartId: string; dateOfBirth: string; idNameMatchesShipping: boolean },
  context: any,
) {
  await assertCartAccess(context, cartId);
  if (typeof dateOfBirth !== "string" || idNameMatchesShipping !== true && idNameMatchesShipping !== false) {
    throw new Error("Enter a valid date of birth.");
  }
  const result = await submitAgeCheck(context, { cartId, dateOfBirth, idNameMatchesShipping });
  return { success: true, regulated: result.regulated };
}
