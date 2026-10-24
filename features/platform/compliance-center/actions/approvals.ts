'use server';

import { runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type ApprovalOptions = {
  profiles: Array<{ id: string; legalName: string; status: string }>;
  paymentProviders: Array<{ id: string; name: string }>;
  shippingProviders: Array<{ id: string; name: string }>;
  jurisdictions: Array<{ code: string; name: string }>;
};

export type ApprovalInput = {
  profileId: string;
  purpose: string;
  providerCode: string;
  approvalReference: string;
  evidenceDigest: string;
  coveredCategories: string[];
  coveredJurisdictionCodes: string[];
  capabilities: string;
  paymentProviderId: string;
  shippingProviderId: string;
  status: string;
  effectiveAt: string;
  expiresAt: string;
};

const iso = (value: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null);

export async function getApprovalOptions(): Promise<ApprovalOptions | null> {
  const context = await sessionContext();
  if (!context.session?.itemId) return null;
  // Each list loads on its own so one refused read leaves the rest of the form usable
  const [profiles, paymentProviders, shippingProviders, jurisdictions] = await Promise.allSettled([
    context.query.RegulatedMerchantProfile.findMany({ take: 20, query: 'id legalName status' }),
    context.query.PaymentProvider.findMany({ take: 50, query: 'id name' }),
    context.query.ShippingProvider.findMany({ take: 50, query: 'id name' }),
    context.query.Jurisdiction.findMany({ take: 100, query: 'code name' }),
  ]);
  const value = (result: PromiseSettledResult<readonly Record<string, any>[]>, list: string) => {
    if (result.status === 'fulfilled') return [...result.value];
    const error = result.reason as any;
    console.error(`Approval options: ${list} read failed`, { name: error?.name, code: error?.extensions?.code });
    return [];
  };
  return {
    profiles: value(profiles, 'RegulatedMerchantProfile'),
    paymentProviders: value(paymentProviders, 'PaymentProvider'),
    shippingProviders: value(shippingProviders, 'ShippingProvider'),
    jurisdictions: value(jurisdictions, 'Jurisdiction').sort((a, b) => String(a.code).localeCompare(String(b.code))),
  } as ApprovalOptions;
}

export async function createProviderApproval(input: ApprovalInput): Promise<SaveResult> {
  const data: Record<string, unknown> = {
    purpose: input.purpose,
    providerCode: input.providerCode.trim(),
    approvalReference: input.approvalReference.trim(),
    evidenceDigest: input.evidenceDigest,
    coveredCategories: input.coveredCategories,
    coveredJurisdictionCodes: input.coveredJurisdictionCodes,
    capabilities: input.capabilities.split(',').map(value => value.trim()).filter(Boolean),
    status: input.status,
    effectiveAt: iso(input.effectiveAt),
    expiresAt: iso(input.expiresAt),
  };
  if (input.profileId) data.profile = { connect: { id: input.profileId } };
  if (input.purpose === 'payment' && input.paymentProviderId) data.paymentProvider = { connect: { id: input.paymentProviderId } };
  if (input.purpose === 'carrier' && input.shippingProviderId) data.shippingProvider = { connect: { id: input.shippingProviderId } };
  if (input.status === 'active') data.validatedAt = new Date().toISOString();

  // The sheet refreshes the page itself; revalidating inside the action re-renders the route in the response
  return runMutation(
    `mutation CreateProviderApproval($data: ProviderApprovalCreateInput!) { createProviderApproval(data: $data) { id } }`,
    { data },
    response => response.createProviderApproval
  );
}
