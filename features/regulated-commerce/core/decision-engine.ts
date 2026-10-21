import crypto from "node:crypto";

import type { DecisionInput, DecisionOutput, EvidenceStatus, Rule } from "./decision-types";

const time = (value?: string | Date | null) => value ? new Date(value).getTime() : null;

export function isCurrentEvidence(
  evidence: EvidenceStatus | null | undefined,
  acceptedStatuses: string[],
  now = new Date(),
): boolean {
  if (!evidence || !acceptedStatuses.includes(evidence.status)) return false;
  const effectiveAt = time(evidence.effectiveAt);
  const expiresAt = time(evidence.expiresAt);
  return effectiveAt !== null && Number.isFinite(effectiveAt) && effectiveAt <= now.getTime() &&
    expiresAt !== null && Number.isFinite(expiresAt) && expiresAt > now.getTime() && expiresAt > effectiveAt;
}

function stable(value: unknown): unknown {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new Error("Invalid evidence timestamp");
    return value.toISOString();
  }
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, stable(entry)]),
    );
  }
  return value;
}

export function evidenceDigest(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

const SUPPORTED_RULE_TYPES = new Set([
  "minimum_age",
  "category_prohibition",
  "flavor_prohibition",
  "directory_required",
  "license_required",
  "quantity_limit",
  "adult_signature_required",
  "package_marking",
  "marketing_restriction",
]);

function isSupportedRule(rule: unknown): rule is Rule {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) return false;
  const type = (rule as { type?: unknown }).type;
  return typeof type === "string" && SUPPORTED_RULE_TYPES.has(type);
}

function evaluateRules(input: DecisionInput, rules: Rule[], reasons: Set<string>, ruleIds: Set<string>) {
  const categories = new Set(input.products.map(product => product.category));
  const flavors = new Set(input.products.map(product => product.flavor?.toLowerCase()).filter(Boolean));
  for (const rule of rules) {
    if (!isSupportedRule(rule)) {
      reasons.add("POLICY_REQUIREMENT_NOT_IMPLEMENTED");
      const id = (rule as { id?: unknown } | null)?.id;
      if (typeof id === "string") ruleIds.add(id);
      continue;
    }
    if (rule.type === "category_prohibition" && rule.categories.some(category => categories.has(category))) {
      reasons.add("CATEGORY_PROHIBITED"); ruleIds.add(rule.id);
    }
    if (rule.type === "flavor_prohibition" && rule.flavors.some(flavor => flavors.has(flavor.toLowerCase()))) {
      reasons.add("FLAVOR_PROHIBITED"); ruleIds.add(rule.id);
    }
    if (rule.type === "quantity_limit") {
      const quantity = input.products.filter(product => product.category === rule.category)
        .reduce((sum, product) => sum + product.quantity * product.packageUnits, 0);
      if (!Number.isSafeInteger(quantity) || quantity > rule.maxUnits) {
        reasons.add("QUANTITY_LIMIT_EXCEEDED"); ruleIds.add(rule.id);
      }
    }
    if (rule.type === "directory_required") {
      if (input.products.some(product => product.destinationAuthorization?.authority !== rule.authority || !isCurrentEvidence(product.destinationAuthorization, ["authorized"], input.now))) {
        reasons.add("DESTINATION_AUTHORIZATION_REQUIRED"); ruleIds.add(rule.id);
      }
    }
    // These policy values are not yet supported by an accepted content/lane
    // resolver. Deny rather than silently interpreting only part of a rule.
    if (rule.type === "marketing_restriction" || rule.type === "adult_signature_required") {
      reasons.add("POLICY_REQUIREMENT_NOT_IMPLEMENTED"); ruleIds.add(rule.id);
    }
    if (rule.type === "package_marking" && ["shipping", "payment", "checkout", "fulfillment"].includes(input.purpose)) {
      const supplied = new Set(input.carrierEvidence?.packageMarkings ?? []);
      if (!rule.markings.every(marking => supplied.has(marking))) {
        reasons.add("REQUIRED_PACKAGE_MARKING_MISSING"); ruleIds.add(rule.id);
      }
    }
    if (rule.type === "license_required") {
      const currentTypes = new Set(input.licenses
        .filter(license => isCurrentEvidence(license, ["active", "conditioned"], input.now))
        .map(license => license.licenseType));
      if (!rule.licenseTypes.every(required => currentTypes.has(required))) {
        reasons.add("MERCHANT_LICENSE_REQUIRED"); ruleIds.add(rule.id);
      }
    }
  }
}

export function evaluateRegulatedCommerce(input: DecisionInput): DecisionOutput {
  const now = input.now ?? new Date();
  const reasons = new Set<string>();
  const ruleIds = new Set<string>();

  if (!input.merchant || !isCurrentEvidence(input.merchant, ["active"], now)) reasons.add("MERCHANT_NOT_ACTIVE");
  if (input.merchant?.killSwitch) reasons.add("MERCHANT_KILL_SWITCH_ACTIVE");
  if (!input.merchant?.pactRegistered) reasons.add("PACT_REGISTRATION_NOT_RECORDED");
  if (!input.jurisdiction) reasons.add("DESTINATION_JURISDICTION_UNRESOLVED");
  if (input.jurisdiction && !input.merchant?.launchJurisdictionCodes?.includes(input.jurisdiction.code)) {
    reasons.add("DESTINATION_NOT_IN_MERCHANT_LAUNCH_SCOPE");
  }
  if (input.genericTaxRate !== 0) reasons.add("GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART");
  if (!input.ruleSet || !input.ruleSet.approvedAt || !isCurrentEvidence(input.ruleSet, ["active"], now)) {
    reasons.add("ACTIVE_POLICY_REQUIRED");
  }

  for (const product of input.products) {
    if (!input.merchant?.enabledCategories?.includes(product.category)) {
      reasons.add("CATEGORY_NOT_ENABLED_FOR_MERCHANT");
    }
    if (product.marketingReviewStatus !== "approved") reasons.add("MARKETING_REVIEW_REQUIRED");
    if (!isCurrentEvidence({
      status: product.classificationStatus,
      effectiveAt: product.classificationEffectiveAt,
      expiresAt: product.classificationExpiresAt,
    }, ["approved"], now)) reasons.add("PRODUCT_CLASSIFICATION_REQUIRED");
    if (!isCurrentEvidence(product.federalAuthorization, ["authorized"], now)) reasons.add("FEDERAL_AUTHORIZATION_REQUIRED");
    if (!Number.isSafeInteger(product.quantity) || product.quantity <= 0 || !Number.isSafeInteger(product.packageUnits) || product.packageUnits <= 0) reasons.add("INVALID_REGULATED_QUANTITY");
  }

  const rules = input.ruleSet?.rules ?? [];
  evaluateRules({ ...input, now }, rules, reasons, ruleIds);

  if (["payment", "checkout", "fulfillment"].includes(input.purpose)) {
    const minimumAge = rules
      .filter((rule): rule is Extract<Rule, { type: "minimum_age" }> => isSupportedRule(rule) && rule.type === "minimum_age")
      .reduce((minimum, rule) => Math.max(minimum, rule.value), 21);
    if (!input.ageEvidence || !isCurrentEvidence(input.ageEvidence, ["passed"], now) ||
      input.ageEvidence.result !== "passed" || input.ageEvidence.age < minimumAge ||
      input.ageEvidence.addressMatch !== "matched") reasons.add("CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED");
    const acceptedTaxStatuses = ["committed"];
    if (!input.taxEvidence || !isCurrentEvidence(input.taxEvidence, acceptedTaxStatuses, now)) {
      reasons.add(input.purpose === "payment" ? "CURRENT_TAX_EVIDENCE_REQUIRED" : "COMMITTED_TAX_EVIDENCE_REQUIRED");
    }
    if (!input.paymentApproval || !isCurrentEvidence(input.paymentApproval, ["active"], now)) {
      reasons.add("PAYMENT_PROVIDER_APPROVAL_REQUIRED");
    }
  }

  if (["shipping", "payment", "checkout", "fulfillment"].includes(input.purpose)) {
    if (!input.carrierEvidence || !isCurrentEvidence(input.carrierEvidence, ["allow"], now) ||
      input.carrierEvidence.result !== "allow" || !input.carrierEvidence.adultSignature) {
      reasons.add("APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED");
    }
  }

  return {
    result: reasons.size ? "deny" : "allow",
    reasonCodes: [...reasons].sort(),
    ruleIds: [...ruleIds].sort(),
    policyVersion: input.ruleSet?.version ?? null,
    policyHash: input.ruleSet?.policyHash ?? null,
    evaluatedAt: now.toISOString(),
  };
}
