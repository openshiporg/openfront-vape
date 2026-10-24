import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Dot, ListBand, SectionTitle, type DotTone } from '@/features/platform/components/vape-ui';
import { COMPLIANCE_EVENT_LABELS, REASON_CODE_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels';
import { getOrderCompliance } from '../actions/order-compliance';

const REVERSAL = 'TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED';

const EVENT_TONES: Record<string, DotTone> = {
  'checkout.compliance_committed': 'ok',
  'tax.commit_acknowledged': 'ok',
  'tax.reversal_acknowledged': 'ok',
  'regulated.return_refunded': 'warn',
  'merchant.emergency_stop': 'danger',
};

const stamp = (value: string) =>
  new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Read-only compliance events for one order, reversal reviews first. */
export async function OrderComplianceSection({ orderId }: { orderId: string }) {
  const result = await getOrderCompliance(orderId);
  const events = result.success
    ? [...result.events].sort((a, b) => Number(b.reasonCode === REVERSAL) - Number(a.reasonCode === REVERSAL))
    : [];
  const reviews = events.filter(event => event.reasonCode === REVERSAL).length;
  const reversed = events.some(event => event.eventType === 'tax.reversal_acknowledged');

  return (
    <section>
      <SectionTitle meta={result.success ? events.length : undefined}>Compliance</SectionTitle>
      <ListBand>
        {!result.success && <div className="px-4 py-3 text-sm text-muted-foreground">{result.error}</div>}
        {result.success && reviews > 0 && (
          <div className="flex items-baseline gap-2.5 px-4 py-3 text-sm font-medium text-foreground">
            <Dot tone={reversed ? 'ok' : 'danger'} />
            {reversed ? 'Tax reversal acknowledged' : regulatedLabel(REASON_CODE_LABELS, REVERSAL)}
            <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">{reviews}</span>
          </div>
        )}
        {result.success && events.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">No compliance events</div>}
        {events.map(event => {
          const review = event.reasonCode === REVERSAL;
          const body = (
            <>
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="flex min-w-0 items-baseline gap-2.5 text-sm text-foreground">
                  <Dot tone={review && !reversed ? 'danger' : EVENT_TONES[event.eventType] || 'muted'} />
                  <span className="min-w-0 break-words">{regulatedLabel(COMPLIANCE_EVENT_LABELS, event.eventType)}</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{stamp(event.occurredAt)}</span>
              </span>
              <span className="mt-0.5 flex flex-wrap gap-x-4 pl-[1.125rem] text-xs text-muted-foreground">
                {event.reasonCode && <span className={review && !reversed ? 'text-red-600 dark:text-red-400' : undefined}>{regulatedLabel(REASON_CODE_LABELS, event.reasonCode)}</span>}
                <span>{event.resourceType}</span>
                {event.decisionId && (
                  <span className="inline-flex items-center gap-0.5 text-foreground">
                    Decision <ArrowUpRight className="size-3" />
                  </span>
                )}
              </span>
            </>
          );
          return event.decisionId ? (
            <Link key={event.id} href={`/dashboard/platform/compliance-ledger/${event.decisionId}`} className="block px-4 py-2.5 transition-colors hover:bg-background/60">
              {body}
            </Link>
          ) : (
            <div key={event.id} className="px-4 py-2.5">{body}</div>
          );
        })}
        <Link
          href="/dashboard/platform/compliance-ledger"
          className="flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-background/60"
        >
          Compliance ledger <ArrowUpRight className="size-3.5" />
        </Link>
      </ListBand>
    </section>
  );
}
