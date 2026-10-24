'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checks, ErrorLine, EvidenceFile, Field, selectClass, textareaClass } from '@/features/platform/components/compliance-form';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { CLASSIFICATION_CATEGORY_LABELS } from '@/features/keystone/regulated/labels';
import {
  createProfile,
  getJurisdictionOptions,
  updateProfile,
  type JurisdictionOption,
  type ProfileInput,
} from '../actions/profiles';

const EMPTY: ProfileInput = {
  legalName: '',
  complianceOwner: '',
  escalationContacts: '',
  counselApprovalReference: '',
  insuranceReference: '',
  enabledCategories: [],
  originJurisdictionId: '',
  launchJurisdictionIds: [],
  pactRegistered: false,
  pactRegistrationReference: '',
  pactEvidenceDigest: '',
  effectiveAt: '',
  expiresAt: '',
};

export function ProfileSheet({
  profileId,
  initial,
  hasPactEvidence = false,
  className,
  children,
}: {
  profileId?: string;
  initial?: Omit<ProfileInput, 'pactEvidenceDigest'>;
  hasPactEvidence?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionOption[] | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [value, setValue] = useState<ProfileInput>(EMPTY);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<ProfileInput>) => setValue(current => ({ ...current, ...patch }));

  useEffect(() => {
    if (!open) return;
    getJurisdictionOptions()
      .then(result => {
        setJurisdictions(result);
        setLoadState(result ? 'ready' : 'failed');
      })
      .catch(() => setLoadState('failed'));
  }, [open]);

  const show = () => {
    setError('');
    setValue(initial ? { ...initial, pactEvidenceDigest: '' } : EMPTY);
    setLoadState('loading');
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={show} className={className}>
        {children}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-2">
            <SheetTitle>{profileId ? 'Edit merchant profile' : 'New merchant profile'}</SheetTitle>
            <SheetDescription className="sr-only">Merchant profile</SheetDescription>
          </SheetHeader>

          {loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
          {loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load jurisdictions.</p>}

          {loadState === 'ready' && jurisdictions && (
            <form
              className="space-y-6 px-4 pb-24 sm:pb-8"
              onSubmit={event => {
                event.preventDefault();
                setError('');
                if (value.effectiveAt && value.expiresAt && value.expiresAt <= value.effectiveAt) {
                  setError('Expiry must be after the effective date.');
                  return;
                }
                startTransition(async () => {
                  const result = profileId ? await updateProfile(profileId, value) : await createProfile(value);
                  if (!result.success) { setError(result.error); return; }
                  toast.success(profileId ? 'Profile saved' : 'Profile created');
                  setOpen(false);
                  if (!profileId) router.push(`/dashboard/platform/merchant-profiles/${result.data.id}`);
                  else router.refresh();
                });
              }}
            >
              <section className="space-y-3">
                <SectionTitle>Merchant</SectionTitle>
                <Field id="mp-legal" label="Legal name">
                  <Input id="mp-legal" required value={value.legalName} onChange={event => set({ legalName: event.target.value })} />
                </Field>
                <Field id="mp-owner" label="Compliance owner">
                  <Input id="mp-owner" required value={value.complianceOwner} onChange={event => set({ complianceOwner: event.target.value })} />
                </Field>
                <Field id="mp-contacts" label="Escalation contacts (one per line)">
                  <textarea id="mp-contacts" className={textareaClass} value={value.escalationContacts} onChange={event => set({ escalationContacts: event.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="mp-counsel" label="Counsel approval reference">
                    <Input id="mp-counsel" value={value.counselApprovalReference} onChange={event => set({ counselApprovalReference: event.target.value })} />
                  </Field>
                  <Field id="mp-insurance" label="Insurance reference">
                    <Input id="mp-insurance" value={value.insuranceReference} onChange={event => set({ insuranceReference: event.target.value })} />
                  </Field>
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Scope</SectionTitle>
                <Checks
                  label="Enabled product types"
                  options={Object.entries(CLASSIFICATION_CATEGORY_LABELS)}
                  value={value.enabledCategories}
                  onChange={enabledCategories => set({ enabledCategories })}
                />
                <Field id="mp-origin" label="Origin jurisdiction">
                  <select id="mp-origin" className={selectClass} value={value.originJurisdictionId} onChange={event => set({ originJurisdictionId: event.target.value })}>
                    <option value="">None</option>
                    {jurisdictions.map(item => <option key={item.id} value={item.id}>{item.code} {item.name}</option>)}
                  </select>
                </Field>
                <Checks
                  label="Launch jurisdictions"
                  options={jurisdictions.map(item => [item.id, `${item.code} ${item.name}`])}
                  value={value.launchJurisdictionIds}
                  onChange={launchJurisdictionIds => set({ launchJurisdictionIds })}
                />
              </section>

              <section className="space-y-3">
                <SectionTitle>PACT Act</SectionTitle>
                <label className="flex min-h-8 items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={value.pactRegistered} onChange={event => set({ pactRegistered: event.target.checked })} />
                  Registered
                </label>
                <Field id="mp-pact-ref" label="Registration reference">
                  <Input id="mp-pact-ref" value={value.pactRegistrationReference} onChange={event => set({ pactRegistrationReference: event.target.value })} />
                </Field>
                <EvidenceFile
                  id="mp-pact-evidence"
                  label="Registration evidence"
                  digest={value.pactEvidenceDigest}
                  onRecord={hasPactEvidence}
                  onDigest={pactEvidenceDigest => set({ pactEvidenceDigest })}
                />
              </section>

              <section className="space-y-3">
                <SectionTitle>Dates</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="mp-from" label="Effective from">
                    <Input id="mp-from" type="date" value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                  </Field>
                  <Field id="mp-to" label="Expires">
                    <Input id="mp-to" type="date" value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                  </Field>
                </div>
              </section>

              <ErrorLine message={error} />
              <Button type="submit" disabled={pending} className="h-10 w-full rounded-full">
                {pending ? 'Saving…' : profileId ? 'Save profile' : 'Create draft'}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
