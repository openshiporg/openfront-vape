import Link from 'next/link';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, PageTitle, SectionTitle, Stamp, StatusFilter, Td, Th, Tr } from '@/features/platform/components/vape-ui';
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS } from '@/features/keystone/regulated/labels';
import { FilteredEmpty } from '@/features/platform/compliance-ledger/components/FilteredEmpty';
import { Pager } from '@/features/platform/compliance-ledger/components/LinkTrack';
import { PAGE_SIZE, REPORTS_PATH, dateTime, filterValue, label, pageNumber, periodText, shortId, stateTone } from '@/features/platform/compliance-ledger/lib/format';
import { getReportOptions, getReports } from '../actions/reports';
import { ExportInventoryButton, GenerateReportButton, RecordSubmissionButton } from '../components/ReportSheets';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Compliance reports' },
];

const SUBMITTABLE = new Set(['generated', 'reviewed', 'submitted']);
// Waiting on the operator: generated or reviewed runs not yet filed, and rejected filings to correct
const NEEDS_YOU: Record<string, number> = { rejected: 0, reviewed: 1, generated: 2 };
const NEXT_STEP: Record<string, string> = { rejected: 'Correct and refile', reviewed: 'Record submission', generated: 'Review and submit' };

export async function ComplianceReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = filterValue(params['!status_matches']);
  const page = pageNumber(params.page);
  const response = await getReports({ status, page });
  const canManage = response.success && response.canManage;
  const options = canManage ? await getReportOptions() : null;

  const queue = response.success && !status && page === 1
    ? response.items
        .filter(report => report.status in NEEDS_YOU)
        .sort((a, b) => NEEDS_YOU[a.status] - NEEDS_YOU[b.status] || new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime())
    : [];

  const header = <PageTitle title="Compliance reports" meta={response.success ? `${response.total} report runs` : undefined} />;

  return (
    <PageContainer title="Compliance reports" header={header} breadcrumbs={breadcrumbs}>
      <div className="pb-24 sm:pb-10">
        {canManage && (
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-6">
            <GenerateReportButton />
            <ExportInventoryButton profiles={options?.profiles || []} />
          </div>
        )}

        {response.success && queue.length > 0 && (
          <section className="mt-6 px-4 md:px-6">
            <SectionTitle meta={queue.length}>Waiting on you</SectionTitle>
            <DataTable>
              <thead>
                <tr>
                  <Th>Report</Th>
                  <Th>Status</Th>
                  <Th priority={2}>Next step</Th>
                  <Th priority={3}>Generated</Th>
                  {canManage && <Th align="right"><span className="sr-only">Actions</span></Th>}
                </tr>
              </thead>
              <tbody>
                {queue.map(report => (
                  <Tr key={report.id}>
                    <Td className="min-w-0">
                      <Link href={`${REPORTS_PATH}/${report.id}`} className="inline-flex min-h-8 items-center font-medium text-foreground underline-offset-4 hover:underline max-sm:min-h-10">
                        {label(REPORT_TYPE_LABELS, report.reportType)}
                        {report.jurisdiction?.code ? ` · ${report.jurisdiction.code}` : ''}
                      </Link>
                    </Td>
                    <Td><Stamp tone={stateTone(report.status)} serial={shortId(report.id)}>{label(REPORT_STATUS_LABELS, report.status)}</Stamp></Td>
                    <Td priority={2} className="whitespace-nowrap">{NEXT_STEP[report.status]}</Td>
                    <Td priority={3} className="whitespace-nowrap font-mono text-[12px] tabular-nums">{dateTime(report.generatedAt)}</Td>
                    {canManage && (
                      <Td align="right" className="whitespace-nowrap">
                        {SUBMITTABLE.has(report.status) && (
                          <RecordSubmissionButton
                            reportId={report.id}
                            className="inline-flex min-h-8 shrink-0 items-center text-[13px] font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground max-sm:min-h-10"
                          />
                        )}
                      </Td>
                    )}
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          </section>
        )}

        {!response.success ? (
          <div className="px-4 py-3 md:px-6">
            <Alert variant="destructive"><AlertDescription>{response.error}</AlertDescription></Alert>
          </div>
        ) : (
          <>
            <h2 className="mt-6 px-4 text-[15px] font-semibold text-foreground md:px-6">All reports</h2>
            <StatusFilter
              allCount={response.total}
              statuses={Object.keys(response.counts).map(value => ({
                value,
                label: REPORT_STATUS_LABELS[value] || value,
                count: response.counts[value],
                tone: stateTone(value),
              }))}
            />
            <div className="px-4 md:px-6">
              {response.items.length === 0 ? (
                <FilteredEmpty title={status ? 'No reports match this status' : 'No compliance reports'} resetHref={status ? REPORTS_PATH : undefined} />
              ) : (
                <>
                  <DataTable>
                    <thead>
                      <tr>
                        <Th>Report</Th>
                        <Th>Status</Th>
                        <Th priority={3}>Merchant</Th>
                        <Th priority={2}>Period</Th>
                        <Th priority={3}>Generated</Th>
                        <Th priority={3}>Submitted</Th>
                        <Th priority={3} align="right">Orders</Th>
                        <Th priority={2} align="right">Record</Th>
                        {canManage && <Th align="right"><span className="sr-only">Actions</span></Th>}
                      </tr>
                    </thead>
                    <tbody>
                      {response.items.map(report => {
                        const sources = Array.isArray(report.sourceTransactionIds) ? report.sourceTransactionIds.length : 0;
                        return (
                          <Tr key={report.id}>
                            <Td className="min-w-0">
                              <Link href={`${REPORTS_PATH}/${report.id}`} className="inline-flex min-h-8 items-center font-medium text-foreground underline-offset-4 hover:underline max-sm:min-h-10">
                                {label(REPORT_TYPE_LABELS, report.reportType)}
                                {report.jurisdiction?.code ? ` · ${report.jurisdiction.code}` : ''}
                              </Link>
                            </Td>
                            <Td><Stamp tone={stateTone(report.status)}>{label(REPORT_STATUS_LABELS, report.status)}</Stamp></Td>
                            <Td priority={3}><span className="block max-w-[14rem] truncate">{report.merchantProfile?.legalName || ''}</span></Td>
                            <Td priority={2} className="whitespace-nowrap font-mono text-[12px] tabular-nums">{periodText(report.periodStartsAt, report.periodEndsAt)}</Td>
                            <Td priority={3} className="whitespace-nowrap font-mono text-[12px] tabular-nums">{dateTime(report.generatedAt)}</Td>
                            <Td priority={3} className="whitespace-nowrap font-mono text-[12px] tabular-nums">
                              {report.submittedAt ? dateTime(report.submittedAt) : <span className="font-sans text-muted-foreground">Not submitted</span>}
                            </Td>
                            <Td priority={3} align="right" className="font-mono text-[12px]">{sources}</Td>
                            <Td priority={2} align="right" className="font-mono text-[12px] text-muted-foreground">{shortId(report.id)}</Td>
                            {canManage && (
                              <Td align="right" className="whitespace-nowrap">
                                {SUBMITTABLE.has(report.status) && (
                                  <RecordSubmissionButton
                                    reportId={report.id}
                                    className="inline-flex min-h-8 shrink-0 items-center text-[13px] font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground max-sm:min-h-10"
                                  />
                                )}
                              </Td>
                            )}
                          </Tr>
                        );
                      })}
                    </tbody>
                  </DataTable>
                  <Pager
                    page={page}
                    count={response.count}
                    pageSize={PAGE_SIZE}
                    href={number => {
                      const next = new URLSearchParams();
                      if (status) next.set('!status_matches', JSON.stringify([status]));
                      next.set('page', String(number));
                      return `${REPORTS_PATH}?${next.toString()}`;
                    }}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default ComplianceReportsPage;
