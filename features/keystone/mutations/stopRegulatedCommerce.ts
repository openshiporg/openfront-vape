import { permissions } from "../access";
import { buildEmergencyStopAuditRecord } from "../regulated/emergency-stop-audit";

/** A safety-only operator can stop commerce, never activate it or edit authority. */
export default async function stopRegulatedCommerce(_root: unknown, { profileId, reason }: { profileId: string; reason: string }, context: any) {
  if (!context.session?.itemId || !permissions.canOperateComplianceKillSwitch({ session: context.session })) throw new Error("Access denied");
  if (typeof reason !== "string" || reason.trim().length < 10 || reason.length > 500) throw new Error("Provide a reason of 10–500 characters, without personal or identity data");
  if (typeof profileId !== "string" || !profileId || profileId.length > 200) throw new Error("Merchant profile is required");
  const now = new Date();
  // Explicitly authorized infrastructure transaction: no provider calls, no raw
  // authority CRUD, no deletion, and the stop + decision revocation + audit commit together.
  return context.prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT id FROM "RegulatedMerchantProfile" WHERE id = ${profileId} FOR UPDATE`;
    const profile = await tx.regulatedMerchantProfile.findUnique({ where: { id: profileId }, select: { id: true, status: true } });
    if (!profile) throw new Error("Merchant profile not found");
    await tx.regulatedMerchantProfile.update({ where: { id: profileId }, data: { killSwitch: true, ...(profile.status === "active" ? { status: "suspended" } : {}) } });
    await tx.complianceDecision.updateMany({ where: { revokedAt: null }, data: { revokedAt: now } });
    await tx.carrierEligibilityDecision.updateMany({ where: { result: "allow", orderId: null }, data: { result: "revoked" } });
    await tx.complianceEvent.create({
      data: buildEmergencyStopAuditRecord({
        profileId,
        actorId: context.session.itemId,
        occurredAt: now,
      }),
    });
    return { profileId, killSwitch: true, stoppedAt: now.toISOString(), inFlightReviewRequired: true };
  });
}
