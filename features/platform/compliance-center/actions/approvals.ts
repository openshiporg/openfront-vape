'use server';

import { revalidatePath } from 'next/cache';

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
  try {
    const [profiles, paymentProviders, shippingProviders, jurisdictions] = await Promise.all([
      context.query.RegulatedMerchantProfile.findMany({ take: 20, orderBy: [{ createdAt: 'desc' }], query: 'id legalName status' }),
      context.query.PaymentProvider.findMany({ take: 50, query: 'id name' }),
      context.query.ShippingProvider.findMany({ take: 50, query: 'id name' }),
      context.query.Jurisdiction.findMany({ take: 200, orderBy: [{ code: 'asc' }], query: 'code name' }),
    ]);
    return { profiles, paymentProviders, shippingProviders, jurisdictions } as unknown as ApprovalOptions;
  } catch {
    return null;
  }
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

  const result = await runMutation(
    `mutation CreateProviderApproval($data: ProviderApprovalCreateInput!) { createProviderApproval(data: $data) { id } }`,
    { data },
    response => response.createProviderApproval
  );
  if (result.success) revalidatePath('/dashboard/platform/compliance');
  return result;
}
