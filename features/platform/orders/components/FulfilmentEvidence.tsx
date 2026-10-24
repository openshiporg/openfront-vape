'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ErrorLine } from '@/features/platform/components/compliance-form';
import { Dot, ListBand, SectionTitle, type DotTone } from '@/features/platform/components/vape-ui';
import { DECISION_RESULT_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels';
import { cancelShippingLabel, type CarrierDecision, type FulfilmentEvidence as Evidence, type OrderLabel } from '../actions/label-evidence';

const RESULT_TONES: Record<string, DotTone> = { allow: 'ok', deny: 'danger', manual_review: 'warn', expired: 'muted', revoked: 'muted' };

const stamp = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

function labelState(label: OrderLabel): { tone: DotTone; text: string; cancellable: boolean } {
  if (label.cancellation?.status === 'confirmed') return { tone: 'muted', text: 'Label cancelled', cancellable: false };
  if (label.cancellation?.status === 'pending') return { tone: 'warn', text: 'Cancellation pending', cancellable: true };
  if (label.cancellation) return { tone: 'warn', text: 'Cancellation unconfirmed', cancellable: true };
  if (label.status === 'purchased') return { tone: 'ok', text: 'Purchased', cancellable: true };
  if (label.status === 'failed') return { tone: 'danger', text: 'Failed', cancellable: false };
  return { tone: 'info', text: 'Created', cancellable: false };
}

function CancelLabel({ label }: { label: OrderLabel }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  if (!label.provider) return null;
  const providerId = label.provider.id;

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex min-h-8 items-center rounded-full bg-background px-3 text-xs font-medium text-foreground shadow-xs ring-1 ring-border disabled:opacity-50 max-sm:min-h-10"
            disabled={pending}
          >
            {pending ? 'Cancelling' : 'Cancel label'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3" side="bottom" align="end">
          <div className="space-y-2.5">
            <p className="text-[13px] font-medium">Cancel this label with the carrier?</p>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 rounded-full text-xs"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  setError('');
                  startTransition(async () => {
                    const result = await cancelShippingLabel(providerId, label.id);
                    if (!result.success) {
                      setError(result.error);
                      router.refresh();
                      return;
                    }
                    toast.success(result.data.refundStatus ? `Label cancelled, refund ${result.data.refundStatus.toLowerCase()}` : 'Label cancelled');
                    router.refresh();
                  });
                }}
              >
                Cancel label
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ErrorLine message={error} />
    </div>
  );
}

function Labels({ labels }: { labels: Evidence['labels'] }) {
  if (!Array.isArray(labels)) {
    return (
      <ListBand>
        <div className="px-4 py-3 text-sm text-muted-foreground">{labels.error}</div>
      </ListBand>
    );
  }
  return (
    <ListBand>
      {labels.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">No labels</div>}
      {labels.map(label => {
        const state = labelState(label);
        return (
          <div key={label.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                  <Dot tone={state.tone} />
                  {[label.carrier?.toUpperCase(), label.service].filter(Boolean).join(' ') || 'Label'}
                </span>
                <span className="text-xs text-muted-foreground">{state.text}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">
                {label.trackingNumber && <span className="break-all font-mono tabular-nums text-foreground">{label.trackingNumber}</span>}
                {label.provider && <span>{label.provider.name}</span>}
                {label.createdAt && <span className="font-mono tabular-nums">{stamp(label.createdAt)}</span>}
                {label.cancellation?.refundStatus && <span>Refund {label.cancellation.refundStatus.toLowerCase()}</span>}
                {label.labelUrl && state.text === 'Purchased' && (
                  <Link href={label.labelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-foreground hover:underline underline-offset-4">
                    Download <ArrowUpRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
            {state.cancellable && (
              <div className="shrink-0 pl-[1.125rem] sm:pl-0">
                <CancelLabel label={label} />
              </div>
            )}
          </div>
        );
      })}
    </ListBand>
  );
}

function Carrier({ decisions }: { decisions: CarrierDecision[] | { error: string } }) {
  if (!Array.isArray(decisions)) {
    return (
      <ListBand>
        <div className="px-4 py-3 text-sm text-muted-foreground">{decisions.error}</div>
      </ListBand>
    );
  }
  return (
    <ListBand>
      {decisions.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">No carrier eligibility decision</div>}
      {decisions.map(decision => (
        <div key={decision.id} className="px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
              <Dot tone={RESULT_TONES[decision.result] || 'muted'} />
              <span className="truncate">{decision.carrierCode} {decision.serviceCode}</span>
            </span>
            <span className="text-xs text-muted-foreground">{regulatedLabel(DECISION_RESULT_LABELS, decision.result)}</span>
          </div>
          <dl className="mt-2 grid gap-x-4 gap-y-1 pl-[1.125rem] text-xs sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-muted-foreground">Adult signature</dt>
            <dd className={decision.adultSignature ? 'text-foreground' : 'text-red-600 dark:text-red-400'}>
              {decision.adultSignature ? 'Required' : 'Not required'}
            </dd>
            <dt className="text-muted-foreground">Package markings</dt>
            <dd className="break-words text-foreground">{decision.packageMarkings.length ? decision.packageMarkings.join(', ') : 'None'}</dd>
            <dt className="text-muted-foreground">Route</dt>
            <dd className="font-mono tabular-nums text-foreground">{decision.originJurisdictionCode} to {decision.destinationJurisdictionCode}</dd>
            {decision.rateId && (
              <>
                <dt className="text-muted-foreground">Rate</dt>
                <dd className="break-all font-mono text-foreground">{decision.rateId}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Bound to</dt>
            <dd className="text-foreground">{decision.boundToOrder ? 'This order' : 'Cart only'}</dd>
            <dt className="text-muted-foreground">Expires</dt>
            <dd className="font-mono tabular-nums text-foreground">{stamp(decision.expiresAt)}</dd>
          </dl>
        </div>
      ))}
      <Link
        href="/dashboard/platform/compliance-ledger?tab=carrier"
        className="flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-background/60"
      >
        Compliance ledger <ArrowUpRight className="size-3.5" />
      </Link>
    </ListBand>
  );
}

export function FulfilmentEvidence({ evidence }: { evidence: Evidence }) {
  const labelCount = Array.isArray(evidence.labels) ? evidence.labels.length : undefined;
  const decisionCount = Array.isArray(evidence.carrier) ? evidence.carrier.length : undefined;
  return (
    <>
      <section>
        <SectionTitle meta={labelCount}>Shipping labels</SectionTitle>
        <Labels labels={evidence.labels} />
      </section>
      <section>
        <SectionTitle meta={decisionCount}>Carrier eligibility</SectionTitle>
        <Carrier decisions={evidence.carrier} />
      </section>
    </>
  );
}
