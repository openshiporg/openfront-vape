import Link from 'next/link';
import type { ReactNode } from 'react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, StatusFilter } from '@/features/platform/components/vape-ui';
import {
  ADDRESS_MATCH_LABELS,
  AGE_RESULT_LABELS,
  DECISION_PURPOSE_LABELS,
  DECISION_RESULT_LABELS,
  TAX_QUOTE_STATUS_LABELS,
} from '@/features/keystone/regulated/labels';
import { getLedger, type LedgerTab } from '../actions/ledger';
import { FilteredEmpty } from '../components/FilteredEmpty';
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

function Row({ tone, title, aside, meta, href }: { tone?: ReturnType<typeof stateTone>; title: ReactNode; aside?: ReactNode; meta?: ReactNode; href?: string }) {
  return (
    <div className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
          {tone && <Dot tone={tone} />}
          {href ? (
            <Link href={href} className="min-w-0 break-words underline-offset-4 hover:underline">{title}</Link>
          ) : (
            <span className="min-w-0 break-words">{title}</span>
          )}
        </span>
        {aside && <span className="flex shrink-0 items-baseline gap-3">{aside}</span>}
      </div>
      {meta && <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">{meta}</div>}
    </div>
  );
}

const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono tabular-nums">{children}</span>;

function Validity({ issuedAt, expiresAt }: { issuedAt?: string; expiresAt?: string }) {
  return (
    <>
      {issuedAt && <span>Issued <Mono>{dateTime(issuedAt)}</Mono></span>}
      {expiresAt && <span>Expires <Mono>{dateTime(expiresAt)}</Mono></span>}
    </>
  );
}

function rows(tab: LedgerTab, items: any[]) {
  switch (tab) {
    case 'decisions':
      return items.map(item => {
        const reasons: string[] = Array.isArray(item.reasonCodes) ? item.reasonCodes : [];
        return (
          <Row
            key={item.id}
            tone={stateTone(item.result)}
            href={`${LEDGER_PATH}/${item.id}`}
            title={`${label(DECISION_PURPOSE_LABELS, item.purpose)} · ${label(DECISION_RESULT_LABELS, item.result)}`}
            aside={<OrderLink order={item.order} cartId={item.cart?.id} />}
            meta={
              <>
                {reasons.length > 0 && (
                  <span className="basis-full text-foreground/80">
                    {reasons.slice(0, 3).map(reasonLabel).join(', ')}
                    {reasons.length > 3 && ` +${reasons.length - 3}`}
                  </span>
                )}
                {item.jurisdiction?.code && <span>{item.jurisdiction.code}</span>}
                <Validity issuedAt={item.issuedAt} expiresAt={item.expiresAt} />
                {item.revokedAt && <span>Revoked <Mono>{dateTime(item.revokedAt)}</Mono></span>}
              </>
            }
          />
        );
      });
    case 'age':
      return items.map(item => (
        <Row
          key={item.id}
          tone={stateTone(item.result)}
          title={`${label(AGE_RESULT_LABELS, item.result)} · ${item.providerCode}`}
          aside={<OrderLink order={item.order} cartId={item.cart?.id} />}
          meta={
            <>
              <span>{label(DECISION_PURPOSE_LABELS, item.purpose)}</span>
              <span>Age <Mono>{item.verifiedAge}</Mono> of <Mono>{item.thresholdAge}</Mono></span>
              <span>Address {label(ADDRESS_MATCH_LABELS, item.addressMatch).toLowerCase()}</span>
              {item.reasonCode && <span>{reasonLabel(item.reasonCode)}</span>}
              <span>Consent {item.consentPolicyVersion}</span>
              <Validity issuedAt={item.issuedAt} expiresAt={item.expiresAt} />
            </>
          }
        />
      ));
    case 'tax':
      return items.map(item => (
        <Row
          key={item.id}
          tone={stateTone(item.status)}
          title={`${label(TAX_QUOTE_STATUS_LABELS, item.status)} · ${item.providerCode}`}
          aside={<OrderLink order={item.order} cartId={item.cart?.id} />}
          meta={
            <>
              {item.jurisdiction?.code && <span>{item.jurisdiction.code}</span>}
              <span>Sales <Mono>{money(item.salesTaxAmount, item.currencyCode)}</Mono></span>
              <span>Excise <Mono>{money(item.exciseTaxAmount, item.currencyCode)}</Mono></span>
              <span>Local <Mono>{money(item.localFeeAmount, item.currencyCode)}</Mono></span>
              <span>Source {item.sourceVersion}</span>
              <Validity issuedAt={item.issuedAt} expiresAt={item.expiresAt} />
              {item.committedAt && <span>Committed <Mono>{dateTime(item.committedAt)}</Mono></span>}
            </>
          }
        />
      ));
    case 'carrier':
      return items.map(item => (
        <Row
          key={item.id}
          tone={stateTone(item.result)}
          title={`${label(DECISION_RESULT_LABELS, item.result)} · ${item.carrierCode} ${item.serviceCode}`}
          aside={<OrderLink order={item.order} cartId={item.cart?.id} />}
          meta={
            <>
              <span><Mono>{item.originJurisdictionCode}</Mono> to <Mono>{item.destinationJurisdictionCode}</Mono></span>
              <span>{item.adultSignature ? 'Adult signature' : 'No adult signature'}</span>
              {Array.isArray(item.packageMarkings) && item.packageMarkings.length > 0 && (
                <span>Markings {item.packageMarkings.join(', ')}</span>
              )}
              <Validity issuedAt={item.issuedAt} expiresAt={item.expiresAt} />
            </>
          }
        />
      ));
    case 'attestations':
      return items.map(item => (
        <Row
          key={item.id}
          tone="ok"
          title={item.customer?.name || item.customer?.email || `Customer ${shortId(item.resourceId)}`}
          aside={<span className="font-mono text-xs tabular-nums text-muted-foreground">{dateTime(item.occurredAt)}</span>}
          meta={
            <>
              {item.customer?.email && item.customer?.name && <span>{item.customer.email}</span>}
              {item.data?.statement && <span>{item.data.statement}</span>}
            </>
          }
        />
      ));
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

  const response = await getLedger({ tab, state, purpose, page });

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

  const filtered = Boolean(state || purpose);
  const stateLabels = STATE_LABELS[tab];

  return (
    <PageContainer title="Compliance ledger" header={<PageTitle title="Compliance ledger" />} breadcrumbs={breadcrumbs}>
      <div className="space-y-1 pb-24 sm:pb-10">
        <div className="px-4 md:px-6">
          <LinkTrack label="Record type" options={tabs} />
        </div>

        {!response.success ? (
          <div className="px-4 py-3 md:px-6">
            <Alert variant="destructive">
              <AlertDescription>{response.error}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {tab !== 'attestations' && (
              <StatusFilter
                allCount={response.total}
                statuses={Object.keys(response.counts).map(value => ({
                  value,
                  label: stateLabels[value] || value,
                  count: response.counts[value],
                  tone: stateTone(value),
                }))}
                className="pb-0"
              />
            )}
            {tab === 'decisions' && (
              <div className="px-4 pt-3 md:px-6">
                <LinkTrack label="Purpose" options={purposes} />
              </div>
            )}
            <div className="px-4 pt-4 md:px-6">
              {response.items.length === 0 ? (
                <FilteredEmpty title={filtered ? `${EMPTY[tab]} match these filters` : EMPTY[tab]} resetHref={filtered ? `${LEDGER_PATH}?tab=${tab}` : undefined} />
              ) : (
                <>
                  <ListBand>{rows(tab, response.items)}</ListBand>
                  <Pager page={page} count={response.count} pageSize={PAGE_SIZE} href={number => query({ page: String(number) })} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default ComplianceLedgerPage;
