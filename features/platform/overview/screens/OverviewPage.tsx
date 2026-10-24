import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Dot, ListBand, PageTitle, SectionTitle, type DotTone } from '@/features/platform/components/vape-ui';
import { CLASSIFICATION_STATUS_LABELS } from '@/features/keystone/regulated/labels';
import { getComplianceReadiness } from '@/features/platform/compliance-center/actions/getReadiness';
import { outLinkClass } from '@/features/platform/compliance-ledger/components/LinkTrack';
import { LEDGER_PATH, ORDERS_PATH, dateTime, day, label, reasonLabel } from '@/features/platform/compliance-ledger/lib/format';
import { getOverview, type Section } from '../actions/overview';

const COMPLIANCE_PATH = '/dashboard/platform/compliance';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Overview' },
];

function Unavailable() {
  return <div className="px-4 py-3 text-sm text-muted-foreground">Unable to load</div>;
}

function None({ children }: { children: ReactNode }) {
  return <div className="px-4 py-3 text-sm text-muted-foreground">{children}</div>;
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={outLinkClass}>
      {children}
      <ArrowUpRight className="size-3" />
    </Link>
  );
}

const count = <T,>(section: Section<T>, pick: (value: T) => number, capped?: (value: T) => boolean) =>
  section.ok ? `${pick(section.value)}${capped?.(section.value) ? '+' : ''}` : undefined;

function daysLeft(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return days <= 1 ? '1 day' : `${days} days`;
}

/** Hide the broader profile check when the gate already names the profile problem. */
function visibleBlockers(codes: string[]) {
  const gateProfileCode = codes.some(code => ['ACTIVE_MERCHANT_PROFILE_REQUIRED', 'KILL_SWITCH_ENABLED'].includes(code));
  return Array.from(new Set(codes)).filter(code => !(gateProfileCode && code === 'EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED'));
}

export async function OverviewPage() {
  const [readiness, overview] = await Promise.all([getComplianceReadiness(), getOverview()]);

  const ready = readiness.success ? readiness.data.launchReady : null;
  const blockers = readiness.success ? visibleBlockers(readiness.data.blockers) : [];
  const tone: DotTone = ready === null ? 'muted' : ready ? 'ok' : 'danger';
  const header = (
    <PageTitle
      title="Overview"
      tone={tone}
      state={ready === null ? 'Sales status unavailable' : ready ? 'Sales enabled' : 'Sales disabled'}
    />
  );

  const empty = { ok: false } as const;
  const orders = overview?.orders ?? empty;
  const blocked = overview?.blocked ?? empty;
  const expiring = overview?.expiring ?? empty;
  const decisions = overview?.decisions ?? empty;

  return (
    <PageContainer title="Overview" header={header} breadcrumbs={breadcrumbs}>
      <div className="space-y-10 px-4 pb-24 sm:pb-10 md:px-6">
        <section>
          <SectionTitle meta={readiness.success ? blockers.length : undefined}>Blockers</SectionTitle>
          <ListBand>
            {!readiness.success && <Unavailable />}
            {readiness.success && blockers.length === 0 && (
              <div className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
                <Dot tone="ok" />
                All checks pass
              </div>
            )}
            {blockers.slice(0, 5).map(code => (
              <div key={code} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                  <Dot tone="warn" />
                  {reasonLabel(code)}
                </span>
                <OutLink href={COMPLIANCE_PATH}>Compliance Center</OutLink>
              </div>
            ))}
            {blockers.length > 5 && (
              <div className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm text-muted-foreground">
                <span>{blockers.length - 5} more</span>
                <OutLink href={COMPLIANCE_PATH}>View all</OutLink>
              </div>
            )}
          </ListBand>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle meta={count(orders, value => value.count, value => value.capped)}>Orders to fulfill</SectionTitle>
            <ListBand>
              {!orders.ok && <Unavailable />}
              {orders.ok && orders.value.latest.length === 0 && <None>No paid orders waiting</None>}
              {orders.ok && orders.value.latest.map(order => (
                <Link
                  key={order.id}
                  href={`${ORDERS_PATH}/${order.id}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-background/60"
                >
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <Dot tone={order.fulfillmentStatus?.status === 'partially_fulfilled' ? 'warn' : 'info'} />
                      #{order.displayId}
                    </span>
                    <span className="block truncate pl-[1.125rem] text-xs text-muted-foreground">
                      {order.email}
                      {order.fulfillmentStatus?.status === 'partially_fulfilled' && ' · Partially fulfilled'}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {order.total && <span className="block font-mono text-sm tabular-nums text-foreground">{order.total}</span>}
                    <span className="block font-mono text-[11px] tabular-nums text-muted-foreground">{day(order.createdAt)}</span>
                  </span>
                </Link>
              ))}
            </ListBand>
            {orders.ok && orders.value.count > 0 && (
              <div className="mt-2 flex justify-end">
                <OutLink href={ORDERS_PATH}>All orders</OutLink>
              </div>
            )}
          </div>

          <div>
            <SectionTitle meta={count(decisions, value => value.allow + value.deny + value.manual_review)}>Decisions today</SectionTitle>
            {!decisions.ok ? (
              <ListBand><Unavailable /></ListBand>
            ) : (
              <ListBand className="grid grid-cols-3 divide-x divide-y-0">
                {([
                  ['allow', 'Allowed', 'ok'],
                  ['deny', 'Denied', 'danger'],
                  ['manual_review', 'Review', 'warn'],
                ] as const).map(([key, text, dot]) => (
                  <Link
                    key={key}
                    href={`${LEDGER_PATH}?tab=decisions&${new URLSearchParams({ '!status_matches': JSON.stringify([key]) }).toString()}`}
                    className="min-w-0 px-4 py-3 transition-colors hover:bg-background/60"
                  >
                    <span className="flex items-baseline gap-1.5 text-xs text-muted-foreground">
                      <Dot tone={dot} />
                      {text}
                    </span>
                    <span className="mt-1 block font-mono text-2xl font-medium tabular-nums text-foreground">{decisions.value[key]}</span>
                  </Link>
                ))}
              </ListBand>
            )}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle meta={count(blocked, value => value.count, value => value.capped)}>Blocked from publishing</SectionTitle>
            <ListBand>
              {!blocked.ok && <Unavailable />}
              {blocked.ok && blocked.value.products.length === 0 && <None>No blocked draft products</None>}
              {blocked.ok && blocked.value.products.map(product => (
                <div key={product.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <Dot tone="warn" />
                      <span className="min-w-0 break-words">{product.title}</span>
                    </span>
                    <span className="block pl-[1.125rem] text-xs text-muted-foreground">
                      {product.variants.slice(0, 3).map(variant =>
                        `${variant.label}: ${variant.state === 'missing' ? 'Not classified' : label(CLASSIFICATION_STATUS_LABELS, variant.state)}`,
                      ).join(', ')}
                      {product.variants.length > 3 && ` +${product.variants.length - 3}`}
                    </span>
                  </span>
                  <OutLink href={`/dashboard/platform/products/${product.id}`}>Product</OutLink>
                </div>
              ))}
            </ListBand>
          </div>

          <div>
            <SectionTitle meta={expiring.ok ? expiring.value.length : undefined}>Evidence expiring in 30 days</SectionTitle>
            <ListBand>
              {!expiring.ok && <Unavailable />}
              {expiring.ok && expiring.value.length === 0 && <None>Nothing expiring</None>}
              {expiring.ok && expiring.value.slice(0, 10).map(item => (
                <div key={`${item.kind}-${item.id}`} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <Dot tone={new Date(item.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'danger' : 'warn'} />
                      <span className="min-w-0 break-words">{item.title}</span>
                    </span>
                    <span className="block pl-[1.125rem] text-xs text-muted-foreground">
                      {item.detail} · <span className="font-mono tabular-nums" title={dateTime(item.expiresAt)}>{day(item.expiresAt)}</span> ({daysLeft(item.expiresAt)})
                    </span>
                  </span>
                  <OutLink href={item.href}>Open</OutLink>
                </div>
              ))}
              {expiring.ok && expiring.value.length > 10 && <None>{expiring.value.length - 10} more</None>}
            </ListBand>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

export default OverviewPage;
