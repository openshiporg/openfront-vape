'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ErrorLine, Field } from '@/features/platform/components/compliance-form';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { saveRuleSet } from '../actions/jurisdictions';
import { formatDay, nextVersion, type RuleSetRecord, type Source } from '../lib/shared';
import { RulesEditor, currentRules, initialRulesState, type RulesState } from './RulesEditor';
import { SourcesEditor } from './SourcesEditor';

export type RuleSetSheetMode = 'create' | 'edit' | 'version' | 'view';

type FormValue = {
  packName: string;
  version: string;
  effectiveAt: string;
  expiresAt: string;
  authorityCitations: Source[];
  rules: RulesState;
};

function initial(mode: RuleSetSheetMode, ruleSet?: RuleSetRecord): FormValue {
  if (!ruleSet || mode === 'create') {
    return { packName: '', version: '1', effectiveAt: '', expiresAt: '', authorityCitations: [{ title: '', url: '' }], rules: initialRulesState([]) };
  }
  return {
    packName: ruleSet.packName,
    version: mode === 'version' ? nextVersion(ruleSet.version) : ruleSet.version,
    effectiveAt: mode === 'version' ? '' : formatDay(ruleSet.effectiveAt),
    expiresAt: mode === 'version' ? '' : formatDay(ruleSet.expiresAt),
    authorityCitations: ruleSet.authorityCitations.length ? ruleSet.authorityCitations : [{ title: '', url: '' }],
    rules: initialRulesState(ruleSet.rules),
  };
}

const TITLES: Record<RuleSetSheetMode, string> = {
  create: 'New rule set',
  edit: 'Edit rule set',
  version: 'New version',
  view: 'Rule set',
};

export function RuleSetSheetButton({ jurisdictionId, ruleSet, mode, children, className, variant = 'outline' }: {
  jurisdictionId: string;
  ruleSet?: RuleSetRecord;
  mode: RuleSetSheetMode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<FormValue>(() => initial(mode, ruleSet));
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<FormValue>) => setValue(current => ({ ...current, ...patch }));
  const readOnly = mode === 'view';

  useEffect(() => {
    if (!open) return;
    setError('');
    setValue(initial(mode, ruleSet));
    // Reset only when the sheet opens, not when the page refreshes behind it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>{children}</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle>
              {TITLES[mode]}
              {ruleSet && mode !== 'create' && <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{ruleSet.packName} {ruleSet.version}</span>}
            </SheetTitle>
            <SheetDescription className="sr-only">{TITLES[mode]}</SheetDescription>
          </SheetHeader>
          <form
            className="space-y-6 px-4 pb-24 sm:pb-8"
            onSubmit={event => {
              event.preventDefault();
              if (readOnly) return;
              setError('');
              const rules = currentRules(value.rules);
              if (rules.error) { setError(rules.error); return; }
              startTransition(async () => {
                const result = await saveRuleSet(mode === 'edit' && ruleSet ? ruleSet.id : null, jurisdictionId, {
                  packName: value.packName,
                  version: value.version,
                  effectiveAt: value.effectiveAt,
                  expiresAt: value.expiresAt,
                  authorityCitations: value.authorityCitations,
                  rules: rules.rules,
                });
                if (!result.success) { setError(result.error); return; }
                toast.success(mode === 'edit' ? 'Rule set saved' : 'Draft rule set created');
                setOpen(false);
                router.refresh();
              });
            }}
          >
            <section className="space-y-3">
              <SectionTitle>Policy pack</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="rs-pack" label="Pack name">
                  <Input id="rs-pack" required disabled={readOnly} value={value.packName} onChange={event => set({ packName: event.target.value })} />
                </Field>
                <Field id="rs-version" label="Version">
                  <Input id="rs-version" required disabled={readOnly} className="font-mono" value={value.version} onChange={event => set({ version: event.target.value })} />
                </Field>
                <Field id="rs-from" label="Effective from">
                  <Input id="rs-from" type="date" required disabled={readOnly} value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                </Field>
                <Field id="rs-to" label="Expires">
                  <Input id="rs-to" type="date" required disabled={readOnly} value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                </Field>
              </div>
              {readOnly && ruleSet && (
                <p className="break-all font-mono text-[11px] text-muted-foreground">Policy hash {ruleSet.policyHash}</p>
              )}
            </section>

            <section className="space-y-3">
              <SectionTitle>Rules</SectionTitle>
              <RulesEditor value={value.rules} onChange={rules => set({ rules })} disabled={readOnly} />
            </section>

            <section className="space-y-3">
              <SectionTitle>Authority citations</SectionTitle>
              <SourcesEditor
                id="rs-citations"
                label="Citations"
                titleLabel="Citation"
                value={value.authorityCitations}
                disabled={readOnly}
                onChange={authorityCitations => set({ authorityCitations })}
              />
            </section>

            {!readOnly && (
              <>
                <ErrorLine message={error} />
                <Button type="submit" disabled={pending} className="h-10 w-full rounded-[4px]">
                  {pending ? 'Saving…' : mode === 'edit' ? 'Save draft' : 'Create draft'}
                </Button>
              </>
            )}
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
