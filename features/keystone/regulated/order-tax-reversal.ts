import { appendOrderTaxReversal } from "./reversals";
import { createStoreRateTaxAdapter, STORE_RATE_PROVIDER_CODE } from "../../regulated-commerce/providers/builtin/tax-store-rate";

/** A canceled order owes no tax: append the reversal row. The committed quote stays exactly as written. */
export async function reverseTaxForCanceledOrder(context: any, orderId: string) {
  const prisma = context.sudo().prisma;
  const store = {
    ratesFor: async () => [],
    taxable: async () => { throw new Error("not used"); },
    findQuote: (reference: string) => prisma.regulatedTaxQuote.findFirst({ where: { providerReference: reference, status: "committed" } }),
  };
  return appendOrderTaxReversal({
    context,
    orderId,
    adapterFor: (code) => (code === STORE_RATE_PROVIDER_CODE ? createStoreRateTaxAdapter(store) : null),
  });
}
