'use server';

import { isoDay, runMutation, type SaveResult } from '@/features/platform/lib/session-context';

export type LicenseInput = {
  jurisdictionId: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  authorityReference: string;
  verificationSource: string;
  evidenceDigest: string;
  status: string;
  effectiveAt: string;
  expiresAt: string;
  verifiedAt: string;
};

const EDIT_STATUSES = ['draft', 'active', 'conditioned'];
const CLOSE_STATUSES = ['suspended', 'expired', 'revoked'];

function licenseData(input: LicenseInput, creating: boolean) {
  const data: Record<string, unknown> = {
    licenseType: input.licenseType.trim(),
    licenseNumber: input.licenseNumber.trim(),
    issuingAuthority: input.issuingAuthority.trim(),
    authorityReference: input.authorityReference.trim(),
    verificationSource: input.verificationSource.trim(),
    status: EDIT_STATUSES.includes(input.status) ? input.status : 'draft',
    effectiveAt: isoDay(input.effectiveAt),
    expiresAt: isoDay(input.expiresAt),
    verifiedAt: isoDay(input.verifiedAt),
  };
  if (input.evidenceDigest) data.evidenceDigest = input.evidenceDigest;
  if (input.jurisdictionId) data.jurisdiction = { connect: { id: input.jurisdictionId } };
  else if (!creating) data.jurisdiction = { disconnect: true };
  return data;
}

export async function createLicense(profileId: string, input: LicenseInput): Promise<SaveResult> {
  if (!input.evidenceDigest) return { success: false, error: 'Evidence document required.' };
  const data = licenseData(input, true);
  data.profile = { connect: { id: profileId } };
  return runMutation(
    `mutation CreateMerchantLicense($data: MerchantLicenseCreateInput!) { createMerchantLicense(data: $data) { id } }`,
    { data },
    response => response.createMerchantLicense
  );
}

export async function updateLicense(id: string, input: LicenseInput): Promise<SaveResult> {
  return runMutation(
    `mutation UpdateMerchantLicense($id: ID!, $data: MerchantLicenseUpdateInput!) { updateMerchantLicense(where: { id: $id }, data: $data) { id } }`,
    { id, data: licenseData(input, false) },
    response => response.updateMerchantLicense
  );
}

export async function closeLicense(id: string, status: string): Promise<SaveResult> {
  if (!CLOSE_STATUSES.includes(status)) return { success: false, error: 'This status change is not allowed.' };
  return runMutation(
    `mutation CloseMerchantLicense($id: ID!, $status: MerchantLicenseStatusType!) { updateMerchantLicense(where: { id: $id }, data: { status: $status }) { id } }`,
    { id, status },
    response => response.updateMerchantLicense
  );
}
