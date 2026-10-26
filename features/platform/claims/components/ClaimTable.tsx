"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  DataTable,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
  type DotTone,
} from "../../components/vape-ui";
import { cn } from "@/lib/utils";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

type Word = { label: string; tone: DotTone };

const FULFILMENT: Record<string, Word> = {
  not_fulfilled: { label: "Not fulfilled", tone: "warn" },
  partially_fulfilled: { label: "Partly fulfilled", tone: "info" },
  fulfilled: { label: "Fulfilled", tone: "ok" },
  partially_shipped: { label: "Partly shipped", tone: "info" },
  shipped: { label: "Shipped", tone: "ok" },
  partially_returned: { label: "Partly returned", tone: "info" },
  returned: { label: "Returned", tone: "ok" },
  canceled: { label: "Canceled", tone: "muted" },
  requires_action: { label: "Requires action", tone: "warn" },
};

const PAYMENT: Record<string, Word> = {
  na: { label: "No refund", tone: "muted" },
  not_refunded: { label: "Not refunded", tone: "warn" },
  refunded: { label: "Refunded", tone: "ok" },
};

export function claimFulfilment(claim: any): Word {
  if (claim?.canceledAt) return { label: "Canceled", tone: "muted" };
  return FULFILMENT[claim?.fulfillmentStatus] ?? { label: "Unknown", tone: "muted" };
}

export function claimPayment(claim: any): Word {
  return PAYMENT[claim?.paymentStatus] ?? { label: "Unknown", tone: "muted" };
}

/** Why a claim is waiting on the operator, or null when it isn't. */
export function claimNeed(claim: any): Word | null {
  if (!claim || claim.canceledAt) return null;
  if (claim.fulfillmentStatus === "requires_action") return { label: "Requires action", tone: "danger" };
  if (claim.type === "refund" && claim.paymentStatus === "not_refunded") return { label: "Refund to issue", tone: "warn" };
  if (claim.type === "replace" && claim.fulfillmentStatus === "not_fulfilled") return { label: "Replacement to ship", tone: "warn" };
  return null;
}

const claimHref = (claim: any) => `/dashboard/claim-orders/${claim.id}`;
const shortDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date";
const waiting = (value?: string) => {
  if (!value) return "";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  return days === 0 ? "Today" : `${days}d`;
};
const typeLabel = (type?: string) => (type === "refund" ? "Refund" : type === "replace" ? "Replacement" : "Claim");

function OrderCell({ claim }: { claim: any }) {
  if (!claim.order) return <span className="text-muted-foreground">No order</span>;
  return (
    <Link
      href={`/dashboard/platform/orders/${claim.order.id}`}
      className="font-mono tabular-nums text-foreground underline-offset-4 hover:underline"
    >
      #{claim.order.displayId}
    </Link>
  );
}

function ClaimIdLink({ claim }: { claim: any }) {
  return (
    <Link href={claimHref(claim)} className="font-mono font-medium tabular-nums text-foreground underline-offset-4 hover:underline">
      {claim.id.slice(-8)}
    </Link>
  );
}

function EditButton({ claim }: { claim: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Edit"
        onClick={() => setOpen(true)}
        className={cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10")}
      >
        <Pencil />
      </button>
      <EditItemDrawerClientWrapper listKey="claims" itemId={claim.id} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ClaimQueue({ claims }: { claims: any[] }) {
  return (
    <DataTable aria-label="Claims needing action">
      <thead>
        <tr>
          <Th>Claim</Th>
          <Th>Needs</Th>
          <Th priority={2}>Order</Th>
          <Th priority={2}>Waiting</Th>
          <Th align="right"><span className="sr-only">Next step</span></Th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => {
          const need = claimNeed(claim)!;
          return (
            <Tr key={claim.id}>
              <Td><ClaimIdLink claim={claim} /></Td>
              <Td><StatusWord tone={need.tone}>{need.label}</StatusWord></Td>
              <Td priority={2}><OrderCell claim={claim} /></Td>
              <Td priority={2} className="tabular-nums text-muted-foreground">{waiting(claim.createdAt)}</Td>
              <Td align="right">
                <Link href={claimHref(claim)} className={cn(buttonClass.base, buttonClass.outline)}>
                  Open
                </Link>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}

export function ClaimTable({ claims }: { claims: any[] }) {
  return (
    <DataTable aria-label="Claims">
      <thead>
        <tr>
          <Th>Claim</Th>
          <Th>Type</Th>
          <Th priority={2}>Order</Th>
          <Th priority={2}>Opened</Th>
          <Th>Fulfilment</Th>
          <Th priority={3}>Refund</Th>
          <Th align="right" priority={3}>Items</Th>
          <Th className="w-10"><span className="sr-only">Actions</span></Th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => {
          const ful = claimFulfilment(claim);
          const pay = claimPayment(claim);
          const items = (claim.claimItems || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          return (
            <Tr key={claim.id}>
              <Td><ClaimIdLink claim={claim} /></Td>
              <Td className="text-foreground">{typeLabel(claim.type)}</Td>
              <Td priority={2}><OrderCell claim={claim} /></Td>
              <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">{shortDate(claim.createdAt)}</Td>
              <Td><StatusWord tone={ful.tone}>{ful.label}</StatusWord></Td>
              <Td priority={3}><StatusWord tone={pay.tone}>{pay.label}</StatusWord></Td>
              <Td align="right" priority={3}>{items}</Td>
              <Td className="w-10 pr-2"><EditButton claim={claim} /></Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
