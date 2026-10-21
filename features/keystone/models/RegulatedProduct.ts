import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { decimal, integer, relationship, select, text, timestamp } from "@keystone-6/core/fields";

import { trackingFields } from "./trackingFields";
import { managedComplianceAccess } from "./regulatedAccess";
import { validateAuthorityRevision } from "../regulated/authority-revision";

const state = (values: string[], defaultValue: string) => select({
  type: "enum",
  options: values.map(value => ({ label: value.replaceAll("_", " "), value })),
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
    ], "ends_device"),
    nicotineSource: state(["none", "tobacco", "synthetic", "other", "unknown"], "unknown"),
    nicotineConcentrationMgMl: decimal({ scale: 3 }),
    flavor: text(),
    packageUnits: integer({ defaultValue: 1, validation: { min: 1, isRequired: true } }),
    liquidVolumeMl: decimal({ scale: 3, validation: { min: "0" } }),
    manufacturer: text({ validation: { isRequired: true } }),
    brand: text({ validation: { isRequired: true } }),
    sourceReference: text({ validation: { isRequired: true } }),
    evidenceDigest: text({ access: { read: denyAll }, validation: { isRequired: true } }),
    marketingReviewStatus: state(["pending", "approved", "rejected", "revoked"], "pending"),
    marketingEvidenceDigest: text({ access: { read: denyAll } }),
    marketingReviewedAt: timestamp(),
    reviewedBy: relationship({ ref: "User" }),
    status: state(["draft", "review", "approved", "rejected", "revoked"], "draft"),
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
    authorizationType: state(["federal_marketing_order", "preexisting_status", "state_directory", "local_directory"], "federal_marketing_order"),
    authorizationIdentifier: text({ validation: { isRequired: true } }),
    evidenceUrl: text({ validation: { isRequired: true } }),
    evidenceDigest: text({ access: { read: denyAll }, validation: { isRequired: true } }),
    claimRestrictions: text({ ui: { displayMode: "textarea" } }),
    status: state(["pending", "authorized", "suspended", "delisted", "denied", "expired"], "pending"),
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
