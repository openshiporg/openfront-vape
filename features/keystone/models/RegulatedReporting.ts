import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, relationship, select, text, timestamp } from "@keystone-6/core/fields";

import { trackingFields } from "./trackingFields";
import { complianceRead, complianceReportManage } from "./regulatedAccess";

export const ComplianceReportRun = list({
  access: {
    operation: {
      query: ({ session }) => complianceRead({ session }) || complianceReportManage({ session }),
      create: denyAll,
      update: denyAll,
      delete: denyAll,
    },
  },
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    reportType: text({ validation: { isRequired: true } }),
    jurisdiction: relationship({ ref: "Jurisdiction" }),
    merchantProfile: relationship({ ref: "RegulatedMerchantProfile" }),
    periodStartsAt: timestamp({ validation: { isRequired: true } }),
    periodEndsAt: timestamp({ validation: { isRequired: true } }),
    sourceTransactionIds: json({ defaultValue: [] }),
    policyVersions: json({ defaultValue: [] }),
    contentDigest: text({ validation: { isRequired: true } }),
    content: json({ access: { read: complianceReportManage }, defaultValue: {} }),
    artifactReference: text({ access: { read: complianceReportManage }, validation: { isRequired: true } }),
    status: select({
      type: "enum",
      options: ["generated", "reviewed", "submitted", "accepted", "rejected", "corrected"].map(value => ({ label: value, value })),
      defaultValue: "generated",
      validation: { isRequired: true },
    }),
    generatedBy: relationship({ ref: "User" }),
    submittedBy: relationship({ ref: "User" }),
    generatedAt: timestamp({ validation: { isRequired: true } }),
    submittedAt: timestamp(),
    filingReceiptReference: text({ access: { read: complianceReportManage } }),
    supersedes: relationship({ ref: "ComplianceReportRun" }),
    ...trackingFields,
  },
});
