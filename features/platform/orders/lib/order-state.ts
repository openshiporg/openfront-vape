// Order state in words, derived only from fields the order queries already load
// (status, fulfillmentStatus JSON, paymentDetails). No new fields are invented here.

import type { DotTone } from "@/features/platform/components/vape-ui";
import { orderStatusLabel, orderStatusTone } from "../components/StatusBadge";

export type StateWord = { label: string; tone: DotTone };

export { orderStatusLabel, orderStatusTone };

type FulfilmentJson = {
  status?: string;
  shippingStatus?: string;
  remainingQuantity?: number;
  totalQuantity?: number;
  fulfilledQuantity?: number;
} | null | undefined;

function fulfilmentObject(value: unknown): FulfilmentJson {
  if (!value) return null;
  if (typeof value === "string") return { status: value };
  if (typeof value === "object") return value as FulfilmentJson;
  return null;
}

export function fulfilmentState(value: unknown): StateWord & { key: string } {
  const f = fulfilmentObject(value);
  switch (f?.status) {
    case "fulfilled":
      return f.shippingStatus === "shipped"
        ? { key: "shipped", label: "Shipped", tone: "ok" }
        : { key: "fulfilled", label: "Fulfilled", tone: "ok" };
    case "partially_fulfilled":
      return { key: "partial", label: "Partly fulfilled", tone: "info" };
    case "not_fulfilled":
      return { key: "unfulfilled", label: "Unfulfilled", tone: "warn" };
    default:
      return { key: "unknown", label: "No fulfilment data", tone: "muted" };
  }
}

export function isUnfulfilled(value: unknown) {
  const key = fulfilmentState(value).key;
  return key === "unfulfilled" || key === "partial";
}

type PaymentRow = { status?: string } | null | undefined;

export function paymentState(details: unknown): StateWord & { key: string } {
  const rows: PaymentRow[] = Array.isArray(details) ? details : [];
  if (rows.length === 0) return { key: "none", label: "No payment", tone: "muted" };
  const has = (s: string) => rows.some((row) => row?.status === s);
  if (has("captured")) return { key: "captured", label: "Paid", tone: "ok" };
  if (has("authorized")) return { key: "authorized", label: "Authorized", tone: "info" };
  if (has("pending")) return { key: "pending", label: "Payment pending", tone: "warn" };
  if (has("failed")) return { key: "failed", label: "Payment failed", tone: "danger" };
  if (has("canceled")) return { key: "canceled", label: "Payment canceled", tone: "muted" };
  return { key: "unknown", label: "Payment unknown", tone: "muted" };
}

export function isPaid(details: unknown) {
  const key = paymentState(details).key;
  return key === "captured" || key === "authorized";
}

/** Open order, payment captured or authorized, items still to fulfil. */
export function isReadyToShip(order: any) {
  return order?.status === "pending" && isPaid(order?.paymentDetails) && isUnfulfilled(order?.fulfillmentStatus);
}

export function isHeld(order: any) {
  return order?.status === "requires_action";
}

export function shipToRegion(address: any): string | null {
  if (!address) return null;
  const parts = [address.city, address.province].filter(Boolean).join(", ");
  return parts || address.postalCode || null;
}

export function customerName(order: any): string {
  return order?.user?.name || order?.user?.email || order?.email || "Guest";
}

export function shortDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function daysSince(value?: string) {
  if (!value) return null;
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  return days < 0 ? 0 : days;
}

export function ageLabel(value?: string) {
  const days = daysSince(value);
  if (days == null) return "";
  if (days === 0) return "Today";
  return `${days}d`;
}
