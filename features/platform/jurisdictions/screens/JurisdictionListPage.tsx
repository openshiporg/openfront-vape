import Link from 'next/link';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  buttonClass,
  DataTable,
  ListBand,
  PageTitle,
  SectionTitle,
  Stamp,
  StatusFilter,
  StatusWord,
  Td,
  Th,
  Tr,
  type DotTone,
} from '@/features/platform/components/vape-ui';
import { JURISDICTION_LEVEL_LABELS, JURISDICTION_STATUS_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels';
import { listJurisdictions } from '../actions/jurisdictions';
import { JURISDICTION_TONES, type JurisdictionRow } from '../lib/shared';
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

  if (!response.success) {
    return (
      <PageContainer title="Jurisdictions" header={<PageTitle title="Jurisdictions" />} breadcrumbs={breadcrumbs}>
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

  const allowed = all.filter(row => row.status === 'active' && row.inForce);
  const blocked = all.filter(row => row.status === 'active' && !row.inForce);
  // Rank by severity: conflicting rule sets, then a lapsed policy, then none at all
  const queue = blocked
    .map(row => ({ row, policy: policyOf(row) }))
    .sort((a, b) => SEVERITY[a.policy.key] - SEVERITY[b.policy.key] || a.row.code.localeCompare(b.row.code));
  const levels = Object.keys(JURISDICTION_LEVEL_LABELS)
    .concat(Array.from(new Set(all.map(row => row.level))).filter(value => !(value in JURISDICTION_LEVEL_LABELS)))
    .map(value => {
      const at = all.filter(row => row.level === value);
      return {
        value,
        total: at.length,
        allowed: at.filter(row => row.status === 'active' && row.inForce),
        blocked: at.filter(row => row.status === 'active' && !row.inForce),
        inactive: at.filter(row => row.status !== 'active').length,
      };
    })
    .filter(entry => entry.total > 0);

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageTitle
        title="Jurisdictions"
        tone={allowed.length ? (blocked.length ? 'warn' : 'ok') : 'danger'}
        state={allowed.length ? `Selling in ${allowed.length}` : 'Selling nowhere'}
        meta={`${all.length} jurisdictions, ${blocked.length} active without a policy in force`}
      />
      <JurisdictionSheetButton className="h-10 shrink-0 rounded-[4px] px-4 text-[13px] font-medium">New jurisdiction</JurisdictionSheetButton>
    </div>
  );

  return (
    <PageContainer title="Jurisdictions" header={header} breadcrumbs={breadcrumbs}>
      <div className="space-y-8 px-4 pb-24 sm:pb-10 md:px-6">
        <section>
          <SectionTitle meta={`${allowed.length} allowed, ${blocked.length} blocked`}>Coverage</SectionTitle>
          {levels.length === 0 ? (
            <ListBand><div className="px-4 py-6 text-sm text-muted-foreground">No jurisdictions. Add a country or state and activate a rule set for it.</div></ListBand>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Level</Th>
                  <Th>Selling allowed</Th>
                  <Th>Blocked</Th>
                  <Th align="right" priority={2}>Not active</Th>
                  <Th align="right" priority={2}>Total</Th>
                </tr>
              </thead>
              <tbody>
                {levels.map(entry => (
                  <Tr key={entry.value}>
                    <Td className="font-medium text-foreground">{regulatedLabel(JURISDICTION_LEVEL_LABELS, entry.value)}</Td>
                    <Td><Coverage tone="ok" rows={entry.allowed} /></Td>
                    <Td><Coverage tone="danger" rows={entry.blocked} /></Td>
                    <Td align="right" priority={2} className="text-muted-foreground">{entry.inactive}</Td>
                    <Td align="right" priority={2}>{entry.total}</Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </section>

        <section>
          <SectionTitle meta={queue.length}>Needs a policy</SectionTitle>
          {queue.length === 0 ? (
            <ListBand><div className="px-4 py-3 text-sm text-muted-foreground">Every active jurisdiction has one rule set in force</div></ListBand>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Jurisdiction</Th>
                  <Th>Policy</Th>
                  <Th priority={2}>Level</Th>
                  <Th align="right"><span className="sr-only">Fix</span></Th>
                </tr>
              </thead>
              <tbody>
                {queue.map(({ row, policy }) => (
                  <Tr key={row.id}>
                    <Td>
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="min-w-0 truncate font-medium text-foreground">{row.name}</span>
                        <span className="font-mono text-[12px] text-muted-foreground">{row.code}</span>
                      </span>
                    </Td>
                    <Td><Stamp tone={policy.tone}>{policy.label}</Stamp></Td>
                    <Td priority={2} className="text-muted-foreground">{regulatedLabel(JURISDICTION_LEVEL_LABELS, row.level)}</Td>
                    <Td align="right">
                      <Link href={`${BASE}/${row.id}`} className={`${buttonClass.base} ${buttonClass.outline}`}>
                        {policy.key === 'conflict' ? 'Retire extra' : 'Rule sets'}
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle meta={rows.length}>All jurisdictions</SectionTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <StatusFilter statuses={statuses} allCount={scoped.length} className="min-w-0 p-0 md:px-0" />
            <JurisdictionFilters level={level} search={one(params.search) || ''} />
          </div>
          {rows.length === 0 ? (
            <NoJurisdictions filtered={Boolean(status || level || search)} />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Jurisdiction</Th>
                  <Th>Status</Th>
                  <Th>Policy</Th>
                  <Th priority={2}>Level</Th>
                  <Th priority={3}>Parent</Th>
                  <Th align="right" priority={2}>Rule sets</Th>
                  <Th align="right" priority={3}>Sources</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const policy = policyOf(row);
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <Link href={`${BASE}/${row.id}`} className="flex min-h-10 min-w-0 items-center gap-2 underline-offset-4 hover:underline md:min-h-0">
                          <span className="min-w-0 truncate font-medium text-foreground">{row.name}</span>
                          <span className="font-mono text-[12px] text-muted-foreground">{row.code}</span>
                        </Link>
                      </Td>
                      <Td><Stamp tone={JURISDICTION_TONES[row.status] || 'muted'}>{regulatedLabel(JURISDICTION_STATUS_LABELS, row.status)}</Stamp></Td>
                      <Td><Stamp tone={policy.tone}>{policy.label}</Stamp></Td>
                      <Td priority={2} className="text-muted-foreground">{regulatedLabel(JURISDICTION_LEVEL_LABELS, row.level)}</Td>
                      <Td priority={3} className="font-mono text-[12px] text-muted-foreground">{row.parent?.code || ''}</Td>
                      <Td align="right" priority={2}>{row.ruleSetCount}</Td>
                      <Td align="right" priority={3} className="text-muted-foreground">{row.sourceCount}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </DataTable>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

type Policy = { key: 'conflict' | 'lapsed' | 'none' | 'inForce'; tone: DotTone; label: string };

const SEVERITY: Record<Policy['key'], number> = { conflict: 0, lapsed: 1, none: 2, inForce: 3 };

function policyOf(row: JurisdictionRow): Policy {
  if (row.activeRuleSetCount > 1) return { key: 'conflict', tone: 'danger', label: `${row.activeRuleSetCount} active rule sets` };
  if (row.inForce) return { key: 'inForce', tone: 'ok', label: 'Policy in force' };
  if (row.activeRuleSetCount === 1) return { key: 'lapsed', tone: 'warn', label: 'Policy out of dates' };
  return { key: 'none', tone: 'muted', label: 'No policy' };
}

function Coverage({ tone, rows }: { tone: DotTone; rows: JurisdictionRow[] }) {
  if (!rows.length) return <span className="text-muted-foreground">0</span>;
  const shown = rows.slice(0, 6);
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
      <StatusWord tone={tone}>{rows.length}</StatusWord>
      <span className="min-w-0 font-mono text-[12px] text-muted-foreground">
        {shown.map(row => row.code).join(' ')}
        {rows.length > shown.length && ` +${rows.length - shown.length}`}
      </span>
    </span>
  );
}
