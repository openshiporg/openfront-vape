'use server';

import { keystoneContext } from '@/features/keystone/context';
import { permissions } from '@/features/keystone/access';
import { isoDay, runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type JurisdictionOption = { id: string; code: string; name: string };

export type ProfileRow = {
  id: string;
  legalName: string;
  complianceOwner: string;
  status: string;
  killSwitch: boolean;
  pactRegistered: boolean;
  origin: string | null;
  launchCount: number;
  effectiveAt: string | null;
  expiresAt: string | null;
};

export type ProfileList = {
  profiles: ProfileRow[];
  counts: Record<string, number>;
  total: number;
  canManage: boolean;
};

export type ProfileInput = {
  legalName: string;
  complianceOwner: string;
  escalationContacts: string;
  counselApprovalReference: string;
  insuranceReference: string;
  enabledCategories: string[];
  originJurisdictionId: string;
  launchJurisdictionIds: string[];
  pactRegistered: boolean;
  pactRegistrationReference: string;
  pactEvidenceDigest: string;
  effectiveAt: string;
  expiresAt: string;
};

export type ProfileLicense = {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  authorityReference: string;
  verificationSource: string;
  status: string;
  jurisdictionId: string;
  jurisdiction: string | null;
  effectiveAt: string;
  expiresAt: string;
  verifiedAt: string;
  hasEvidence: boolean;
};

export type ProfileApproval = {
  id: string;
  purpose: string;
  providerCode: string;
  status: string;
  effectiveAt: string | null;
  expiresAt: string | null;
};

export type ProfileDetail = {
  id: string;
  status: string;
  killSwitch: boolean;
  input: Omit<ProfileInput, 'pactEvidenceDigest'>;
  hasPactEvidence: boolean;
  origin: JurisdictionOption | null;
  launchJurisdictions: JurisdictionOption[];
  licenses: ProfileLicense[];
  approvals: ProfileApproval[];
  createdAt: string | null;
  updatedAt: string | null;
  canManage: boolean;
  canKill: boolean;
};

export type LoadResult<T> = { success: true; data: T } | { success: false; error: string };

const STATUSES = ['draft', 'review', 'active', 'suspended', 'revoked'];

const PROFILE_FIELDS = `id legalName complianceOwner escalationContacts counselApprovalReference insuranceReference
  enabledCategories pactRegistered pactRegistrationReference status effectiveAt expiresAt killSwitch createdAt updatedAt
  store { id } originJurisdiction { id code name } launchJurisdictions(orderBy: [{ code: asc }]) { id code name }`;

const day = (value: string | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : '');

function readError(error: any) {
  const code = error?.extensions?.code;
  if (code === 'KS_ACCESS_DENIED' || /access denied/i.test(String(error?.message || ''))) {
    return "You don't have permission to view compliance records.";
  }
  return 'Unable to load merchant profiles.';
}

function contactLines(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .map(contact => (typeof contact === 'string' ? contact : contact && typeof contact === 'object' ? Object.values(contact).filter(Boolean).join(' ') : ''))
    .filter(Boolean)
    .join('\n');
}

export async function listProfiles(status: string, search: string): Promise<LoadResult<ProfileList>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view merchant profiles.' };
  const term = search.trim();
  const searchWhere = term
    ? { OR: [{ legalName: { contains: term, mode: 'insensitive' } }, { complianceOwner: { contains: term, mode: 'insensitive' } }] }
    : {};
  const where = STATUSES.includes(status) ? { ...searchWhere, status: { equals: status } } : searchWhere;
  try {
    const [items, total, ...counts] = await Promise.all([
      context.query.RegulatedMerchantProfile.findMany({
        where: where as any,
        orderBy: [{ createdAt: 'desc' }],
        take: 100,
        query: 'id legalName complianceOwner status killSwitch pactRegistered effectiveAt expiresAt originJurisdiction { code } launchJurisdictionsCount',
      }),
      context.query.RegulatedMerchantProfile.count({ where: searchWhere as any }),
      ...STATUSES.map(value => context.query.RegulatedMerchantProfile.count({ where: { ...searchWhere, status: { equals: value } } as any })),
    ]);
    return {
      success: true,
      data: {
        profiles: items.map((item: any) => ({
          id: item.id,
          legalName: item.legalName,
          complianceOwner: item.complianceOwner,
          status: item.status,
          killSwitch: Boolean(item.killSwitch),
          pactRegistered: Boolean(item.pactRegistered),
          origin: item.originJurisdiction?.code || null,
          launchCount: item.launchJurisdictionsCount || 0,
          effectiveAt: item.effectiveAt,
          expiresAt: item.expiresAt,
        })),
        counts: Object.fromEntries(STATUSES.map((value, index) => [value, counts[index] as number])),
        total: total as number,
        canManage: permissions.canManageCompliance({ session: context.session }),
      },
    };
  } catch (error) {
    return { success: false, error: readError(error) };
  }
}

export async function getJurisdictionOptions(): Promise<JurisdictionOption[] | null> {
  const context = await sessionContext();
  if (!context.session?.itemId) return null;
  try {
    const items = await context.query.Jurisdiction.findMany({ orderBy: [{ code: 'asc' }], take: 200, query: 'id code name' });
    return items as unknown as JurisdictionOption[];
  } catch {
    return null;
  }
}

export async function getProfile(id: string): Promise<LoadResult<ProfileDetail | null>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view merchant profiles.' };
  try {
    const profile: any = await context.query.RegulatedMerchantProfile.findOne({
      where: { id },
      query: `${PROFILE_FIELDS}
        licenses(orderBy: [{ createdAt: desc }]) { id licenseType licenseNumber issuingAuthority authorityReference verificationSource status effectiveAt expiresAt verifiedAt jurisdiction { id code } }
        providerApprovals(orderBy: [{ createdAt: desc }]) { id purpose providerCode status effectiveAt expiresAt }`,
    });
    if (!profile) return { success: true, data: null };

    // Digests are never readable; only whether one is on file, after the session read succeeded
    const sudo = keystoneContext.sudo();
    const [evidence, licenseEvidence] = await Promise.all([
      sudo.query.RegulatedMerchantProfile.findOne({ where: { id }, query: 'pactEvidenceDigest' }),
      profile.licenses.length
        ? sudo.query.MerchantLicense.findMany({ where: { id: { in: profile.licenses.map((license: any) => license.id) } }, query: 'id evidenceDigest' })
        : Promise.resolve([]),
    ]);
    const licenseDigests = new Set((licenseEvidence as any[]).filter(item => item.evidenceDigest).map(item => item.id));

    return {
      success: true,
      data: {
        id: profile.id,
        status: profile.status,
        killSwitch: Boolean(profile.killSwitch),
        input: {
          legalName: profile.legalName || '',
          complianceOwner: profile.complianceOwner || '',
          escalationContacts: contactLines(profile.escalationContacts),
          counselApprovalReference: profile.counselApprovalReference || '',
          insuranceReference: profile.insuranceReference || '',
          enabledCategories: Array.isArray(profile.enabledCategories) ? profile.enabledCategories : [],
          originJurisdictionId: profile.originJurisdiction?.id || '',
          launchJurisdictionIds: profile.launchJurisdictions.map((item: any) => item.id),
          pactRegistered: Boolean(profile.pactRegistered),
          pactRegistrationReference: profile.pactRegistrationReference || '',
          effectiveAt: day(profile.effectiveAt),
          expiresAt: day(profile.expiresAt),
        },
        hasPactEvidence: Boolean(evidence?.pactEvidenceDigest),
        origin: profile.originJurisdiction,
        launchJurisdictions: profile.launchJurisdictions,
        licenses: profile.licenses.map((license: any) => ({
          id: license.id,
          licenseType: license.licenseType,
          licenseNumber: license.licenseNumber,
          issuingAuthority: license.issuingAuthority,
          authorityReference: license.authorityReference,
          verificationSource: license.verificationSource,
          status: license.status,
          jurisdictionId: license.jurisdiction?.id || '',
          jurisdiction: license.jurisdiction?.code || null,
          effectiveAt: day(license.effectiveAt),
          expiresAt: day(license.expiresAt),
          verifiedAt: day(license.verifiedAt),
          hasEvidence: licenseDigests.has(license.id),
        })),
        approvals: profile.providerApprovals,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        canManage: permissions.canManageCompliance({ session: context.session }),
        canKill: permissions.canOperateComplianceKillSwitch({ session: context.session }),
      },
    };
  } catch (error) {
    return { success: false, error: readError(error) };
  }
}

function profileData(input: ProfileInput, creating: boolean) {
  const data: Record<string, unknown> = {
    legalName: input.legalName.trim(),
    complianceOwner: input.complianceOwner.trim(),
    escalationContacts: input.escalationContacts.split('\n').map(line => line.trim()).filter(Boolean),
    counselApprovalReference: input.counselApprovalReference.trim(),
    insuranceReference: input.insuranceReference.trim(),
    enabledCategories: input.enabledCategories,
    pactRegistered: input.pactRegistered,
    pactRegistrationReference: input.pactRegistrationReference.trim(),
    effectiveAt: isoDay(input.effectiveAt),
    expiresAt: isoDay(input.expiresAt),
  };
  if (input.pactEvidenceDigest) data.pactEvidenceDigest = input.pactEvidenceDigest;
  if (input.originJurisdictionId) data.originJurisdiction = { connect: { id: input.originJurisdictionId } };
  else if (!creating) data.originJurisdiction = { disconnect: true };
  if (creating) {
    if (input.launchJurisdictionIds.length) data.launchJurisdictions = { connect: input.launchJurisdictionIds.map(id => ({ id })) };
  } else {
    data.launchJurisdictions = { set: input.launchJurisdictionIds.map(id => ({ id })) };
  }
  return data;
}

async function firstStoreId() {
  try {
    const context = await sessionContext();
    const stores = await context.query.Store.findMany({ take: 1, query: 'id' });
    return stores[0]?.id as string | undefined;
  } catch {
    return undefined;
  }
}

export async function createProfile(input: ProfileInput): Promise<SaveResult> {
  const data = profileData(input, true);
  data.status = 'draft';
  const storeId = await firstStoreId();
  if (storeId) data.store = { connect: { id: storeId } };
  return runMutation(
    `mutation CreateMerchantProfile($data: RegulatedMerchantProfileCreateInput!) { createRegulatedMerchantProfile(data: $data) { id } }`,
    { data },
    response => response.createRegulatedMerchantProfile
  );
}

export async function updateProfile(id: string, input: ProfileInput): Promise<SaveResult> {
  return runMutation(
    `mutation UpdateMerchantProfile($id: ID!, $data: RegulatedMerchantProfileUpdateInput!) { updateRegulatedMerchantProfile(where: { id: $id }, data: $data) { id } }`,
    { id, data: profileData(input, false) },
    response => response.updateRegulatedMerchantProfile
  );
}

const TRANSITIONS: Record<string, string[]> = {
  review: ['draft'],
  draft: ['review'],
  active: ['draft', 'review', 'suspended'],
  suspended: ['active'],
  revoked: ['draft', 'review', 'active', 'suspended'],
};

export async function setProfileStatus(id: string, from: string, status: string): Promise<SaveResult> {
  if (!TRANSITIONS[status]?.includes(from)) return { success: false, error: 'This status change is not allowed.' };
  return runMutation(
    `mutation SetMerchantProfileStatus($id: ID!, $status: RegulatedMerchantProfileStatusType!) { updateRegulatedMerchantProfile(where: { id: $id }, data: { status: $status }) { id } }`,
    { id, status },
    response => response.updateRegulatedMerchantProfile
  );
}

export async function stopSales(id: string, reason: string): Promise<SaveResult> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  if (!permissions.canOperateComplianceKillSwitch({ session: context.session })) return { success: false, error: 'Kill switch permission required.' };
  const text = reason.trim();
  if (text.length < 10 || reason.length > 500) return { success: false, error: 'Reason must be 10 to 500 characters.' };
  const result = await runMutation(
    `mutation StopRegulatedCommerce($profileId: ID!, $reason: String!) { stopRegulatedCommerce(profileId: $profileId, reason: $reason) }`,
    { profileId: id, reason: text },
    () => ({ id })
  );
  return result.success ? result : { success: false, error: 'Unable to stop sales.' };
}

export async function resumeSales(id: string): Promise<SaveResult> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  if (!permissions.canOperateComplianceKillSwitch({ session: context.session })) return { success: false, error: 'Kill switch permission required.' };
  if (!permissions.canManageCompliance({ session: context.session })) return { success: false, error: 'Compliance management permission required.' };
  return runMutation(
    `mutation ResumeRegulatedCommerce($id: ID!) { updateRegulatedMerchantProfile(where: { id: $id }, data: { killSwitch: false }) { id } }`,
    { id },
    response => response.updateRegulatedMerchantProfile
  );
}

/** A new draft carrying the content of an accepted profile, which itself stays unchanged. */
export async function duplicateProfile(id: string): Promise<SaveResult> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  let profile: any;
  try {
    profile = await context.query.RegulatedMerchantProfile.findOne({ where: { id }, query: PROFILE_FIELDS });
  } catch (error) {
    return { success: false, error: readError(error) };
  }
  if (!profile) return { success: false, error: 'Merchant profile not found.' };
  const evidence = await keystoneContext.sudo().query.RegulatedMerchantProfile.findOne({ where: { id }, query: 'pactEvidenceDigest' });
  const data: Record<string, unknown> = {
    legalName: profile.legalName,
    complianceOwner: profile.complianceOwner,
    escalationContacts: profile.escalationContacts ?? [],
    counselApprovalReference: profile.counselApprovalReference || '',
    insuranceReference: profile.insuranceReference || '',
    enabledCategories: profile.enabledCategories ?? [],
    pactRegistered: Boolean(profile.pactRegistered),
    pactRegistrationReference: profile.pactRegistrationReference || '',
    effectiveAt: profile.effectiveAt,
    expiresAt: profile.expiresAt,
    status: 'draft',
  };
  if (evidence?.pactEvidenceDigest) data.pactEvidenceDigest = evidence.pactEvidenceDigest;
  if (profile.store?.id) data.store = { connect: { id: profile.store.id } };
  if (profile.originJurisdiction?.id) data.originJurisdiction = { connect: { id: profile.originJurisdiction.id } };
  if (profile.launchJurisdictions.length) data.launchJurisdictions = { connect: profile.launchJurisdictions.map((item: any) => ({ id: item.id })) };
  return runMutation(
    `mutation ReviseMerchantProfile($data: RegulatedMerchantProfileCreateInput!) { createRegulatedMerchantProfile(data: $data) { id } }`,
    { data },
    response => response.createRegulatedMerchantProfile
  );
}
