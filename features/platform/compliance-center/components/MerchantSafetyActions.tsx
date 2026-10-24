'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stopCommerce, exportInventory } from '../actions/operations';

export function MerchantSafetyActions({ profileId, killSwitch, canStop, canExport }: { profileId: string; killSwitch: boolean; canStop: boolean; canExport: boolean }) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  if (!canStop && !canExport) return null;

  return <div className="space-y-3">
    {canStop && killSwitch && <Link href={`/dashboard/platform/merchant-profiles/${profileId}`} className="inline-flex h-9 items-center gap-1 rounded-full bg-background px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.08)]">
      Turn off on profile
      <ArrowUpRight className="size-3.5" />
    </Link>}
    {canStop && !killSwitch && <form className="space-y-2" onSubmit={event => {
      event.preventDefault();
      startTransition(async () => { const result = await stopCommerce(profileId, reason); setMessage(result.message); if (result.success) setReason(''); });
    }}>
      <Label htmlFor={`stop-reason-${profileId}`} className="text-xs text-muted-foreground">Safety stop reason</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id={`stop-reason-${profileId}`} value={reason} onChange={e => setReason(e.target.value)} minLength={10} maxLength={500} required placeholder="Reason" className="h-10 rounded-full bg-background px-4" />
        <button type="submit" disabled={pending} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
          {pending ? 'Recording…' : 'Enable kill switch'}
        </button>
      </div>
    </form>}
    {canExport && <button type="button" disabled={pending} className="inline-flex h-9 items-center rounded-full bg-background px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.08)] disabled:opacity-60" onClick={() => startTransition(async () => {
      const result = await exportInventory(profileId);
      if (!result.success) { setMessage(result.message); return; }
      const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `vape-evidence-inventory-${result.report.id}.json`; link.click(); URL.revokeObjectURL(url);
      setMessage('Evidence inventory exported.');
    })}>Export evidence inventory</button>}
    {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </div>;
}
