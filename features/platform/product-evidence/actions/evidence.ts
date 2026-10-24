'use server';

import { isCurrentEvidence } from '@/features/regulated-commerce/core/decision-engine';
import { runMutation, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

const FEDERAL_TYPES = ['federal_marketing_order', 'preexisting_status'];

export type EvidenceVariant = { id: string; title: string; sku: string | null; productId: string | null; productTitle: string };

export type EvidenceClassification = {
  id: string;
  variant: EvidenceVariant | null;
  category: string;
  nicotineSource: string;
  nicotineConcentrationMgMl: string | null;
  liquidVolumeMl: string | null;
  flavor: string;
  brand: string;
  marketingReviewStatus: string;
  status: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  federal: 'current' | 'missing';
  authorizationCount: number;
};

export type EvidenceAuthorization = {
  id: string;
  classificationId: string | null;
  variant: EvidenceVariant | null;
  authority: string;
  authorizationType: string;
  authorizationIdentifier: string;
  jurisdiction: string | null;
  status: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  delistedAt: string | null;
  lastVerifiedAt: string | null;
};

export type ProductEvidence = {
  classifications: EvidenceClassification[];
  authorizations: EvidenceAuthorization[];
  unclassified: EvidenceVariant[];
};

function variantOf(variant: any): EvidenceVariant | null {
  if (!variant) return null;
  const productTitle = variant.product?.title || '';
  // Single-variant products carry the placeholder "Default Title"
  const title = variant.title && variant.title !== 'Default Title' ? variant.title : '';
  return { id: variant.id, title, sku: variant.sku || null, productId: variant.product?.id || null, productTitle };
}

const VARIANT = 'id title sku product { id title }';

export async function getProductEvidence(): Promise<SaveResult<ProductEvidence>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  try {
    const [classifications, authorizations, unclassified] = await Promise.all([
      context.query.RegulatedProductClassification.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        take: 500,
        query: `id category nicotineSource nicotineConcentrationMgMl liquidVolumeMl flavor brand marketingReviewStatus status effectiveAt expiresAt
          variant { ${VARIANT} }
          authorizations { id authorizationType status effectiveAt expiresAt delistedAt }`,
      }),
      context.query.ProductAuthorization.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        take: 500,
        query: `id authority authorizationType authorizationIdentifier status effectiveAt expiresAt delistedAt lastVerifiedAt
          jurisdiction { code } classification { id variant { ${VARIANT} } }`,
      }),
      context.query.ProductVariant.findMany({
        where: { product: { regulatedCommerceRequired: { equals: true } }, regulatedClassification: null },
        take: 500,
        query: VARIANT,
      }),
    ]);
    const now = new Date();
    return {
      success: true,
      data: {
        classifications: classifications.map((item: any) => {
          const federal = (item.authorizations || []).some((authorization: any) =>
            FEDERAL_TYPES.includes(authorization.authorizationType) && !authorization.delistedAt &&
            isCurrentEvidence(authorization, ['authorized'], now));
          return {
            id: item.id,
            variant: variantOf(item.variant),
            category: item.category,
            nicotineSource: item.nicotineSource,
            nicotineConcentrationMgMl: item.nicotineConcentrationMgMl ?? null,
            liquidVolumeMl: item.liquidVolumeMl ?? null,
            flavor: item.flavor || '',
            brand: item.brand || '',
            marketingReviewStatus: item.marketingReviewStatus,
            status: item.status,
            effectiveAt: item.effectiveAt,
            expiresAt: item.expiresAt,
            federal: federal ? 'current' : 'missing',
            authorizationCount: (item.authorizations || []).length,
          } as EvidenceClassification;
        }),
        authorizations: authorizations.map((item: any) => ({
          id: item.id,
          classificationId: item.classification?.id || null,
          variant: variantOf(item.classification?.variant),
          authority: item.authority,
          authorizationType: item.authorizationType,
          authorizationIdentifier: item.authorizationIdentifier,
          jurisdiction: item.jurisdiction?.code || null,
          status: item.status,
          effectiveAt: item.effectiveAt,
          expiresAt: item.expiresAt,
          delistedAt: item.delistedAt,
          lastVerifiedAt: item.lastVerifiedAt,
        })),
        unclassified: unclassified.map(variantOf).filter((item): item is EvidenceVariant => Boolean(item)),
      },
    };
  } catch (error: any) {
    console.error('Product evidence read failed', { name: error?.name, code: error?.extensions?.code });
    return { success: false, error: 'Unable to load compliance records.' };
  }
}

const CLASSIFICATION_TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  revoke: { from: ['approved'], to: 'revoked' },
  reject: { from: ['review'], to: 'rejected' },
};

export async function transitionClassification(id: string, action: string): Promise<SaveResult> {
  const transition = CLASSIFICATION_TRANSITIONS[action];
  if (!transition) return { success: false, error: 'Unknown action.' };
  return runMutation(
    `mutation TransitionClassification($id: ID!, $status: RegulatedProductClassificationStatusType!) {
      updateRegulatedProductClassification(where: { id: $id }, data: { status: $status }) { id }
    }`,
    { id, status: transition.to },
    response => response.updateRegulatedProductClassification
  );
}

export async function transitionAuthorization(id: string, action: string): Promise<SaveResult> {
  if (action === 'delist') {
    // delistedAt is part of the accepted evidence, so it can only be recorded once the
    // record has left the authorized state; mutation fields run in order.
    return runMutation(
      `mutation DelistAuthorization($id: ID!, $at: DateTime!) {
        status: updateProductAuthorization(where: { id: $id }, data: { status: delisted }) { id }
        delisted: updateProductAuthorization(where: { id: $id }, data: { delistedAt: $at }) { id }
      }`,
      { id, at: new Date().toISOString() },
      response => response.delisted
    );
  }
  const status = action === 'suspend' ? 'suspended' : action === 'expire' ? 'expired' : null;
  if (!status) return { success: false, error: 'Unknown action.' };
  return runMutation(
    `mutation TransitionAuthorization($id: ID!, $status: ProductAuthorizationStatusType!) {
      updateProductAuthorization(where: { id: $id }, data: { status: $status }) { id }
    }`,
    { id, status },
    response => response.updateProductAuthorization
  );
}
