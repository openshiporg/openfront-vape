'use client';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/features/platform/components/vape-primitives';
import { ListBand } from '@/features/platform/components/vape-ui';
import { setDemoCatalogue } from '../actions/storefrontWarning';

/** Drafts visible on the storefront as display only. Never makes anything sellable. */
export function DemoCatalogueControl({ storeId, on: initialOn, changedAt }: { storeId: string; on: boolean; changedAt: string | null }) {
  const [on, setOn] = useState(initialOn);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const save = (next: boolean) =>
    startTransition(async () => {
      const result = await setDemoCatalogue(storeId, next);
      setMessage(result.message);
      if (result.success) setOn(next);
      setConfirming(false);
    });

  return (
    <ListBand>
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[14px] font-medium text-foreground">
            Demo catalogue <span className="font-normal text-muted-foreground">· {on ? 'On' : 'Off'}</span>
          </p>
          <p className="text-[12px] text-muted-foreground">
            Shows draft products on the storefront as display only. Nothing can be added to a bag or bought, and sales stay paused while it is on. No compliance records are created.
          </p>
          {changedAt && (
            <p className="text-[12px] text-muted-foreground">Last changed {new Date(changedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          {!on && !confirming && (
            <button type="button" disabled={pending} onClick={() => { setMessage(''); setConfirming(true); }} className={cn(buttonClass.base, buttonClass.outline)}>
              Turn on
            </button>
          )}
          {!on && confirming && (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={() => save(true)} className={cn(buttonClass.base, buttonClass.primary)}>
                {pending ? 'Saving…' : 'Confirm: show drafts'}
              </button>
              <button type="button" disabled={pending} onClick={() => setConfirming(false)} className={cn(buttonClass.base, buttonClass.ghost)}>
                Cancel
              </button>
            </div>
          )}
          {on && (
            <button type="button" disabled={pending} onClick={() => save(false)} className={cn(buttonClass.base, buttonClass.outline)}>
              {pending ? 'Saving…' : 'Turn off'}
            </button>
          )}
          {message && <p role="status" className="text-[12px] text-muted-foreground">{message}</p>}
        </div>
      </div>
    </ListBand>
  );
}
