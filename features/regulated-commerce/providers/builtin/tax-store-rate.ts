import crypto from "node:crypto";

import { evidenceDigest } from "../../core/decision-engine";
import type { RegulatedTaxAdapter, TaxCommitResult, TaxQuoteResult, TaxReversalResult } from "../contracts";

/**
 * Built-in tax method `store_rate`.
 *
 * Sales, excise and local-fee rates are the merchant's own TaxRate rows for the
 * destination jurisdiction (metadata `{ jurisdictionCode, kind }`, `rate` a
 * fraction of the taxable amount). A jurisdiction with no rows has no quote, so
 * a missing configuration fails closed; a zero rate must be entered explicitly.
 */
export const STORE_RATE_PROVIDER_CODE = "store_rate";
export const STORE_RATE_TTL_MS = 60 * 60 * 1000;
export const TAX_KINDS = ["sales", "excise", "local_fee"] as const;
export type TaxKind = (typeof TAX_KINDS)[number];

export type StoreTaxRate = { id: string; kind: TaxKind; rate: number; updatedAt: string };

export function computeStoreRateTax(rates: StoreTaxRate[], taxableAmount: number) {
  if (!Number.isSafeInteger(taxableAmount) || taxableAmount < 0) throw new Error("A non-negative taxable amount is required");
  const totals: Record<TaxKind, number> = { sales: 0, excise: 0, local_fee: 0 };
  const breakdown = rates.map(rate => {
    if (!TAX_KINDS.includes(rate.kind) || !Number.isFinite(rate.rate) || rate.rate < 0 || rate.rate > 1) {
      throw new Error("Store tax rates must be fractions between 0 and 1 with a known kind");
    }
    const amount = Math.round(taxableAmount * rate.rate);
    totals[rate.kind] += amount;
    return { kind: rate.kind, rate: rate.rate, amount, rateId: rate.id };
  });
  return { salesTaxAmount: totals.sales, exciseTaxAmount: totals.excise, localFeeAmount: totals.local_fee, breakdown };
}

export interface StoreRateTaxStore {
  ratesFor(jurisdictionCode: string): Promise<StoreTaxRate[]>;
  taxable(cartId: string): Promise<{ amount: number; currencyCode: string }>;
  findQuote(reference: string): Promise<{ status: string; salesTaxAmount: number; exciseTaxAmount: number; localFeeAmount: number } | null>;
}

const total = (quote: { salesTaxAmount: number; exciseTaxAmount: number; localFeeAmount: number }) =>
  quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;

export function createStoreRateTaxAdapter(store: StoreRateTaxStore, now: () => Date = () => new Date()): RegulatedTaxAdapter {
  return {
    async quote({ cartId, jurisdictionCode }): Promise<TaxQuoteResult> {
      const rates = await store.ratesFor(jurisdictionCode);
      if (!rates.length) throw new Error(`No store tax rates are configured for ${jurisdictionCode}`);
      const { amount, currencyCode } = await store.taxable(cartId);
      const computed = computeStoreRateTax(rates, amount);
      const issuedAt = new Date(now().getTime() - 60_000);
      const expiresAt = new Date(now().getTime() + STORE_RATE_TTL_MS);
      const providerReference = `srq_${crypto.randomUUID()}`;
      const sourceVersion = `store_rate:${evidenceDigest(rates.map(({ id, kind, rate, updatedAt }) => ({ id, kind, rate, updatedAt }))).slice(0, 16)}`;
      return {
        providerReference,
        status: "quoted",
        salesTaxAmount: computed.salesTaxAmount,
        exciseTaxAmount: computed.exciseTaxAmount,
        localFeeAmount: computed.localFeeAmount,
        currencyCode,
        breakdown: computed.breakdown,
        stampRequirements: [],
        sourceVersion,
        evidenceDigest: evidenceDigest({ providerReference, cartId, jurisdictionCode, taxable: amount, sourceVersion, computed }),
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
    },
    async commit({ quoteReference, idempotencyKey }): Promise<TaxCommitResult> {
      const quote = await store.findQuote(quoteReference);
      if (!quote || quote.status !== "quoted") throw new Error("A quoted store-rate tax record is required");
      const reference = `src_${evidenceDigest({ quoteReference, idempotencyKey }).slice(0, 24)}`;
      return {
        reference,
        status: "committed",
        totalAmount: total(quote),
        evidenceDigest: evidenceDigest({ reference, quoteReference, totalAmount: total(quote) }),
      };
    },
    async reverse({ commitReference, idempotencyKey }): Promise<TaxReversalResult> {
      const quote = await store.findQuote(commitReference);
      if (!quote || quote.status !== "committed") throw new Error("A committed store-rate tax record is required");
      const reference = `srr_${evidenceDigest({ commitReference, idempotencyKey }).slice(0, 24)}`;
      return {
        reference,
        status: "reversed",
        totalAmount: total(quote),
        evidenceDigest: evidenceDigest({ reference, commitReference, totalAmount: total(quote) }),
      };
    },
  };
}
