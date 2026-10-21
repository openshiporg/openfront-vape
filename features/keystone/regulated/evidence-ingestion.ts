import { evidenceDigest, isCurrentEvidence } from '../../regulated-commerce/core/decision-engine';
import type { VerificationResult } from '../../regulated-commerce/providers/contracts';
import { assertCartEvidenceFingerprint } from './cart-fingerprint';

const SHA256 = /^[a-f0-9]{64}$/i;

async function activeApproval(context: any, purpose: string, providerCode: string, now = new Date()) {
  const approvals = await context.sudo().query.ProviderApproval.findMany({
    where: { purpose: { equals: purpose }, providerCode: { equals: providerCode }, status: { equals: 'active' } },
    take: 10,
    query: 'id status effectiveAt expiresAt coveredCategories coveredJurisdictionCodes profile { id status pactRegistered killSwitch effectiveAt expiresAt }',
  });
  const current = approvals.filter((entry: any) =>
    isCurrentEvidence(entry, ['active'], now) && isCurrentEvidence(entry.profile, ['active'], now) &&
    entry.profile?.pactRegistered && !entry.profile?.killSwitch,
  );
  if (current.length !== 1) {
    throw new Error(`Exactly one current ${purpose} provider approval is required`);
  }
  return current[0];
}

/**
 * Internal adapter boundary. Call only after the configured adapter verifies the
 * provider signature and retrieves the canonical result. Raw identity data must
 * never be passed to or persisted by this function.
 */
export async function recordVerifiedIdentityResult({
  context,
  cartId,
  providerCode,
  thresholdAge,
  consentPolicyVersion,
  purpose = 'checkout',
  orderId,
  subjectDigest,
  cartFingerprint,
  result,
}: {
  context: any;
  cartId: string;
  providerCode: string;
  thresholdAge: number;
  consentPolicyVersion: string;
  purpose?: 'checkout' | 'delivery';
  orderId?: string;
  subjectDigest: string;
  cartFingerprint: string;
  result: VerificationResult;
}) {
  const providerApproval = await activeApproval(context, 'identity', providerCode);
  await assertCartEvidenceFingerprint(context, cartId, cartFingerprint);
  if (!['checkout', 'delivery'].includes(purpose) || (purpose === 'delivery' && !orderId)) {
    throw new Error('Delivery identity evidence requires an order');
  }
  if (!SHA256.test(subjectDigest) || !SHA256.test(result.evidenceDigest)) {
    throw new Error('Hashed subject and provider evidence digests are required');
  }
  if (!Number.isSafeInteger(thresholdAge) || thresholdAge < 21 || thresholdAge > 120) {
    throw new Error('A valid configured age threshold is required');
  }
  const issuedAt = new Date(result.issuedAt);
  const expiresAt = new Date(result.expiresAt);
  if (![issuedAt, expiresAt].every(value => Number.isFinite(value.getTime())) || expiresAt <= issuedAt) {
    throw new Error('Valid bounded identity evidence timestamps are required');
  }
  const allowedResults = ['passed', 'failed', 'manual_review'];
  if (!allowedResults.includes(result.result) || !Number.isSafeInteger(result.verifiedAge) || result.verifiedAge < 0 || result.verifiedAge > 120) {
    throw new Error('Unsupported identity result');
  }
  const sudo = context.sudo();
  const cartScope = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `id shippingAddress { province country { iso2 } }
      lineItems { productVariant { regulatedClassification { category } } }`,
  });
  const country = String(cartScope?.shippingAddress?.country?.iso2 || '').toUpperCase();
  const province = String(cartScope?.shippingAddress?.province || '').toUpperCase();
  const destinationCode = country && province ? `${country}-${province}` : null;
  const categories = cartScope?.lineItems?.map((line: any) => line.productVariant?.regulatedClassification?.category).filter(Boolean) ?? [];
  if (!cartScope || !destinationCode || !categories.length || categories.length !== cartScope.lineItems.length ||
      !providerApproval.coveredJurisdictionCodes?.includes(destinationCode) ||
      !categories.every((category: string) => providerApproval.coveredCategories?.includes(category))) {
    throw new Error('Identity provider approval does not cover the classified cart and destination');
  }
  return context.transaction(async (transactionContext: any) => {
    const tx = transactionContext.sudo().prisma;
    await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
    await assertCartEvidenceFingerprint(transactionContext, cartId, cartFingerprint);
    const existing = await tx.ageVerificationAttempt.findUnique({ where: { providerTransactionId: result.transactionId } });
    if (existing && (existing.cartId !== cartId || existing.providerCode !== providerCode || existing.cartFingerprint !== cartFingerprint || existing.evidenceDigest !== result.evidenceDigest)) throw new Error('Provider result replay does not match its original scope');
    if (orderId) {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { cartId: true } });
      if (!order || order.cartId !== cartId) throw new Error('Identity evidence order does not belong to the cart');
    }
    const attempt = await tx.ageVerificationAttempt.upsert({
      where: { providerTransactionId: result.transactionId },
      create: {
        cartId, cartFingerprint, orderId: orderId ?? null, subjectDigest, purpose, thresholdAge,
        verifiedAge: result.verifiedAge, providerCode, providerTransactionId: result.transactionId,
        result: result.result, addressMatch: result.addressMatch, evidenceDigest: result.evidenceDigest,
        consentPolicyVersion, issuedAt, expiresAt,
        // A retention period must be selected with the merchant; do not invent
        // a statutory deletion deadline or erase evidence automatically.
        deleteAfter: null,
      },
      update: {},
    });
    await tx.complianceDecision.updateMany({ where: { cartId, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.complianceEvent.create({
      data: {
        eventType: 'identity.result_recorded', resourceType: 'AgeVerificationAttempt', resourceId: attempt.id,
        reasonCode: result.result.toUpperCase(), evidenceDigest: evidenceDigest({ attemptId: attempt.id, providerEvidence: result.evidenceDigest }),
        data: { providerCode, result: result.result, addressMatch: result.addressMatch }, occurredAt: new Date(),
      },
    });
    return attempt;
  });
}
