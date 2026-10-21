import { denyAll } from "@keystone-6/core/access";

import { permissions } from "../access";

export const complianceRead = ({ session }: { session?: unknown }) =>
  permissions.canReadCompliance({ session }) || permissions.canManageCompliance({ session });

export const complianceManage = ({ session }: { session?: unknown }) =>
  permissions.canManageCompliance({ session });

export const complianceDecisionReview = ({ session }: { session?: unknown }) =>
  permissions.canReviewComplianceDecisions({ session });

export const complianceReportManage = ({ session }: { session?: unknown }) =>
  permissions.canManageComplianceReports({ session });

export const identityEvidenceRead = ({ session }: { session?: unknown }) =>
  permissions.canAccessIdentityEvidence({ session });

export const managedComplianceAccess = {
  operation: {
    query: complianceRead,
    create: complianceManage,
    update: complianceManage,
    delete: denyAll,
  },
};

export const immutableComplianceAccess = {
  operation: {
    query: complianceRead,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
};
