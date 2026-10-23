import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, json, relationship, select, text, timestamp } from "@keystone-6/core/fields";

import { trackingFields } from "./trackingFields";
import { managedComplianceAccess } from "./regulatedAccess";
import { permissions } from "../access";
import { validateRules } from "../../regulated-commerce/core/policy-validation";
import { effectiveValue, validateAuthorityRevision } from "../regulated/authority-revision";
import { PROVIDER_APPROVAL_STATUS_LABELS, PROVIDER_PURPOSE_LABELS, regulatedLabel } from "../regulated/labels";

const state = (values: string[], defaultValue: string, labels: Record<string, string> = {}, label?: string) => select({
  type: "enum",
  label,
  options: values.map(value => ({ label: regulatedLabel(labels, value), value })),
  defaultValue,
  validation: { isRequired: true },
});

const SHA256 = /^[a-f0-9]{64}$/i;
const next = effectiveValue;
const linked = (value: any) => Boolean(value && value.disconnect !== true && (typeof value === "string" || value.connect?.id || value.id));

export const Jurisdiction = list({
  access: managedComplianceAccess,
  fields: {
    code: text({ isIndexed: "unique", validation: { isRequired: true } }),
    name: text({ validation: { isRequired: true } }),
    level: state(["country", "state", "county", "municipality", "postal"], "state"),
    parent: relationship({ ref: "Jurisdiction.children" }),
    children: relationship({ ref: "Jurisdiction.parent", many: true }),
    postalScope: json({ defaultValue: [] }),
    authoritySources: json({ defaultValue: [] }),
    status: state(["draft", "active", "retired"], "draft"),
    ...trackingFields,
  },
  hooks: {
    validateInput: ({ resolvedData, item, addValidationError }: any) => {
      if (next(resolvedData, item, "status") === "active" && !(next(resolvedData, item, "authoritySources") || []).length) {
        addValidationError("Active jurisdictions require recorded authority sources");
      }
    },
  },
});

export const RegulatedMerchantProfile = list({
  access: managedComplianceAccess,
  fields: {
    store: relationship({ ref: "Store" }),
    legalName: text({ validation: { isRequired: true } }),
    enabledCategories: json({ defaultValue: [] }),
    launchJurisdictions: relationship({ ref: "Jurisdiction", many: true }),
    originJurisdiction: relationship({ ref: "Jurisdiction" }),
    complianceOwner: text({ validation: { isRequired: true } }),
    escalationContacts: json({ defaultValue: [] }),
    counselApprovalReference: text(),
    insuranceReference: text(),
    pactRegistered: checkbox({ defaultValue: false }),
    pactRegistrationReference: text(),
    pactEvidenceDigest: text({ access: { read: denyAll } }),
    status: state(["draft", "review", "active", "suspended", "revoked"], "draft"),
    effectiveAt: timestamp(),
    expiresAt: timestamp(),
    killSwitch: checkbox({
      defaultValue: true,
      access: {
        create: permissions.canManageCompliance,
        update: permissions.canOperateComplianceKillSwitch,
      },
    }),
    licenses: relationship({ ref: "MerchantLicense.profile", many: true }),
    providerApprovals: relationship({ ref: "ProviderApproval.profile", many: true }),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active"], ["store", "legalName", "enabledCategories", "launchJurisdictions", "originJurisdiction", "pactRegistered", "pactRegistrationReference", "pactEvidenceDigest", "effectiveAt", "expiresAt"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const origin = resolvedData.originJurisdiction !== undefined ? resolvedData.originJurisdiction : item?.originJurisdiction;
      if (!next(resolvedData, item, "pactRegistered") || !next(resolvedData, item, "pactRegistrationReference") ||
          !SHA256.test(next(resolvedData, item, "pactEvidenceDigest") || "") ||
          !linked(origin) || !next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "expiresAt")) {
        addValidationError("Active merchant profiles require origin, current PACT evidence and bounded dates. The kill switch may always stop an active profile");
      }
    },
  },
});

export const MerchantLicense = list({
  access: managedComplianceAccess,
  fields: {
    profile: relationship({ ref: "RegulatedMerchantProfile.licenses" }),
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    licenseType: text({ validation: { isRequired: true } }),
    licenseNumber: text({ validation: { isRequired: true } }),
    issuingAuthority: text({ validation: { isRequired: true } }),
    authorityReference: text({ validation: { isRequired: true } }),
    evidenceDigest: text({ access: { read: denyAll }, validation: { isRequired: true } }),
    verificationSource: text({ validation: { isRequired: true } }),
    status: state(["draft", "active", "conditioned", "suspended", "expired", "revoked"], "draft"),
    effectiveAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    verifiedAt: timestamp(),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active", "conditioned"], ["profile", "jurisdiction", "licenseType", "licenseNumber", "issuingAuthority", "authorityReference", "evidenceDigest", "verificationSource", "effectiveAt", "expiresAt", "verifiedAt"]);
      if (["active", "conditioned"].includes(next(resolvedData, item, "status")) &&
          (!next(resolvedData, item, "verifiedAt") || !SHA256.test(next(resolvedData, item, "evidenceDigest") || ""))) {
        addValidationError("Usable licenses require verification evidence");
      }
    },
  },
});

export const ProviderApproval = list({
  access: managedComplianceAccess,
  fields: {
    profile: relationship({ ref: "RegulatedMerchantProfile.providerApprovals" }),
    purpose: state(["identity", "payment", "tax", "registry", "carrier"], "identity", PROVIDER_PURPOSE_LABELS),
    providerCode: text({ validation: { isRequired: true } }),
    paymentProvider: relationship({ ref: "PaymentProvider" }),
    shippingProvider: relationship({ ref: "ShippingProvider" }),
    coveredCategories: json({ defaultValue: [] }),
    coveredJurisdictionCodes: json({ defaultValue: [] }),
    capabilities: json({ defaultValue: [] }),
    approvalReference: text({ validation: { isRequired: true } }),
    evidenceDigest: text({ label: "Evidence SHA-256", access: { read: denyAll }, validation: { isRequired: true } }),
    status: state(["unconfigured", "review", "active", "suspended", "expired", "revoked"], "unconfigured", PROVIDER_APPROVAL_STATUS_LABELS),
    effectiveAt: timestamp(),
    expiresAt: timestamp(),
    validatedAt: timestamp(),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active"], ["profile", "purpose", "providerCode", "paymentProvider", "shippingProvider", "coveredCategories", "coveredJurisdictionCodes", "capabilities", "approvalReference", "evidenceDigest", "effectiveAt", "expiresAt", "validatedAt"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const profile = resolvedData.profile !== undefined ? resolvedData.profile : item?.profile;
      const purpose = next(resolvedData, item, "purpose");
      const paymentProvider = resolvedData.paymentProvider !== undefined ? resolvedData.paymentProvider : item?.paymentProvider;
      const shippingProvider = resolvedData.shippingProvider !== undefined ? resolvedData.shippingProvider : item?.shippingProvider;
      if (!linked(profile) || !next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "expiresAt") ||
          !next(resolvedData, item, "validatedAt") || !SHA256.test(next(resolvedData, item, "evidenceDigest") || "") ||
          !(next(resolvedData, item, "coveredCategories") || []).length ||
          !(next(resolvedData, item, "coveredJurisdictionCodes") || []).length ||
          !(next(resolvedData, item, "capabilities") || []).length ||
          (purpose === "payment" && !linked(paymentProvider)) || (purpose === "carrier" && !linked(shippingProvider))) {
        addValidationError("Active provider approvals require merchant scope, bounded validated evidence, category/jurisdiction capabilities, and bound commerce providers where applicable");
      }
    },
  },
});

export const RegulatedRuleSet = list({
  access: managedComplianceAccess,
  fields: {
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    packName: text({ validation: { isRequired: true } }),
    version: text({ validation: { isRequired: true } }),
    policyHash: text({ isIndexed: "unique", validation: { isRequired: true } }),
    authorityCitations: json({ defaultValue: [] }),
    rules: json({ defaultValue: [] }),
    status: state(["draft", "approved", "active", "retired", "emergency_disabled"], "draft"),
    effectiveAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    reviewedBy: relationship({ ref: "User" }),
    approvedAt: timestamp(),
    signatureDigest: text({ access: { read: denyAll } }),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active", "approved"], ["jurisdiction", "packName", "version", "policyHash", "authorityCitations", "rules", "effectiveAt", "expiresAt", "reviewedBy", "approvedAt", "signatureDigest"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const reviewer = resolvedData.reviewedBy !== undefined ? resolvedData.reviewedBy : item?.reviewedBy;
      const validation = validateRules(next(resolvedData, item, "rules"));
      if (!next(resolvedData, item, "approvedAt") || !SHA256.test(next(resolvedData, item, "signatureDigest") || "") ||
          !linked(reviewer) || !(next(resolvedData, item, "authorityCitations") || []).length || !validation.valid) {
        addValidationError(`Active rule sets require reviewer approval, signed policy evidence, citations, and valid rules${validation.errors.length ? `: ${validation.errors.join('; ')}` : ''}`);
      }
    },
  },
});
