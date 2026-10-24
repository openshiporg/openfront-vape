'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorLine, Field, textareaClass } from '@/features/platform/components/compliance-form';
import { Pill, Track } from '@/features/platform/components/vape-primitives';
import { adjustStock } from '../actions/adjust';

const REASONS = ['Received', 'Count correction', 'Damaged', 'Expired', 'Returned to supplier', 'Recall', 'Other'];

export function AdjustStockSheet({ variant }: { variant: { id: string; title: string; sku: string | null; inventoryQuantity: number } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'delta' | 'set'>('delta');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const parsed = Number(quantity);
  const valid = quantity.trim() !== '' && Number.isInteger(parsed);
  const after = valid ? (mode === 'set' ? parsed : variant.inventoryQuantity + parsed) : null;

  const reset = () => {
    setMode('delta');
    setQuantity('');
    setReason(REASONS[0]);
    setNote('');
    setError('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex min-h-8 items-center rounded-full bg-background px-3 text-xs font-medium text-foreground shadow-xs ring-1 ring-border hover:bg-background/80 max-sm:min-h-10"
      >
        Adjust stock
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="pb-2">
            <SheetTitle>Adjust stock</SheetTitle>
            <SheetDescription className="break-words font-mono text-xs tabular-nums">
              {variant.title}
              {variant.sku ? ` ${variant.sku}` : ''}
            </SheetDescription>
          </SheetHeader>
          <form
            className="space-y-5 px-4 pb-24 sm:pb-8"
            onSubmit={event => {
              event.preventDefault();
              setError('');
              startTransition(async () => {
                const result = await adjustStock({ variantId: variant.id, mode, quantity: parsed, reason, note });
                if (!result.success) {
                  setError(result.error);
                  return;
                }
                toast.success(`Stock now ${result.data.inventoryQuantity}`);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">On hand</span>
              <span className="font-mono tabular-nums text-foreground">{variant.inventoryQuantity}</span>
            </div>

            <Track label="Adjustment type">
              <Pill active={mode === 'delta'} onClick={() => setMode('delta')}>Add or remove</Pill>
              <Pill active={mode === 'set'} onClick={() => setMode('set')}>Set count</Pill>
            </Track>

            <Field id="adjust-quantity" label={mode === 'set' ? 'New count' : 'Change (negative removes)'}>
              <Input
                id="adjust-quantity"
                inputMode="numeric"
                required
                className="font-mono tabular-nums"
                value={quantity}
                onChange={event => setQuantity(event.target.value.replace(/[^\d-]/g, ''))}
              />
            </Field>

            <Field id="adjust-reason" label="Reason">
              <select
                id="adjust-reason"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={reason}
                onChange={event => setReason(event.target.value)}
              >
                {REASONS.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </Field>

            <Field id="adjust-note" label="Note">
              <textarea id="adjust-note" className={textareaClass} maxLength={500} value={note} onChange={event => setNote(event.target.value)} />
            </Field>

            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">After</span>
              <span className={after !== null && after < 0 ? 'font-mono tabular-nums text-red-600 dark:text-red-400' : 'font-mono tabular-nums text-foreground'}>
                {after === null ? '-' : after}
              </span>
            </div>

            <ErrorLine message={error} />
            <Button type="submit" disabled={pending || !valid} className="h-10 w-full rounded-full">
              {pending ? 'Saving' : 'Save adjustment'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
