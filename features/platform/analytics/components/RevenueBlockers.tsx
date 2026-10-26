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

/** What is blocking revenue right now: blocked regulated products first, then held orders oldest first. */
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
              <Th>Record</Th>
              <Th>State</Th>
              <Th priority={2}>Detail</Th>
              <Th align="right">Fix</Th>
            </tr>
          </thead>
          <tbody>
            {(blocked?.products ?? []).map((product) => (
              <Tr key={`p-${product.id}`}>
                <Td className="max-w-[16rem]">
                  <span className="block truncate font-medium text-foreground">{product.title}</span>
                  <span className="block font-mono text-[11px] text-muted-foreground">{product.id.slice(-8)}</span>
                </Td>
                <Td>
                  <Stamp tone="danger">Blocked</Stamp>
                </Td>
                <Td priority={2} className="text-muted-foreground">
                  {product.variants
                    .slice(0, 2)
                    .map((variant) => `${variant.label}: ${classificationLabel(variant.state)}`)
                    .join(", ")}
                  {product.variants.length > 2 && ` +${product.variants.length - 2}`}
                </Td>
                <Td align="right">
                  <Link
                    href={`/dashboard/platform/products/${product.id}`}
                    className={cn(buttonClass.base, buttonClass.outline)}
                  >
                    Classify
                  </Link>
                </Td>
              </Tr>
            ))}
            {held.map((order) => (
              <Tr key={`o-${order.id}`}>
                <Td>
                  <span className="block font-mono font-medium text-foreground">#{order.displayId ?? order.id.slice(-6)}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{order.email}</span>
                </Td>
                <Td>
                  <StatusWord tone="warn">Held</StatusWord>
                </Td>
                <Td priority={2} className="tabular-nums text-muted-foreground">
                  Requires action since {shortDate(order.createdAt)}
                  {order.total ? ` · ${order.total}` : ""}
                </Td>
                <Td align="right">
                  <Link
                    href={`/dashboard/platform/orders/${order.id}`}
                    className={cn(buttonClass.base, buttonClass.outline)}
                  >
                    Review
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
      {blocked && blocked.count > blocked.products.length && (
        <p className="mt-2 text-[13px]">
          <Link href="/dashboard/platform/products" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
            All {blocked.count}
            {blocked.capped ? "+" : ""} blocked products
          </Link>
        </p>
      )}
    </section>
  );
}
