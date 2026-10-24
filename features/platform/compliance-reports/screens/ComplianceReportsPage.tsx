import Link from 'next/link';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, StatusFilter } from '@/features/platform/components/vape-ui';
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS } from '@/features/keystone/regulated/labels';
import { FilteredEmpty } from '@/features/platform/compliance-ledger/components/FilteredEmpty';
import { Pager } from '@/features/platform/compliance-ledger/components/LinkTrack';
import { PAGE_SIZE, REPORTS_PATH, dateTime, filterValue, label, pageNumber, periodText, stateTone } from '@/features/platform/compliance-ledger/lib/format';
import { getReportOptions, getReports } from '../actions/reports';
import { ExportInventoryButton, GenerateReportButton, RecordSubmissionButton } from '../components/ReportSheets';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Compliance reports' },
];

const SUBMITTABLE = new Set(['generated', 'reviewed', 'submitted']);

export async function ComplianceReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = filterValue(params['!status_matches']);
  const page = pageNumber(params.page);
  const response = await getReports({ status, page });
  const canManage = response.success && response.canManage;
  const options = canManage ? await getReportOptions() : null;

  const header = <PageTitle title="Compliance reports" />;

  return (
    <PageContainer title="Compliance reports" header={header} breadcrumbs={breadcrumbs}>
      <div className="pb-24 sm:pb-10">
        {canManage && (
          <div className="flex flex-wrap items-center gap-2 px-4 md:px-6">
            <GenerateReportButton />
            <ExportInventoryButton profiles={options?.profiles || []} />
          </div>
        )}

        {!response.success ? (
          <div className="px-4 py-3 md:px-6">
            <Alert variant="destructive"><AlertDescription>{response.error}</AlertDescription></Alert>
          </div>
        ) : (
          <>
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
                  <ListBand>
                    {response.items.map(report => {
                      const sources = Array.isArray(report.sourceTransactionIds) ? report.sourceTransactionIds.length : 0;
                      return (
                        <div key={report.id} className="px-4 py-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                            <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                              <Dot tone={stateTone(report.status)} />
                              <Link href={`${REPORTS_PATH}/${report.id}`} className="min-w-0 break-words underline-offset-4 hover:underline">
                                {label(REPORT_TYPE_LABELS, report.reportType)}
                                {report.jurisdiction?.code ? ` · ${report.jurisdiction.code}` : ''}
                              </Link>
                              <span className="shrink-0 text-xs font-normal text-muted-foreground">{label(REPORT_STATUS_LABELS, report.status)}</span>
                            </span>
                            {canManage && SUBMITTABLE.has(report.status) && (
                              <RecordSubmissionButton
                                reportId={report.id}
                                className="inline-flex shrink-0 items-center text-xs font-medium text-foreground underline-offset-4 hover:underline"
                              />
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">
                            {report.merchantProfile?.legalName && <span>{report.merchantProfile.legalName}</span>}
                            <span className="font-mono tabular-nums">{periodText(report.periodStartsAt, report.periodEndsAt)}</span>
                            <span>Generated <span className="font-mono tabular-nums">{dateTime(report.generatedAt)}</span></span>
                            {report.submittedAt && (
                              <span>Submitted <span className="font-mono tabular-nums">{dateTime(report.submittedAt)}</span></span>
                            )}
                            <span><span className="font-mono tabular-nums">{sources}</span> orders</span>
                          </div>
                        </div>
                      );
                    })}
                  </ListBand>
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
