'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorLine, EvidenceFile, Field, selectClass } from '@/features/platform/components/compliance-form';
import { SectionTitle } from '@/features/platform/components/vape-ui';
import { Pill, Track } from '@/features/platform/components/vape-primitives';
import { MERCHANT_LICENSE_STATUS_LABELS } from '@/features/keystone/regulated/labels';
import { getJurisdictionOptions, type JurisdictionOption, type ProfileLicense } from '../actions/profiles';
import { closeLicense, createLicense, updateLicense, type LicenseInput } from '../actions/licenses';

const STATUSES = ['draft', 'active', 'conditioned'] as const;
const USABLE = ['active', 'conditioned'];

const EMPTY: LicenseInput = {
  jurisdictionId: '',
  licenseType: '',
  licenseNumber: '',
  issuingAuthority: '',
  authorityReference: '',
  verificationSource: '',
  evidenceDigest: '',
  status: 'draft',
  effectiveAt: '',
  expiresAt: '',
  verifiedAt: '',
};

function fromLicense(license: ProfileLicense): LicenseInput {
  return {
    jurisdictionId: license.jurisdictionId,
    licenseType: license.licenseType,
    licenseNumber: license.licenseNumber,
    issuingAuthority: license.issuingAuthority,
    authorityReference: license.authorityReference,
    verificationSource: license.verificationSource,
    evidenceDigest: '',
    status: STATUSES.includes(license.status as any) ? license.status : 'draft',
    effectiveAt: license.effectiveAt,
    expiresAt: license.expiresAt,
    verifiedAt: license.verifiedAt,
  };
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right text-foreground">{children || 'None'}</dd>
    </div>
  );
}

export function LicenseSheet({
  profileId,
  license,
  canManage,
  className,
  children,
}: {
  profileId: string;
  license?: ProfileLicense;
  canManage: boolean;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionOption[] | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [value, setValue] = useState<LicenseInput>(EMPTY);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<LicenseInput>) => setValue(current => ({ ...current, ...patch }));
  const locked = Boolean(license && (USABLE.includes(license.status) || !canManage));

  useEffect(() => {
    if (!open || locked) return;
    getJurisdictionOptions()
      .then(result => {
        setJurisdictions(result);
        setLoadState(result ? 'ready' : 'failed');
      })
      .catch(() => setLoadState('failed'));
  }, [open, locked]);

  const show = () => {
    setError('');
    setValue(license ? fromLicense(license) : EMPTY);
    setLoadState(locked ? 'ready' : 'loading');
    setOpen(true);
  };

  const close = (status: string) => {
    if (!license) return;
    setError('');
    startTransition(async () => {
      const result = await closeLicense(license.id, status);
      if (!result.success) { setError(result.error); return; }
      toast.success(`Licence ${MERCHANT_LICENSE_STATUS_LABELS[status].toLowerCase()}`);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button type="button" onClick={show} className={className}>
        {children}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-2">
            <SheetTitle>{license ? `Licence ${license.licenseNumber}` : 'New licence'}</SheetTitle>
            <SheetDescription className="sr-only">Merchant licence</SheetDescription>
          </SheetHeader>

          {locked && license && (
            <div className="space-y-6 px-4 pb-24 sm:pb-8">
              <dl className="divide-y divide-border rounded-md bg-muted/40 ring-1 ring-inset ring-border/60">
                <Row label="Status">{MERCHANT_LICENSE_STATUS_LABELS[license.status] || license.status}</Row>
                <Row label="Jurisdiction">{license.jurisdiction}</Row>
                <Row label="Type">{license.licenseType}</Row>
                <Row label="Number"><span className="font-mono">{license.licenseNumber}</span></Row>
                <Row label="Issuing authority">{license.issuingAuthority}</Row>
                <Row label="Authority reference">{license.authorityReference}</Row>
                <Row label="Verification source">{license.verificationSource}</Row>
                <Row label="Verified"><span className="font-mono tabular-nums">{license.verifiedAt}</span></Row>
                <Row label="Effective"><span className="font-mono tabular-nums">{license.effectiveAt}</span></Row>
                <Row label="Expires"><span className="font-mono tabular-nums">{license.expiresAt}</span></Row>
                <Row label="Evidence">{license.hasEvidence ? 'On file' : 'No file'}</Row>
              </dl>
              {canManage && USABLE.includes(license.status) && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={pending} className="rounded-[4px]" onClick={() => close('suspended')}>Suspend</Button>
                  <Button type="button" variant="outline" disabled={pending} className="rounded-[4px]" onClick={() => close('expired')}>Mark expired</Button>
                  <Button type="button" variant="destructive" disabled={pending} className="rounded-[4px]" onClick={() => close('revoked')}>Revoke</Button>
                </div>
              )}
              <ErrorLine message={error} />
            </div>
          )}

          {!locked && loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
          {!locked && loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load jurisdictions.</p>}

          {!locked && loadState === 'ready' && jurisdictions && (
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
                  const result = license ? await updateLicense(license.id, value) : await createLicense(profileId, value);
                  if (!result.success) { setError(result.error); return; }
                  toast.success(license ? 'Licence saved' : 'Licence recorded');
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              <section className="space-y-3">
                <SectionTitle>Licence</SectionTitle>
                <Field id="ml-jurisdiction" label="Jurisdiction">
                  <select id="ml-jurisdiction" className={selectClass} value={value.jurisdictionId} onChange={event => set({ jurisdictionId: event.target.value })}>
                    <option value="">None</option>
                    {jurisdictions.map(item => <option key={item.id} value={item.id}>{item.code} {item.name}</option>)}
                  </select>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="ml-type" label="Licence type">
                    <Input id="ml-type" required value={value.licenseType} onChange={event => set({ licenseType: event.target.value })} />
                  </Field>
                  <Field id="ml-number" label="Licence number">
                    <Input id="ml-number" required className="font-mono" value={value.licenseNumber} onChange={event => set({ licenseNumber: event.target.value })} />
                  </Field>
                  <Field id="ml-authority" label="Issuing authority">
                    <Input id="ml-authority" required value={value.issuingAuthority} onChange={event => set({ issuingAuthority: event.target.value })} />
                  </Field>
                  <Field id="ml-reference" label="Authority reference">
                    <Input id="ml-reference" required value={value.authorityReference} onChange={event => set({ authorityReference: event.target.value })} />
                  </Field>
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Evidence</SectionTitle>
                <Field id="ml-source" label="Verification source">
                  <Input id="ml-source" required value={value.verificationSource} onChange={event => set({ verificationSource: event.target.value })} />
                </Field>
                <EvidenceFile
                  id="ml-evidence"
                  label="Licence document"
                  digest={value.evidenceDigest}
                  onRecord={Boolean(license?.hasEvidence)}
                  onDigest={evidenceDigest => set({ evidenceDigest })}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field id="ml-verified" label="Verified on">
                    <Input id="ml-verified" type="date" value={value.verifiedAt} onChange={event => set({ verifiedAt: event.target.value })} />
                  </Field>
                  <Field id="ml-from" label="Effective from">
                    <Input id="ml-from" type="date" required value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                  </Field>
                  <Field id="ml-to" label="Expires">
                    <Input id="ml-to" type="date" required value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                  </Field>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-xs text-muted-foreground">Status</span>
                  <Track label="Licence status">
                    {STATUSES.map(status => (
                      <Pill key={status} active={value.status === status} onClick={() => set({ status })}>
                        {MERCHANT_LICENSE_STATUS_LABELS[status]}
                      </Pill>
                    ))}
                  </Track>
                </div>
              </section>

              <ErrorLine message={error} />
              <Button type="submit" disabled={pending || (!license && !value.evidenceDigest)} className="h-10 w-full rounded-[4px]">
                {pending ? 'Saving…' : license ? 'Save licence' : 'Record licence'}
              </Button>
              {!license && !value.evidenceDigest && <p className="text-xs text-muted-foreground">Licence document required</p>}
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
