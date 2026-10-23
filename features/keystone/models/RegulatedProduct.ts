import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { decimal, integer, relationship, select, text, timestamp } from "@keystone-6/core/fields";

import { trackingFields } from "./trackingFields";
import { managedComplianceAccess } from "./regulatedAccess";
import { validateAuthorityRevision } from "../regulated/authority-revision";
import {
  AUTHORIZATION_STATUS_LABELS, AUTHORIZATION_TYPE_LABELS, CLASSIFICATION_CATEGORY_LABELS, CLASSIFICATION_STATUS_LABELS,
  NICOTINE_SOURCE_LABELS, REVIEW_STATUS_LABELS, regulatedLabel,
} from "../regulated/labels";

const state = (values: string[], defaultValue: string, labels: Record<string, string> = {}, label?: string) => select({
  type: "enum",
  label,
  options: values.map(value => ({ label: regulatedLabel(labels, value), value })),
  defaultValue,
  validation: { isRequired: true },
});

const SHA256 = /^[a-f0-9]{64}$/i;
const next = (resolvedData: any, item: any, key: string) => resolvedData[key] !== undefined ? resolvedData[key] : item?.[key];
const linked = (value: any) => Boolean(value && value.disconnect !== true && (typeof value === "string" || value.connect?.id || value.id));

async function draftLinkedProduct(context: any, classificationId: string | null | undefined) {
  if (!classificationId) return;
  const classification = await context.sudo().query.RegulatedProductClassification.findOne({
    where: { id: classificationId },
    query: "variant { product { id status regulatedCommerceRequired } }",
  });
  const product = classification?.variant?.product;
  if (product?.status === "published" && product.regulatedCommerceRequired !== false) {
    await context.sudo().prisma.product.update({ where: { id: product.id }, data: { status: "draft" } });
  }
}

export const RegulatedProductClassification = list({
  access: managedComplianceAccess,
  fields: {
    variant: relationship({ ref: "ProductVariant.regulatedClassification" }),
    category: state([
      "ends_device", "e_liquid", "component", "accessory",
      "tobacco_derived_nicotine", "synthetic_nicotine",
    ], "ends_device", CLASSIFICATION_CATEGORY_LABELS, "Product type"),
    nicotineSource: state(["none", "tobacco", "synthetic", "other", "unknown"], "unknown", NICOTINE_SOURCE_LABELS, "Nicotine source"),
    nicotineConcentrationMgMl: decimal({ scale: 3, label: "Nicotine strength (mg/ml)" }),
    flavor: text({ label: "Flavour" }),
    packageUnits: integer({ label: "Units per pack", defaultValue: 1, validation: { min: 1, isRequired: true } }),
    liquidVolumeMl: decimal({ scale: 3, label: "Liquid volume (ml)", validation: { min: "0" } }),
    manufacturer: text({ validation: { isRequired: true } }),
    brand: text({ validation: { isRequired: true } }),
    sourceReference: text({ label: "Source reference", validation: { isRequired: true } }),
    evidenceDigest: text({ label: "Evidence SHA-256", access: { read: denyAll }, validation: { isRequired: true } }),
    marketingReviewStatus: state(["pending", "approved", "rejected", "revoked"], "pending", REVIEW_STATUS_LABELS, "Marketing review"),
    marketingEvidenceDigest: text({ label: "Marketing evidence SHA-256", access: { read: denyAll } }),
    marketingReviewedAt: timestamp({ label: "Marketing reviewed at" }),
    reviewedBy: relationship({ ref: "User", label: "Reviewed by" }),
    status: state(["draft", "review", "approved", "rejected", "revoked"], "draft", CLASSIFICATION_STATUS_LABELS),
    effectiveAt: timestamp(),
    expiresAt: timestamp(),
    authorizations: relationship({ ref: "ProductAuthorization.classification", many: true }),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["approved"], ["variant", "category", "nicotineSource", "nicotineConcentrationMgMl", "flavor", "packageUnits", "liquidVolumeMl", "manufacturer", "brand", "sourceReference", "evidenceDigest", "marketingReviewStatus", "marketingEvidenceDigest", "marketingReviewedAt", "reviewedBy", "effectiveAt", "expiresAt"]);
      if (next(resolvedData, item, "status") !== "approved") return;
      const reviewer = resolvedData.reviewedBy !== undefined ? resolvedData.reviewedBy : item?.reviewedBy;
      if (!linked(reviewer) || !next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "expiresAt") ||
          !SHA256.test(next(resolvedData, item, "evidenceDigest") || "") ||
          next(resolvedData, item, "marketingReviewStatus") !== "approved" ||
          !SHA256.test(next(resolvedData, item, "marketingEvidenceDigest") || "") ||
          !next(resolvedData, item, "marketingReviewedAt")) {
        addValidationError("Approved classifications require a reviewer, bounded product evidence, and recorded marketing review");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }: any) => {
      if (operation === "update" &&
          (next(resolvedData, item, "status") !== "approved" || next(resolvedData, item, "marketingReviewStatus") !== "approved")) {
        await draftLinkedProduct(context, item.id);
      }
    },
  },
});

export const ProductAuthorization = list({
  access: managedComplianceAccess,
  fields: {
    classification: relationship({ ref: "RegulatedProductClassification.authorizations" }),
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    authority: text({ validation: { isRequired: true } }),
    authorizationType: state(["federal_marketing_order", "preexisting_status", "state_directory", "local_directory"], "federal_marketing_order", AUTHORIZATION_TYPE_LABELS, "Authorization type"),
    authorizationIdentifier: text({ label: "Authorization number", validation: { isRequired: true } }),
    evidenceUrl: text({ label: "Evidence URL", validation: { isRequired: true } }),
    evidenceDigest: text({ label: "Evidence SHA-256", access: { read: denyAll }, validation: { isRequired: true } }),
    claimRestrictions: text({ ui: { displayMode: "textarea" } }),
    status: state(["pending", "authorized", "suspended", "delisted", "denied", "expired"], "pending", AUTHORIZATION_STATUS_LABELS),
    effectiveAt: timestamp({ validation: { isRequired: true } }),
    expiresAt: timestamp(),
    delistedAt: timestamp(),
    sellThroughEndsAt: timestamp(),
    lastVerifiedAt: timestamp(),
    ...trackingFields,
  },
  hooks: {
    validateInput: (args: any) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["authorized"], ["classification", "jurisdiction", "authority", "authorizationType", "authorizationIdentifier", "evidenceUrl", "evidenceDigest", "claimRestrictions", "effectiveAt", "expiresAt", "delistedAt", "sellThroughEndsAt", "lastVerifiedAt"]);
      if (next(resolvedData, item, "status") === "authorized" &&
          (!next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "lastVerifiedAt") ||
           !SHA256.test(next(resolvedData, item, "evidenceDigest") || ""))) {
        addValidationError("Authorized products require current authority evidence and verification time");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }: any) => {
      if (operation !== "update" || next(resolvedData, item, "status") === "authorized") return;
      const classificationId = resolvedData.classification?.connect?.id || item?.classification;
      await draftLinkedProduct(context, classificationId);
    },
  },
});
