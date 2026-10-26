'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ErrorLine, Field, textareaClass } from '@/features/platform/components/compliance-form';
import { Dot, ListBand } from '@/features/platform/components/vape-ui';
import { adjustStockBulk, type BulkOutcome, type BulkRow } from '../actions/adjust';

type Parsed = { rows: BulkRow[]; problems: Array<{ line: number; message: string }> };

function parse(text: string): Parsed {
  const rows: BulkRow[] = [];
  const problems: Parsed['problems'] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    if (!raw.trim()) return;
    const [sku = '', delta = '', ...rest] = raw.split(',').map(cell => cell.trim());
    if (line === 1 && /^sku$/i.test(sku)) return;
    const reason = rest.join(',').trim();
    const amount = Number(delta);
    if (!sku) problems.push({ line, message: 'SKU missing' });
    else if (!delta || !Number.isInteger(amount) || amount === 0) problems.push({ line, message: 'Change must be a non-zero whole number' });
    else if (!reason) problems.push({ line, message: 'Reason missing' });
    else rows.push({ line, sku, delta: amount, reason });
  });
  return { rows, problems };
}

export function BulkAdjustSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [outcomes, setOutcomes] = useState<BulkOutcome[] | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const parsed = useMemo(() => parse(text), [text]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setText('');
          setOutcomes(null);
          setError('');
          setOpen(true);
        }}
        className="inline-flex min-h-8 shrink-0 items-center rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-muted max-sm:min-h-10"
      >
        Bulk adjust
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-2">
            <SheetTitle>Bulk adjust stock</SheetTitle>
            <SheetDescription className="font-mono text-xs">sku,change,reason</SheetDescription>
          </SheetHeader>
          <form
            className="space-y-5 px-4 pb-24 sm:pb-8"
            onSubmit={event => {
              event.preventDefault();
              setError('');
              startTransition(async () => {
                const result = await adjustStockBulk(parsed.rows);
                if (!result.success) {
                  setError(result.error);
                  return;
                }
                setOutcomes(result.data);
                if (result.data.some(outcome => outcome.ok)) router.refresh();
              });
            }}
          >
            <Field id="bulk-rows" label="Rows">
              <textarea
                id="bulk-rows"
                className={`${textareaClass} min-h-48 font-mono text-xs`}
                spellCheck={false}
                value={text}
                placeholder={'VAPE-001,24,Received\nVAPE-002,-1,Damaged'}
                onChange={event => {
                  setText(event.target.value);
                  setOutcomes(null);
                }}
              />
            </Field>

            <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              <span><span className="font-mono tabular-nums text-foreground">{parsed.rows.length}</span> rows</span>
              {parsed.problems.length > 0 && (
                <span><span className="font-mono tabular-nums text-red-600 dark:text-red-400">{parsed.problems.length}</span> invalid</span>
              )}
            </div>

            {parsed.problems.length > 0 && (
              <ListBand>
                {parsed.problems.map(problem => (
                  <div key={problem.line} className="flex items-baseline gap-2.5 px-3 py-2 text-xs">
                    <Dot tone="danger" />
                    <span className="font-mono tabular-nums text-muted-foreground">Line {problem.line}</span>
                    <span className="text-foreground">{problem.message}</span>
                  </div>
                ))}
              </ListBand>
            )}

            {outcomes && (
              <ListBand>
                {outcomes.map(outcome => (
                  <div key={outcome.line} className="flex items-baseline gap-2.5 px-3 py-2 text-xs">
                    <Dot tone={outcome.ok ? 'ok' : 'danger'} />
                    <span className="min-w-0 truncate font-mono tabular-nums text-foreground">{outcome.sku}</span>
                    <span className="ml-auto shrink-0 text-right text-muted-foreground">{outcome.message}</span>
                  </div>
                ))}
              </ListBand>
            )}

            <ErrorLine message={error} />
            <Button
              type="submit"
              disabled={pending || parsed.rows.length === 0 || parsed.problems.length > 0 || outcomes !== null}
              className="h-10 w-full rounded-[4px]"
            >
              {pending ? 'Applying' : `Apply ${parsed.rows.length} ${parsed.rows.length === 1 ? 'row' : 'rows'}`}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
