'use server';

import { createHash } from 'crypto';

import { keystoneContext } from '@/features/keystone/context';
import { isoDay, runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';
import {
  cleanSources,
  ruleSetInForce,
  type JurisdictionDetail,
  type JurisdictionInput,
  type JurisdictionRow,
  type RuleSetInput,
} from '../lib/shared';

type Read<T> = { success: true; data: T } | { success: false; error: string };

const READ_ERROR = 'Unable to load jurisdictions.';

function readFailure(scope: string, error: any): { success: false; error: string } {
  console.error(`Jurisdictions: ${scope} read failed`, { name: error?.name, code: error?.extensions?.code });
  if (error?.extensions?.code === 'KS_ACCESS_DENIED') return { success: false, error: "You don't have permission to view compliance records." };
  return { success: false, error: READ_ERROR };
}

export async function listJurisdictions(): Promise<Read<JurisdictionRow[]>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to continue.' };
  try {
    const [jurisdictions, ruleSets] = await Promise.all([
      context.query.Jurisdiction.findMany({
        orderBy: [{ code: 'asc' }],
        take: 1000,
        query: 'id code name level status authoritySources parent { id code }',
      }),
      context.query.RegulatedRuleSet.findMany({
        take: 5000,
        query: 'id status effectiveAt expiresAt jurisdiction { id }',
      }),
    ]);
    const now = Date.now();
    const byJurisdiction = new Map<string, any[]>();
    for (const ruleSet of ruleSets) {
      const id = ruleSet.jurisdiction?.id;
      if (!id) continue;
      byJurisdiction.set(id, [...(byJurisdiction.get(id) || []), ruleSet]);
    }
    return {
      success: true,
      data: jurisdictions.map((jurisdiction: any) => {
        const sets = byJurisdiction.get(jurisdiction.id) || [];
        const active = sets.filter(set => set.status === 'active');
        return {
          id: jurisdiction.id,
          code: jurisdiction.code,
          name: jurisdiction.name,
          level: jurisdiction.level,
          status: jurisdiction.status,
          parent: jurisdiction.parent ? { id: jurisdiction.parent.id, code: jurisdiction.parent.code } : null,
          sourceCount: cleanSources(jurisdiction.authoritySources).length,
          ruleSetCount: sets.length,
          activeRuleSetCount: active.length,
          // Checkout fails closed unless exactly one active rule set exists
          inForce: active.length === 1 && ruleSetInForce(active[0], now),
        };
      }),
    };
  } catch (error) {
    return readFailure('list', error);
  }
}

export async function getJurisdiction(id: string): Promise<Read<JurisdictionDetail | null>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to continue.' };
  try {
    const jurisdiction: any = await context.query.Jurisdiction.findOne({
      where: { id },
      query: `id code name level status postalScope authoritySources createdAt updatedAt
        parent { id code name }
        children(orderBy: [{ code: asc }]) { id code name status }`,
    });
    if (!jurisdiction) return { success: true, data: null };

    const where = { jurisdiction: { id: { equals: id } } };
    const [ruleSets, licenses, authorizations] = await Promise.all([
      context.query.RegulatedRuleSet.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        take: 200,
        query: 'id packName version policyHash status effectiveAt expiresAt approvedAt authorityCitations rules createdAt reviewedBy { id name email }',
      }),
      context.query.MerchantLicense.findMany({
        where,
        take: 100,
        query: 'id licenseType licenseNumber issuingAuthority status expiresAt profile { id legalName }',
      }).catch(() => []),
      context.query.ProductAuthorization.findMany({
        where,
        take: 100,
        query: 'id authority authorizationType authorizationIdentifier status expiresAt classification { variant { id title sku product { id title } } }',
      }).catch(() => []),
    ]);

    // Signatures are never readable; after the session read succeeded, only presence is checked
    const signatures = ruleSets.length
      ? await keystoneContext.sudo().query.RegulatedRuleSet.findMany({
          where: { id: { in: ruleSets.map((set: any) => set.id) } },
          query: 'id signatureDigest',
        })
      : [];
    const signed = new Set(signatures.filter((set: any) => set.signatureDigest).map((set: any) => set.id));

    return {
      success: true,
      data: {
        id: jurisdiction.id,
        code: jurisdiction.code,
        name: jurisdiction.name,
        level: jurisdiction.level,
        status: jurisdiction.status,
        parent: jurisdiction.parent,
        children: jurisdiction.children || [],
        postalScope: Array.isArray(jurisdiction.postalScope) ? jurisdiction.postalScope.map(String) : [],
        authoritySources: cleanSources(jurisdiction.authoritySources),
        createdAt: jurisdiction.createdAt,
        updatedAt: jurisdiction.updatedAt,
        ruleSets: ruleSets.map((set: any) => ({
          id: set.id,
          packName: set.packName,
          version: set.version,
          policyHash: set.policyHash,
          status: set.status,
          effectiveAt: set.effectiveAt,
          expiresAt: set.expiresAt,
          approvedAt: set.approvedAt,
          reviewer: set.reviewedBy ? set.reviewedBy.name || set.reviewedBy.email || null : null,
          hasSignature: signed.has(set.id),
          authorityCitations: cleanSources(set.authorityCitations),
          rules: Array.isArray(set.rules) ? set.rules : [],
          createdAt: set.createdAt,
        })),
        licenses: licenses.map((license: any) => ({
          id: license.id,
          licenseType: license.licenseType,
          licenseNumber: license.licenseNumber,
          issuingAuthority: license.issuingAuthority,
          status: license.status,
          expiresAt: license.expiresAt,
          profile: license.profile,
        })),
        authorizations: authorizations.map((authorization: any) => {
          const variant = authorization.classification?.variant;
          const product = variant?.product;
          const variantTitle = variant?.title && variant.title !== 'Default Title' ? ` / ${variant.title}` : '';
          return {
            id: authorization.id,
            authority: authorization.authority,
            authorizationType: authorization.authorizationType,
            authorizationIdentifier: authorization.authorizationIdentifier,
            status: authorization.status,
            expiresAt: authorization.expiresAt,
            product: product ? { id: product.id, title: `${product.title}${variantTitle}` } : null,
          };
        }),
      },
    };
  } catch (error) {
    return readFailure('detail', error);
  }
}

export async function getParentOptions(): Promise<Array<{ id: string; code: string; name: string }>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return [];
  try {
    const rows = await context.query.Jurisdiction.findMany({ orderBy: [{ code: 'asc' }], take: 1000, query: 'id code name' });
    return rows as Array<{ id: string; code: string; name: string }>;
  } catch {
    return [];
  }
}

const sources = (value: JurisdictionInput['authoritySources']) =>
  value.map(source => ({ title: source.title.trim(), url: source.url.trim() })).filter(source => source.title || source.url);

export async function saveJurisdiction(id: string | null, input: JurisdictionInput): Promise<SaveResult> {
  const data: Record<string, unknown> = {
    code: input.code.trim(),
    name: input.name.trim(),
    level: input.level,
    postalScope: input.postalScope.split(',').map(entry => entry.trim()).filter(Boolean),
    authoritySources: sources(input.authoritySources),
  };
  if (!data.code) return { success: false, error: 'Code is required' };
  if (!data.name) return { success: false, error: 'Name is required' };
  if (id && input.parentId === id) return { success: false, error: 'A jurisdiction cannot be its own parent' };
  if (input.parentId) data.parent = { connect: { id: input.parentId } };
  else if (id) data.parent = { disconnect: true };

  const context = await sessionContext();
  const clash = await context.query.Jurisdiction.findMany({ where: { code: { equals: data.code as string } }, take: 1, query: 'id' }).catch(() => []);
  if (clash.length && clash[0].id !== id) return { success: false, error: `Code ${data.code} is already used` };

  if (id) {
    return runMutation(
      `mutation UpdateJurisdiction($id: ID!, $data: JurisdictionUpdateInput!) { updateJurisdiction(where: { id: $id }, data: $data) { id } }`,
      { id, data },
      response => response.updateJurisdiction,
    );
  }
  return runMutation(
    `mutation CreateJurisdiction($data: JurisdictionCreateInput!) { createJurisdiction(data: $data) { id } }`,
    { data: { ...data, status: 'draft' } },
    response => response.createJurisdiction,
  );
}

export async function setJurisdictionStatus(id: string, status: 'active' | 'retired'): Promise<SaveResult> {
  return runMutation(
    `mutation SetJurisdictionStatus($id: ID!, $data: JurisdictionUpdateInput!) { updateJurisdiction(where: { id: $id }, data: $data) { id } }`,
    { id, data: { status } },
    response => response.updateJurisdiction,
  );
}

/** Key-sorted JSON so the same policy content always hashes the same. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as object).sort().map(key => `${JSON.stringify(key)}:${canonical((value as any)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function saveRuleSet(id: string | null, jurisdictionId: string, input: RuleSetInput): Promise<SaveResult> {
  const packName = input.packName.trim();
  const version = input.version.trim();
  if (!packName) return { success: false, error: 'Pack name is required' };
  if (!version) return { success: false, error: 'Version is required' };
  if (!Array.isArray(input.rules)) return { success: false, error: 'Rules must be a JSON array' };

  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  const jurisdiction = await context.query.Jurisdiction.findOne({ where: { id: jurisdictionId }, query: 'id code' }).catch(() => null);
  if (!jurisdiction) return { success: false, error: 'Jurisdiction not found' };

  const effectiveAt = isoDay(input.effectiveAt);
  const expiresAt = isoDay(input.expiresAt);
  const authorityCitations = sources(input.authorityCitations);
  const policyHash = createHash('sha256')
    .update(canonical({ jurisdiction: jurisdiction.code, packName, version, effectiveAt, expiresAt, authorityCitations, rules: input.rules }))
    .digest('hex');

  // The hash is unique; a clash would otherwise surface as a generic database error
  const clash = await keystoneContext.sudo().query.RegulatedRuleSet.findMany({ where: { policyHash: { equals: policyHash } }, take: 1, query: 'id' });
  if (clash.length && clash[0].id !== id) return { success: false, error: 'A rule set with identical content already exists' };

  const data: Record<string, unknown> = { packName, version, effectiveAt, expiresAt, authorityCitations, rules: input.rules, policyHash };
  if (id) {
    return runMutation(
      `mutation UpdateRuleSet($id: ID!, $data: RegulatedRuleSetUpdateInput!) { updateRegulatedRuleSet(where: { id: $id }, data: $data) { id } }`,
      { id, data },
      response => response.updateRegulatedRuleSet,
    );
  }
  return runMutation(
    `mutation CreateRuleSet($data: RegulatedRuleSetCreateInput!) { createRegulatedRuleSet(data: $data) { id } }`,
    { data: { ...data, status: 'draft', jurisdiction: { connect: { id: jurisdictionId } } } },
    response => response.createRegulatedRuleSet,
  );
}

/** Records the signed-in reviewer, approval time and signed policy digest in one write. */
export async function approveRuleSet(id: string, input: { signatureDigest: string; status: 'approved' | 'active' }): Promise<SaveResult> {
  if (!/^[a-f0-9]{64}$/i.test(input.signatureDigest)) return { success: false, error: 'Signed policy document required' };
  const context = await sessionContext();
  const userId = context.session?.itemId;
  if (!userId) return { success: false, error: 'Sign in again to save.' };
  return runMutation(
    `mutation ApproveRuleSet($id: ID!, $data: RegulatedRuleSetUpdateInput!) { updateRegulatedRuleSet(where: { id: $id }, data: $data) { id } }`,
    {
      id,
      data: {
        status: input.status,
        reviewedBy: { connect: { id: userId } },
        approvedAt: new Date().toISOString(),
        signatureDigest: input.signatureDigest.toLowerCase(),
      },
    },
    response => response.updateRegulatedRuleSet,
  );
}

export async function setRuleSetStatus(id: string, status: 'active' | 'retired' | 'emergency_disabled'): Promise<SaveResult> {
  return runMutation(
    `mutation SetRuleSetStatus($id: ID!, $data: RegulatedRuleSetUpdateInput!) { updateRegulatedRuleSet(where: { id: $id }, data: $data) { id } }`,
    { id, data: { status } },
    response => response.updateRegulatedRuleSet,
  );
}
