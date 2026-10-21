export const COMPLIANCE_SNAPSHOT_MAX_AGE_MS = 5 * 60 * 1000;

/** Bound an allow snapshot by the earliest expiry of every required input. */
export function boundedComplianceSnapshotExpiry(now: Date, evidence: unknown[]): Date {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) throw new Error("A valid snapshot issue time is required");

  const expiryTimes = evidence.map((entry) => {
    if (!entry || typeof entry !== "object" || !("expiresAt" in entry)) return nowMs;
    const rawExpiry = (entry as { expiresAt?: unknown }).expiresAt;
    if (rawExpiry === null || rawExpiry === undefined) return nowMs;
    const expiry = new Date(rawExpiry as string | number | Date).getTime();
    return Number.isFinite(expiry) ? expiry : nowMs;
  });

  return new Date(Math.min(nowMs + COMPLIANCE_SNAPSHOT_MAX_AGE_MS, ...expiryTimes));
}
