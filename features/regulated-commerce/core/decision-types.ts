export const REGULATED_CATEGORIES = [
  "ends_device",
  "e_liquid",
  "component",
  "accessory",
  "tobacco_derived_nicotine",
  "synthetic_nicotine",
] as const;

export type RegulatedCategory = (typeof REGULATED_CATEGORIES)[number];
export type ComplianceResult = "allow" | "deny" | "manual_review";
export type CompliancePurpose =
  | "catalog_publication"
  | "cart"
  | "shipping"
  | "payment"
  | "checkout"
  | "fulfillment";

export type EvidenceStatus = {
  status: string;
  authority?: string;
  effectiveAt?: string | Date | null;
  expiresAt?: string | Date | null;
};

export type Rule =
  | { id: string; type: "minimum_age"; value: number }
  | { id: string; type: "category_prohibition"; categories: RegulatedCategory[] }
  | { id: string; type: "flavor_prohibition"; flavors: string[] }
  | { id: string; type: "directory_required"; authority: string }
  | { id: string; type: "license_required"; licenseTypes: string[] }
  | { id: string; type: "quantity_limit"; category: RegulatedCategory; maxUnits: number }
  | { id: string; type: "adult_signature_required"; minimumAge: number }
  | { id: string; type: "package_marking"; markings: string[] }
  | { id: string; type: "marketing_restriction"; restrictedClaims: string[] };

export type ProductEvidence = {
  variantId: string;
  category: RegulatedCategory;
  flavor?: string | null;
  quantity: number;
  packageUnits: number;
  classificationStatus: string;
  classificationEffectiveAt?: string | Date | null;
  classificationExpiresAt?: string | Date | null;
  marketingReviewStatus?: string | null;
  federalAuthorization: EvidenceStatus | null;
  destinationAuthorization: EvidenceStatus | null;
};

export type DecisionInput = {
  purpose: CompliancePurpose;
  now?: Date;
  merchant: (EvidenceStatus & {
    killSwitch: boolean;
    pactRegistered: boolean;
    enabledCategories?: RegulatedCategory[];
    launchJurisdictionCodes?: string[];
  }) | null;
  jurisdiction: { code: string } | null;
  genericTaxRate?: number | null;
  ruleSet: (EvidenceStatus & { approvedAt?: string | Date | null; version: string; policyHash: string; rules: Rule[] }) | null;
  licenses: Array<EvidenceStatus & { licenseType: string }>;
  products: ProductEvidence[];
  ageEvidence?: (EvidenceStatus & { result: string; age: number; addressMatch: string }) | null;
  taxEvidence?: (EvidenceStatus & { status: string }) | null;
  paymentApproval?: (EvidenceStatus & { status: string }) | null;
  carrierEvidence?: (EvidenceStatus & { result: string; adultSignature: boolean; packageMarkings?: string[] }) | null;
};

export type DecisionOutput = {
  result: ComplianceResult;
  reasonCodes: string[];
  ruleIds: string[];
  policyVersion: string | null;
  policyHash: string | null;
  evaluatedAt: string;
};
