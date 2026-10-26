import type { DotTone } from "@/features/platform/components/vape-primitives";

/** The compliance facts the list needs per product, reduced from getProductCompliance on the server. */
export type ProductComplianceSummary = {
  regulated: boolean;
  publishIssue: string | null;
  pendingReview: boolean;
};

export type ComplianceById = Record<string, ProductComplianceSummary | null>;

type ListProduct = {
  id: string;
  status: string;
  productVariants?: Array<{ inventoryQuantity?: number | null; manageInventory?: boolean | null }>;
};

export function complianceStamp(summary: ProductComplianceSummary | null | undefined): { tone: DotTone; label: string } {
  if (!summary) return { tone: "muted", label: "Unchecked" };
  if (!summary.regulated) return { tone: "muted", label: "Exempt" };
  if (!summary.publishIssue) return { tone: "ok", label: "Cleared" };
  if (summary.pendingReview) return { tone: "warn", label: "Pending review" };
  return { tone: "danger", label: "Blocked" };
}

export function stockOf(product: ListProduct) {
  const tracked = (product.productVariants || []).filter((variant) => variant.manageInventory);
  const total = tracked.reduce((sum, variant) => sum + (Number(variant.inventoryQuantity) || 0), 0);
  return { tracked: tracked.length, total };
}

export type Blocker = {
  rank: number;
  reason: string;
  fixLabel: string;
  fixHref: string;
};

/** Why a product is not on sale right now, most severe first. Null when it is selling. */
export function blockerFor(product: ListProduct, summary: ProductComplianceSummary | null | undefined): Blocker | null {
  const detail = `/dashboard/platform/products/${product.id}`;
  const issue = summary?.publishIssue ?? null;
  if (product.status === "published" && issue) {
    return { rank: 0, reason: issue, fixLabel: "Fix evidence", fixHref: detail };
  }
  if (product.status === "rejected") {
    return { rank: 1, reason: issue ? `Rejected. ${issue}` : "Publication rejected", fixLabel: "Review", fixHref: detail };
  }
  if (issue) {
    return { rank: 2, reason: issue, fixLabel: summary?.pendingReview ? "Finish review" : "Add evidence", fixHref: detail };
  }
  const stock = stockOf(product);
  if (product.status === "published" && stock.tracked > 0 && stock.total <= 0) {
    return { rank: 3, reason: "Out of stock", fixLabel: "Adjust stock", fixHref: "/dashboard/platform/inventory" };
  }
  if (product.status === "draft" || product.status === "proposed") {
    return {
      rank: 4,
      reason: summary ? "Evidence cleared, not published" : "Not published",
      fixLabel: "Publish",
      fixHref: detail,
    };
  }
  return null;
}
