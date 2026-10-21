import { permissions } from '../access';
import { evidenceDigest } from '../../regulated-commerce/core/decision-engine';
import { assertCommerceReleaseEnabled } from '../../regulated-commerce/core/release-gate';

function requireReportPermission(context: any) {
  if (!permissions.canManageComplianceReports({ session: context.session })) {
    throw new Error('Access denied');
  }
}

function boundedPeriod(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
    throw new Error('A valid half-open reporting period is required');
  }
  if (end.getTime() - start.getTime() > 93 * 24 * 60 * 60 * 1000) {
    throw new Error('Report periods cannot exceed 93 days');
  }
  return { start, end };
}

export async function generateComplianceReport(
  _root: unknown,
  args: { reportType: string; jurisdictionId: string; merchantProfileId: string; periodStartsAt: string; periodEndsAt: string },
  context: any,
) {
  requireReportPermission(context);
  if (args.reportType !== 'evidence_inventory') throw new Error('Only evidence_inventory exports are implemented; this is not a jurisdiction filing');
  const { start, end } = boundedPeriod(args.periodStartsAt, args.periodEndsAt);
  if (!args.reportType?.trim() || !args.jurisdictionId || !args.merchantProfileId) {
    throw new Error('Report type, jurisdiction, and merchant profile are required');
  }
  const sudo = context.sudo();
  const [jurisdiction, merchant] = await Promise.all([
    sudo.prisma.jurisdiction.findUnique({ where: { id: args.jurisdictionId }, select: { id: true, code: true } }),
    sudo.prisma.regulatedMerchantProfile.findUnique({ where: { id: args.merchantProfileId }, select: { id: true, legalName: true } }),
  ]);
  if (!jurisdiction || !merchant) throw new Error('Reporting scope not found');

  const decisions = await sudo.prisma.complianceDecision.findMany({
    where: {
      merchantProfileId: merchant.id,
      jurisdictionId: jurisdiction.id,
      issuedAt: { gte: start, lt: end },
      orderId: { not: null },
    },
    orderBy: [{ issuedAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true, orderId: true, purpose: true, result: true, reasonCodes: true,
      policyPack: true, policyVersion: true, policyHash: true, snapshotDigest: true, issuedAt: true,
    },
  });
  const content = {
    schemaVersion: 'openfront-vape-report/v1',
    reportType: args.reportType.trim(),
    jurisdictionCode: jurisdiction.code,
    merchantProfileId: merchant.id,
    period: { startsAt: start.toISOString(), endsAt: end.toISOString() },
    generatedFrom: 'immutable_compliance_decisions',
    decisions,
  };
  const digest = evidenceDigest(content);
  const policyVersions = [...new Set(decisions.map((decision: any) =>
    `${decision.policyPack}@${decision.policyVersion}:${decision.policyHash}`,
  ))].sort();
  const generatedAt = new Date();
  const report = await sudo.prisma.complianceReportRun.create({
    data: {
      reportType: args.reportType.trim(), jurisdictionId: jurisdiction.id, merchantProfileId: merchant.id,
      periodStartsAt: start, periodEndsAt: end, sourceTransactionIds: decisions.map((decision: any) => decision.orderId),
      policyVersions, contentDigest: digest, content, artifactReference: `database:ComplianceReportRun:${digest}`,
      status: 'generated', generatedById: context.session.itemId, generatedAt,
    },
  });
  await sudo.prisma.complianceEvent.create({
    data: {
      eventType: 'report.generated', resourceType: 'ComplianceReportRun', resourceId: report.id,
      actorId: context.session.itemId, reasonCode: 'OPERATOR_GENERATED', evidenceDigest: digest,
      data: { reportType: args.reportType.trim(), jurisdictionCode: jurisdiction.code }, occurredAt: generatedAt,
    },
  });
  return sudo.query.ComplianceReportRun.findOne({
    where: { id: report.id },
    query: 'id reportType status periodStartsAt periodEndsAt contentDigest artifactReference generatedAt',
  });
}

export async function recordComplianceReportSubmission(
  _root: unknown,
  args: { reportId: string; filingReceiptReference: string; status?: 'submitted' | 'accepted' | 'rejected' },
  context: any,
) {
  requireReportPermission(context);
  await assertCommerceReleaseEnabled(context);
  const receipt = args.filingReceiptReference?.trim();
  const status = args.status ?? 'submitted';
  if (!receipt || !['submitted', 'accepted', 'rejected'].includes(status)) {
    throw new Error('A filing receipt and valid external submission status are required');
  }
  const sudo = context.sudo();
  const at = new Date();
  const result = await sudo.prisma.$transaction(async (tx: any) => {
    const report = await tx.complianceReportRun.findUnique({ where: { id: args.reportId } });
    if (!report || !['generated', 'reviewed', 'submitted'].includes(report.status)) throw new Error('Report is not eligible for submission recording');
    const updated = await tx.complianceReportRun.update({
      where: { id: report.id },
      data: { status, filingReceiptReference: receipt, submittedAt: at, submittedById: context.session.itemId },
    });
    await tx.complianceEvent.create({
      data: {
        eventType: 'report.submission_recorded', resourceType: 'ComplianceReportRun', resourceId: report.id,
        actorId: context.session.itemId, reasonCode: status.toUpperCase(),
        evidenceDigest: evidenceDigest({ reportId: report.id, receipt, status, at: at.toISOString() }),
        data: { status, receiptReferenceRecorded: true }, occurredAt: at,
      },
    });
    return updated;
  });
  return sudo.query.ComplianceReportRun.findOne({ where: { id: result.id }, query: 'id reportType status submittedAt filingReceiptReference' });
}
