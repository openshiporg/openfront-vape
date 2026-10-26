import Link from 'next/link';
import type { ReactNode } from 'react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, PageTitle, SectionTitle, Stamp, Td, Th, Tr } from '@/features/platform/components/vape-ui';
import {
  ADDRESS_MATCH_LABELS,
  AGE_RESULT_LABELS,
  DECISION_PURPOSE_LABELS,
  DECISION_RESULT_LABELS,
  TAX_QUOTE_STATUS_LABELS,
} from '@/features/keystone/regulated/labels';
import { getLedger, getTodayAttention, type LedgerTab } from '../actions/ledger';
import { FilteredEmpty } from '../components/FilteredEmpty';
import { LinkSelect } from '../components/LinkSelect';
import { LinkTrack, OrderLink, Pager } from '../components/LinkTrack';
import { LEDGER_PATH, PAGE_SIZE, dateTime, filterValue, label, money, pageNumber, reasonLabel, shortId, stateTone } from '../lib/format';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Compliance ledger' },
];

const TABS: Array<{ key: LedgerTab; label: string }> = [
  { key: 'decisions', label: 'Decisions' },
  { key: 'age', label: 'Age verification' },
  { key: 'tax', label: 'Tax quotes' },
  { key: 'carrier', label: 'Carrier eligibility' },
  { key: 'attestations', label: 'Age attestations' },
];

const STATE_LABELS: Record<LedgerTab, Record<string, string>> = {
  decisions: { allow: 'Allowed', deny: 'Denied', manual_review: 'Manual review' },
  age: { passed: 'Passed', failed: 'Failed', manual_review: 'Manual review', pending: 'Pending', expired: 'Expired', revoked: 'Revoked' },
  tax: TAX_QUOTE_STATUS_LABELS,
  carrier: { allow: 'Allowed', deny: 'Denied', manual_review: 'Manual review', expired: 'Expired', revoked: 'Revoked' },
  attestations: {},
};

const EMPTY: Record<LedgerTab, string> = {
  decisions: 'No compliance decisions',
  age: 'No age verification attempts',
  tax: 'No tax quotes',
  carrier: 'No carrier decisions',
  attestations: 'No age attestations',
};

const Mono = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={`font-mono text-[12px] tabular-nums ${className ?? ''}`}>{children}</span>
);

/** HH:MM UTC for today's log; the full date and time sit in the title. */
function clock(value: string | null | undefined) {
  if (!value) return '';
  return dateTime(value).slice(11);
}

function Serial({ id, href }: { id: string; href?: string }) {
  if (!href) return <Mono className="text-muted-foreground">{shortId(id)}</Mono>;
  return (
    <Link href={href} className="inline-flex min-h-8 items-center font-mono text-[12px] tabular-nums text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground max-sm:min-h-10">
      {shortId(id)}
    </Link>
  );
}

function Rule({ item }: { item: any }) {
  const reasons: string[] = Array.isArray(item.reasonCodes) ? item.reasonCodes : [];
  const ruleIds: string[] = Array.isArray(item.ruleIds) ? item.ruleIds : [];
  if (!reasons.length && !ruleIds.length) return <span className="text-muted-foreground">None</span>;
  return (
    <span className="block max-w-[22rem] truncate" title={[...reasons, ...ruleIds].join(', ')}>
      {reasons.length ? reasonLabel(reasons[0]) : <Mono>{ruleIds[0]}</Mono>}
      {reasons.length > 1 && <span className="text-muted-foreground"> +{reasons.length - 1}</span>}
    </span>
  );
}

function actor(item: any) {
  const id = Array.isArray(item.events) ? item.events[0]?.actorId : null;
  return id ? <Mono>{shortId(id)}</Mono> : <span className="text-muted-foreground">System</span>;
}

/** Decision log: time, decision stamp, rule, jurisdiction, subject, actor, record serial. */
function DecisionLog({ items, timeOnly }: { items: any[]; timeOnly?: boolean }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Decision</Th>
          <Th>Rule</Th>
          <Th priority={3}>Purpose</Th>
          <Th priority={2}>Jurisdiction</Th>
          <Th priority={2}>Subject</Th>
          <Th priority={3}>Actor</Th>
          <Th align="right">Record</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id}>
            <Td className="whitespace-nowrap">
              <Mono>
                <span title={dateTime(item.issuedAt)}>{timeOnly ? clock(item.issuedAt) : dateTime(item.issuedAt)}</span>
              </Mono>
            </Td>
            <Td><Stamp tone={stateTone(item.result)}>{label(DECISION_RESULT_LABELS, item.result)}</Stamp></Td>
            <Td className="min-w-0"><Rule item={item} /></Td>
            <Td priority={3} className="whitespace-nowrap">{label(DECISION_PURPOSE_LABELS, item.purpose)}</Td>
            <Td priority={2}>{item.jurisdiction?.code ? <Mono>{item.jurisdiction.code}</Mono> : <span className="text-muted-foreground">None</span>}</Td>
            <Td priority={2} className="whitespace-nowrap"><OrderLink order={item.order} cartId={item.cart?.id} /></Td>
            <Td priority={3}>{actor(item)}</Td>
            <Td align="right"><Serial id={item.id} href={`${LEDGER_PATH}/${item.id}`} /></Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function AgeTable({ items }: { items: any[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Result</Th>
          <Th>Provider</Th>
          <Th priority={3}>Purpose</Th>
          <Th priority={2} align="right">Age</Th>
          <Th priority={3}>Address</Th>
          <Th priority={3}>Reason</Th>
          <Th priority={2}>Subject</Th>
          <Th align="right">Record</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id}>
            <Td className="whitespace-nowrap"><Mono>{dateTime(item.issuedAt)}</Mono></Td>
            <Td><Stamp tone={stateTone(item.result)}>{label(AGE_RESULT_LABELS, item.result)}</Stamp></Td>
            <Td className="whitespace-nowrap">{item.providerCode}</Td>
            <Td priority={3} className="whitespace-nowrap">{label(DECISION_PURPOSE_LABELS, item.purpose)}</Td>
            <Td priority={2} align="right"><Mono>{item.verifiedAge ?? '–'} / {item.thresholdAge}</Mono></Td>
            <Td priority={3} className="whitespace-nowrap">{label(ADDRESS_MATCH_LABELS, item.addressMatch)}</Td>
            <Td priority={3}>{item.reasonCode ? reasonLabel(item.reasonCode) : <span className="text-muted-foreground">None</span>}</Td>
            <Td priority={2} className="whitespace-nowrap"><OrderLink order={item.order} cartId={item.cart?.id} /></Td>
            <Td align="right"><Serial id={item.id} /></Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function TaxTable({ items }: { items: any[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Status</Th>
          <Th priority={2}>Provider</Th>
          <Th priority={2}>Jurisdiction</Th>
          <Th align="right">Sales</Th>
          <Th align="right">Excise</Th>
          <Th priority={3} align="right">Local</Th>
          <Th priority={3}>Subject</Th>
          <Th priority={2} align="right">Record</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id}>
            <Td className="whitespace-nowrap"><Mono>{dateTime(item.issuedAt)}</Mono></Td>
            <Td><Stamp tone={stateTone(item.status)}>{label(TAX_QUOTE_STATUS_LABELS, item.status)}</Stamp></Td>
            <Td priority={2} className="whitespace-nowrap">{item.providerCode}</Td>
            <Td priority={2}>{item.jurisdiction?.code ? <Mono>{item.jurisdiction.code}</Mono> : <span className="text-muted-foreground">None</span>}</Td>
            <Td align="right"><Mono>{money(item.salesTaxAmount, item.currencyCode)}</Mono></Td>
            <Td align="right"><Mono>{money(item.exciseTaxAmount, item.currencyCode)}</Mono></Td>
            <Td priority={3} align="right"><Mono>{money(item.localFeeAmount, item.currencyCode)}</Mono></Td>
            <Td priority={3} className="whitespace-nowrap"><OrderLink order={item.order} cartId={item.cart?.id} /></Td>
            <Td priority={2} align="right"><Serial id={item.id} /></Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function CarrierTable({ items }: { items: any[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Result</Th>
          <Th>Service</Th>
          <Th priority={2}>Route</Th>
          <Th priority={3}>Adult signature</Th>
          <Th priority={3}>Markings</Th>
          <Th priority={2}>Subject</Th>
          <Th align="right">Record</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id}>
            <Td className="whitespace-nowrap"><Mono>{dateTime(item.issuedAt)}</Mono></Td>
            <Td><Stamp tone={stateTone(item.result)}>{label(DECISION_RESULT_LABELS, item.result)}</Stamp></Td>
            <Td className="whitespace-nowrap">{item.carrierCode} {item.serviceCode}</Td>
            <Td priority={2} className="whitespace-nowrap"><Mono>{item.originJurisdictionCode} → {item.destinationJurisdictionCode}</Mono></Td>
            <Td priority={3}>{item.adultSignature ? 'Required' : 'Not required'}</Td>
            <Td priority={3}>
              {Array.isArray(item.packageMarkings) && item.packageMarkings.length > 0
                ? item.packageMarkings.join(', ')
                : <span className="text-muted-foreground">None</span>}
            </Td>
            <Td priority={2} className="whitespace-nowrap"><OrderLink order={item.order} cartId={item.cart?.id} /></Td>
            <Td align="right"><Serial id={item.id} /></Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function AttestationTable({ items }: { items: any[] }) {
  return (
    <DataTable>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Customer</Th>
          <Th priority={2}>Email</Th>
          <Th priority={3}>Statement</Th>
          <Th align="right">Record</Th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <Tr key={item.id}>
            <Td className="whitespace-nowrap"><Mono>{dateTime(item.occurredAt)}</Mono></Td>
            <Td className="min-w-0">
              <span className="block truncate">{item.customer?.name || item.customer?.email || `Customer ${shortId(item.resourceId)}`}</span>
            </Td>
            <Td priority={2}>{item.customer?.email || <span className="text-muted-foreground">Hidden</span>}</Td>
            <Td priority={3}><span className="block max-w-[28rem] truncate">{item.data?.statement || ''}</span></Td>
            <Td align="right"><Serial id={item.id} /></Td>
          </Tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function Records({ tab, items }: { tab: LedgerTab; items: any[] }) {
  switch (tab) {
    case 'decisions':
      return <DecisionLog items={items} />;
    case 'age':
      return <AgeTable items={items} />;
    case 'tax':
      return <TaxTable items={items} />;
    case 'carrier':
      return <CarrierTable items={items} />;
    case 'attestations':
      return <AttestationTable items={items} />;
  }
}

export async function ComplianceLedgerPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: LedgerTab = TABS.some(entry => entry.key === rawTab) ? (rawTab as LedgerTab) : 'decisions';
  const state = filterValue(params['!status_matches']);
  const purposeValue = filterValue(params.purpose);
  const purpose = purposeValue && DECISION_PURPOSE_LABELS[purposeValue] ? purposeValue : null;
  const page = pageNumber(params.page);
  const filtered = Boolean(state || purpose);
  // The default view (decisions, first page, no filters) opens on today's work queue
  const showQueue = tab === 'decisions' && page === 1 && !filtered;

  const [response, attention] = await Promise.all([
    getLedger({ tab, state, purpose, page }),
    showQueue ? getTodayAttention() : Promise.resolve(null),
  ]);

  const query = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    next.set('tab', tab);
    if (state) next.set('!status_matches', JSON.stringify([state]));
    if (purpose) next.set('purpose', JSON.stringify([purpose]));
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    return `${LEDGER_PATH}?${next.toString()}`;
  };

  const tabs = TABS.map(entry => ({
    key: entry.key,
    label: entry.label,
    href: `${LEDGER_PATH}?tab=${entry.key}`,
    active: entry.key === tab,
  }));

  const purposes = [
    { key: 'all', label: 'All purposes', href: query({ purpose: null, page: null }), active: !purpose },
    ...Object.entries(DECISION_PURPOSE_LABELS).map(([key, text]) => ({
      key,
      label: text,
      href: query({ purpose: JSON.stringify([key]), page: null }),
      active: purpose === key,
    })),
  ];

  const stateLabels = STATE_LABELS[tab];
  const outcomes = response.success
    ? [
        { key: 'all', label: 'All outcomes', count: response.total, href: query({ '!status_matches': null, page: null }), active: !state },
        ...Object.keys(response.counts).map(value => ({
          key: value,
          label: stateLabels[value] || label({}, value),
          count: response.counts[value],
          href: query({ '!status_matches': JSON.stringify([value]), page: null }),
          active: state === value,
        })),
      ]
    : [];

  const attentionItems = attention?.success ? attention.items : [];
  const denied = attentionItems.filter(item => item.result === 'deny').length;
  const review = attentionItems.length - denied;
  const meta = attention?.success
    ? `Today: ${denied}${attention.capped ? '+' : ''} denied, ${review} in manual review`
    : undefined;

  return (
    <PageContainer title="Compliance ledger" header={<PageTitle title="Compliance ledger" meta={meta} />} breadcrumbs={breadcrumbs}>
      <div className="space-y-6 pb-24 sm:pb-10">
        {showQueue && (
          <section className="px-4 md:px-6">
            <SectionTitle meta={attention?.success ? `${attentionItems.length}${attention.capped ? '+' : ''}` : undefined}>
              Denials and manual reviews today
            </SectionTitle>
            {!attention?.success ? (
              <Alert variant="destructive">
                <AlertDescription>{attention && !attention.success ? attention.error : 'Unable to load compliance records.'}</AlertDescription>
              </Alert>
            ) : attentionItems.length === 0 ? (
              <div className="flex items-center gap-2.5 rounded-md border bg-card px-4 py-3 text-[13px] text-foreground">
                <Stamp tone="ok">Clear</Stamp>
                No denials or manual reviews today
              </div>
            ) : (
              <DecisionLog items={attentionItems} timeOnly />
            )}
          </section>
        )}

        <section className="space-y-3">
          <div className="px-4 md:px-6">
            {showQueue && <h2 className="mb-1 text-[15px] font-semibold text-foreground">All records</h2>}
            <LinkTrack label="Record type" options={tabs} />
          </div>

          {!response.success ? (
            <div className="px-4 md:px-6">
              <Alert variant="destructive">
                <AlertDescription>{response.error}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 md:px-6">
                {tab !== 'attestations' && <LinkSelect label="Outcome" options={outcomes} />}
                {tab === 'decisions' && <LinkSelect label="Purpose" options={purposes} />}
                <span className="ml-auto text-[12px] tabular-nums text-muted-foreground">
                  {response.count} {response.count === 1 ? 'record' : 'records'}
                </span>
              </div>
              <div className="px-4 md:px-6">
                {response.items.length === 0 ? (
                  <FilteredEmpty title={filtered ? `${EMPTY[tab]} match these filters` : EMPTY[tab]} resetHref={filtered ? `${LEDGER_PATH}?tab=${tab}` : undefined} />
                ) : (
                  <>
                    <Records tab={tab} items={response.items} />
                    <Pager page={page} count={response.count} pageSize={PAGE_SIZE} href={number => query({ page: String(number) })} />
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

export default ComplianceLedgerPage;
