'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { keystoneContext } from '@/features/keystone/context';
import { assertProductPublicationEvidence } from '@/features/keystone/regulated/enforcement';
import { isCurrentEvidence } from '@/features/regulated-commerce/core/decision-engine';

const FEDERAL_AUTHORIZATION_TYPES = ['federal_marketing_order', 'preexisting_status'];
const MARKETING_FIELDS = ['title', 'subtitle', 'description', 'metadata'];

export type VariantCompliance = {
  id: string;
  title: string;
  sku: string | null;
  classification: {
    id: string;
    status: string;
    current: boolean;
    category: string;
    marketingReviewStatus: string;
    nicotineConcentrationMgMl: string | null;
    liquidVolumeMl: string | null;
    flavor: string | null;
    federalAuthorized: boolean;
  } | null;
};

export type ProductCompliance = {
  regulated: boolean;
  exemptionExpiresAt: string | null;
  publishIssue: string | null;
  variants: VariantCompliance[];
};

type ProductAccess = { id: string; status: string; regulatedCommerceRequired: boolean | null };

// Reads through the signed-in session so only people who can see the product get its evidence state
async function readableProduct(productId: string): Promise<ProductAccess | null> {
  const response = await keystoneClient<{ product: ProductAccess | null }>(
    `query ProductComplianceAccess($id: ID!) { product(where: { id: $id }) { id status regulatedCommerceRequired } }`,
    { id: productId }
  );
  return response.success ? response.data.product : null;
}

async function publicationIssue(productId: string) {
  try {
    await assertProductPublicationEvidence(keystoneContext, productId);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Regulated publication evidence is required';
  }
}

export async function getProductCompliance(productId: string): Promise<ProductCompliance | null> {
  const product = await readableProduct(productId);
  if (!product) return null;

  const now = new Date();
  const record = await keystoneContext.sudo().query.Product.findOne({
    where: { id: productId },
    query: `regulatedCommerceRequired regulatedExemptionExpiresAt productVariants {
      id title sku
      regulatedClassification {
        id status effectiveAt expiresAt category marketingReviewStatus nicotineConcentrationMgMl liquidVolumeMl flavor
        authorizations { authorizationType status effectiveAt expiresAt delistedAt }
      }
    }`,
  });
  if (!record) return null;

  const regulated = record.regulatedCommerceRequired !== false;
  const variants: VariantCompliance[] = (record.productVariants || []).map((variant: any) => {
    const classification = variant.regulatedClassification;
    return {
      id: variant.id,
      title: variant.title || variant.sku || 'Variant',
      sku: variant.sku || null,
      classification: classification ? {
        id: classification.id,
        status: classification.status,
        current: isCurrentEvidence(classification, ['approved'], now),
        category: classification.category,
        marketingReviewStatus: classification.marketingReviewStatus,
        nicotineConcentrationMgMl: classification.nicotineConcentrationMgMl ?? null,
        liquidVolumeMl: classification.liquidVolumeMl ?? null,
        flavor: classification.flavor || null,
        federalAuthorized: (classification.authorizations || []).some((authorization: any) =>
          FEDERAL_AUTHORIZATION_TYPES.includes(authorization.authorizationType) &&
          !authorization.delistedAt && isCurrentEvidence(authorization, ['authorized'], now)),
      } : null,
    };
  });

  return {
    regulated,
    exemptionExpiresAt: regulated ? null : record.regulatedExemptionExpiresAt ?? null,
    publishIssue: await publicationIssue(productId),
    variants,
  };
}

/**
 * The dashboard client replaces save errors with a generic message. For a product save,
 * work out which regulated rule refused it so the merchant sees the reason.
 */
export async function explainProductSaveError(productId: string, data: Record<string, unknown>): Promise<string | null> {
  const product = await readableProduct(productId);
  if (!product) return null;

  const nextStatus = (data.status as string | undefined) ?? product.status;
  const regulated = (data.regulatedCommerceRequired as boolean | undefined) ?? product.regulatedCommerceRequired ?? true;
  if (!regulated) {
    const saved = await keystoneContext.sudo().query.Product.findOne({
      where: { id: productId },
      query: 'regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt',
    });
    const field = (key: string) => (data[key] as string | undefined) ?? saved?.[key];
    const expiresAt = field('regulatedExemptionExpiresAt');
    if (!field('regulatedExemptionReference') || !/^[a-f0-9]{64}$/i.test(field('regulatedExemptionDigest') || '') ||
        !field('regulatedExemptionReviewedAt') || !expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      return 'A reviewed exemption reference and evidence digest are required to disable regulated controls';
    }
    return null;
  }
  if (nextStatus !== 'published') return null;
  if (product.status === 'published' && MARKETING_FIELDS.some(key => data[key] !== undefined)) {
    return 'Unpublish regulated products before changing customer-facing claims';
  }
  return publicationIssue(productId);
}
