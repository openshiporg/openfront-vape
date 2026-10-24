import { permissions } from "../access";
import { isCurrentEvidence } from "../../regulated-commerce/core/decision-engine";
import { releaseBlockers } from "../../regulated-commerce/core/release-gate";

export default async function regulatedCommerceReadiness(_root: unknown, _args: unknown, context: any) {
  const canRead = permissions.canReadCompliance({ session: context.session }) || permissions.canManageCompliance({ session: context.session });
  const canStop = permissions.canOperateComplianceKillSwitch({ session: context.session });
  if (!canRead && !canStop) throw new Error("Access denied");
  const sudo = context.sudo();
  const gateBlockers = await releaseBlockers(context);
  const launchReady = gateBlockers.length === 0;
  const transactionMode = launchReady ? "enabled" : "disabled";
  if (!canRead) return {
    launchReady, canStop: true, canExport: false, blockers: gateBlockers, integrationStates: [],
    transactionMode, claimBoundary: "You can stop regulated sales. Managing compliance records needs compliance access.",
    profiles: await sudo.query.RegulatedMerchantProfile.findMany({ take: 10, query: "id legalName status killSwitch" }),
    activeRuleSets: [], approvedClassifications: [], activeProviderApprovals: [], reportRuns: [],
  };
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const [profiles, activeRuleSets, approvedClassifications, activeProviderApprovals, reportRuns] = await Promise.all([
    sudo.query.RegulatedMerchantProfile.findMany({ take: 10, orderBy: [{ createdAt: "desc" }], query: "id legalName status pactRegistered killSwitch enabledCategories effectiveAt expiresAt originJurisdiction { code } launchJurisdictions { code }" }),
    sudo.query.RegulatedRuleSet.findMany({ where: { status: { equals: "active" }, effectiveAt: { lte: now }, expiresAt: { gt: now } }, take: 100, query: "id packName version policyHash jurisdiction { code name } approvedAt expiresAt" }),
    sudo.query.RegulatedProductClassification.findMany({ where: { status: { equals: "approved" } }, take: 100, query: "id category brand manufacturer status effectiveAt expiresAt marketingReviewStatus variant { id sku product { id title status } } authorizations { id authority authorizationType status effectiveAt expiresAt delistedAt jurisdiction { code } }" }),
    sudo.query.ProviderApproval.findMany({ where: { status: { equals: "active" }, effectiveAt: { lte: now }, expiresAt: { gt: now } }, take: 100, query: "id purpose providerCode coveredCategories coveredJurisdictionCodes capabilities expiresAt" }),
    sudo.query.ComplianceReportRun.findMany({ take: 25, orderBy: [{ generatedAt: "desc" }], query: "id reportType status periodStartsAt periodEndsAt contentDigest generatedAt jurisdiction { code }" }),
  ]);
  const activeProfiles = profiles.filter((profile: any) =>
    isCurrentEvidence(profile, ["active"], nowDate) && !profile.killSwitch && profile.pactRegistered &&
    profile.originJurisdiction?.code && profile.enabledCategories?.length && profile.launchJurisdictions?.length,
  );
  const usableClassifications = approvedClassifications.filter((classification: any) =>
    isCurrentEvidence(classification, ["approved"], nowDate) &&
    classification.marketingReviewStatus === "approved" &&
    classification.authorizations?.some((authorization: any) =>
      ["federal_marketing_order", "preexisting_status"].includes(authorization.authorizationType) &&
      !authorization.delistedAt && isCurrentEvidence(authorization, ["authorized"], nowDate),
    ),
  );
  const requiredProviderPurposes = ["identity", "payment", "tax", "carrier", "registry"];
  const integrationStates = requiredProviderPurposes.map((purpose) => ({
    purpose,
    status: activeProviderApprovals.some((approval: any) => approval.purpose === purpose)
      ? "recorded_active"
      : "unconfigured",
  }));
  const blockers = [
    ...gateBlockers,
    ...(activeProfiles.length === 1 ? [] : ["EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED"]),
    ...(activeRuleSets.length ? [] : ["ACTIVE_REVIEWED_POLICY_REQUIRED"]),
    ...(usableClassifications.length ? [] : ["CURRENT_PRODUCT_AND_FEDERAL_AUTHORITY_REQUIRED"]),
    ...integrationStates
      .filter((integration) => integration.status !== "recorded_active")
      .map((integration) => `${integration.purpose.toUpperCase()}_PROVIDER_AUTHORITY_REQUIRED`),
  ];
  return {
    launchReady,
    canStop: permissions.canOperateComplianceKillSwitch({ session: context.session }),
    canExport: permissions.canManageComplianceReports({ session: context.session }),
    blockers,
    integrationStates,
    transactionMode,
    claimBoundary: "Checkout opens when a merchant profile is active, its kill switch is off and it has a launch jurisdiction, and the store has published its legal name, licence numbers and all five policies. Each order is still checked against the compliance rules for its cart.",
    profiles,
    activeRuleSets,
    approvedClassifications: usableClassifications,
    activeProviderApprovals,
    reportRuns,
  };
}
