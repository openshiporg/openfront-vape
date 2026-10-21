import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";

export function buildEmergencyStopAuditRecord({
  profileId,
  actorId,
  occurredAt,
}: {
  profileId: string;
  actorId: string;
  occurredAt: Date;
}) {
  const reasonCode = "OPERATOR_STOP";
  const occurredAtIso = occurredAt.toISOString();

  return {
    eventType: "merchant.emergency_stop",
    resourceType: "RegulatedMerchantProfile",
    resourceId: profileId,
    actorId,
    reasonCode,
    evidenceDigest: evidenceDigest({ profileId, actorId, reasonCode, occurredAt: occurredAtIso }),
    data: { inFlightReviewRequired: true },
    occurredAt,
  };
}
