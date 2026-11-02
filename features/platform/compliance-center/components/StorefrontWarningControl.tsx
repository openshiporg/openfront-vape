'use client';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/features/platform/components/vape-primitives';
import { ListBand } from '@/features/platform/components/vape-ui';
import { NICOTINE_WARNING } from '@/features/storefront/lib/nicotine-warning';
import { setStorefrontWarning } from '../actions/storefrontWarning';

/** The store-wide FDA nicotine warning (21 CFR 1143.3). Turning it off needs a confirm. */
export function StorefrontWarningControl({ storeId, on: initialOn }: { storeId: string; on: boolean }) {
  const [on, setOn] = useState(initialOn);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  const save = (next: boolean) =>
    startTransition(async () => {
      const result = await setStorefrontWarning(storeId, next);
      setMessage(result.message);
      if (result.success) setOn(next);
      setConfirming(false);
    });

  return (
    <ListBand>
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[14px] font-medium text-foreground">
            Nicotine warning on the storefront <span className="font-normal text-muted-foreground">· {on ? 'On' : 'Off'}</span>
          </p>
          <p className="border-2 border-foreground px-2 py-1 text-center text-[12px] font-bold text-foreground">{NICOTINE_WARNING}</p>
          <p className="text-[12px] text-muted-foreground">
            Shown at the top of every storefront page, cannot be dismissed. Required by 21 CFR 1143.3 while the shop shows nicotine products.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          {on && !confirming && (
            <button type="button" disabled={pending} onClick={() => { setMessage(''); setConfirming(true); }} className={cn(buttonClass.base, buttonClass.outline)}>
              Turn off
            </button>
          )}
          {on && confirming && (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={() => save(false)} className={cn(buttonClass.base, buttonClass.danger)}>
                {pending ? 'Saving…' : 'Confirm: turn off'}
              </button>
              <button type="button" disabled={pending} onClick={() => setConfirming(false)} className={cn(buttonClass.base, buttonClass.ghost)}>
                Cancel
              </button>
            </div>
          )}
          {!on && (
            <button type="button" disabled={pending} onClick={() => save(true)} className={cn(buttonClass.base, buttonClass.primary)}>
              {pending ? 'Saving…' : 'Turn on'}
            </button>
          )}
          {message && <p role="status" className="text-[12px] text-muted-foreground">{message}</p>}
        </div>
      </div>
    </ListBand>
  );
}
