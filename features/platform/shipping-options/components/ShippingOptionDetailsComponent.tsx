"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { StatusWord, Td, Th, Tr, type DotTone } from "../../components/vape-ui";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  Facts,
  rowIconClass,
  type QueueItem,
} from "../../regions/components/config-kit";

interface ShippingOption {
  id: string;
  name: string;
  uniqueKey: string;
  priceType: 'flat_rate' | 'calculated' | 'free';
  amount?: number;
  isReturn: boolean;
  adminOnly: boolean;
  region?: {
    id: string;
    name: string;
    code: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  fulfillmentProvider?: {
    id: string;
    name: string;
    code: string;
  };
  shippingProfile?: {
    id: string;
    name: string;
  };
  calculatedAmount?: string;
  createdAt: string;
  updatedAt?: string;
}

export const SHIPPING_OPTION_COLUMNS = 7;

export function ShippingOptionTableHead() {
  return (
    <tr>
      <Th>Option</Th>
      <Th>Status</Th>
      <Th align="right">Price</Th>
      <Th priority={2}>Region</Th>
      <Th priority={3}>Provider</Th>
      <Th priority={3}>Profile</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

/** Options that cannot quote at checkout: no region, no provider, or a flat rate without an amount. */
export function shippingOptionAttention(option: ShippingOption): QueueItem[] {
  const base = { id: option.id, record: option.name, serial: option.uniqueKey, fixLabel: "Edit" };
  const items: QueueItem[] = [];
  if (!option.region) items.push({ ...base, tone: "danger", state: "No region", issue: "Not assigned to a region" });
  if (!option.fulfillmentProvider) items.push({ ...base, tone: "warn", state: "No provider", issue: "No fulfillment provider" });
  if (option.priceType === "flat_rate" && !option.amount) items.push({ ...base, tone: "warn", state: "No price", issue: "Flat rate with no amount" });
  return items;
}

interface ShippingOptionDetailsComponentProps {
  shippingOption: ShippingOption;
  list: any;
}

export function ShippingOptionDetailsComponent({
  shippingOption,
  list,
}: ShippingOptionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const detailId = `shipping-option-${shippingOption.id}-detail`;

  // Format price display
  const formatPrice = () => {
    if (shippingOption.priceType === 'free') {
      return 'Free';
    }
    
    if (shippingOption.calculatedAmount) {
      return shippingOption.calculatedAmount;
    }
    
    if (shippingOption.amount && shippingOption.region?.currency) {
      const { symbol, code } = shippingOption.region.currency;
      const amount = shippingOption.amount / 100; // Convert from cents
      return `${symbol}${amount.toFixed(2)} ${code}`;
    }
    
    return shippingOption.priceType === 'calculated' ? 'Calculated' : 'N/A';
  };

  // Determine status
  const getStatus = (): { label: string; tone: DotTone } => {
    if (shippingOption.isReturn) return { label: 'Return', tone: 'info' };
    if (shippingOption.adminOnly) return { label: 'Admin only', tone: 'warn' };
    return { label: 'Active', tone: 'ok' };
  };

  const status = getStatus();

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/shipping-options/${shippingOption.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {shippingOption.name}
          </Link>
          <div className="mt-0.5 truncate font-mono text-[12px] text-muted-foreground">{shippingOption.uniqueKey}</div>
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td align="right" className="whitespace-nowrap">
          {formatPrice()}
          <div className="text-[12px] capitalize text-muted-foreground">{shippingOption.priceType.replace('_', ' ')}</div>
        </Td>
        <Td priority={2}>
          {shippingOption.region ? (
            <>
              {shippingOption.region.name}{" "}
              <span className="font-mono text-[12px] uppercase text-muted-foreground">{shippingOption.region.code}</span>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Td>
        <Td priority={3} className="text-muted-foreground">{shippingOption.fulfillmentProvider?.name ?? "—"}</Td>
        <Td priority={3} className="text-muted-foreground">{shippingOption.shippingProfile?.name ?? "—"}</Td>
        <ActionsCell>
          <button
            type="button"
            className={rowIconClass}
            onClick={() => setIsEditDrawerOpen(true)}
            aria-label="Edit"
          >
            <MoreVertical />
          </button>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="shipping option details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={SHIPPING_OPTION_COLUMNS}>
          <Facts
            facts={[
              { label: "Price type", value: <span className="capitalize">{shippingOption.priceType.replace('_', ' ')}</span> },
              { label: "Base amount", value: shippingOption.amount ? formatPrice() : '—' },
              { label: "Return option", value: shippingOption.isReturn ? 'Yes' : 'No' },
              { label: "Admin only", value: shippingOption.adminOnly ? 'Yes' : 'No' },
              { label: "Region", value: shippingOption.region?.name ?? '—' },
              { label: "Provider", value: shippingOption.fulfillmentProvider?.name ?? '—' },
              { label: "Profile", value: shippingOption.shippingProfile?.name ?? '—' },
              { label: "Key", value: shippingOption.uniqueKey, mono: true },
            ]}
          />
        </ExpandRow>
      )}

      {/* Edit Shipping Option Drawer */}
      <EditItemDrawerClientWrapper
        listKey="shipping-options"
        itemId={shippingOption.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          // Refresh will be handled by the parent component
        }}
      />
    </>
  );
}