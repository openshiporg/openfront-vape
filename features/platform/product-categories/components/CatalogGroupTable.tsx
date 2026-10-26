"use client";

// Shared table for product groupings (categories and collections): one row per group,
// expandable to its products, with the same edit drawers the old cards used.

import React, { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DataTable,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
  type DotTone,
} from "../../components/vape-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

export type GroupProduct = {
  id: string;
  title: string;
  status: string;
  thumbnail?: string;
  productVariants?: { id: string }[];
};

const PRODUCT_STATUS: Record<string, { label: string; tone: DotTone }> = {
  published: { label: "Published", tone: "ok" },
  draft: { label: "Draft", tone: "muted" },
  proposed: { label: "Proposed", tone: "info" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const iconButtonClass = cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10");

export function productStatus(status: string) {
  return PRODUCT_STATUS[status] ?? { label: status || "Unknown", tone: "muted" as const };
}

export function shortDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function GroupTable({ label, children, extraColumn }: { label: string; children: ReactNode; extraColumn?: string }) {
  return (
    <DataTable aria-label={label}>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Status</Th>
          {extraColumn && <Th priority={2}>{extraColumn}</Th>}
          <Th align="right">Products</Th>
          <Th align="right" priority={2}>
            Published
          </Th>
          <Th priority={3}>Created</Th>
          <Th align="right">
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </DataTable>
  );
}

const PAGE = 12;

/** One grouping row; `extra` renders only when the table declares an extra column. */
export function GroupRow({
  listKey,
  id,
  title,
  href,
  handle,
  status,
  extra,
  hasExtraColumn,
  createdAt,
  products,
}: {
  listKey: string;
  id: string;
  title: string;
  href: string;
  handle?: string;
  status: { label: string; tone: DotTone };
  extra?: ReactNode;
  hasExtraColumn?: boolean;
  createdAt: string;
  products: GroupProduct[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editProductId, setEditProductId] = useState("");
  const [page, setPage] = useState(1);
  const published = products.filter((product) => product.status === "published").length;
  const start = (page - 1) * PAGE;
  const visible = products.slice(start, start + PAGE);
  const columns = hasExtraColumn ? 7 : 6;

  return (
    <Fragment>
      <Tr>
        <Td className="max-w-0 w-[34%]">
          <Link href={href} className="block truncate font-medium text-foreground underline-offset-4 hover:underline">
            {title}
          </Link>
          {handle && <span className="block truncate font-mono text-[12px] text-muted-foreground">{handle}</span>}
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        {hasExtraColumn && (
          <Td priority={2} className="text-muted-foreground">
            {extra ?? "-"}
          </Td>
        )}
        <Td align="right">{products.length}</Td>
        <Td align="right" priority={2}>
          {published}
        </Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">
          {shortDate(createdAt)}
        </Td>
        <Td align="right" className="w-0 whitespace-nowrap">
          <span className="inline-flex items-center gap-1">
            <button type="button" aria-label="Edit" className={iconButtonClass} onClick={() => setEditing(true)}>
              <MoreVertical />
            </button>
            <button
              type="button"
              aria-label={open ? "Hide products" : "Show products"}
              aria-expanded={open}
              className={iconButtonClass}
              onClick={() => setOpen((value) => !value)}
            >
              <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </button>
          </span>
        </Td>
      </Tr>
      {open && (
        <tr className="border-b bg-muted/20 last:border-b-0">
          <td colSpan={columns} className="px-4 py-3">
            {products.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No products</p>
            ) : (
              <div className="space-y-2">
                {products.length > PAGE && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] tabular-nums text-muted-foreground">
                      {start + 1}-{Math.min(start + PAGE, products.length)} of {products.length}
                    </span>
                    <ItemPagination currentPage={page} totalItems={products.length} itemsPerPage={PAGE} onPageChange={setPage} />
                  </div>
                )}
                <ul className="divide-y divide-border rounded-md border bg-card">
                  {visible.map((product) => {
                    const state = productStatus(product.status);
                    const variants = product.productVariants?.length ?? 0;
                    return (
                      <li key={product.id} className="flex min-h-10 items-center gap-3 px-3 py-1.5">
                        <Link
                          href={`/dashboard/platform/products/${product.id}`}
                          className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {product.title}
                        </Link>
                        <StatusWord tone={state.tone} className="text-[12px]">
                          {state.label}
                        </StatusWord>
                        <span className="w-20 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground max-sm:hidden">
                          {variants} variant{variants !== 1 ? "s" : ""}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className={iconButtonClass} aria-label="Product actions">
                              <MoreVertical />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditProductId(product.id)}>Edit product</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </td>
        </tr>
      )}
      {editing && (
        <EditItemDrawerClientWrapper listKey={listKey} itemId={id} open={editing} onClose={() => setEditing(false)} />
      )}
      {editProductId && (
        <EditItemDrawerClientWrapper
          listKey="products"
          itemId={editProductId}
          open={!!editProductId}
          onClose={() => setEditProductId("")}
        />
      )}
    </Fragment>
  );
}

export type QueueRow = { id: string; title: string; href: string; reason: string; tone: DotTone; state: string };

/** "Needs you" for groupings: live groups with nothing to sell, hidden groups still holding products. */
export function GroupQueue({
  title,
  rows,
}: {
  title: string;
  rows: QueueRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <section aria-label={title} className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <span className="text-[13px] tabular-nums text-muted-foreground">{rows.length}</span>
      </div>
      <DataTable aria-label={title}>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th priority={2}>Why</Th>
            <Th align="right">
              <span className="sr-only">Fix</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.id}>
              <Td className="max-w-0 w-[34%]">
                <span className="block truncate font-medium text-foreground">{row.title}</span>
                <span className="block text-[12px] text-muted-foreground md:hidden">{row.reason}</span>
              </Td>
              <Td>
                <StatusWord tone={row.tone}>{row.state}</StatusWord>
              </Td>
              <Td priority={2} className="text-muted-foreground">
                {row.reason}
              </Td>
              <Td align="right">
                <Link href={row.href} className={cn(buttonClass.base, buttonClass.outline)}>
                  Open
                </Link>
              </Td>
            </Tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}
