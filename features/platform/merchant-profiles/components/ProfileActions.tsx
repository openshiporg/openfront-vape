'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { ErrorLine, Field } from '@/features/platform/components/compliance-form';
import { buttonClass } from '@/features/platform/components/vape-ui';
import { duplicateProfile, resumeSales, setProfileStatus, stopSales } from '../actions/profiles';
import type { SaveResult } from '@/features/platform/lib/session-context';

type Transition = { status: string; label: string; done: string; variant: 'default' | 'outline' | 'destructive' };

const VARIANT_CLASS: Record<Transition['variant'], string> = {
  default: `${buttonClass.base} ${buttonClass.primary}`,
  outline: `${buttonClass.base} ${buttonClass.outline}`,
  destructive: `${buttonClass.base} ${buttonClass.danger}`,
};

const TRANSITIONS: Record<string, Transition[]> = {
  draft: [
    { status: 'review', label: 'Submit for review', done: 'Submitted for review', variant: 'default' },
    { status: 'revoked', label: 'Revoke', done: 'Profile revoked', variant: 'destructive' },
  ],
  review: [
    { status: 'active', label: 'Activate', done: 'Profile activated', variant: 'default' },
    { status: 'draft', label: 'Return to draft', done: 'Returned to draft', variant: 'outline' },
    { status: 'revoked', label: 'Revoke', done: 'Profile revoked', variant: 'destructive' },
  ],
  active: [
    { status: 'suspended', label: 'Suspend', done: 'Profile suspended', variant: 'outline' },
    { status: 'revoked', label: 'Revoke', done: 'Profile revoked', variant: 'destructive' },
  ],
  suspended: [
    { status: 'active', label: 'Activate', done: 'Profile activated', variant: 'default' },
    { status: 'revoked', label: 'Revoke', done: 'Profile revoked', variant: 'destructive' },
  ],
  revoked: [],
};

export function ProfileStatusActions({ id, status, canManage }: { id: string; status: string; canManage: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!canManage) return null;

  const run = (action: () => Promise<SaveResult>, done: string, next?: (id: string) => void) => {
    setError('');
    startTransition(async () => {
      const result = await action();
      if (!result.success) { setError(result.error); return; }
      toast.success(done);
      setConfirming(false);
      if (next) next(result.data.id);
      else router.refresh();
    });
  };

  const transitions = TRANSITIONS[status] || [];
  const revision = status !== 'draft' && status !== 'review';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {transitions.map(transition => transition.status === 'revoked' && !confirming ? (
          <button key={transition.status} type="button" disabled={pending} className={VARIANT_CLASS.outline} onClick={() => setConfirming(true)}>
            Revoke
          </button>
        ) : (
          <button
            key={transition.status}
            type="button"
            disabled={pending}
            className={VARIANT_CLASS[transition.variant]}
            onClick={() => run(() => setProfileStatus(id, status, transition.status), transition.done)}
          >
            {transition.status === 'revoked' ? 'Confirm revoke' : transition.label}
          </button>
        ))}
        {revision && (
          <button
            type="button"
            disabled={pending}
            className={VARIANT_CLASS.outline}
            onClick={() => run(() => duplicateProfile(id), 'New draft recorded', newId => router.push(`/dashboard/platform/merchant-profiles/${newId}`))}
          >
            Record a new revision
          </button>
        )}
      </div>
      <ErrorLine message={error} />
    </div>
  );
}

export function KillSwitchControl({ id, killSwitch, canKill }: { id: string; killSwitch: boolean; canKill: boolean }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<SaveResult>, done: string) => {
    setError('');
    startTransition(async () => {
      const result = await action();
      if (!result.success) { setError(result.error); return; }
      toast.success(done);
      setReason('');
      router.refresh();
    });
  };

  if (killSwitch) {
    return (
      <div className="space-y-2">
        <button type="button" disabled={pending} className={VARIANT_CLASS.default} onClick={() => run(() => resumeSales(id), 'Sales resumed')}>
          {pending ? 'Saving…' : 'Resume sales'}
        </button>
        {!canKill && <p className="text-xs text-muted-foreground">Kill switch permission required</p>}
        <ErrorLine message={error} />
      </div>
    );
  }

  const length = reason.trim().length;
  return (
    <form
      className="space-y-2"
      onSubmit={event => {
        event.preventDefault();
        run(() => stopSales(id, reason), 'Sales stopped');
      }}
    >
      <Field id={`stop-${id}`} label="Stop reason">
        <Input id={`stop-${id}`} value={reason} maxLength={500} onChange={event => setReason(event.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || length < 10}
          className={`${VARIANT_CLASS.destructive} h-10`}
        >
          {pending ? 'Recording…' : 'Stop sales'}
        </button>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{length} / 10-500</span>
      </div>
      {!canKill && <p className="text-xs text-muted-foreground">Kill switch permission required</p>}
      <ErrorLine message={error} />
    </form>
  );
}
