'use server';

import { keystoneContext } from '@/features/keystone/context';
import { isoDay, runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type ApprovalRow = {
  id: string;
  purpose: string;
  providerCode: string;
  status: string;
  profile: { id: string; legalName: string } | null;
  paymentProvider: { id: string; name: string } | null;
  shippingProvider: { id: string; name: string } | null;
  coveredCategories: string[];
  coveredJurisdictionCodes: string[];
  capabilities: string[];
  approvalReference: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  validatedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ApprovalDetail = ApprovalRow & { hasEvidence: boolean; jurisdictionNames: Record<string, string> };

export type ApprovalEditInput = {
  profileId: string;
  providerCode: string;
  approvalReference: string;
  evidenceDigest: string;
  coveredCategories: string[];
  coveredJurisdictionCodes: string[];
  capabilities: string;
  paymentProviderId: string;
  shippingProviderId: string;
  effectiveAt: string;
  expiresAt: string;
};

const QUERY = `id purpose providerCode status approvalReference effectiveAt expiresAt validatedAt createdAt updatedAt
  coveredCategories coveredJurisdictionCodes capabilities
  profile { id legalName } paymentProvider { id name } shippingProvider { id name }`;

const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);

function row(item: any): ApprovalRow {
  return {
    id: item.id,
    purpose: item.purpose,
    providerCode: item.providerCode || '',
    status: item.status,
    profile: item.profile || null,
    paymentProvider: item.paymentProvider || null,
    shippingProvider: item.shippingProvider || null,
    coveredCategories: list(item.coveredCategories),
    coveredJurisdictionCodes: list(item.coveredJurisdictionCodes),
    capabilities: list(item.capabilities),
    approvalReference: item.approvalReference || '',
    effectiveAt: item.effectiveAt,
    expiresAt: item.expiresAt,
    validatedAt: item.validatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function getProviderApprovals(): Promise<SaveResult<ApprovalRow[]>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  try {
    const items = await context.query.ProviderApproval.findMany({ orderBy: [{ updatedAt: 'desc' }], take: 500, query: QUERY });
    return { success: true, data: items.map(row) };
  } catch (error: any) {
    console.error('Provider approvals read failed', { name: error?.name, code: error?.extensions?.code });
    return { success: false, error: 'Unable to load compliance records.' };
  }
}

export async function getProviderApproval(id: string): Promise<SaveResult<ApprovalDetail | null>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  try {
    const item = await context.query.ProviderApproval.findOne({ where: { id }, query: QUERY });
    if (!item) return { success: true, data: null };
    // The digest is never readable; after the session-scoped read succeeds, only presence is checked
    const evidence = await keystoneContext.sudo().query.ProviderApproval.findOne({ where: { id }, query: 'evidenceDigest' });
    const approval = row(item);
    const jurisdictions = approval.coveredJurisdictionCodes.length
      ? await context.query.Jurisdiction.findMany({ where: { code: { in: approval.coveredJurisdictionCodes } }, query: 'code name' }).catch(() => [])
      : [];
    const jurisdictionNames = Object.fromEntries(jurisdictions.map((jurisdiction: any) => [jurisdiction.code, jurisdiction.name]));
    return { success: true, data: { ...approval, hasEvidence: Boolean(evidence?.evidenceDigest), jurisdictionNames } };
  } catch (error: any) {
    console.error('Provider approval read failed', { name: error?.name, code: error?.extensions?.code });
    return { success: false, error: 'Unable to load compliance records.' };
  }
}

/** Only approvals that are not yet usable (not configured, in review) can be edited. */
export async function updateProviderApproval(id: string, purpose: string, input: ApprovalEditInput): Promise<SaveResult> {
  const data: Record<string, unknown> = {
    providerCode: input.providerCode.trim(),
    approvalReference: input.approvalReference.trim(),
    coveredCategories: input.coveredCategories,
    coveredJurisdictionCodes: input.coveredJurisdictionCodes,
    capabilities: input.capabilities.split(',').map(value => value.trim()).filter(Boolean),
    effectiveAt: isoDay(input.effectiveAt),
    expiresAt: isoDay(input.expiresAt),
    profile: input.profileId ? { connect: { id: input.profileId } } : { disconnect: true },
  };
  if (input.evidenceDigest) data.evidenceDigest = input.evidenceDigest;
  if (purpose === 'payment') data.paymentProvider = input.paymentProviderId ? { connect: { id: input.paymentProviderId } } : { disconnect: true };
  if (purpose === 'carrier') data.shippingProvider = input.shippingProviderId ? { connect: { id: input.shippingProviderId } } : { disconnect: true };

  return runMutation(
    `mutation UpdateProviderApproval($id: ID!, $data: ProviderApprovalUpdateInput!) {
      updateProviderApproval(where: { id: $id }, data: $data) { id }
    }`,
    { id, data },
    response => response.updateProviderApproval
  );
}

const TRANSITIONS: Record<string, string> = {
  review: 'review',
  activate: 'active',
  suspend: 'suspended',
  revoke: 'revoked',
  expire: 'expired',
};

export async function transitionProviderApproval(id: string, action: string): Promise<SaveResult> {
  const status = TRANSITIONS[action];
  if (!status) return { success: false, error: 'Unknown action.' };
  const data: Record<string, unknown> = { status };
  // Activation records the validation time; the hook checks the rest of the evidence
  if (status === 'active') data.validatedAt = new Date().toISOString();
  return runMutation(
    `mutation TransitionProviderApproval($id: ID!, $data: ProviderApprovalUpdateInput!) {
      updateProviderApproval(where: { id: $id }, data: $data) { id }
    }`,
    { id, data },
    response => response.updateProviderApproval
  );
}
