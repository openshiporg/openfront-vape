"use client";

// Local building blocks for the configuration lists (regions, countries, currencies,
// discounts, gift cards, price lists, shipping, payment, stores). Built only from the
// locked vape kit: a "needs you" queue table, row action controls, an expandable
// detail row and a dense facts grid.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import {
  DataTable,
  SectionTitle,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
  type DotTone,
} from "../../components/vape-ui";
import { recordSerial } from "../../product-evidence/lib/serial";

/** Square 40px (phone) / 32px (desktop) icon control for table rows. */
export const rowIconClass = cn(
  buttonClass.base,
  buttonClass.ghost,
  "size-10 px-0 sm:size-8 sm:min-h-8"
);

/** Row actions menu trigger plus its content. */
export function RowMenu({ label = "Actions", children }: { label?: string; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={rowIconClass} aria-label={label}>
          <MoreVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Disclosure toggle for an expandable table row. */
export function ExpandToggle({
  open,
  onToggle,
  controls,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className={rowIconClass}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? `Hide ${label}` : `Show ${label}`}
      onClick={onToggle}
    >
      <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} />
    </button>
  );
}

/** Actions cell: right aligned, never wraps. */
export function ActionsCell({ children }: { children: ReactNode }) {
  return (
    <Td align="right" className="w-px whitespace-nowrap py-0.5">
      <div className="flex items-center justify-end gap-0.5">{children}</div>
    </Td>
  );
}

/** The detail row under an expanded record. */
export function ExpandRow({ id, colSpan, children }: { id: string; colSpan: number; children: ReactNode }) {
  return (
    <tr id={id} className="border-b bg-muted/25 last:border-b-0">
      <td colSpan={colSpan} className="px-4 py-4">
        {children}
      </td>
    </tr>
  );
}

export type Fact = { label: string; value: ReactNode; mono?: boolean };

/** Dense facts: sentence-case labels, two columns on phone, four on desktop. */
export function Facts({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] lg:grid-cols-4", className)}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-[12px] font-medium text-muted-foreground">{fact.label}</dt>
          <dd className={cn("mt-0.5 truncate tabular-nums text-foreground", fact.mono && "font-mono")}>
            {fact.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Small sub-table inside an expanded row. */
export function SubTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <DataTable>
      <thead>
        <tr>{head}</tr>
      </thead>
      <tbody>{children}</tbody>
    </DataTable>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function daysUntil(value?: string | null) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
}

export type QueueItem = {
  id: string;
  record: ReactNode;
  serial?: string | null;
  tone: DotTone;
  state: string;
  issue: string;
  fixLabel: string;
  /** Opens the edit drawer for this list key (defaults to the queue's listKey). */
  listKey?: string;
  /** Link instead of the edit drawer. */
  href?: string;
};

const SEVERITY: Record<DotTone, number> = { danger: 0, warn: 1, info: 2, accent: 3, ok: 4, muted: 5 };

/**
 * The "needs you" queue: records on this page that need the operator, worst first,
 * each with its fix. Renders nothing when nothing needs attention.
 */
export function NeedsYouQueue({
  listKey,
  items,
  recordLabel = "Record",
  className,
}: {
  listKey: string;
  items: QueueItem[];
  recordLabel?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState<{ id: string; listKey: string } | null>(null);
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => SEVERITY[a.tone] - SEVERITY[b.tone]);

  return (
    <section aria-label="Needs you" className={cn("px-4 md:px-6", className)}>
      <SectionTitle meta={`${sorted.length} ${sorted.length === 1 ? "record" : "records"}`}>Needs you</SectionTitle>
      <DataTable>
        <thead>
          <tr>
            <Th>{recordLabel}</Th>
            <Th>State</Th>
            <Th priority={2}>Issue</Th>
            <Th align="right">
              <span className="sr-only">Fix</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, index) => (
            <Tr key={`${item.id}-${index}`}>
              <Td className="max-w-[16rem]">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate font-medium text-foreground">{item.record}</span>
                  <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{item.serial || recordSerial(item.id)}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground md:hidden">{item.issue}</div>
              </Td>
              <Td>
                <StatusWord tone={item.tone}>{item.state}</StatusWord>
              </Td>
              <Td priority={2} className="text-muted-foreground">
                {item.issue}
              </Td>
              <Td align="right" className="w-px whitespace-nowrap py-0.5">
                {item.href ? (
                  <Link href={item.href} className={cn(buttonClass.base, buttonClass.outline)}>
                    {item.fixLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={cn(buttonClass.base, buttonClass.outline)}
                    onClick={() => setEditing({ id: item.id, listKey: item.listKey ?? listKey })}
                  >
                    {item.fixLabel}
                  </button>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </DataTable>

      {editing && (
        <EditItemDrawerClientWrapper
          listKey={editing.listKey}
          itemId={editing.id}
          open={!!editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

/** Map records to queue items, dropping the ones that need nothing. */
export function collectQueue<T>(items: T[] | undefined | null, fn: (item: T) => QueueItem | QueueItem[] | null): QueueItem[] {
  return (items ?? []).flatMap((item) => {
    const result = fn(item);
    return result === null ? [] : Array.isArray(result) ? result : [result];
  });
}
