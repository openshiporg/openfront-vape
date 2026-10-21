import { permissions } from '../access';
import { evidenceDigest } from '../../regulated-commerce/core/decision-engine';
import { releaseBlockers } from '../../regulated-commerce/core/release-gate';

export default async function exportComplianceInventory(_root: unknown, { profileId }: { profileId: string }, context: any) {
  if (!context.session?.itemId || !permissions.canManageComplianceReports({ session: context.session })) throw new Error('Access denied');
  const sudo = context.sudo();
  const profile = await sudo.query.RegulatedMerchantProfile.findOne({
    where: { id: profileId },
    query: `id legalName status pactRegistered killSwitch effectiveAt expiresAt
      originJurisdiction { code } launchJurisdictions(take: 100) { code }
      licenses(take: 100) { id licenseType status effectiveAt expiresAt }
      providerApprovals(take: 100) { id purpose providerCode status effectiveAt expiresAt }`,
  });
  if (!profile) throw new Error('Merchant profile not found');
  const now = new Date();
  const content = { schemaVersion: 'openfront-vape-evidence-inventory/v1',
    claimBoundary: 'Recorded configuration only. Not a PACT filing, legal authority, provider acceptance or launch approval.',
    transactionEnabled: (await releaseBlockers(context)).length === 0, generatedAt: now.toISOString(), limits: { perRelation: 100 }, profile };
  const contentDigest = evidenceDigest(content);
  const report = await sudo.prisma.$transaction(async (tx: any) => {
    const stored = await tx.complianceReportRun.create({ data: {
      merchantProfileId: profile.id, reportType: 'evidence_inventory', status: 'generated',
      periodStartsAt: now, periodEndsAt: now, content, contentDigest,
      artifactReference: `sha256:${contentDigest}`, generatedAt: now, generatedById: context.session.itemId,
    } });
    await tx.complianceEvent.create({ data: {
      eventType: 'evidence.inventory_exported', resourceType: 'ComplianceReportRun', resourceId: stored.id,
      actorId: context.session.itemId, reasonCode: 'OPERATOR_EXPORT', evidenceDigest: contentDigest, occurredAt: now,
      data: { profileId: profile.id, identityEvidenceIncluded: false },
    } });
    return stored;
  });
  return { id: report.id, contentDigest, content };
}
