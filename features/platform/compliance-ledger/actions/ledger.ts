'use server';

import { sessionContext } from '@/features/platform/lib/session-context';
import { PAGE_SIZE } from '../lib/format';

export type LedgerTab = 'decisions' | 'age' | 'tax' | 'carrier' | 'attestations';

export type LedgerQuery = { tab: LedgerTab; state: string | null; purpose: string | null; page: number };

export type LedgerResult =
  | { success: true; items: any[]; count: number; total: number; counts: Record<string, number> }
  | { success: false; error: string };


const ORDER = 'order { id displayId }';

type Spec = {
  list: string;
  stateField: string | null;
  states: string[];
  base: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>;
  query: string;
};

const SPECS: Record<LedgerTab, Spec> = {
  decisions: {
    list: 'ComplianceDecision',
    stateField: 'result',
    states: ['allow', 'deny', 'manual_review'],
    base: {},
    orderBy: { issuedAt: 'desc' },
    query: `id purpose result reasonCodes policyPack policyVersion issuedAt expiresAt revokedAt cart { id } ${ORDER} jurisdiction { code }`,
  },
  age: {
    list: 'AgeVerificationAttempt',
    stateField: 'result',
    states: ['passed', 'failed', 'manual_review', 'pending', 'expired', 'revoked'],
    base: {},
    orderBy: { issuedAt: 'desc' },
    query: `id purpose thresholdAge verifiedAge providerCode result addressMatch reasonCode consentPolicyVersion issuedAt expiresAt cart { id } ${ORDER}`,
  },
  tax: {
    list: 'RegulatedTaxQuote',
    stateField: 'status',
    states: ['quoted', 'committed', 'voided', 'reversed', 'failed', 'expired'],
    base: {},
    orderBy: { issuedAt: 'desc' },
    query: `id providerCode status salesTaxAmount exciseTaxAmount localFeeAmount currencyCode sourceVersion issuedAt expiresAt committedAt jurisdiction { code } cart { id } ${ORDER}`,
  },
  carrier: {
    list: 'CarrierEligibilityDecision',
    stateField: 'result',
    states: ['allow', 'deny', 'manual_review', 'expired', 'revoked'],
    base: {},
    orderBy: { issuedAt: 'desc' },
    query: `id carrierCode serviceCode originJurisdictionCode destinationJurisdictionCode adultSignature packageMarkings result issuedAt expiresAt cart { id } ${ORDER}`,
  },
  attestations: {
    list: 'ComplianceEvent',
    stateField: null,
    states: [],
    base: { eventType: { equals: 'AGE_ATTESTED_21' } },
    orderBy: { occurredAt: 'desc' },
    query: 'id resourceId actorId data occurredAt',
  },
};

function failure(error: unknown, list: string) {
  const value = error as any;
  console.error(`Compliance ledger: ${list} read failed`, { name: value?.name, code: value?.extensions?.code });
  if (/access denied|not allowed|permission/i.test(String(value?.message || ''))) {
    return { success: false as const, error: "You don't have permission to view compliance records." };
  }
  return { success: false as const, error: 'Unable to load compliance records.' };
}

export async function getLedger(input: LedgerQuery): Promise<LedgerResult> {
  const spec = SPECS[input.tab] || SPECS.decisions;
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  const list = (context.query as any)[spec.list];
  const scope: Record<string, unknown> = { ...spec.base };
  if (input.tab === 'decisions' && input.purpose) scope.purpose = { equals: input.purpose };
  const where: Record<string, unknown> = { ...scope };
  if (spec.stateField && input.state && spec.states.includes(input.state)) where[spec.stateField] = { equals: input.state };

  try {
    const [items, count, total, ...stateCounts] = await Promise.all([
      list.findMany({ where, take: PAGE_SIZE, skip: (input.page - 1) * PAGE_SIZE, orderBy: [spec.orderBy], query: spec.query }),
      list.count({ where }),
      list.count({ where: scope }),
      ...spec.states.map(state => list.count({ where: { ...scope, [spec.stateField as string]: { equals: state } } })),
    ]);
    const counts = Object.fromEntries(spec.states.map((state, index) => [state, stateCounts[index] as number]));
    let rows = [...items];
    if (input.tab === 'attestations') rows = await withCustomers(context, rows);
    return { success: true, items: rows, count, total, counts };
  } catch (error) {
    return failure(error, spec.list);
  }
}

/** Attestations name the customer when the signed-in user may read them. */
async function withCustomers(context: any, events: any[]) {
  const ids = [...new Set(events.map(event => event.resourceId).filter(Boolean))];
  if (!ids.length) return events;
  try {
    const users = await context.query.User.findMany({ where: { id: { in: ids } }, take: ids.length, query: 'id name email' });
    const byId = new Map(users.map((user: any) => [user.id, user]));
    return events.map(event => ({ ...event, customer: byId.get(event.resourceId) || null }));
  } catch {
    return events;
  }
}

export type DecisionDetail = {
  decision: any;
  events: any[];
};

export async function getDecision(id: string): Promise<{ success: true; data: DecisionDetail | null } | { success: false; error: string }> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view compliance records.' };
  try {
    const decision = await context.query.ComplianceDecision.findOne({
      where: { id },
      query: `id purpose result reasonCodes ruleIds policyPack policyVersion policyHash snapshotDigest snapshot evidenceReferences
        issuedAt expiresAt revokedAt createdAt idempotencyKey
        cart { id } ${ORDER} merchantProfile { id legalName } jurisdiction { id code name }
        supersededBy { id result issuedAt }
        events(orderBy: [{ occurredAt: asc }], take: 100) { id eventType reasonCode resourceType resourceId occurredAt }`,
    });
    if (!decision) return { success: true, data: null };
    // Cart and order events are written against the resource, not the decision
    const related: Record<string, unknown>[] = [];
    if ((decision as any).cart?.id) related.push({ resourceType: { equals: 'Cart' }, resourceId: { equals: (decision as any).cart.id } });
    if ((decision as any).order?.id) related.push({ order: { id: { equals: (decision as any).order.id } } });
    let resourceEvents: any[] = [];
    if (related.length) {
      try {
        resourceEvents = [...await context.query.ComplianceEvent.findMany({
          where: { OR: related },
          orderBy: [{ occurredAt: 'asc' }],
          take: 100,
          query: 'id eventType reasonCode resourceType resourceId occurredAt',
        })];
      } catch {
        resourceEvents = [];
      }
    }
    const seen = new Set<string>();
    const events = [...((decision as any).events || []), ...resourceEvents]
      .filter(event => (seen.has(event.id) ? false : (seen.add(event.id), true)))
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    return { success: true, data: { decision, events } };
  } catch (error) {
    return failure(error, 'ComplianceDecision');
  }
}
