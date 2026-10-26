import Link from "next/link";

import {
  DataTable,
  ListBand,
  SectionTitle,
  Stamp,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
} from "@/features/platform/components/vape-ui";
import { CLASSIFICATION_STATUS_LABELS } from "@/features/keystone/regulated/labels";
import type { BlockedProduct } from "@/features/platform/overview/actions/overview";
import { cn } from "@/lib/utils";

export type HeldOrder = {
  id: string;
  displayId?: number | string | null;
  total?: string | null;
  createdAt: string;
  email?: string | null;
};

export type SalesWindow = { label: string; value: string; orders: number };

function shortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function classificationLabel(state: string) {
  if (state === "missing") return "Not classified";
  return CLASSIFICATION_STATUS_LABELS[state] ?? state;
}

/** Today / last 7 days sales as one quiet strip. */
export function SalesNow({ windows }: { windows: SalesWindow[] }) {
  if (windows.length === 0) return null;
  return (
    <ListBand className="grid grid-cols-2 divide-y-0">
      {windows.map((window, index) => (
        <div key={window.label} className={cn("min-w-0 px-4 py-3", index === 0 && "border-r border-border")}>
          <p className="text-[12px] font-medium text-muted-foreground">{window.label}</p>
          <p className="mt-0.5 truncate text-xl font-semibold tabular-nums text-foreground">{window.value}</p>
          <p className="text-[12px] tabular-nums text-muted-foreground">
            {window.orders} {window.orders === 1 ? "order" : "orders"}
          </p>
        </div>
      ))}
    </ListBand>
  );
}

const HELD_ORDERS_HREF = `/dashboard/platform/orders?${new URLSearchParams({
  "!status_matches": JSON.stringify(["requires_action"]),
}).toString()}`;

/**
 * What is blocking revenue right now, as counts with one fix each: blocked regulated products first, then held
 * orders. The records themselves live on Products, Product Evidence and Orders.
 */
export function RevenueBlockers({
  blocked,
  held,
}: {
  blocked: { count: number; capped: boolean; products: BlockedProduct[] } | null;
  held: HeldOrder[];
}) {
  const blockedCount = blocked?.count ?? 0;
  const total = blockedCount + held.length;
  const meta = blocked
    ? `${total}${blocked.capped ? "+" : ""}`
    : held.length > 0
      ? `${held.length} held`
      : undefined;

  // Group the sampled blocked products by why their variants hold them back.
  const reasons = new Map<string, number>();
  for (const product of blocked?.products ?? []) {
    const states = new Set(product.variants.map((variant) => classificationLabel(variant.state)));
    for (const state of states) reasons.set(state, (reasons.get(state) ?? 0) + 1);
  }
  const sampledAll = !blocked?.capped && (blocked?.products.length ?? 0) === blockedCount;
  const reasonText = !sampledAll ? "" : [...reasons.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([state, count]) => `${count} ${state.toLowerCase()}`)
    .join(", ");
  const oldestHeld = held.reduce<string | null>(
    (oldest, order) => (!oldest || order.createdAt < oldest ? order.createdAt : oldest),
    null
  );

  return (
    <section aria-label="Blocking revenue" className="min-w-0">
      <SectionTitle meta={meta}>Blocking revenue</SectionTitle>
      {blocked === null && (
        <p className="mb-2 text-[13px] text-muted-foreground">Blocked products unavailable</p>
      )}
      {total === 0 ? (
        <ListBand>
          <p className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
            <StatusWord tone="ok">Nothing blocking sales</StatusWord>
          </p>
        </ListBand>
      ) : (
        <DataTable aria-label="Records blocking revenue">
          <thead>
            <tr>
              <Th align="right" className="w-0">
                Count
              </Th>
              <Th>Blocked by</Th>
              <Th align="right">
                <span className="sr-only">Fix</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {blockedCount > 0 && (
              <Tr>
                <Td align="right" className="w-0 font-medium">
                  {blockedCount}
                  {blocked?.capped ? "+" : ""}
                </Td>
                <Td className="max-w-0">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <Stamp tone="danger">Blocked</Stamp>
                    <span className="min-w-0 truncate text-muted-foreground">
                      {blockedCount === 1 ? "product" : "products"} without current classification
                      {reasonText ? ` (${reasonText})` : ""}
                    </span>
                  </span>
                </Td>
                <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                  <Link href="/dashboard/platform/product-evidence" className={cn(buttonClass.base, buttonClass.outline)}>
                    Classify in Product Evidence
                  </Link>
                </Td>
              </Tr>
            )}
            {held.length > 0 && (
              <Tr>
                <Td align="right" className="w-0 font-medium">
                  {held.length}
                </Td>
                <Td className="max-w-0">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <StatusWord tone="warn">Held</StatusWord>
                    <span className="min-w-0 truncate tabular-nums text-muted-foreground">
                      {held.length === 1 ? "order requires" : "orders require"} action
                      {oldestHeld ? `, oldest since ${shortDate(oldestHeld)}` : ""}
                    </span>
                  </span>
                </Td>
                <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                  <Link href={HELD_ORDERS_HREF} className={cn(buttonClass.base, buttonClass.outline)}>
                    Review held orders
                  </Link>
                </Td>
              </Tr>
            )}
          </tbody>
        </DataTable>
      )}
    </section>
  );
}
