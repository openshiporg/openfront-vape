export type VerificationResult = {
  transactionId: string;
  result: "passed" | "failed" | "manual_review";
  verifiedAge: number;
  addressMatch: "matched" | "mismatched" | "indeterminate";
  evidenceDigest: string;
  issuedAt: string;
  expiresAt: string;
};

export interface IdentityProviderAdapter {
  createSession(input: { cartId: string; returnUrl: string; thresholdAge: number }): Promise<{ sessionId: string; url: string }>;
  retrieveVerifiedResult(input: { sessionId: string }): Promise<VerificationResult>;
  verifyWebhook(input: { rawBody: string; headers: Record<string, string> }): Promise<{ eventId: string; sessionId: string }>;
  health(): Promise<{ healthy: boolean; capabilities: string[] }>;
}

export type TaxQuoteResult = {
  providerReference: string;
  status: "quoted";
  salesTaxAmount: number;
  exciseTaxAmount: number;
  localFeeAmount: number;
  currencyCode: string;
  breakdown: unknown[];
  stampRequirements: unknown[];
  sourceVersion: string;
  evidenceDigest: string;
  issuedAt: string;
  expiresAt: string;
};

export type TaxCommitResult = {
  reference: string;
  status: "committed";
  totalAmount: number;
  evidenceDigest: string;
};

export type TaxReversalResult = {
  reference: string;
  status: "reversed" | "voided";
  totalAmount: number;
  evidenceDigest: string;
};

export interface RegulatedTaxAdapter {
  quote(input: { cartId: string; jurisdictionCode: string; lines: unknown[] }): Promise<TaxQuoteResult>;
  commit(input: { quoteReference: string; idempotencyKey: string }): Promise<TaxCommitResult>;
  reverse(input: { commitReference: string; idempotencyKey: string }): Promise<TaxReversalResult>;
}

export interface CarrierEligibilityAdapter {
  eligibility(input: { merchantProfileId: string; cartId: string; originCode: string; destinationCode: string; lines: unknown[] }): Promise<unknown>;
  createLabel(input: { eligibilityReference: string; idempotencyKey: string }): Promise<unknown>;
  cancelLabel(input: { labelReference: string; idempotencyKey: string }): Promise<unknown>;
  retrieveDeliveryEvidence(input: { trackingNumber: string }): Promise<unknown>;
}

export interface ProductRegistryAdapter {
  resolve(input: { authority: string; identifier: string }): Promise<unknown>;
  snapshot(input: { jurisdictionCode: string; effectiveAt: string }): Promise<unknown>;
}

export function unconfiguredProvider(name: string): never {
  throw new Error(`${name} provider is unconfigured; regulated transactions remain disabled`);
}
