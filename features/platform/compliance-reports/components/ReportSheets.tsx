'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorLine, Field, selectClass } from '@/features/platform/components/compliance-form';
import { Pill, Track } from '@/features/platform/components/vape-primitives';
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS } from '@/features/keystone/regulated/labels';
import { exportInventory } from '@/features/platform/compliance-center/actions/operations';
import { generateReport, getReportOptions, recordSubmission, type GenerateInput, type ReportOptions } from '../actions/reports';

const primaryClass = 'h-10 rounded-full px-4 text-[13px] font-medium';
const secondaryClass =
  'inline-flex h-10 items-center justify-center rounded-full bg-background px-4 text-[13px] font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)] disabled:opacity-60 dark:bg-zinc-800';

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => `${today().slice(0, 8)}01`;

export function GenerateReportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ReportOptions | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [value, setValue] = useState<GenerateInput>({
    reportType: 'evidence_inventory',
    jurisdictionId: '',
    merchantProfileId: '',
    periodStartsAt: '',
    periodThrough: '',
  });
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<GenerateInput>) => setValue(current => ({ ...current, ...patch }));

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoadState('loading');
    getReportOptions()
      .then(result => {
        setOptions(result);
        setValue(current => ({
          ...current,
          merchantProfileId: result?.profiles.find(profile => profile.status === 'active')?.id || result?.profiles[0]?.id || '',
          jurisdictionId: current.jurisdictionId,
          periodStartsAt: current.periodStartsAt || monthStart(),
          periodThrough: current.periodThrough || today(),
        }));
        setLoadState(result ? 'ready' : 'failed');
      })
      .catch(() => setLoadState('failed'));
  }, [open]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className={primaryClass}>
        Generate report
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-2">
            <SheetTitle>Generate report</SheetTitle>
            <SheetDescription className="sr-only">Generate a compliance report from recorded decisions</SheetDescription>
          </SheetHeader>
          {loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
          {loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load compliance records.</p>}
          {loadState === 'ready' && options && (
            <form
              className="space-y-4 px-4 pb-24 sm:pb-8"
              onSubmit={event => {
                event.preventDefault();
                setError('');
                startTransition(async () => {
                  const result = await generateReport(value);
                  if (!result.success) { setError(result.error); return; }
                  toast.success('Report generated');
                  setOpen(false);
                  router.push(`/dashboard/platform/compliance-reports/${result.data.id}`);
                  router.refresh();
                });
              }}
            >
              <Field id="cr-type" label="Report type">
                <select id="cr-type" className={selectClass} value={value.reportType} onChange={event => set({ reportType: event.target.value })}>
                  {Object.entries(REPORT_TYPE_LABELS).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
                </select>
              </Field>
              <Field id="cr-profile" label="Merchant profile">
                <select id="cr-profile" required className={selectClass} value={value.merchantProfileId} onChange={event => set({ merchantProfileId: event.target.value })}>
                  <option value="">Choose a profile</option>
                  {options.profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.legalName}</option>)}
                </select>
              </Field>
              <Field id="cr-jurisdiction" label="Jurisdiction">
                <select id="cr-jurisdiction" required className={selectClass} value={value.jurisdictionId} onChange={event => set({ jurisdictionId: event.target.value })}>
                  <option value="">Choose a jurisdiction</option>
                  {options.jurisdictions.map(jurisdiction => (
                    <option key={jurisdiction.id} value={jurisdiction.id}>{jurisdiction.code} {jurisdiction.name}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="cr-from" label="Period start">
                  <Input id="cr-from" type="date" required value={value.periodStartsAt} onChange={event => set({ periodStartsAt: event.target.value })} />
                </Field>
                <Field id="cr-through" label="Period end (inclusive)">
                  <Input id="cr-through" type="date" required value={value.periodThrough} onChange={event => set({ periodThrough: event.target.value })} />
                </Field>
              </div>
              <ErrorLine message={error} />
              <Button type="submit" disabled={pending} className="h-10 w-full rounded-full">
                {pending ? 'Generating…' : 'Generate report'}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const SUBMISSION_STATUSES = ['submitted', 'accepted', 'rejected'] as const;

export function RecordSubmissionButton({ reportId, className }: { reportId: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [status, setStatus] = useState<string>('submitted');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => { setError(''); setOpen(true); }} className={className || secondaryClass}>
        Record submission
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="pb-2">
            <SheetTitle>Record submission</SheetTitle>
            <SheetDescription className="sr-only">Record the filing receipt for this report</SheetDescription>
          </SheetHeader>
          <form
            className="space-y-4 px-4 pb-24 sm:pb-8"
            onSubmit={event => {
              event.preventDefault();
              setError('');
              startTransition(async () => {
                const result = await recordSubmission({ reportId, filingReceiptReference: receipt, status });
                if (!result.success) { setError(result.error); return; }
                toast.success('Submission recorded');
                setOpen(false);
                setReceipt('');
                router.refresh();
              });
            }}
          >
            <Field id={`rs-receipt-${reportId}`} label="Filing receipt reference">
              <Input id={`rs-receipt-${reportId}`} required className="font-mono" value={receipt} onChange={event => setReceipt(event.target.value)} />
            </Field>
            <div className="space-y-1.5">
              <span className="block text-xs text-muted-foreground">Outcome</span>
              <Track label="Submission outcome">
                {SUBMISSION_STATUSES.map(value => (
                  <Pill key={value} active={status === value} onClick={() => setStatus(value)}>
                    {REPORT_STATUS_LABELS[value]}
                  </Pill>
                ))}
              </Track>
            </div>
            <ErrorLine message={error} />
            <Button type="submit" disabled={pending || !receipt.trim()} className="h-10 w-full rounded-full">
              {pending ? 'Recording…' : 'Record submission'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ExportInventoryButton({ profiles }: { profiles: Array<{ id: string; legalName: string }> }) {
  const router = useRouter();
  const [profileId, setProfileId] = useState(profiles[0]?.id || '');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  if (!profiles.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {profiles.length > 1 && (
        <select aria-label="Merchant profile" className={`${selectClass} h-10 w-auto max-w-full rounded-full`} value={profileId} onChange={event => setProfileId(event.target.value)}>
          {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.legalName}</option>)}
        </select>
      )}
      <button
        type="button"
        disabled={pending || !profileId}
        className={secondaryClass}
        onClick={() => {
          setError('');
          startTransition(async () => {
            const result = await exportInventory(profileId);
            if (!result.success) { setError(result.message); return; }
            const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `vape-evidence-inventory-${result.report.id}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Evidence inventory exported');
            router.refresh();
          });
        }}
      >
        {pending ? 'Exporting…' : 'Export evidence inventory'}
      </button>
      {error && <span className="basis-full"><ErrorLine message={error} /></span>}
    </div>
  );
}
