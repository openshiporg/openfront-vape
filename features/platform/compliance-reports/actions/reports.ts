'use server';

import { permissions } from '@/features/keystone/access';
import { isoDay, merchantError, sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

export type ReportRow = {
  id: string;
  reportType: string;
  status: string;
  periodStartsAt: string;
  periodEndsAt: string;
  generatedAt: string;
  submittedAt: string | null;
  contentDigest: string;
  sourceTransactionIds: unknown;
  policyVersions: unknown;
  jurisdiction: { id: string; code: string; name: string } | null;
  merchantProfile: { id: string; legalName: string } | null;
  generatedBy: { id: string; name: string | null; email: string | null } | null;
  submittedBy: { id: string; name: string | null; email: string | null } | null;
  supersedes: { id: string; reportType: string; generatedAt: string } | null;
};

export type ReportOptions = {
  profiles: Array<{ id: string; legalName: string; status: string }>;
  jurisdictions: Array<{ id: string; code: string; name: string }>;
};

const STATUSES = ['generated', 'reviewed', 'submitted', 'accepted', 'rejected', 'corrected'];
const PAGE_SIZE = 50;

const REPORT_FIELDS = `id reportType status periodStartsAt periodEndsAt generatedAt submittedAt contentDigest sourceTransactionIds policyVersions
  jurisdiction { id code name } merchantProfile { id legalName }
  generatedBy { id name email } submittedBy { id name email } supersedes { id reportType generatedAt }`;

// Messages thrown by the report mutations and the release gate, written for merchants
const MUTATION_MESSAGES = [
  'Only evidence_inventory exports are implemented',
  'A valid half-open reporting period is required',
  'Report periods cannot exceed 93 days',
  'Report type, jurisdiction, and merchant profile are required',
  'Reporting scope not found',
  'A filing receipt and valid external submission status are required',
  'Report is not eligible for submission recording',
  "Checkout isn't available for this store yet.",
];

function reportError(errors: readonly any[]) {
  for (const error of errors) {
    const message = String(error?.message || '');
    if (/^Access denied/.test(message)) return 'Report management permission is required.';
    if (message.startsWith('Only evidence_inventory')) return 'Only evidence inventory reports can be generated.';
    if (message === "Checkout isn't available for this store yet.") return 'Sales are disabled for this store, so submissions cannot be recorded yet.';
    if (message === 'A valid half-open reporting period is required') return 'Enter a period start before the period end.';
    if (MUTATION_MESSAGES.some(known => message.startsWith(known))) return message;
  }
  return merchantError(errors);
}

async function runReportMutation<T>(query: string, variables: Record<string, unknown>, pick: (data: any) => T): Promise<SaveResult<T>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  try {
    const result = await context.graphql.raw({ query, variables });
    if (result.errors?.length) return { success: false, error: reportError(result.errors) };
    const data = pick(result.data);
    if (!data) return { success: false, error: 'Unable to save. Please try again.' };
    return { success: true, data };
  } catch {
    return { success: false, error: 'Unable to save. Please try again.' };
  }
}

function readFailure(error: unknown) {
  const value = error as any;
  console.error('Compliance reports: read failed', { name: value?.name, code: value?.extensions?.code });
  return "Unable to load compliance reports. Check that you have compliance access.";
}

export async function getReports(input: { status: string | null; page: number }): Promise<
  | { success: true; items: ReportRow[]; count: number; total: number; counts: Record<string, number>; canManage: boolean }
  | { success: false; error: string }
> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view reports.' };
  const where: any = input.status && STATUSES.includes(input.status) ? { status: { equals: input.status } } : {};
  try {
    const [items, count, total, ...counts] = await Promise.all([
      context.query.ComplianceReportRun.findMany({
        where,
        take: PAGE_SIZE,
        skip: (input.page - 1) * PAGE_SIZE,
        orderBy: [{ generatedAt: 'desc' }],
        query: REPORT_FIELDS,
      }),
      context.query.ComplianceReportRun.count({ where }),
      context.query.ComplianceReportRun.count({}),
      ...STATUSES.map(status => context.query.ComplianceReportRun.count({ where: { status: { equals: status as any } } })),
    ]);
    return {
      success: true,
      items: [...items] as unknown as ReportRow[],
      count,
      total,
      counts: Object.fromEntries(STATUSES.map((status, index) => [status, counts[index] as number])),
      canManage: permissions.canManageComplianceReports({ session: context.session }),
    };
  } catch (error) {
    return { success: false, error: readFailure(error) };
  }
}

export async function getReport(id: string): Promise<
  | { success: true; data: { report: ReportRow; receipt: string | null; events: any[]; canManage: boolean } | null }
  | { success: false; error: string }
> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view reports.' };
  try {
    const report = await context.query.ComplianceReportRun.findOne({ where: { id }, query: REPORT_FIELDS });
    if (!report) return { success: true, data: null };
    const canManage = permissions.canManageComplianceReports({ session: context.session });
    const [receipt, events] = await Promise.allSettled([
      canManage
        ? context.query.ComplianceReportRun.findOne({ where: { id }, query: 'filingReceiptReference' })
        : Promise.resolve(null),
      context.query.ComplianceEvent.findMany({
        where: { resourceType: { equals: 'ComplianceReportRun' }, resourceId: { equals: id } },
        orderBy: [{ occurredAt: 'asc' }],
        take: 50,
        query: 'id eventType reasonCode actorId occurredAt',
      }),
    ]);
    return {
      success: true,
      data: {
        report: report as unknown as ReportRow,
        receipt: receipt.status === 'fulfilled' ? ((receipt.value as any)?.filingReceiptReference ?? null) : null,
        events: events.status === 'fulfilled' ? [...events.value] : [],
        canManage,
      },
    };
  } catch (error) {
    return { success: false, error: readFailure(error) };
  }
}

export async function getReportOptions(): Promise<ReportOptions | null> {
  const context = await sessionContext();
  if (!context.session?.itemId) return null;
  const [profiles, jurisdictions] = await Promise.allSettled([
    context.query.RegulatedMerchantProfile.findMany({ take: 20, orderBy: [{ createdAt: 'desc' }], query: 'id legalName status' }),
    context.query.Jurisdiction.findMany({ take: 100, query: 'id code name' }),
  ]);
  if (profiles.status !== 'fulfilled' || jurisdictions.status !== 'fulfilled') return null;
  return {
    profiles: [...profiles.value] as ReportOptions['profiles'],
    jurisdictions: ([...jurisdictions.value] as ReportOptions['jurisdictions']).sort((a, b) => a.code.localeCompare(b.code)),
  };
}

export type GenerateInput = {
  reportType: string;
  jurisdictionId: string;
  merchantProfileId: string;
  periodStartsAt: string;
  /** Last day of the period, inclusive (yyyy-mm-dd). */
  periodThrough: string;
};

export async function generateReport(input: GenerateInput): Promise<SaveResult> {
  if (!input.jurisdictionId || !input.merchantProfileId) return { success: false, error: 'Choose a merchant profile and jurisdiction.' };
  if (!input.periodStartsAt || !input.periodThrough) return { success: false, error: 'Enter the period start and end dates.' };
  const startsAt = isoDay(input.periodStartsAt);
  const through = isoDay(input.periodThrough);
  if (!startsAt || !through) return { success: false, error: 'Enter the period start and end dates.' };
  // The mutation takes a half-open period, so the end is the day after the last included day
  const endsAt = new Date(new Date(through).getTime() + 24 * 60 * 60 * 1000).toISOString();
  return runReportMutation(
    `mutation GenerateComplianceReport($reportType: String!, $jurisdictionId: ID!, $merchantProfileId: ID!, $periodStartsAt: String!, $periodEndsAt: String!) {
      generateComplianceReport(reportType: $reportType, jurisdictionId: $jurisdictionId, merchantProfileId: $merchantProfileId, periodStartsAt: $periodStartsAt, periodEndsAt: $periodEndsAt) { id }
    }`,
    {
      reportType: input.reportType,
      jurisdictionId: input.jurisdictionId,
      merchantProfileId: input.merchantProfileId,
      periodStartsAt: startsAt,
      periodEndsAt: endsAt,
    },
    data => data?.generateComplianceReport,
  );
}

export async function recordSubmission(input: { reportId: string; filingReceiptReference: string; status: string }): Promise<SaveResult> {
  if (!input.filingReceiptReference.trim()) return { success: false, error: 'Enter the filing receipt reference.' };
  return runReportMutation(
    `mutation RecordComplianceReportSubmission($reportId: ID!, $filingReceiptReference: String!, $status: String) {
      recordComplianceReportSubmission(reportId: $reportId, filingReceiptReference: $filingReceiptReference, status: $status) { id }
    }`,
    { reportId: input.reportId, filingReceiptReference: input.filingReceiptReference.trim(), status: input.status },
    data => data?.recordComplianceReportSubmission,
  );
}
