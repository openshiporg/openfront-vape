import { evidenceDigest, isCurrentEvidence } from '../../regulated-commerce/core/decision-engine';
import type { RegulatedTaxAdapter } from '../../regulated-commerce/providers/contracts';
import { assertCartEvidenceFingerprint } from './cart-fingerprint';

const SHA256 = /^[a-f0-9]{64}$/i;
const safeAmount = (value: number) => Number.isSafeInteger(value) && value >= 0;

async function approval(context: any, purpose: string, providerCode: string, now = new Date()) {
  const matches = await context.sudo().query.ProviderApproval.findMany({
    where: { purpose: { equals: purpose }, providerCode: { equals: providerCode }, status: { equals: 'active' } },
    take: 10,
    query: 'id status effectiveAt expiresAt coveredCategories coveredJurisdictionCodes shippingProvider { id } profile { id status pactRegistered killSwitch effectiveAt expiresAt originJurisdiction { code } }',
  });
  const current = matches.filter((entry: any) =>
    isCurrentEvidence(entry, ['active'], now) && isCurrentEvidence(entry.profile, ['active'], now) &&
    entry.profile?.pactRegistered && !entry.profile?.killSwitch,
  );
  if (current.length !== 1) {
    throw new Error(`Exactly one current ${purpose} provider approval is required`);
  }
  return current[0];
}

async function cartScope(context: any, cartId: string) {
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: `id region { id currency { code } } shippingAddress { province country { iso2 } }
      lineItems { productVariant { regulatedClassification { category } } }`,
  });
  const country = String(cart?.shippingAddress?.country?.iso2 || '').toUpperCase();
  const province = String(cart?.shippingAddress?.province || '').toUpperCase();
  const jurisdictionCode = country && province ? `${country}-${province}` : null;
  const categories = cart?.lineItems?.map((line: any) => line.productVariant?.regulatedClassification?.category).filter(Boolean) ?? [];
  if (!cart || !jurisdictionCode || !categories.length || categories.length !== cart.lineItems.length) {
    throw new Error('A fully classified regulated cart and resolved destination are required');
  }
  return { cart, jurisdictionCode, categories };
}

function assertApprovalScope(providerApproval: any, scope: { jurisdictionCode: string; categories: string[] }) {
  if (!providerApproval.coveredJurisdictionCodes?.includes(scope.jurisdictionCode) ||
      !scope.categories.every(category => providerApproval.coveredCategories?.includes(category))) {
    throw new Error('Provider approval does not cover the cart category and jurisdiction');
  }
}

/** Persist a canonical quote only after an approved tax adapter returns it. */
export async function recordRegulatedTaxQuote({ context, cartId, jurisdictionId, providerCode, quote }: any) {
  const providerApproval = await approval(context, 'tax', providerCode);
  await assertCartEvidenceFingerprint(context, cartId, quote.cartFingerprint);
  const scope = await cartScope(context, cartId);
  assertApprovalScope(providerApproval, scope);
  const jurisdiction = await context.sudo().query.Jurisdiction.findOne({ where: { id: jurisdictionId }, query: 'id code' });
  if (jurisdiction?.code !== scope.jurisdictionCode ||
      String(quote.currencyCode).toUpperCase() !== String(scope.cart.region?.currency?.code).toUpperCase()) {
    throw new Error('Tax quote jurisdiction or currency does not match the cart');
  }
  const { salesTaxAmount, exciseTaxAmount, localFeeAmount } = quote;
  if (!String(quote.providerReference || '').trim() || !String(quote.sourceVersion || '').trim() ||
      ![salesTaxAmount, exciseTaxAmount, localFeeAmount].every(safeAmount) || !SHA256.test(quote.evidenceDigest)) {
    throw new Error('Complete non-negative tax amounts and an evidence digest are required');
  }
  const issuedAt = new Date(quote.issuedAt);
  const expiresAt = new Date(quote.expiresAt);
  if (![issuedAt, expiresAt].every(value => Number.isFinite(value.getTime())) || expiresAt <= issuedAt) {
    throw new Error('Valid bounded tax evidence timestamps are required');
  }
  const sudo = context.sudo();
  const idempotencyKey = `tax:${cartId}:${providerCode}:${evidenceDigest({ providerReference: quote.providerReference, evidenceDigest: quote.evidenceDigest })}`;
  return context.transaction(async (transactionContext: any) => {
    const tx = transactionContext.sudo().prisma;
    await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
    await assertCartEvidenceFingerprint(transactionContext, cartId, quote.cartFingerprint);
    const stored = await tx.regulatedTaxQuote.upsert({
      where: { idempotencyKey },
      create: {
      cartId, cartFingerprint: quote.cartFingerprint, jurisdictionId, providerCode, providerReference: quote.providerReference, idempotencyKey,
      status: 'quoted', salesTaxAmount, exciseTaxAmount, localFeeAmount,
      currencyCode: String(quote.currencyCode).toUpperCase(), breakdown: quote.breakdown ?? [],
      stampRequirements: quote.stampRequirements ?? [], sourceVersion: quote.sourceVersion,
      evidenceDigest: quote.evidenceDigest, issuedAt, expiresAt,
      },
      update: {},
    });
    await tx.complianceDecision.updateMany({ where: { cartId, revokedAt: null }, data: { revokedAt: new Date() } });
    return stored;
  });
}

/** Commit externally first; only provider acknowledgement can produce committed evidence. */
export async function commitRegulatedTaxQuote({ context, quoteId, adapter, idempotencyKey }: {
  context: any; quoteId: string; adapter: RegulatedTaxAdapter; idempotencyKey: string;
}) {
  if (!idempotencyKey?.trim()) throw new Error('Tax commit idempotency key is required');
  const sudo = context.sudo();
  const quote = await sudo.prisma.regulatedTaxQuote.findUnique({ where: { id: quoteId } });
  if (quote?.status === 'committed') return quote;
  if (!quote || quote.status !== 'quoted' || quote.expiresAt <= new Date()) throw new Error('A current quoted tax record is required');
  await approval(context, 'tax', quote.providerCode);
  await assertCartEvidenceFingerprint(context, quote.cartId, quote.cartFingerprint);
  const providerResult = await adapter.commit({ quoteReference: quote.providerReference, idempotencyKey: idempotencyKey.trim() });
  const expectedTotal = quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;
  if (!providerResult || providerResult.status !== 'committed' || !providerResult.reference ||
      providerResult.totalAmount !== expectedTotal || !SHA256.test(providerResult.evidenceDigest)) {
    throw new Error('Tax provider did not acknowledge the exact quoted amount');
  }
  const committedAt = new Date();
  return context.transaction(async (transactionContext: any) => {
    const tx = transactionContext.sudo().prisma;
    await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${quote.cartId} FOR UPDATE`;
    await assertCartEvidenceFingerprint(transactionContext, quote.cartId, quote.cartFingerprint);
    const updated = await tx.regulatedTaxQuote.update({
      where: { id: quote.id },
      data: { status: 'committed', committedAt, providerReference: String(providerResult.reference) },
    });
    await tx.complianceDecision.updateMany({ where: { cartId: quote.cartId, revokedAt: null }, data: { revokedAt: committedAt } });
    await tx.complianceEvent.create({
      data: {
        eventType: 'tax.commit_acknowledged', resourceType: 'RegulatedTaxQuote', resourceId: quote.id,
        reasonCode: 'PROVIDER_ACKNOWLEDGED', evidenceDigest: evidenceDigest({ quoteId, reference: providerResult.reference, providerEvidence: providerResult.evidenceDigest, committedAt: committedAt.toISOString() }),
        data: { providerCode: quote.providerCode, providerAcknowledged: true }, occurredAt: committedAt,
      },
    });
    return updated;
  });
}

/** Persist eligibility only after an approved carrier adapter returns it. */
export async function recordCarrierEligibility({ context, cartId, shippingOptionId, providerCode, decision }: any) {
  const providerApproval = await approval(context, 'carrier', providerCode);
  await assertCartEvidenceFingerprint(context, cartId, decision.cartFingerprint);
  if (!decision.rateId || !SHA256.test(decision.packageDigest || '')) throw new Error('An exact provider rate and package digest are required');
  const scope = await cartScope(context, cartId);
  assertApprovalScope(providerApproval, scope);
  if (!providerApproval.shippingProvider?.id) throw new Error('Carrier approval is not bound to a shipping provider');
  if (decision.destinationJurisdictionCode !== scope.jurisdictionCode ||
      decision.originJurisdictionCode !== providerApproval.profile?.originJurisdiction?.code) {
    throw new Error('Carrier decision origin or destination does not match merchant and cart scope');
  }
  if (!SHA256.test(decision.evidenceDigest) || !['allow', 'deny', 'manual_review'].includes(decision.result)) {
    throw new Error('Canonical carrier result and evidence digest are required');
  }
  if (decision.result === 'allow' && decision.adultSignature !== true) {
    throw new Error('Allowed regulated carrier service must require adult signature');
  }
  const issuedAt = new Date(decision.issuedAt);
  const expiresAt = new Date(decision.expiresAt);
  if (![issuedAt, expiresAt].every(value => Number.isFinite(value.getTime())) || expiresAt <= issuedAt) {
    throw new Error('Valid bounded carrier evidence timestamps are required');
  }
  const idempotencyKey = `carrier:${cartId}:${shippingOptionId}:${evidenceDigest(decision)}`;
  const sudo = context.sudo();
  return context.transaction(async (transactionContext: any) => {
    const tx = transactionContext.sudo().prisma;
    await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
    await assertCartEvidenceFingerprint(transactionContext, cartId, decision.cartFingerprint);
    const stored = await tx.carrierEligibilityDecision.upsert({
      where: { idempotencyKey },
      create: {
        cartId, cartFingerprint: decision.cartFingerprint, rateId: decision.rateId, packageDigest: decision.packageDigest,
        shippingOptionId, providerApprovalId: providerApproval.id,
        carrierCode: decision.carrierCode, serviceCode: decision.serviceCode,
        originJurisdictionCode: decision.originJurisdictionCode,
        destinationJurisdictionCode: decision.destinationJurisdictionCode,
        regulatedCategories: decision.regulatedCategories ?? [], quantities: decision.quantities ?? [],
        adultSignature: decision.adultSignature, packageMarkings: decision.packageMarkings ?? [],
        result: decision.result, evidenceDigest: decision.evidenceDigest, issuedAt, expiresAt, idempotencyKey,
      },
      update: {},
    });
    await tx.complianceDecision.updateMany({ where: { cartId, revokedAt: null }, data: { revokedAt: new Date() } });
    return stored;
  });
}
