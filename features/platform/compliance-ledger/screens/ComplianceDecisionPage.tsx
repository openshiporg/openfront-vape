import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, SectionTitle } from '@/features/platform/components/vape-ui';
import {
  CLASSIFICATION_CATEGORY_LABELS,
  CLASSIFICATION_STATUS_LABELS,
  DECISION_PURPOSE_LABELS,
  DECISION_RESULT_LABELS,
} from '@/features/keystone/regulated/labels';
import { getDecision } from '../actions/ledger';
import { outLinkClass } from '../components/LinkTrack';
import { LEDGER_PATH, ORDERS_PATH, dateTime, eventLabel, label, reasonLabel, shortId, stateTone } from '../lib/format';

const breadcrumbs = (id?: string) => [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'link' as const, label: 'Compliance ledger', href: LEDGER_PATH },
  { type: 'page' as const, label: id ? `Decision ${shortId(id)}` : 'Decision' },
];

function Facts({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <ListBand>
      {items.filter(([, value]) => value !== null && value !== undefined && value !== '').map(([name, value]) => (
        <div key={name} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-xs text-muted-foreground">{name}</dt>
          <dd className="min-w-0 break-words text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </ListBand>
  );
}

const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono text-xs tabular-nums break-all">{children}</span>;

const productLine = (product: any) =>
  [
    product?.variantId ? `Variant ${shortId(product.variantId)}` : null,
    label(CLASSIFICATION_CATEGORY_LABELS, product?.category),
    product?.flavor,
    product?.quantity ? `Qty ${product.quantity}` : null,
    product?.classificationStatus ? `Classification ${label(CLASSIFICATION_STATUS_LABELS, product.classificationStatus).toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

export async function ComplianceDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await getDecision(id);

  if (!response.success) {
    return (
      <PageContainer title="Decision" header={<PageTitle title="Decision" />} breadcrumbs={breadcrumbs(id)}>
        <div className="px-4 pb-24 sm:pb-10 md:px-6">
          <Alert variant="destructive"><AlertDescription>{response.error}</AlertDescription></Alert>
        </div>
      </PageContainer>
    );
  }
  if (!response.data) notFound();

  const { decision, events } = response.data;
  const reasons: string[] = Array.isArray(decision.reasonCodes) ? decision.reasonCodes : [];
  const ruleIds: string[] = Array.isArray(decision.ruleIds) ? decision.ruleIds : [];
  const snapshot = (decision.snapshot && typeof decision.snapshot === 'object' ? decision.snapshot : {}) as Record<string, any>;
  const products: any[] = Array.isArray(snapshot.products) ? snapshot.products : [];
  const title = `${label(DECISION_PURPOSE_LABELS, decision.purpose)} decision`;
  const expired = decision.expiresAt && new Date(decision.expiresAt).getTime() <= Date.now();

  const header = (
    <PageTitle
      title={title}
      tone={stateTone(decision.result)}
      state={label(DECISION_RESULT_LABELS, decision.result)}
      meta={<span className="font-mono tabular-nums">{dateTime(decision.issuedAt)}</span>}
    />
  );

  const evidence: Array<[string, ReactNode]> = [
    ['Age verification', snapshot.ageAttemptId ? <Mono>{shortId(snapshot.ageAttemptId)}</Mono> : 'None'],
    ['Tax quote', snapshot.taxQuoteId ? <Mono>{shortId(snapshot.taxQuoteId)}</Mono> : 'None'],
    ['Payment approval', snapshot.paymentApprovalId ? <Mono>{shortId(snapshot.paymentApprovalId)}</Mono> : 'None'],
    ['Carrier decision', snapshot.carrierDecisionId ? <Mono>{shortId(snapshot.carrierDecisionId)}</Mono> : 'None'],
  ];

  return (
    <PageContainer title={title} header={header} breadcrumbs={breadcrumbs(id)}>
      <div className="space-y-8 px-4 pb-24 sm:pb-10 md:px-6">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle meta={reasons.length}>Reasons</SectionTitle>
            <ListBand>
              {reasons.length === 0 ? (
                <div className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
                  <Dot tone="ok" />
                  All checks passed
                </div>
              ) : (
                reasons.map(code => (
                  <div key={code} className="px-4 py-2.5">
                    <span className="flex items-baseline gap-2.5 text-sm text-foreground">
                      <Dot tone="danger" />
                      {reasonLabel(code)}
                    </span>
                    <span className="block pl-[1.125rem] font-mono text-[11px] text-muted-foreground">{code}</span>
                  </div>
                ))
              )}
            </ListBand>
          </div>
          <div>
            <SectionTitle>Decision</SectionTitle>
            <Facts
              items={[
                ['Order', decision.order?.id ? (
                  <Link href={`${ORDERS_PATH}/${decision.order.id}`} className={outLinkClass}>
                    Order {decision.order.displayId ? `#${decision.order.displayId}` : shortId(decision.order.id)}
                    <ArrowUpRight className="size-3" />
                  </Link>
                ) : 'None'],
                ['Cart', decision.cart?.id ? <Mono>{decision.cart.id}</Mono> : null],
                ['Merchant', decision.merchantProfile?.legalName],
                ['Jurisdiction', decision.jurisdiction ? `${decision.jurisdiction.code} · ${decision.jurisdiction.name}` : snapshot.jurisdictionCode || 'Unresolved'],
                ['Issued', <Mono key="i">{dateTime(decision.issuedAt)}</Mono>],
                ['Expires', <Mono key="e">{dateTime(decision.expiresAt)}{expired ? ' (expired)' : ''}</Mono>],
                ['Revoked', decision.revokedAt ? <Mono>{dateTime(decision.revokedAt)}</Mono> : null],
                ['Superseded by', decision.supersededBy ? (
                  <Link href={`${LEDGER_PATH}/${decision.supersededBy.id}`} className={outLinkClass}>
                    {label(DECISION_RESULT_LABELS, decision.supersededBy.result)} · {dateTime(decision.supersededBy.issuedAt)}
                    <ArrowUpRight className="size-3" />
                  </Link>
                ) : null],
              ]}
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle>Policy</SectionTitle>
            <Facts
              items={[
                ['Pack', decision.policyPack],
                ['Version', decision.policyVersion],
                ['Hash', <Mono key="h">{decision.policyHash}</Mono>],
                ['Rules applied', ruleIds.length ? <Mono key="r">{ruleIds.join(', ')}</Mono> : 'None'],
                ['Snapshot SHA-256', <Mono key="s">{decision.snapshotDigest}</Mono>],
              ]}
            />
          </div>
          <div>
            <SectionTitle meta={products.length}>Inputs</SectionTitle>
            <Facts
              items={[
                ...products.slice(0, 20).map((product, index): [string, ReactNode] => [
                  `Item ${index + 1}`,
                  productLine(product) || 'Unknown item',
                ]),
                ...evidence,
              ]}
            />
          </div>
        </section>

        <section>
          <SectionTitle meta={events.length}>Events</SectionTitle>
          <ListBand>
            {events.length === 0 && <div className="px-4 py-3 text-[13px] text-muted-foreground">No events</div>}
            {events.map(event => (
              <div key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2.5 text-sm text-foreground">
                    <Dot tone="muted" />
                    {eventLabel(event.eventType)}
                  </span>
                  {event.reasonCode && (
                    <span className="block pl-[1.125rem] text-xs text-muted-foreground">{reasonLabel(event.reasonCode)}</span>
                  )}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{dateTime(event.occurredAt)}</span>
              </div>
            ))}
          </ListBand>
        </section>
      </div>
    </PageContainer>
  );
}

export default ComplianceDecisionPage;
