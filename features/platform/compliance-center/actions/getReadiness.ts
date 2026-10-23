'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';

export type ComplianceReadiness = {
  launchReady: boolean;
  canStop: boolean;
  canExport: boolean;
  blockers: string[];
  integrationStates: Array<{ purpose: string; status: string }>;
  transactionMode: string;
  claimBoundary: string;
  profiles: Array<{ id: string; legalName: string; status: string; pactRegistered: boolean; killSwitch: boolean; effectiveAt?: string | null; expiresAt?: string | null }>;
  activeRuleSets: unknown[];
  approvedClassifications: unknown[];
  activeProviderApprovals: unknown[];
  reportRuns: Array<{ id: string; reportType: string; status: string; generatedAt: string }>;
};

export async function getComplianceReadiness(): Promise<
  | { success: true; data: ComplianceReadiness; error?: never }
  | { success: false; error: string; data?: never }
> {
  const response = await keystoneClient<{ regulatedCommerceReadiness: ComplianceReadiness }>(`
    query ComplianceCenterReadiness { regulatedCommerceReadiness }
  `);
  if (!response.success) {
    return { success: false, error: response.error || 'Failed to load compliance records' };
  }
  if (!response.data?.regulatedCommerceReadiness) {
    return { success: false, error: 'Failed to load compliance records' };
  }
  return { success: true, data: response.data.regulatedCommerceReadiness };
}
