'use server';

import { runCommand } from '@/features/platform/lib/run-command';
import { sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type OrderLabel = {
  id: string;
  status: string;
  carrier: string | null;
  service: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  labelUrl: string | null;
  createdAt: string | null;
  cancellation: { status: string; refundStatus: string | null; recordedAt: string | null } | null;
  provider: { id: string; name: string } | null;
  fulfillment: { id: string; canceledAt: string | null } | null;
};

export type CarrierDecision = {
  id: string;
  result: string;
  carrierCode: string;
  serviceCode: string;
  rateId: string | null;
  adultSignature: boolean;
  packageMarkings: string[];
  originJurisdictionCode: string;
  destinationJurisdictionCode: string;
  issuedAt: string;
  expiresAt: string;
  boundToOrder: boolean;
};

export type FulfilmentEvidence = {
  labels: OrderLabel[] | { error: string };
  carrier: CarrierDecision[] | { error: string };
};

const denied = (error: unknown, fallback: string) =>
  /access denied|not allowed|permission/i.test(String((error as any)?.message || '')) ? "You don't have permission to view these records." : fallback;

export async function getFulfilmentEvidence(orderId: string): Promise<FulfilmentEvidence> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { labels: { error: 'Sign in again.' }, carrier: { error: 'Sign in again.' } };

  let labels: FulfilmentEvidence['labels'];
  try {
    const rows = await context.query.ShippingLabel.findMany({
      where: { order: { id: { equals: orderId } } },
      orderBy: [{ createdAt: 'desc' }],
      query: 'id status carrier service trackingNumber trackingUrl labelUrl createdAt metadata provider { id name } fulfillment { id canceledAt }',
    });
    labels = rows.map((row: any) => {
      const cancellation = row.metadata?.cancellation;
      return {
        id: row.id,
        status: row.status,
        carrier: row.carrier ?? null,
        service: row.service ?? null,
        trackingNumber: row.trackingNumber ?? null,
        trackingUrl: row.trackingUrl ?? null,
        labelUrl: row.labelUrl ?? null,
        createdAt: row.createdAt ?? null,
        cancellation: cancellation
          ? { status: String(cancellation.status || 'unknown'), refundStatus: cancellation.refundStatus ?? null, recordedAt: cancellation.recordedAt ?? null }
          : null,
        provider: row.provider ? { id: row.provider.id, name: row.provider.name } : null,
        fulfillment: row.fulfillment ? { id: row.fulfillment.id, canceledAt: row.fulfillment.canceledAt ?? null } : null,
      };
    });
  } catch (error) {
    labels = { error: denied(error, 'Unable to load shipping labels.') };
  }

  let carrier: FulfilmentEvidence['carrier'];
  try {
    const order = await context.query.Order.findOne({ where: { id: orderId }, query: 'id cart { id }' });
    const cartId = order?.cart?.id as string | undefined;
    const rows = await context.query.CarrierEligibilityDecision.findMany({
      where: cartId ? { OR: [{ order: { id: { equals: orderId } } }, { cart: { id: { equals: cartId } } }] } : { order: { id: { equals: orderId } } },
      orderBy: [{ issuedAt: 'desc' }],
      take: 20,
      query: 'id result carrierCode serviceCode rateId adultSignature packageMarkings originJurisdictionCode destinationJurisdictionCode issuedAt expiresAt order { id }',
    });
    carrier = rows.map((row: any) => ({
      id: row.id,
      result: row.result,
      carrierCode: row.carrierCode,
      serviceCode: row.serviceCode,
      rateId: row.rateId ?? null,
      adultSignature: !!row.adultSignature,
      packageMarkings: Array.isArray(row.packageMarkings) ? row.packageMarkings.map(String) : [],
      originJurisdictionCode: row.originJurisdictionCode,
      destinationJurisdictionCode: row.destinationJurisdictionCode,
      issuedAt: row.issuedAt,
      expiresAt: row.expiresAt,
      boundToOrder: row.order?.id === orderId,
    }));
  } catch (error) {
    carrier = { error: denied(error, 'Unable to load carrier eligibility.') };
  }

  return { labels, carrier };
}

export async function cancelShippingLabel(providerId: string, labelId: string): Promise<SaveResult<{ success: boolean; refundStatus: string | null; error: string | null }>> {
  const result = await runCommand(
    `mutation CancelShippingLabel($providerId: ID!, $labelId: ID!) {
      cancelShippingLabel(providerId: $providerId, labelId: $labelId) { success refundStatus error }
    }`,
    { providerId, labelId },
    data => data.cancelShippingLabel
  );
  if (result.success && !result.data?.success) {
    return { success: false, error: result.data?.error || 'The carrier did not confirm the cancellation.' };
  }
  return result;
}
