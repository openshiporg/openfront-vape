'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { Pill, Track } from '@/features/platform/components/vape-primitives';
import {
  CLASSIFICATION_CATEGORY_LABELS,
  PROVIDER_APPROVAL_STATUS_LABELS,
  PROVIDER_PURPOSE_LABELS,
} from '@/features/keystone/regulated/labels';
import { createProviderApproval, getApprovalOptions, type ApprovalInput, type ApprovalOptions } from '../actions/approvals';

const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring';

async function sha256(file: File) {
  const buffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Checks({ label, options, value, onChange }: {
  label: string;
  options: Array<[string, string]>;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs text-muted-foreground">{label}</legend>
      <div className="grid max-h-48 gap-1 overflow-y-auto rounded-md border border-input p-2 sm:grid-cols-2">
        {options.map(([key, text]) => (
          <label key={key} className="flex min-h-8 items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={value.includes(key)}
              onChange={event => onChange(event.target.checked ? [...value, key] : value.filter(item => item !== key))}
            />
            {text}
          </label>
        ))}
        {options.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
      </div>
    </fieldset>
  );
}

const STATUSES = ['review', 'active'] as const;

function emptyApproval(purpose: string, options: ApprovalOptions | null): ApprovalInput {
  return {
    profileId: options?.profiles[0]?.id || '',
    purpose,
    providerCode: '',
    approvalReference: '',
    evidenceDigest: '',
    coveredCategories: [],
    coveredJurisdictionCodes: [],
    capabilities: '',
    paymentProviderId: '',
    shippingProviderId: '',
    status: 'review',
    effectiveAt: '',
    expiresAt: '',
  };
}

export function AddApprovalButton({ purpose, children, className }: { purpose: string; children: ReactNode; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ApprovalOptions | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [value, setValue] = useState<ApprovalInput>(() => emptyApproval(purpose, null));
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<ApprovalInput>) => setValue(current => ({ ...current, ...patch }));

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoadState('loading');
    getApprovalOptions()
      .then(result => {
        setOptions(result);
        setValue(emptyApproval(purpose, result));
        setLoadState(result ? 'ready' : 'failed');
      })
      .catch(() => setLoadState('failed'));
  }, [open, purpose]);

  const purposeLabel = PROVIDER_PURPOSE_LABELS[value.purpose] || value.purpose;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-2">
            <SheetTitle>{purposeLabel} provider approval</SheetTitle>
            <SheetDescription className="sr-only">Record a provider approval</SheetDescription>
          </SheetHeader>

          {loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
          {loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load compliance records.</p>}

          {loadState === 'ready' && options && (
            <form
              className="space-y-6 px-4 pb-24 sm:pb-8"
              onSubmit={event => {
                event.preventDefault();
                setError('');
                startTransition(async () => {
                  const result = await createProviderApproval(value);
                  if (!result.success) { setError(result.error); return; }
                  toast.success('Approval recorded');
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              <section className="space-y-3">
                <SectionTitle>Provider</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="pa-purpose" label="Purpose">
                    <select id="pa-purpose" className={selectClass} value={value.purpose} onChange={event => set({ purpose: event.target.value })}>
                      {Object.entries(PROVIDER_PURPOSE_LABELS).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
                    </select>
                  </Field>
                  <Field id="pa-profile" label="Merchant profile">
                    <select id="pa-profile" className={selectClass} value={value.profileId} onChange={event => set({ profileId: event.target.value })}>
                      <option value="">None</option>
                      {options.profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.legalName}</option>)}
                    </select>
                  </Field>
                  <Field id="pa-code" label="Provider code">
                    <Input id="pa-code" required className="font-mono" value={value.providerCode} onChange={event => set({ providerCode: event.target.value })} />
                  </Field>
                  {value.purpose === 'payment' && (
                    <Field id="pa-payment" label="Payment provider">
                      <select id="pa-payment" className={selectClass} value={value.paymentProviderId} onChange={event => set({ paymentProviderId: event.target.value })}>
                        <option value="">None</option>
                        {options.paymentProviders.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                      </select>
                    </Field>
                  )}
                  {value.purpose === 'carrier' && (
                    <Field id="pa-shipping" label="Shipping provider">
                      <select id="pa-shipping" className={selectClass} value={value.shippingProviderId} onChange={event => set({ shippingProviderId: event.target.value })}>
                        <option value="">None</option>
                        {options.shippingProviders.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                      </select>
                    </Field>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Coverage</SectionTitle>
                <Checks
                  label="Product types"
                  options={Object.entries(CLASSIFICATION_CATEGORY_LABELS)}
                  value={value.coveredCategories}
                  onChange={coveredCategories => set({ coveredCategories })}
                />
                <Checks
                  label="Jurisdictions"
                  options={options.jurisdictions.map(jurisdiction => [jurisdiction.code, `${jurisdiction.code} ${jurisdiction.name}`])}
                  value={value.coveredJurisdictionCodes}
                  onChange={coveredJurisdictionCodes => set({ coveredJurisdictionCodes })}
                />
                <Field id="pa-capabilities" label="Capabilities (comma separated)">
                  <Input id="pa-capabilities" className="font-mono" value={value.capabilities} onChange={event => set({ capabilities: event.target.value })} />
                </Field>
              </section>

              <section className="space-y-3">
                <SectionTitle>Evidence</SectionTitle>
                <Field id="pa-reference" label="Approval reference">
                  <Input id="pa-reference" required value={value.approvalReference} onChange={event => set({ approvalReference: event.target.value })} />
                </Field>
                <Field id="pa-evidence" label="Evidence document">
                  <Input
                    id="pa-evidence"
                    type="file"
                    className="h-10 cursor-pointer pt-2 text-xs"
                    onChange={async event => {
                      const file = event.target.files?.[0];
                      set({ evidenceDigest: file ? await sha256(file) : '' });
                    }}
                  />
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {value.evidenceDigest ? `SHA-256 ${value.evidenceDigest}` : 'No file'}
                  </p>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="pa-from" label="Effective from">
                    <Input id="pa-from" type="date" value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                  </Field>
                  <Field id="pa-to" label="Expires">
                    <Input id="pa-to" type="date" value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                  </Field>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-xs text-muted-foreground">Status</span>
                  <Track label="Approval status">
                    {STATUSES.map(status => (
                      <Pill key={status} active={value.status === status} onClick={() => set({ status })}>
                        {PROVIDER_APPROVAL_STATUS_LABELS[status]}
                      </Pill>
                    ))}
                  </Track>
                </div>
              </section>

              {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" disabled={pending || !value.evidenceDigest} className="h-10 w-full rounded-full">
                {pending ? 'Saving…' : 'Record approval'}
              </Button>
              {!value.evidenceDigest && <p className="text-xs text-muted-foreground">Evidence document required</p>}
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
