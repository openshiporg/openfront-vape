import type { KeystoneContext } from "@keystone-6/core/types";

import { missingStoreInfo } from "../../platform/store-settings/lib/store-info";

/**
 * Store-level commerce gate, derived from recorded merchant authority.
 * Commerce is enabled when a RegulatedMerchantProfile is active, its kill
 * switch is off and it has at least one launch jurisdiction. Each sale is
 * still checked separately by the per-cart compliance engine. The store must also
 * publish its legal name, licences and customer policies.
 */
export async function releaseBlockers(context: KeystoneContext<any>): Promise<string[]> {
  const [profiles, stores] = await Promise.all([
    context.sudo().query.RegulatedMerchantProfile.findMany({
      where: { status: { equals: "active" } },
      query: "id killSwitch launchJurisdictionsCount",
    }),
    context.sudo().query.Store.findMany({ take: 1, query: "metadata" }),
  ]);
  const storeInfo = missingStoreInfo(stores[0]?.metadata).length ? ["STORE_POLICIES_REQUIRED"] : [];
  if (!profiles.length) return ["ACTIVE_MERCHANT_PROFILE_REQUIRED", ...storeInfo];
  const live = profiles.filter((profile: any) => !profile.killSwitch);
  if (!live.length) return ["KILL_SWITCH_ENABLED", ...storeInfo];
  if (!live.some((profile: any) => (profile.launchJurisdictionsCount ?? 0) > 0)) return ["LAUNCH_JURISDICTION_REQUIRED", ...storeInfo];
  return storeInfo;
}

export async function assertCommerceReleaseEnabled(context: KeystoneContext<any>) {
  if ((await releaseBlockers(context)).length) {
    throw new Error("Checkout isn't available for this store yet.");
  }
}
