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
