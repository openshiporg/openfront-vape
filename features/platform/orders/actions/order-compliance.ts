'use server';

import { sessionContext } from '@/features/platform/lib/session-context';

export type OrderComplianceEvent = {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  reasonCode: string | null;
  occurredAt: string;
  decisionId: string | null;
};

export type OrderComplianceResult = { success: true; events: OrderComplianceEvent[] } | { success: false; error: string };

export async function getOrderCompliance(orderId: string): Promise<OrderComplianceResult> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  try {
    const rows = await context.query.ComplianceEvent.findMany({
      where: {
        OR: [
          { order: { id: { equals: orderId } } },
          { resourceType: { equals: 'Order' }, resourceId: { equals: orderId } },
        ],
      },
      orderBy: [{ occurredAt: 'desc' }],
      take: 50,
      query: 'id eventType resourceType resourceId reasonCode occurredAt decision { id }',
    });
    return {
      success: true,
      events: rows.map((row: any) => ({
        id: row.id,
        eventType: row.eventType,
        resourceType: row.resourceType,
        resourceId: row.resourceId,
        reasonCode: row.reasonCode ?? null,
        occurredAt: row.occurredAt,
        decisionId: row.decision?.id ?? null,
      })),
    };
  } catch (error) {
    const message = String((error as any)?.message || '');
    return {
      success: false,
      error: /access denied|not allowed|permission/i.test(message) ? "You don't have permission to view compliance records." : 'Unable to load compliance records.',
    };
  }
}
