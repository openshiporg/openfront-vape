"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DataTable,
  Stamp,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
} from "@/features/platform/components/vape-ui";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ProductSectionTabs } from "./ProductSectionTabs";
import { productStatusConfig } from "./StatusBadge";
import { blockerFor, complianceStamp, stockOf, type Blocker, type ComplianceById } from "./product-blockers";
import { recordSerial } from "../../product-evidence/lib/serial";

const iconButton = cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10");

function statusOf(status: string) {
  return (
    productStatusConfig[status as keyof typeof productStatusConfig] ?? { label: status || "Unknown", tone: "muted" as const }
  );
}

function day(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const EVIDENCE_HREF = "/dashboard/platform/product-evidence";

function statusHref(status: string) {
  return `/dashboard/platform/products?${new URLSearchParams({ "!status_matches": JSON.stringify([status]) }).toString()}`;
}

/** One action for every product sharing a blocking reason; a lone product keeps its own fix. */
function groupFix(blocker: Blocker, count: number, firstHref: string) {
  if (count === 1) return { label: blocker.fixLabel, href: firstHref };
  if (blocker.rank === 3) return { label: blocker.fixLabel, href: blocker.fixHref };
  if (blocker.rank === 1) return { label: "Review rejected", href: statusHref("rejected") };
  if (blocker.rank === 4) return { label: "Publish drafts", href: statusHref("draft") };
  if (/classification/i.test(blocker.reason)) return { label: "Classify in Product Evidence", href: EVIDENCE_HREF };
  if (/authori[sz]ation/i.test(blocker.reason)) return { label: "Add authorization in Product Evidence", href: EVIDENCE_HREF };
  return { label: "Open Product Evidence", href: EVIDENCE_HREF };
}

/** Why products on this page are not on sale, one row per distinct reason, most severe first. */
export function BlockedQueue({ products, complianceById }: { products: any[]; complianceById: ComplianceById }) {
  const groups = new Map<string, { blocker: Blocker; count: number; firstHref: string }>();
  for (const product of products) {
    const blocker = blockerFor(product, complianceById[product.id]);
    if (!blocker) continue;
    const key = `${blocker.rank}|${blocker.reason}`;
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { blocker, count: 1, firstHref: blocker.fixHref });
  }
  const rows = [...groups.values()].sort((a, b) => a.blocker.rank - b.blocker.rank || b.count - a.count);
  const blockedCount = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section aria-labelledby="blocked-title" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="blocked-title" className="text-[15px] font-semibold text-foreground">
          Not on sale
        </h2>
        <span className="text-[13px] tabular-nums text-muted-foreground">
          {blockedCount} of {products.length} on this page
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-md border bg-card px-4 py-3 text-[13px] text-muted-foreground">
          Every product on this page is published, cleared and in stock
        </div>
      ) : (
        <DataTable aria-labelledby="blocked-title">
          <thead>
            <tr>
              <Th align="right" className="w-0">
                Products
              </Th>
              <Th>Blocked by</Th>
              <Th align="right">
                <span className="sr-only">Fix</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ blocker, count, firstHref }) => {
              const fix = groupFix(blocker, count, firstHref);
              return (
                <Tr key={`${blocker.rank}|${blocker.reason}`}>
                  <Td align="right" className="w-0 font-medium">
                    {count}
                  </Td>
                  <Td className="max-md:whitespace-normal md:max-w-0">
                    <span className="block text-foreground md:truncate" title={blocker.reason}>
                      {blocker.reason}
                    </span>
                  </Td>
                  <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                    <Link href={fix.href} className={cn(buttonClass.base, buttonClass.outline)} aria-label={fix.label}>
                      <span className="max-md:hidden">{fix.label}</span>
                      <span className="md:hidden">Fix</span>
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </DataTable>
      )}
    </section>
  );
}

function ProductRow({ product, compliance }: { product: any; compliance: ComplianceById[string] | undefined }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const status = statusOf(product.status);
  const stamp = complianceStamp(compliance);
  const variantCount = product.productVariants?.length || 0;
  const stock = stockOf(product);
  const stockTone = stock.tracked === 0 ? "muted" : stock.total <= 0 ? "danger" : "ok";

  return (
    <Fragment>
      <Tr>
        <Td className="w-[32%] max-md:min-w-[10rem] md:max-w-0">
          <span className="flex min-w-0 items-baseline gap-2">
            <Link
              href={`/dashboard/platform/products/${product.id}`}
              className="truncate font-medium text-foreground underline-offset-4 hover:underline"
            >
              {product.title}
            </Link>
            <span className="shrink-0 md:hidden">
              <StatusWord tone={status.tone} className="text-[12px]">
                {status.label}
              </StatusWord>
            </span>
          </span>
        </Td>
        <Td priority={2}>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td>
          <Stamp tone={stamp.tone} serial={recordSerial(product.id)}>
            {stamp.label}
          </Stamp>
        </Td>
        <Td align="right" priority={3}>
          {variantCount}
        </Td>
        <Td align="right" priority={2}>
          {stock.tracked === 0 ? (
            <span className="text-muted-foreground">Not tracked</span>
          ) : (
            <StatusWord tone={stockTone} className="justify-end">
              {stock.total}
            </StatusWord>
          )}
        </Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">
          {day(product.updatedAt || product.createdAt)}
        </Td>
        <Td align="right" className="w-0 whitespace-nowrap py-0.5">
          <span className="inline-flex items-center gap-1">
            <button type="button" aria-label="Edit product" className={iconButton} onClick={() => setEditing(true)}>
              <MoreVertical />
            </button>
            <button
              type="button"
              aria-label={open ? "Hide variants" : "Show variants"}
              aria-expanded={open}
              className={iconButton}
              onClick={() => setOpen((value) => !value)}
            >
              <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </button>
          </span>
        </Td>
      </Tr>
      {open && (
        <tr className="border-b last:border-b-0">
          <td colSpan={7} className="p-0">
            {variantCount > 0 ? (
              <ProductSectionTabs product={product} />
            ) : (
              <div className="bg-muted/30 px-4 py-3 text-[13px] text-muted-foreground">No variants</div>
            )}
          </td>
        </tr>
      )}
      {editing && (
        <EditItemDrawerClientWrapper
          listKey="products"
          itemId={product.id}
          open={editing}
          onClose={() => setEditing(false)}
        />
      )}
    </Fragment>
  );
}

export function ProductTable({ products, complianceById }: { products: any[]; complianceById: ComplianceById }) {
  return (
    <DataTable aria-label="Products">
      <thead>
        <tr>
          <Th>Product</Th>
          <Th priority={2}>Status</Th>
          <Th>Compliance</Th>
          <Th align="right" priority={3}>
            Variants
          </Th>
          <Th align="right" priority={2}>Stock</Th>
          <Th priority={3}>Updated</Th>
          <Th align="right">
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} compliance={complianceById[product.id]} />
        ))}
      </tbody>
    </DataTable>
  );
}
