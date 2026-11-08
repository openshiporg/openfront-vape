import { evidenceDigest } from '../../regulated-commerce/core/decision-engine';

const SHA256 = /^[a-f0-9]{64}$/i;
import type { RegulatedTaxAdapter } from '../../regulated-commerce/providers/contracts';

/**
 * Calls the approved adapter before recording a reversal. A database write can
 * never stand in for provider acknowledgement.
 */
export async function reverseRegulatedTaxCommit({
  context,
  quoteId,
  adapter,
  idempotencyKey,
}: {
  context: any;
  quoteId: string;
  adapter: RegulatedTaxAdapter;
  idempotencyKey: string;
}) {
  if (!idempotencyKey?.trim()) throw new Error('Tax reversal idempotency key is required');
  const sudo = context.sudo();
  const quote = await sudo.prisma.regulatedTaxQuote.findUnique({ where: { id: quoteId } });
  if (quote?.status === 'reversed') return quote;
  if (!quote || quote.status !== 'committed' || !quote.providerReference) {
    throw new Error('A committed regulated tax quote is required');
  }
  const providerResult = await adapter.reverse({
    commitReference: quote.providerReference,
    idempotencyKey: idempotencyKey.trim(),
  });
  const expectedTotal = quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;
  if (!providerResult || !['reversed', 'voided'].includes(providerResult.status) || !providerResult.reference ||
      providerResult.totalAmount !== expectedTotal || !SHA256.test(providerResult.evidenceDigest)) {
    throw new Error('Tax provider did not acknowledge the exact reversal amount');
  }
  const at = new Date();
  return sudo.prisma.$transaction(async (tx: any) => {
    const updated = await tx.regulatedTaxQuote.update({
      where: { id: quote.id },
      data: { status: 'reversed', reversalReference: String(providerResult.reference) },
    });
    await tx.complianceEvent.create({
      data: {
        orderId: quote.orderId,
        eventType: 'tax.reversal_acknowledged', resourceType: 'RegulatedTaxQuote', resourceId: quote.id,
        actorId: context.session?.itemId, reasonCode: 'PROVIDER_ACKNOWLEDGED',
        evidenceDigest: evidenceDigest({ quoteId, providerReference: providerResult.reference, providerEvidence: providerResult.evidenceDigest, at: at.toISOString() }),
        data: { providerCode: quote.providerCode, providerAcknowledged: true }, occurredAt: at,
      },
    });
    return updated;
  });
}

/**
 * Append-only tax reversal for a canceled order. The committed quote is never rewritten: after the
 * adapter acknowledges the reversal, a second row (status `reversed`, linked to the order only, so the
 * cart's evidence lookups never see it) records it. Replays return the existing row.
 */
export async function appendOrderTaxReversal({
  context,
  orderId,
  adapterFor,
}: {
  context: any;
  orderId: string;
  adapterFor: (providerCode: string) => RegulatedTaxAdapter | null;
}) {
  const sudo = context.sudo();
  const committed = await sudo.prisma.regulatedTaxQuote.findMany({ where: { orderId, status: 'committed' } });
  const rows: any[] = [];
  for (const quote of committed) {
    const idempotencyKey = `tax-reversal:${quote.id}`;
    const existing = await sudo.prisma.regulatedTaxQuote.findUnique({ where: { idempotencyKey } });
    if (existing) { rows.push(existing); continue; }
    const adapter = adapterFor(quote.providerCode);
    if (!adapter || !quote.providerReference) continue;
    const providerResult = await adapter.reverse({ commitReference: quote.providerReference, idempotencyKey });
    const expectedTotal = quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;
    if (!providerResult || !['reversed', 'voided'].includes(providerResult.status) || !providerResult.reference ||
        providerResult.totalAmount !== expectedTotal || !SHA256.test(providerResult.evidenceDigest)) {
      throw new Error('Tax provider did not acknowledge the exact reversal amount');
    }
    const at = new Date();
    rows.push(await sudo.prisma.$transaction(async (tx: any) => {
      const created = await tx.regulatedTaxQuote.create({
        data: {
          orderId, jurisdictionId: quote.jurisdictionId, providerCode: quote.providerCode,
          providerReference: quote.providerReference, idempotencyKey, status: 'reversed',
          salesTaxAmount: quote.salesTaxAmount, exciseTaxAmount: quote.exciseTaxAmount, localFeeAmount: quote.localFeeAmount,
          currencyCode: quote.currencyCode, breakdown: quote.breakdown ?? [], stampRequirements: quote.stampRequirements ?? [],
          sourceVersion: quote.sourceVersion, evidenceDigest: providerResult.evidenceDigest,
          issuedAt: at, expiresAt: quote.expiresAt, committedAt: quote.committedAt,
          reversalReference: String(providerResult.reference),
        },
      });
      await tx.complianceEvent.create({
        data: {
          orderId, eventType: 'tax.reversal_acknowledged', resourceType: 'RegulatedTaxQuote', resourceId: created.id,
          actorId: context.session?.itemId, reasonCode: 'PROVIDER_ACKNOWLEDGED',
          evidenceDigest: evidenceDigest({ quoteId: quote.id, reversalId: created.id, providerReference: providerResult.reference, providerEvidence: providerResult.evidenceDigest, at: at.toISOString() }),
          data: { providerCode: quote.providerCode, providerAcknowledged: true, reversesQuoteId: quote.id }, occurredAt: at,
        },
      });
      return created;
    }));
  }
  return rows;
}
