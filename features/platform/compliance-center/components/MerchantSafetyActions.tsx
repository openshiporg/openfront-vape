'use client';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stopCommerce, exportInventory } from '../actions/operations';

export function MerchantSafetyActions({ profileId, canStop, canExport }: { profileId: string; canStop: boolean; canExport: boolean }) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  return <div className="space-y-4">
    {canStop && <form className="space-y-2" onSubmit={event => {
      event.preventDefault();
      startTransition(async () => { const result = await stopCommerce(profileId, reason); setMessage(result.message); if (result.success) setReason(''); });
    }}>
      <Label htmlFor={`stop-reason-${profileId}`}>Reason for safety stop</Label>
      <Input id={`stop-reason-${profileId}`} value={reason} onChange={e => setReason(e.target.value)} minLength={10} maxLength={500} required placeholder="Reason" />
      <Button type="submit" variant="destructive" disabled={pending}>{pending ? 'Recording…' : 'Enable kill switch'}</Button>
    </form>}
    {canExport && <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
      const result = await exportInventory(profileId);
      if (!result.success) { setMessage(result.message); return; }
      const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `vape-evidence-inventory-${result.report.id}.json`; link.click(); URL.revokeObjectURL(url);
      setMessage('Evidence inventory exported.');
    })}>Export evidence inventory</Button>}
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
  </div>;
}
