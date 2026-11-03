import type { PaymentSessionSelection } from '../models/commerce-projections';
import type { KeystoneContext } from "@keystone-6/core/types";
import { assertCartAccess, withCartMutationLock } from "../security/cart-access";
import { invalidateCartCompliance, requireAllowedCartCompliance } from "../regulated/enforcement";
import { shopperError } from "../lib/shopperError";
import { cartNotFound } from "../security/cart-access";

async function setActiveCartPaymentSession(root: unknown, { cartId, providerId }: { cartId: string; providerId: string }, context: KeystoneContext<any>) {
  return withCartMutationLock(context, cartId, async context => {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // Get cart with payment collection
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });

  if (!cart) {
    throw cartNotFound();
  }

  if (!cart.paymentCollection) {
    throw shopperError("Cart has no payment collection", "PAYMENT_COLLECTION_MISSING");
  }

  // Find and update the selected session
  const selectedSession = cart.paymentCollection.paymentSessions?.find(
    (s: PaymentSessionSelection) => s.paymentProvider.id === providerId
  );

  if (!selectedSession) {
    throw shopperError("Payment session not found", "PAYMENT_SESSION_NOT_FOUND");
  }

  await requireAllowedCartCompliance({ context, cartId, purpose: "payment", paymentProviderId: providerId });
  { const tx = sudoContext.prisma;
    await tx.paymentSession.updateMany({
      where: { paymentCollectionId: cart.paymentCollection.id },
      data: { isSelected: false },
    });
    await tx.paymentSession.update({ where: { id: selectedSession.id }, data: { isSelected: true } });
  }
  await invalidateCartCompliance(context, cartId, "PAYMENT_PROVIDER_CHANGED", true);

  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
  });
}

export default setActiveCartPaymentSession; 