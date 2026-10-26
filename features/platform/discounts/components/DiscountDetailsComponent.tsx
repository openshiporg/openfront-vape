"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { StatusWord, Td, Th, Tr, type DotTone } from "../../components/vape-ui";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  Facts,
  RowMenu,
  SubTable,
  daysUntil,
  formatDate,
  type QueueItem,
} from "../../regions/components/config-kit";
import { Discount } from "../actions";

interface DiscountDetailsComponentProps {
  discount: Discount;
  list: any;
}

export const DISCOUNT_COLUMNS = 7;

export function DiscountTableHead() {
  return (
    <tr>
      <Th>Code</Th>
      <Th>Status</Th>
      <Th priority={2}>Value</Th>
      <Th priority={2} align="right">Uses</Th>
      <Th priority={3}>Ends</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

function isExhausted(discount: Discount) {
  return !!discount.usageLimit && (discount.usageCount || 0) >= discount.usageLimit;
}

export function discountStatus(discount: Discount): { tone: DotTone; label: string } {
  if (discount.isDisabled) return { tone: "muted", label: "Disabled" };
  if (discount.endsAt && new Date(discount.endsAt) <= new Date()) return { tone: "danger", label: "Expired" };
  if (isExhausted(discount)) return { tone: "danger", label: "Used up" };
  if (discount.startsAt && new Date(discount.startsAt) > new Date()) return { tone: "info", label: "Scheduled" };
  return { tone: "ok", label: "Active" };
}

/** Why an enabled discount needs the operator, if it does. */
export function discountAttention(discount: Discount): QueueItem | null {
  if (discount.isDisabled) return null;
  const base = { id: discount.id, record: discount.code, fixLabel: "Edit" };
  const status = discountStatus(discount);
  if (status.label === "Expired") {
    return { ...base, tone: "danger", state: "Expired", issue: `Ended ${formatDate(discount.endsAt)}, still enabled` };
  }
  if (status.label === "Used up") {
    return { ...base, tone: "danger", state: "Used up", issue: `Usage limit ${discount.usageLimit} reached, still enabled` };
  }
  if (!discount.discountRule) {
    return { ...base, tone: "warn", state: "No rule", issue: "No discount rule set" };
  }
  const days = daysUntil(discount.endsAt);
  if (days !== null && days <= 7) {
    return { ...base, tone: "warn", state: "Ending soon", issue: `Ends in ${days} ${days === 1 ? "day" : "days"}` };
  }
  if (discount.usageLimit && (discount.usageCount || 0) / discount.usageLimit >= 0.9) {
    return { ...base, tone: "warn", state: "Near limit", issue: `${discount.usageCount || 0} of ${discount.usageLimit} uses` };
  }
  return null;
}

export function DiscountDetailsComponent({ discount, list }: DiscountDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const status = discountStatus(discount);
  const detailId = `discount-${discount.id}-detail`;

  const valueLabel = discount.discountRule
    ? discount.discountRule.type === 'percentage'
      ? `${discount.discountRule.value}% off`
      : discount.discountRule.type === 'fixed'
      ? `$${discount.discountRule.value} off`
      : 'Free shipping'
    : null;

  return (
    <>
      <Tr>
        <Td className="max-w-[14rem]">
          <Link
            href={`/dashboard/platform/discounts?focus=${discount.id}`}
            className="font-mono text-[13px] font-semibold text-foreground hover:underline"
          >
            {discount.code}
          </Link>
          {discount.discountRule?.description && (
            <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{discount.discountRule.description}</div>
          )}
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td priority={2} className="whitespace-nowrap tabular-nums">{valueLabel ?? <span className="text-muted-foreground">No rule</span>}</Td>
        <Td priority={2} align="right" className="whitespace-nowrap">
          {discount.usageCount || 0}
          {discount.usageLimit ? <span className="text-muted-foreground"> / {discount.usageLimit}</span> : null}
        </Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(discount.endsAt) ?? "No end"}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(discount.createdAt)}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Discount
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="discount details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={DISCOUNT_COLUMNS}>
          <div className="space-y-4">
            <Facts
              facts={[
                { label: "Type", value: <span className="capitalize">{discount.discountRule?.type || '—'}</span> },
                {
                  label: "Value",
                  value: discount.discountRule?.value
                    ? discount.discountRule.type === 'percentage'
                      ? `${discount.discountRule.value}%`
                      : `$${discount.discountRule.value}`
                    : '—',
                },
                { label: "Uses", value: `${discount.usageCount || 0}${discount.usageLimit ? ` of ${discount.usageLimit}` : ''}` },
                { label: "Stackable", value: discount.stackable ? "Yes" : "No" },
                { label: "Starts", value: formatDate(discount.startsAt) ?? '—' },
                { label: "Ends", value: formatDate(discount.endsAt) ?? 'No end' },
                { label: "Created", value: formatDate(discount.createdAt) },
              ]}
            />

            {discount.orders && discount.orders.length > 0 && (
              <div>
                <div className="mb-2 text-[12px] font-medium text-muted-foreground">
                  Recent orders <span className="tabular-nums">{discount.orders.length}</span>
                </div>
                <SubTable
                  head={
                    <>
                      <Th>Order</Th>
                      <Th>Customer</Th>
                      <Th align="right">Total</Th>
                    </>
                  }
                >
                  {discount.orders.slice(0, 5).map((order) => (
                    <Tr key={order.id}>
                      <Td className="font-mono">#{order.displayId}</Td>
                      <Td className="max-w-[12rem] truncate text-muted-foreground">{order.user?.name}</Td>
                      <Td align="right">{order.currency?.symbol}{order.total}</Td>
                    </Tr>
                  ))}
                </SubTable>
              </div>
            )}
          </div>
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="discounts"
        itemId={discount.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
