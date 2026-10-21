import { evidenceDigest } from '../core/decision-engine';
import { REGULATED_CATEGORIES, type RegulatedCategory } from '../core/decision-types';

type ShopifyMetafield = { namespace: string; key: string; value: string };
type ShopifyVariant = { id: string | number; sku?: string | null; title: string; metafields?: ShopifyMetafield[] };
type ShopifyProduct = {
  id: string | number;
  title: string;
  handle: string;
  status?: string;
  vendor?: string | null;
  product_type?: string | null;
  body_html?: string | null;
  metafields?: ShopifyMetafield[];
  variants: ShopifyVariant[];
};

type ImportIssue = { productId: string; variantId?: string; code: string; message: string };

function fields(values: ShopifyMetafield[] = []) {
  return new Map(values.map(field => [`${field.namespace}.${field.key}`, field.value.trim()]));
}

/**
 * Deterministic, read-only import planning. It never interprets Shopify tags as
 * legal authority and never carries Shopify publication status into Openfront.
 */
export function planShopifyImport(products: ShopifyProduct[]) {
  const importable: any[] = [];
  const quarantine: ImportIssue[] = [];
  for (const product of products) {
    const productId = String(product.id);
    if (!productId || !product.title?.trim() || !product.handle?.trim() || !Array.isArray(product.variants)) {
      quarantine.push({ productId, code: 'INVALID_PRODUCT_SHAPE', message: 'Stable ID, title, handle, and variants are required' });
      continue;
    }
    const productFields = fields(product.metafields);
    const variants = product.variants.flatMap(variant => {
      const variantId = String(variant.id);
      const variantFields = new Map([...productFields, ...fields(variant.metafields)]);
      const category = variantFields.get('regulated.category');
      const manufacturer = variantFields.get('regulated.manufacturer');
      const brand = variantFields.get('regulated.brand') || product.vendor?.trim();
      const sourceReference = variantFields.get('regulated.source_reference');
      if (!REGULATED_CATEGORIES.includes(category as RegulatedCategory) || !manufacturer || !brand || !sourceReference) {
        quarantine.push({
          productId, variantId, code: 'REGULATED_CLASSIFICATION_INCOMPLETE',
          message: 'Explicit category, manufacturer, brand, and source reference are required; values are never inferred from tags',
        });
        return [];
      }
      const nicotineSource = variantFields.get('regulated.nicotine_source') || 'unknown';
      const nicotineConcentration = variantFields.get('regulated.nicotine_mg_ml') || null;
      if (!['none', 'tobacco', 'synthetic', 'other', 'unknown'].includes(nicotineSource) ||
          (nicotineConcentration !== null && (!Number.isFinite(Number(nicotineConcentration)) || Number(nicotineConcentration) < 0))) {
        quarantine.push({ productId, variantId, code: 'INVALID_NICOTINE_DATA', message: 'Nicotine source or concentration is invalid' });
        return [];
      }
      const source = {
        platform: 'shopify', productId, variantId, sourceReference,
        sourceStatus: product.status ?? null, importedMetafields: Object.fromEntries(variantFields),
      };
      return [{
        externalId: `shopify:variant:${variantId}`,
        sku: variant.sku?.trim() || null,
        title: variant.title,
        classification: {
          category, manufacturer, brand, sourceReference,
          nicotineSource,
          nicotineConcentrationMgMl: nicotineConcentration,
          flavor: variantFields.get('regulated.flavor') || null,
          status: 'draft', marketingReviewStatus: 'pending', evidenceDigest: evidenceDigest(source),
          authorizations: [],
        },
        source,
      }];
    });
    if (!variants.length) continue;
    const source = { platform: 'shopify', productId, sourceStatus: product.status ?? null };
    importable.push({
      externalId: `shopify:product:${productId}`,
      title: product.title.trim(), handle: product.handle.trim(), descriptionHtml: product.body_html ?? null,
      status: 'draft', regulatedCommerceRequired: true, sourceDigest: evidenceDigest(source), variants,
    });
  }
  return {
    schemaVersion: 'openfront-vape-shopify-import-plan/v1',
    importable,
    quarantine,
    prohibitedImports: ['stored_identity_documents', 'shopify_publication_authority', 'processor_approval_assumptions'],
  };
}
