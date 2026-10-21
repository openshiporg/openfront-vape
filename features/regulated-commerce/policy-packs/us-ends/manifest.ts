import type { Rule } from "../../core/decision-types";

export const US_ENDS_POLICY_PACK = {
  name: "us-ends",
  version: "0.1.0-draft",
  status: "draft" as const,
  description: "Source-backed policy vocabulary for bounded US ENDS pilots. No jurisdiction is active by default.",
  sources: [
    { id: "FDA_TOBACCO_21", url: "https://www.fda.gov/tobacco-products/retail-sales-tobacco-products/tobacco-21" },
    { id: "FDA_MARKETING_ORDERS", url: "https://www.fda.gov/tobacco-products/market-and-distribute-tobacco-product/tobacco-products-marketing-orders" },
    { id: "ATF_ENDS", url: "https://www.atf.gov/alcohol-tobacco/vapes-and-e-cigarettes" },
    { id: "ATF_PACT_SELLERS", url: "https://www.atf.gov/alcohol-tobacco/prevent-all-cigarette-trafficking-pact-act/tobacco-sellers-reporting-shipping-and-tax-compliance-requirements" },
    { id: "USPS_PUBLICATION_52_47", url: "https://pe.usps.com/text/pub52/pub52c4_026.htm" },
  ],
  federalRuleTemplates: [
    { id: "US-ENDS-FEDERAL-MINIMUM-AGE", type: "minimum_age", value: 21 },
    { id: "US-ENDS-FEDERAL-ADULT-SIGNATURE", type: "adult_signature_required", minimumAge: 21 },
    {
      id: "US-ENDS-FEDERAL-PACKAGE-MARKING",
      type: "package_marking",
      markings: ["PACT_REQUIRED_MARKING"],
    },
  ] satisfies Rule[],
};
