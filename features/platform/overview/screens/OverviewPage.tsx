import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { DataTable, ListBand, PageTitle, SectionTitle, Stamp, StatusWord, Td, Th, Tr } from '@/features/platform/components/vape-ui';
import { CLASSIFICATION_STATUS_LABELS } from '@/features/keystone/regulated/labels';
import { getComplianceReadiness } from '@/features/platform/compliance-center/actions/getReadiness';
import { LaunchSteps, ReleaseBar, fixClass } from '@/features/platform/compliance-center/components/ReleaseBar';
import { COMPLIANCE_PATH, EVIDENCE_PATH, launchSteps } from '@/features/platform/compliance-center/lib/blockers';
import { LEDGER_PATH, ORDERS_PATH, dateTime, day, label } from '@/features/platform/compliance-ledger/lib/format';
import { getOverview, type Section } from '../actions/overview';
import { recordSerial } from '@/features/platform/product-evidence/lib/serial';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Overview' },
];

const STEP_LIMIT = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

function Unavailable() {
  return <ListBand><div className="px-4 py-3 text-[13px] text-muted-foreground">Unable to load</div></ListBand>;
}

function None({ children }: { children: ReactNode }) {
  return <ListBand><div className="px-4 py-3 text-[13px] text-muted-foreground">{children}</div></ListBand>;
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={fixClass}>
      {children}
      <ArrowUpRight />
    </Link>
  );
}

const count = <T,>(section: Section<T>, pick: (value: T) => number, capped?: (value: T) => boolean) =>
  section.ok ? `${pick(section.value)}${capped?.(section.value) ? '+' : ''}` : undefined;

function daysLeft(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS);
  return days <= 1 ? '1 day' : `${days} days`;
}

/** Variant states for one product, grouped: "2 not classified, 1 pending". */
function variantSummary(variants: Array<{ state: string }>) {
  const groups = new Map<string, number>();
  for (const variant of variants) groups.set(variant.state, (groups.get(variant.state) || 0) + 1);
  return [...groups.entries()]
    .map(([state, total]) => `${total} ${state === 'missing' ? 'not classified' : label(CLASSIFICATION_STATUS_LABELS, state).toLowerCase()}`)
    .join(', ');
}

/** The worst classification state among a product's blocked variants, as a stamp. */
function classificationStamp(variants: Array<{ state: string }>) {
  const has = (state: string) => variants.some(variant => variant.state === state);
  if (has('revoked')) return { tone: 'danger' as const, word: 'Revoked' };
  if (has('rejected')) return { tone: 'danger' as const, word: 'Rejected' };
  // Approved yet still blocked means the approval is outside its effective dates
  if (has('approved')) return { tone: 'danger' as const, word: 'Out of date' };
  if (has('review')) return { tone: 'warn' as const, word: 'In review' };
  if (has('draft')) return { tone: 'warn' as const, word: 'Draft' };
  return { tone: 'warn' as const, word: 'Not classified' };
}

export async function OverviewPage() {
  const [readiness, overview] = await Promise.all([getComplianceReadiness(), getOverview()]);

  const ready = readiness.success ? readiness.data.launchReady : null;
  const steps = readiness.success ? launchSteps(readiness.data.blockers, { profiles: readiness.data.profiles }) : [];
  const header = <PageTitle title="Overview" meta={ready === false ? `${steps.length} ${steps.length === 1 ? 'step' : 'steps'} before sales open` : undefined} />;

  const empty = { ok: false } as const;
  const orders = overview?.orders ?? empty;
  const blocked = overview?.blocked ?? empty;
  const expiring = overview?.expiring ?? empty;
  const decisions = overview?.decisions ?? empty;

  const unclassified = blocked.ok ? blocked.value.unclassified : undefined;
  const otherBlocked = blocked.ok ? (blocked.value.other ?? blocked.value.products) : [];

  return (
    <PageContainer title="Overview" header={header} breadcrumbs={breadcrumbs}>
      <div className="space-y-8 px-4 pb-24 sm:pb-10 md:px-6">
        <ReleaseBar
          ready={ready}
          steps={steps}
          profiles={readiness.success ? readiness.data.profiles : []}
          canStop={readiness.success ? readiness.data.canStop : false}
        />

        <section>
          <SectionTitle meta={readiness.success ? steps.length : undefined}>Launch steps</SectionTitle>
          {!readiness.success ? <Unavailable /> : <LaunchSteps steps={steps} limit={STEP_LIMIT} />}
          {steps.length > STEP_LIMIT && (
            <div className="mt-2 flex items-center justify-between gap-4 text-[13px] text-muted-foreground">
              <span>{steps.length - STEP_LIMIT} more</span>
              <OutLink href={COMPLIANCE_PATH}>All steps in Compliance Center</OutLink>
            </div>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle meta={count(blocked, value => value.count, value => value.capped)}>Blocked from publishing</SectionTitle>
            {!blocked.ok ? <Unavailable /> : blocked.value.count === 0 ? <None>No blocked draft products</None> : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Classification</Th>
                    <Th align="right"><span className="sr-only">Fix</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {unclassified && unclassified.products > 0 && (
                    <Tr>
                      <Td className="max-w-0">
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="shrink-0 font-medium text-foreground">
                            {unclassified.products} {unclassified.products === 1 ? 'product' : 'products'}
                          </span>
                          <span className="min-w-0 truncate text-[12px] text-muted-foreground">
                            {unclassified.variants} {unclassified.variants === 1 ? 'variant' : 'variants'} with no classification
                          </span>
                        </span>
                      </Td>
                      <Td><Stamp tone="warn">Not classified</Stamp></Td>
                      <Td align="right" className="w-0 whitespace-nowrap py-0.5"><OutLink href={EVIDENCE_PATH}>Classify</OutLink></Td>
                    </Tr>
                  )}
                  {otherBlocked.map(product => {
                    const stamp = classificationStamp(product.variants);
                    return (
                    <Tr key={product.id}>
                      <Td className="max-w-0">
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="max-w-[60%] shrink-0 truncate font-medium text-foreground" title={product.title}>{product.title}</span>
                          <span className="min-w-0 truncate text-[12px] text-muted-foreground">{variantSummary(product.variants)}</span>
                        </span>
                      </Td>
                      <Td><Stamp tone={stamp.tone} serial={recordSerial(product.id)}>{stamp.word}</Stamp></Td>
                      <Td align="right" className="w-0 whitespace-nowrap py-0.5"><OutLink href={`/dashboard/platform/products/${product.id}`}>Product</OutLink></Td>
                    </Tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
          </div>

          <div className="min-w-0">
            <SectionTitle meta={expiring.ok ? expiring.value.length : undefined}>Evidence expiring in 30 days</SectionTitle>
            {!expiring.ok ? <Unavailable /> : expiring.value.length === 0 ? <None>Nothing expiring</None> : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Record</Th>
                    <Th>Expires</Th>
                    <Th align="right"><span className="sr-only">Open</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {expiring.value.slice(0, 10).map(item => {
                    const urgent = new Date(item.expiresAt).getTime() - Date.now() < 7 * DAY_MS;
                    return (
                      <Tr key={`${item.kind}-${item.id}`}>
                        <Td className="max-w-0">
                          <span className="flex min-w-0 items-baseline gap-2">
                            <span className="max-w-[60%] shrink-0 truncate font-medium text-foreground" title={item.title}>{item.title}</span>
                            <span className="min-w-0 truncate text-[12px] text-muted-foreground">{item.detail}</span>
                          </span>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <Stamp tone={urgent ? 'danger' : 'warn'} serial={<span title={dateTime(item.expiresAt)}>{day(item.expiresAt)}</span>}>
                            {daysLeft(item.expiresAt)}
                          </Stamp>
                        </Td>
                        <Td align="right" className="w-0 whitespace-nowrap py-0.5"><OutLink href={item.href}>Open</OutLink></Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
            {expiring.ok && expiring.value.length > 10 && (
              <p className="mt-2 text-[13px] text-muted-foreground">{expiring.value.length - 10} more</p>
            )}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle meta={count(orders, value => value.count, value => value.capped)}>Orders to fulfill</SectionTitle>
            {!orders.ok ? <Unavailable /> : orders.value.latest.length === 0 ? <None>No paid orders waiting</None> : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Status</Th>
                    <Th priority={2}>Customer</Th>
                    <Th align="right">Total</Th>
                    <Th priority={3} align="right">Placed</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.value.latest.map(order => {
                    const partial = order.fulfillmentStatus?.status === 'partially_fulfilled';
                    return (
                      <Tr key={order.id}>
                        <Td>
                          <Link href={`${ORDERS_PATH}/${order.id}`} className="inline-flex min-h-8 items-center font-mono text-[12px] font-medium text-foreground underline-offset-4 hover:underline max-sm:min-h-10">
                            #{order.displayId}
                          </Link>
                        </Td>
                        <Td><StatusWord tone={partial ? 'warn' : 'info'}>{partial ? 'Partially fulfilled' : 'To fulfill'}</StatusWord></Td>
                        <Td priority={2}><span className="block max-w-[14rem] truncate">{order.email}</span></Td>
                        <Td align="right" className="font-mono text-[12px]">{order.total || ''}</Td>
                        <Td priority={3} align="right" className="font-mono text-[12px]">{day(order.createdAt)}</Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
            {orders.ok && orders.value.count > 0 && (
              <div className="mt-2 flex justify-end">
                <OutLink href={ORDERS_PATH}>All orders</OutLink>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <SectionTitle meta={count(decisions, value => value.allow + value.deny + value.manual_review)}>Decisions today</SectionTitle>
            {!decisions.ok ? <Unavailable /> : (
              <ListBand>
                {([
                  ['deny', 'Denied', 'danger'],
                  ['manual_review', 'Manual review', 'warn'],
                  ['allow', 'Allowed', 'ok'],
                ] as const).map(([key, text, tone]) => (
                  <Link
                    key={key}
                    href={`${LEDGER_PATH}?tab=decisions&${new URLSearchParams({ '!status_matches': JSON.stringify([key]) }).toString()}`}
                    className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 transition-colors hover:bg-muted/40"
                  >
                    <Stamp tone={decisions.value[key] > 0 ? tone : 'muted'}>{text}</Stamp>
                    <span className="font-mono text-[14px] tabular-nums text-foreground">{decisions.value[key]}</span>
                  </Link>
                ))}
              </ListBand>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

export default OverviewPage;
