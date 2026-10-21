import type { KeystoneContext } from "@keystone-6/core/types";

/**
 * Store-level commerce gate, derived from recorded merchant authority.
 * Commerce is enabled when a RegulatedMerchantProfile is active, its kill
 * switch is off and it has at least one launch jurisdiction. Each sale is
 * still checked separately by the per-cart compliance engine.
 */
export async function releaseBlockers(context: KeystoneContext<any>): Promise<string[]> {
  const profiles = await context.sudo().query.RegulatedMerchantProfile.findMany({
    where: { status: { equals: "active" } },
    query: "id killSwitch launchJurisdictionsCount",
  });
  if (!profiles.length) return ["ACTIVE_MERCHANT_PROFILE_REQUIRED"];
  const live = profiles.filter((profile: any) => !profile.killSwitch);
  if (!live.length) return ["KILL_SWITCH_ENABLED"];
  if (!live.some((profile: any) => (profile.launchJurisdictionsCount ?? 0) > 0)) return ["LAUNCH_JURISDICTION_REQUIRED"];
  return [];
}

export async function assertCommerceReleaseEnabled(context: KeystoneContext<any>) {
  if ((await releaseBlockers(context)).length) {
    throw new Error("Checkout isn't available for this store yet.");
  }
}
