/** Ledger key for an intent the checkout refunded on its own. The database refuses a captured payment or a new
 * payment session on an intent with this key (migration 20261108200000_vape_money_invariants). */
export const autoRefundKey = (paymentId: string) => `auto-refund:${paymentId}`;

export function providerPaymentId(data: any): string | undefined {
  return data?.paymentIntentId || data?.clientSecret?.split("_secret_")[0] || data?.orderId || undefined;
}

/**
 * Provider create key, unique per payment collection. A refund detaches the spent collection, so the cart's next
 * session is a new collection and a new intent. `spentPaymentId` covers a session whose own intent was refunded.
 */
export function paymentCreateKey(input: { paymentCollectionId: string; providerCode: string; amount: number; currency: string; spentPaymentId?: string | null }) {
  const base = `payment:${input.paymentCollectionId}:${input.providerCode}:${input.amount}:${String(input.currency).toLowerCase()}`;
  return input.spentPaymentId ? `${base}:after:${input.spentPaymentId}` : base;
}
