'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ErrorLine, EvidenceFile } from '@/features/platform/components/compliance-form';
import { Dot, Pill, Track } from '@/features/platform/components/vape-primitives';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { validateRules } from '@/features/regulated-commerce/core/policy-validation';
import { approveRuleSet, setJurisdictionStatus, setRuleSetStatus } from '../actions/jurisdictions';
import type { RuleSetRecord } from '../lib/shared';
import { RuleSetSheetButton } from './RuleSetSheet';

type Result = { success: true } | { success: false; error: string };

function useAction() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<Result | { success: boolean; error?: string }>, done: string) => {
    setError('');
    startTransition(async () => {
      const result = await action();
      if (!result.success) { setError((result as { error?: string }).error || 'Unable to save. Please try again.'); return; }
      toast.success(done);
      router.refresh();
    });
  };
  return { error, pending, run };
}

const buttonClass = 'h-9 rounded-full px-4 text-[13px]';

export function JurisdictionStatusActions({ id, status }: { id: string; status: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== 'active' && (
          <Button type="button" className={buttonClass} disabled={pending} onClick={() => run(() => setJurisdictionStatus(id, 'active'), 'Jurisdiction active')}>
            Activate
          </Button>
        )}
        {status === 'active' && (
          <Button type="button" variant="outline" className={buttonClass} disabled={pending} onClick={() => run(() => setJurisdictionStatus(id, 'retired'), 'Jurisdiction retired')}>
            Retire
          </Button>
        )}
      </div>
      <ErrorLine message={error} />
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-baseline gap-2 text-sm text-foreground">
      <Dot tone={ok ? 'ok' : 'danger'} />
      {label}
    </li>
  );
}

function ApproveSheet({ ruleSet, open, onOpenChange, initialStatus }: {
  ruleSet: RuleSetRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus: 'approved' | 'active';
}) {
  const router = useRouter();
  const [digest, setDigest] = useState('');
  const [status, setStatus] = useState<'approved' | 'active'>(initialStatus);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const validation = validateRules(ruleSet.rules);
  const from = ruleSet.effectiveAt ? new Date(ruleSet.effectiveAt).getTime() : NaN;
  const to = ruleSet.expiresAt ? new Date(ruleSet.expiresAt).getTime() : NaN;
  const bounded = Number.isFinite(from) && Number.isFinite(to) && to > from;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (next) { setDigest(''); setError(''); setStatus(initialStatus); }
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-2">
          <SheetTitle>
            Approve rule set
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{ruleSet.packName} {ruleSet.version}</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Record reviewer approval for this rule set</SheetDescription>
        </SheetHeader>
        <form
          className="space-y-6 px-4 pb-24 sm:pb-8"
          onSubmit={event => {
            event.preventDefault();
            setError('');
            startTransition(async () => {
              const result = await approveRuleSet(ruleSet.id, { signatureDigest: digest, status });
              if (!result.success) { setError(result.error); return; }
              toast.success(status === 'active' ? 'Rule set active' : 'Rule set approved');
              onOpenChange(false);
              router.refresh();
            });
          }}
        >
          <section className="space-y-3">
            <SectionTitle>Checks</SectionTitle>
            <ul className="space-y-1.5">
              <Check ok={validation.valid} label={validation.valid ? `${ruleSet.rules.length} valid rules` : 'Rules invalid'} />
              <Check ok={ruleSet.authorityCitations.length > 0} label={`${ruleSet.authorityCitations.length} authority citations`} />
              <Check ok={bounded} label="Bounded effective dates" />
            </ul>
            {!validation.valid && (
              <ul className="space-y-0.5 text-xs text-red-600 dark:text-red-400">
                {validation.errors.map(message => <li key={message}>{message}</li>)}
              </ul>
            )}
          </section>
          <section className="space-y-3">
            <SectionTitle>Approval</SectionTitle>
            <EvidenceFile id="rs-signature" label="Signed policy document" digest={digest} onRecord={false} onDigest={setDigest} />
            <div className="space-y-1.5">
              <span className="block text-xs text-muted-foreground">Result</span>
              <Track label="Approval result">
                <Pill active={status === 'approved'} onClick={() => setStatus('approved')}>Approved</Pill>
                <Pill active={status === 'active'} onClick={() => setStatus('active')}>Approved and active</Pill>
              </Track>
            </div>
            <p className="text-xs text-muted-foreground">Reviewer: you. Approved at: now.</p>
          </section>
          <ErrorLine message={error} />
          <Button type="submit" disabled={pending || !digest} className="h-10 w-full rounded-full">
            {pending ? 'Saving…' : status === 'active' ? 'Approve and activate' : 'Approve'}
          </Button>
          {!digest && <p className="text-xs text-muted-foreground">Signed policy document required</p>}
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function RuleSetActions({ jurisdictionId, ruleSet }: { jurisdictionId: string; ruleSet: RuleSetRecord }) {
  const { error, pending, run } = useAction();
  const [approve, setApprove] = useState<'approved' | 'active' | null>(null);
  const { status } = ruleSet;
  const ghost = 'h-8 rounded-full px-3 text-[13px]';

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {status === 'draft' ? (
          <RuleSetSheetButton jurisdictionId={jurisdictionId} ruleSet={ruleSet} mode="edit" variant="outline" className={ghost}>Edit</RuleSetSheetButton>
        ) : (
          <RuleSetSheetButton jurisdictionId={jurisdictionId} ruleSet={ruleSet} mode="view" variant="ghost" className={ghost}>View</RuleSetSheetButton>
        )}
        {status === 'draft' && (
          <>
            <Button type="button" variant="outline" className={ghost} onClick={() => setApprove('approved')}>Approve</Button>
            <Button type="button" className={ghost} onClick={() => setApprove('active')}>Activate</Button>
          </>
        )}
        {status === 'approved' && (
          <Button type="button" className={ghost} disabled={pending} onClick={() => run(() => setRuleSetStatus(ruleSet.id, 'active'), 'Rule set active')}>
            Activate
          </Button>
        )}
        {status === 'active' && (
          <Button type="button" variant="outline" className={`${ghost} text-red-600 dark:text-red-400`} disabled={pending} onClick={() => run(() => setRuleSetStatus(ruleSet.id, 'emergency_disabled'), 'Rule set disabled')}>
            Emergency disable
          </Button>
        )}
        {['draft', 'approved', 'active'].includes(status) && (
          <Button type="button" variant="outline" className={ghost} disabled={pending} onClick={() => run(() => setRuleSetStatus(ruleSet.id, 'retired'), 'Rule set retired')}>
            Retire
          </Button>
        )}
        {status !== 'draft' && (
          <RuleSetSheetButton jurisdictionId={jurisdictionId} ruleSet={ruleSet} mode="version" variant="outline" className={ghost}>New version</RuleSetSheetButton>
        )}
      </div>
      <ErrorLine message={error} />
      {status === 'draft' && (
        <ApproveSheet
          key={approve || 'closed'}
          ruleSet={ruleSet}
          open={approve !== null}
          initialStatus={approve || 'approved'}
          onOpenChange={next => { if (!next) setApprove(null); }}
        />
      )}
    </div>
  );
}
