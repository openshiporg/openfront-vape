import Link from 'next/link';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, StatusFilter } from '@/features/platform/components/vape-ui';
import { JURISDICTION_LEVEL_LABELS, JURISDICTION_STATUS_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels';
import { listJurisdictions } from '../actions/jurisdictions';
import { JURISDICTION_TONES } from '../lib/shared';
import { JurisdictionFilters, NoJurisdictions } from '../components/JurisdictionFilters';
import { JurisdictionSheetButton } from '../components/JurisdictionSheet';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Jurisdictions' },
];

const BASE = '/dashboard/platform/jurisdictions';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function statusParam(raw: string | undefined) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (Array.isArray(parsed) && parsed.length) return String(typeof parsed[0] === 'object' ? parsed[0].value : parsed[0]);
  } catch {
    // A malformed filter shows everything
  }
  return '';
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export async function JurisdictionListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = statusParam(one(params['!status_matches']));
  const level = one(params.level) || '';
  const search = (one(params.search) || '').trim().toLowerCase();
  const response = await listJurisdictions();

  const header = <PageTitle title="Jurisdictions" />;

  if (!response.success) {
    return (
      <PageContainer title="Jurisdictions" header={header} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 pb-24 sm:pb-10">
          <Alert variant="destructive"><AlertDescription>{response.error}</AlertDescription></Alert>
        </div>
      </PageContainer>
    );
  }

  const all = response.data;
  const scoped = all.filter(row =>
    (!level || row.level === level) &&
    (!search || row.code.toLowerCase().includes(search) || row.name.toLowerCase().includes(search)));
  const rows = scoped.filter(row => !status || row.status === status);
  const statuses = Object.entries(JURISDICTION_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
    tone: JURISDICTION_TONES[value],
    count: scoped.filter(row => row.status === value).length,
  }));
  const inForce = all.filter(row => row.inForce).length;

  return (
    <PageContainer
      title="Jurisdictions"
      header={<PageTitle title="Jurisdictions" meta={`${all.length} jurisdictions, ${inForce} with a policy in force`} />}
      breadcrumbs={breadcrumbs}
    >
      <div className="flex flex-col gap-3 border-b border-border px-4 pb-3 md:px-6 sm:flex-row sm:items-center sm:justify-between">
        <JurisdictionFilters level={level} search={one(params.search) || ''} />
        <JurisdictionSheetButton className="h-10 shrink-0 rounded-full px-4 text-[13px] font-medium">New jurisdiction</JurisdictionSheetButton>
      </div>
      <StatusFilter statuses={statuses} allCount={scoped.length} className="px-4 md:px-6" />
      <div className="px-4 md:px-6 pb-24 sm:pb-10">
        {rows.length === 0 ? (
          <NoJurisdictions filtered={Boolean(status || level || search)} />
        ) : (
          <ListBand>
            {rows.map(row => {
              const policy = row.activeRuleSetCount > 1
                ? { tone: 'danger' as const, label: `${row.activeRuleSetCount} active rule sets` }
                : row.inForce
                  ? { tone: 'ok' as const, label: 'Policy in force' }
                  : row.activeRuleSetCount === 1
                    ? { tone: 'warn' as const, label: 'Active policy out of dates' }
                    : { tone: 'muted' as const, label: 'No policy in force' };
              return (
                <Link
                  key={row.id}
                  href={`${BASE}/${row.id}`}
                  className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/60 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 text-sm font-medium text-foreground">
                      <Dot tone={JURISDICTION_TONES[row.status] || 'muted'} />
                      <span className="min-w-0 break-words">{row.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{row.code}</span>
                    </span>
                    <span className="mt-0.5 block pl-[1.125rem] text-xs text-muted-foreground">
                      {regulatedLabel(JURISDICTION_STATUS_LABELS, row.status)}
                      {' · '}
                      {regulatedLabel(JURISDICTION_LEVEL_LABELS, row.level)}
                      {row.parent && <> · in <span className="font-mono">{row.parent.code}</span></>}
                      {' · '}
                      {row.sourceCount} {row.sourceCount === 1 ? 'source' : 'sources'}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-3 pl-[1.125rem] text-xs text-muted-foreground sm:pl-0">
                    <span className="font-mono tabular-nums">{row.ruleSetCount} {row.ruleSetCount === 1 ? 'rule set' : 'rule sets'}</span>
                    <span className="inline-flex items-baseline gap-1.5">
                      <Dot tone={policy.tone} />
                      {policy.label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </ListBand>
        )}
      </div>
    </PageContainer>
  );
}
