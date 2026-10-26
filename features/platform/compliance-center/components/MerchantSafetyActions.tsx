'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/features/platform/components/vape-primitives';
import { stopCommerce, exportInventory } from '../actions/operations';

/**
 * Kill switch action for one profile. When it is off, "Enable kill switch" opens a confirmation
 * that needs a recorded reason before the stop is sent; when it is on, it is turned off on the profile.
 */
export function KillSwitchControl({ profileId, killSwitch, canStop }: { profileId: string; killSwitch: boolean; canStop: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  if (!canStop) return null;

  if (killSwitch) {
    return (
      <Link href={`/dashboard/platform/merchant-profiles/${profileId}`} className={cn(buttonClass.base, buttonClass.outline)}>
        Turn off on profile
        <ArrowUpRight />
      </Link>
    );
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-start gap-1">
        <button type="button" onClick={() => { setMessage(''); setConfirming(true); }} className={cn(buttonClass.base, buttonClass.danger)}>
          Enable kill switch
        </button>
        {message && <p role="status" className="text-[12px] text-muted-foreground">{message}</p>}
      </div>
    );
  }

  return (
    <form
      className="w-full space-y-2 sm:w-[26rem]"
      onSubmit={event => {
        event.preventDefault();
        startTransition(async () => {
          const result = await stopCommerce(profileId, reason);
          setMessage(result.message);
          if (result.success) { setReason(''); setConfirming(false); }
        });
      }}
    >
      <Label htmlFor={`stop-reason-${profileId}`} className="text-[12px] font-medium text-muted-foreground">Safety stop reason</Label>
      <Input
        id={`stop-reason-${profileId}`}
        value={reason}
        onChange={e => setReason(e.target.value)}
        minLength={10}
        maxLength={500}
        required
        autoFocus
        placeholder="Reason, 10 to 500 characters"
        className="h-10 rounded-[4px] bg-background"
      />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending || reason.trim().length < 10} className={cn(buttonClass.base, buttonClass.danger)}>
          {pending ? 'Recording…' : 'Confirm stop'}
        </button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); setReason(''); }} className={cn(buttonClass.base, buttonClass.ghost)}>
          Cancel
        </button>
      </div>
      {message && <p role="status" className="text-[12px] text-muted-foreground">{message}</p>}
    </form>
  );
}

export function MerchantSafetyActions({ profileId, killSwitch, canStop, canExport }: { profileId: string; killSwitch: boolean; canStop: boolean; canExport: boolean }) {
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  if (!canStop && !canExport) return null;

  return <div className="flex flex-wrap items-start gap-2">
    <KillSwitchControl profileId={profileId} killSwitch={killSwitch} canStop={canStop} />
    {canExport && <button type="button" disabled={pending} className={cn(buttonClass.base, buttonClass.outline)} onClick={() => startTransition(async () => {
      const result = await exportInventory(profileId);
      if (!result.success) { setMessage(result.message); return; }
      const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `vape-evidence-inventory-${result.report.id}.json`; link.click(); URL.revokeObjectURL(url);
      setMessage('Evidence inventory exported.');
    })}>{pending ? 'Exporting…' : 'Export evidence inventory'}</button>}
    {message && <p role="status" className="basis-full text-[12px] text-muted-foreground">{message}</p>}
  </div>;
}
