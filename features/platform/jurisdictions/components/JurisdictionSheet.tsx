'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ErrorLine, Field, Options, selectClass } from '@/features/platform/components/compliance-form';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { JURISDICTION_LEVEL_LABELS } from '@/features/keystone/regulated/labels';
import { getParentOptions, saveJurisdiction } from '../actions/jurisdictions';
import type { JurisdictionDetail, JurisdictionInput } from '../lib/shared';
import { SourcesEditor } from './SourcesEditor';

function initial(jurisdiction?: JurisdictionDetail): JurisdictionInput {
  return {
    code: jurisdiction?.code || '',
    name: jurisdiction?.name || '',
    level: jurisdiction?.level || 'state',
    parentId: jurisdiction?.parent?.id || '',
    postalScope: (jurisdiction?.postalScope || []).join(', '),
    authoritySources: jurisdiction?.authoritySources.length ? jurisdiction.authoritySources : [{ title: '', url: '' }],
  };
}

export function JurisdictionSheetButton({ jurisdiction, children, className, variant }: {
  jurisdiction?: JurisdictionDetail;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<JurisdictionInput>(() => initial(jurisdiction));
  const [parents, setParents] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<JurisdictionInput>) => setValue(current => ({ ...current, ...patch }));

  useEffect(() => {
    if (!open) return;
    setError('');
    setValue(initial(jurisdiction));
    getParentOptions().then(setParents).catch(() => setParents([]));
    // Reset only when the sheet opens, not when the page refreshes behind it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const editing = Boolean(jurisdiction);

  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>{children}</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-2">
            <SheetTitle>{editing ? `Edit ${jurisdiction!.code}` : 'New jurisdiction'}</SheetTitle>
            <SheetDescription className="sr-only">{editing ? 'Edit jurisdiction' : 'Create a jurisdiction'}</SheetDescription>
          </SheetHeader>
          <form
            className="space-y-6 px-4 pb-24 sm:pb-8"
            onSubmit={event => {
              event.preventDefault();
              setError('');
              startTransition(async () => {
                const result = await saveJurisdiction(jurisdiction?.id || null, value);
                if (!result.success) { setError(result.error); return; }
                toast.success(editing ? 'Jurisdiction saved' : 'Jurisdiction created');
                setOpen(false);
                if (!editing) router.push(`/dashboard/platform/jurisdictions/${result.data.id}`);
                router.refresh();
              });
            }}
          >
            <section className="space-y-3">
              <SectionTitle>Jurisdiction</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="j-code" label="Code">
                  <Input id="j-code" required className="font-mono" placeholder="US-CA" value={value.code} onChange={event => set({ code: event.target.value })} />
                </Field>
                <Field id="j-name" label="Name">
                  <Input id="j-name" required value={value.name} onChange={event => set({ name: event.target.value })} />
                </Field>
                <Field id="j-level" label="Level">
                  <Options id="j-level" labels={JURISDICTION_LEVEL_LABELS} value={value.level} onChange={level => set({ level })} />
                </Field>
                <Field id="j-parent" label="Parent">
                  <select id="j-parent" className={selectClass} value={value.parentId} onChange={event => set({ parentId: event.target.value })}>
                    <option value="">None</option>
                    {parents.filter(parent => parent.id !== jurisdiction?.id).map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.code} {parent.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field id="j-postal" label="Postal scope (comma separated)">
                <Input id="j-postal" className="font-mono" value={value.postalScope} onChange={event => set({ postalScope: event.target.value })} />
              </Field>
            </section>

            <section className="space-y-3">
              <SectionTitle>Authority sources</SectionTitle>
              <SourcesEditor
                id="j-sources"
                label="Statutes, regulations and agency sources"
                titleLabel="Source"
                value={value.authoritySources}
                onChange={authoritySources => set({ authoritySources })}
              />
            </section>

            <ErrorLine message={error} />
            <Button type="submit" disabled={pending} className="h-10 w-full rounded-[4px]">
              {pending ? 'Saving…' : editing ? 'Save jurisdiction' : 'Create draft'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
