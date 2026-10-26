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
import { blockerFor, complianceStamp, stockOf, type ComplianceById } from "./product-blockers";

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

/** Products not on sale right now, most severe first, each with the fix. */
export function BlockedQueue({ products, complianceById }: { products: any[]; complianceById: ComplianceById }) {
  const blocked = products
    .map((product) => ({ product, blocker: blockerFor(product, complianceById[product.id]) }))
    .filter((row): row is { product: any; blocker: NonNullable<ReturnType<typeof blockerFor>> } => row.blocker !== null)
    .sort((a, b) => a.blocker.rank - b.blocker.rank || String(a.product.updatedAt || "").localeCompare(String(b.product.updatedAt || "")));

  return (
    <section aria-labelledby="blocked-title" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="blocked-title" className="text-[15px] font-semibold text-foreground">
          Not on sale
        </h2>
        <span className="text-[13px] tabular-nums text-muted-foreground">
          {blocked.length} of {products.length} on this page
        </span>
      </div>
      {blocked.length === 0 ? (
        <div className="rounded-md border bg-card px-4 py-3 text-[13px] text-muted-foreground">
          Every product on this page is published, cleared and in stock
        </div>
      ) : (
        <DataTable aria-labelledby="blocked-title">
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Compliance</Th>
              <Th priority={2}>Blocked by</Th>
              <Th align="right">
                <span className="sr-only">Fix</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {blocked.map(({ product, blocker }) => {
              const stamp = complianceStamp(complianceById[product.id]);
              return (
                <Tr key={product.id}>
                  <Td className="max-w-0 w-[34%]">
                    <Link
                      href={`/dashboard/platform/products/${product.id}`}
                      className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {product.title}
                    </Link>
                    <span className="block text-[12px] text-muted-foreground md:hidden">{blocker.reason}</span>
                  </Td>
                  <Td>
                    <Stamp tone={stamp.tone}>{stamp.label}</Stamp>
                  </Td>
                  <Td priority={2} className="text-muted-foreground">
                    {blocker.reason}
                  </Td>
                  <Td align="right">
                    <Link href={blocker.fixHref} className={cn(buttonClass.base, buttonClass.outline)}>
                      {blocker.fixLabel}
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
        <Td className="max-w-0 w-[32%]">
          <Link
            href={`/dashboard/platform/products/${product.id}`}
            className="block truncate font-medium text-foreground underline-offset-4 hover:underline"
          >
            {product.title}
          </Link>
          <span className="md:hidden">
            <StatusWord tone={status.tone} className="text-[12px]">
              {status.label}
            </StatusWord>
          </span>
        </Td>
        <Td priority={2}>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td>
          <Stamp tone={stamp.tone}>{stamp.label}</Stamp>
        </Td>
        <Td align="right" priority={3}>
          {variantCount}
        </Td>
        <Td align="right">
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
        <Td align="right" className="w-0 whitespace-nowrap">
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
          <Th align="right">Stock</Th>
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
