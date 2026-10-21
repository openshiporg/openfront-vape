import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, integer, json, relationship, select, text, timestamp } from "@keystone-6/core/fields";

import { trackingFields } from "./trackingFields";
import { complianceRead, identityEvidenceRead, immutableComplianceAccess } from "./regulatedAccess";

const state = (values: string[], defaultValue: string) => select({
  type: "enum",
  options: values.map(value => ({ label: value.replaceAll("_", " "), value })),
  defaultValue,
  validation: { isRequired: true },
});

export const AgeVerificationAttempt = list({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: relationship({ ref: "Cart" }),
    order: relationship({ ref: "Order" }),
    cartFingerprint: text({ defaultValue: "", access: { read: identityEvidenceRead } }),
    subjectDigest: text({ access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    purpose: state(["checkout", "delivery"], "checkout"),
    thresholdAge: integer({ validation: { min: 0, max: 120, isRequired: true } }),
    verifiedAge: integer({ validation: { min: 0, max: 120, isRequired: true } }),
    providerCode: text({ validation: { isRequired: true } }),
    providerTransactionId: text({ isIndexed: "unique", access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    result: state(["pending", "passed", "failed", "manual_review", "expired", "revoked"], "pending"),
    addressMatch: state(["not_checked", "matched", "mismatched", "indeterminate"], "not_checked"),
    reasonCode: text(),
    evidenceDigest: text({ access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    consentPolicyVersion: text({ validation: { isRequired: true } }),
    issuedAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    deleteAfter: timestamp(),
    ...trackingFields,
  },
});

export const RegulatedTaxQuote = list({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: relationship({ ref: "Cart" }),
    order: relationship({ ref: "Order" }),
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    providerCode: text({ validation: { isRequired: true } }),
    cartFingerprint: text({ defaultValue: "", access: { read: denyAll } }),
    providerReference: text({ access: { read: denyAll }, validation: { isRequired: true } }),
    idempotencyKey: text({ isIndexed: "unique", validation: { isRequired: true } }),
    status: state(["quoted", "committed", "voided", "reversed", "failed", "expired"], "quoted"),
    salesTaxAmount: integer({ validation: { min: 0, isRequired: true } }),
    exciseTaxAmount: integer({ validation: { min: 0, isRequired: true } }),
    localFeeAmount: integer({ validation: { min: 0, isRequired: true } }),
    currencyCode: text({ validation: { isRequired: true } }),
    breakdown: json({ defaultValue: [] }),
    stampRequirements: json({ defaultValue: [] }),
    sourceVersion: text({ validation: { isRequired: true } }),
    evidenceDigest: text({ validation: { isRequired: true } }),
    issuedAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    committedAt: timestamp(),
    reversalReference: text({ access: { read: denyAll } }),
    ...trackingFields,
  },
});

export const CarrierEligibilityDecision = list({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: relationship({ ref: "Cart" }),
    order: relationship({ ref: "Order" }),
    providerApproval: relationship({ ref: "ProviderApproval" }),
    shippingOption: relationship({ ref: "ShippingOption" }),
    cartFingerprint: text({ defaultValue: "", access: { read: denyAll } }),
    rateId: text(),
    packageDigest: text(),
    carrierCode: text({ validation: { isRequired: true } }),
    serviceCode: text({ validation: { isRequired: true } }),
    originJurisdictionCode: text({ validation: { isRequired: true } }),
    destinationJurisdictionCode: text({ validation: { isRequired: true } }),
    regulatedCategories: json({ defaultValue: [] }),
    quantities: json({ defaultValue: [] }),
    adultSignature: checkbox({ defaultValue: false }),
    packageMarkings: json({ defaultValue: [] }),
    result: state(["allow", "deny", "manual_review", "expired", "revoked"], "deny"),
    evidenceDigest: text({ validation: { isRequired: true } }),
    issuedAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    idempotencyKey: text({ isIndexed: "unique", validation: { isRequired: true } }),
    ...trackingFields,
  },
});

export const ComplianceDecision = list({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: relationship({ ref: "Cart" }),
    order: relationship({ ref: "Order" }),
    merchantProfile: relationship({ ref: "RegulatedMerchantProfile" }),
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    purpose: state(["catalog_publication", "cart", "shipping", "payment", "checkout", "fulfillment"], "cart"),
    result: state(["allow", "deny", "manual_review"], "deny"),
    policyPack: text({ validation: { isRequired: true } }),
    policyVersion: text({ validation: { isRequired: true } }),
    policyHash: text({ validation: { isRequired: true } }),
    ruleIds: json({ defaultValue: [] }),
    reasonCodes: json({ defaultValue: [] }),
    evidenceReferences: json({ defaultValue: [] }),
    snapshot: json({ defaultValue: {} }),
    cartFingerprint: text({ defaultValue: "", access: { read: denyAll } }),
    snapshotDigest: text({ validation: { isRequired: true } }),
    diagnosticData: json({ access: { read: denyAll }, defaultValue: {} }),
    issuedAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    idempotencyKey: text({ isIndexed: "unique", validation: { isRequired: true } }),
    revokedAt: timestamp(),
    supersededBy: relationship({ ref: "ComplianceDecision" }),
    events: relationship({ ref: "ComplianceEvent.decision", many: true }),
    ...trackingFields,
  },
});

export const ComplianceEvent = list({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    decision: relationship({ ref: "ComplianceDecision.events" }),
    order: relationship({ ref: "Order" }),
    eventType: text({ validation: { isRequired: true } }),
    resourceType: text({ validation: { isRequired: true } }),
    resourceId: text({ validation: { isRequired: true } }),
    actorId: text(),
    reasonCode: text(),
    evidenceDigest: text({ validation: { isRequired: true } }),
    data: json({ defaultValue: {} }),
    occurredAt: timestamp({ validation: { isRequired: true } }),
    ...trackingFields,
  },
});
