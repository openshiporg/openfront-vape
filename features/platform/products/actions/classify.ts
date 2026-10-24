'use server';

import { keystoneContext } from '@/features/keystone/context';
import { runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type ClassificationInput = {
  category: string;
  nicotineSource: string;
  nicotineConcentrationMgMl: string;
  liquidVolumeMl: string;
  flavor: string;
  packageUnits: number;
  manufacturer: string;
  brand: string;
  sourceReference: string;
  evidenceDigest?: string;
  marketingReviewStatus: string;
  marketingEvidenceDigest?: string;
  status: string;
  effectiveAt: string;
  expiresAt: string;
};

export type AuthorizationInput = {
  authority: string;
  authorizationType: string;
  authorizationIdentifier: string;
  evidenceUrl: string;
  evidenceDigest: string;
  jurisdictionId: string;
  status: string;
  effectiveAt: string;
  expiresAt: string;
};

export type ClassifyForm = {
  variant: { id: string; title: string; productId: string };
  classification: (Omit<ClassificationInput, 'evidenceDigest' | 'marketingEvidenceDigest'> & {
    id: string;
    hasEvidence: boolean;
    hasMarketingEvidence: boolean;
  }) | null;
  authorizations: Array<{
    id: string;
    authority: string;
    authorizationType: string;
    authorizationIdentifier: string;
    status: string;
    effectiveAt: string | null;
    expiresAt: string | null;
    jurisdiction: string | null;
  }>;
  jurisdictions: Array<{ id: string; code: string; name: string }>;
};

const day = (value: string | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : '');
const iso = (value: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null);
const decimal = (value: string) => (value.trim() === '' ? null : value.trim());

export async function getClassifyForm(variantId: string): Promise<ClassifyForm | null> {
  const context = await sessionContext();
  if (!context.session?.itemId) return null;
  try {
    const [variant, jurisdictions] = await Promise.all([
      context.query.ProductVariant.findOne({
        where: { id: variantId },
        query: `id title sku product { id title }
          regulatedClassification {
            id category nicotineSource nicotineConcentrationMgMl liquidVolumeMl flavor packageUnits manufacturer brand
            sourceReference marketingReviewStatus status effectiveAt expiresAt
            authorizations { id authority authorizationType authorizationIdentifier status effectiveAt expiresAt jurisdiction { code } }
          }`,
      }),
      context.query.Jurisdiction.findMany({ orderBy: [{ code: 'asc' }], take: 100, query: 'id code name' }),
    ]);
    if (!variant) return null;

    const classification = variant.regulatedClassification;
    // Digests are never readable; only whether one is on file
    const evidence = classification
      ? await keystoneContext.sudo().query.RegulatedProductClassification.findOne({
          where: { id: classification.id },
          query: 'evidenceDigest marketingEvidenceDigest',
        })
      : null;

    return {
      // Single-variant products carry the placeholder "Default Title"
      variant: {
        id: variant.id,
        title: (variant.title && variant.title !== 'Default Title' ? variant.title : variant.product?.title) || variant.sku || 'Variant',
        productId: variant.product?.id,
      },
      classification: classification ? {
        id: classification.id,
        category: classification.category,
        nicotineSource: classification.nicotineSource,
        nicotineConcentrationMgMl: classification.nicotineConcentrationMgMl ?? '',
        liquidVolumeMl: classification.liquidVolumeMl ?? '',
        flavor: classification.flavor || '',
        packageUnits: classification.packageUnits ?? 1,
        manufacturer: classification.manufacturer || '',
        brand: classification.brand || '',
        sourceReference: classification.sourceReference || '',
        marketingReviewStatus: classification.marketingReviewStatus,
        status: classification.status,
        effectiveAt: day(classification.effectiveAt),
        expiresAt: day(classification.expiresAt),
        hasEvidence: Boolean(evidence?.evidenceDigest),
        hasMarketingEvidence: Boolean(evidence?.marketingEvidenceDigest),
      } : null,
      authorizations: (classification?.authorizations || []).map((authorization: any) => ({
        id: authorization.id,
        authority: authorization.authority,
        authorizationType: authorization.authorizationType,
        authorizationIdentifier: authorization.authorizationIdentifier,
        status: authorization.status,
        effectiveAt: authorization.effectiveAt,
        expiresAt: authorization.expiresAt,
        jurisdiction: authorization.jurisdiction?.code || null,
      })),
      jurisdictions: jurisdictions as ClassifyForm["jurisdictions"],
    };
  } catch {
    return null;
  }
}

export async function saveClassification(
  variantId: string,
  classificationId: string | null,
  input: ClassificationInput
): Promise<SaveResult> {
  const context = await sessionContext();
  const userId = context.session?.itemId;
  const data: Record<string, unknown> = {
    category: input.category,
    nicotineSource: input.nicotineSource,
    nicotineConcentrationMgMl: decimal(input.nicotineConcentrationMgMl),
    liquidVolumeMl: decimal(input.liquidVolumeMl),
    flavor: input.flavor.trim(),
    packageUnits: input.packageUnits,
    manufacturer: input.manufacturer.trim(),
    brand: input.brand.trim(),
    sourceReference: input.sourceReference.trim(),
    marketingReviewStatus: input.marketingReviewStatus,
    status: input.status,
    effectiveAt: iso(input.effectiveAt),
    expiresAt: iso(input.expiresAt),
  };
  if (input.evidenceDigest) data.evidenceDigest = input.evidenceDigest;
  if (input.marketingEvidenceDigest) data.marketingEvidenceDigest = input.marketingEvidenceDigest;
  if (input.marketingReviewStatus === 'approved') data.marketingReviewedAt = new Date().toISOString();
  if (input.status === 'approved' && userId) data.reviewedBy = { connect: { id: userId } };

  // No revalidatePath: re-rendering the product route inside the action response
  // crashed the page; the sheet reloads its own data after a save.
  return classificationId
    ? await runMutation(
        `mutation SaveClassification($id: ID!, $data: RegulatedProductClassificationUpdateInput!) {
          updateRegulatedProductClassification(where: { id: $id }, data: $data) { id }
        }`,
        { id: classificationId, data },
        response => response.updateRegulatedProductClassification
      )
    : await runMutation(
        `mutation CreateClassification($data: RegulatedProductClassificationCreateInput!) {
          createRegulatedProductClassification(data: $data) { id }
        }`,
        { data: { ...data, variant: { connect: { id: variantId } } } },
        response => response.createRegulatedProductClassification
      );
}

export async function saveAuthorization(classificationId: string, input: AuthorizationInput): Promise<SaveResult> {
  const data: Record<string, unknown> = {
    classification: { connect: { id: classificationId } },
    authority: input.authority.trim(),
    authorizationType: input.authorizationType,
    authorizationIdentifier: input.authorizationIdentifier.trim(),
    evidenceUrl: input.evidenceUrl.trim(),
    evidenceDigest: input.evidenceDigest,
    status: input.status,
    effectiveAt: iso(input.effectiveAt),
    expiresAt: iso(input.expiresAt),
  };
  if (input.jurisdictionId) data.jurisdiction = { connect: { id: input.jurisdictionId } };
  if (input.status === 'authorized') data.lastVerifiedAt = new Date().toISOString();

  return runMutation(
    `mutation CreateAuthorization($data: ProductAuthorizationCreateInput!) {
      createProductAuthorization(data: $data) { id }
    }`,
    { data },
    response => response.createProductAuthorization
  );
}
