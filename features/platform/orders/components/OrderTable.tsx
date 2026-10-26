"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
} from "@/features/platform/components/vape-ui";
import { cn } from "@/lib/utils";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { CreateClaimModal } from "./modals/CreateClaimModal";
import { CreateReturnModal } from "./modals/CreateReturnModal";
import {
  ageLabel,
  customerName,
  fulfilmentState,
  isHeld,
  orderStatusLabel,
  orderStatusTone,
  paymentState,
  shipToRegion,
  shortDate,
} from "../lib/order-state";

/** Row menu keeping the list's edit / claim / return workflows. */
function OrderRowActions({ order }: { order: any }) {
  const [editOpen, setEditOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for order ${order.displayId}`}
            className={cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10")}
          >
            <MoreHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-md">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit Order</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setClaimOpen(true)}>Start Claim</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReturnOpen(true)}>Start Return</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditItemDrawerClientWrapper
        listKey="orders"
        itemId={order.id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <CreateClaimModal isOpen={claimOpen} onClose={() => setClaimOpen(false)} order={order} />
      <CreateReturnModal isOpen={returnOpen} onClose={() => setReturnOpen(false)} order={order} />
    </>
  );
}

const orderHref = (order: any) => `/dashboard/platform/orders/${order.id}`;

/** Full order table: one row per order, status columns in words. */
export function OrderTable({ orders }: { orders: any[] }) {
  return (
    <DataTable aria-label="Orders">
      <thead>
        <tr>
          <Th>Order</Th>
          <Th priority={2}>Date</Th>
          <Th>Customer</Th>
          <Th priority={3}>Ship to</Th>
          <Th priority={2}>Status</Th>
          <Th>Payment</Th>
          <Th priority={2}>Fulfilment</Th>
          <Th align="right">Total</Th>
          <Th className="w-10"><span className="sr-only">Actions</span></Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const pay = paymentState(order.paymentDetails);
          const ful = fulfilmentState(order.fulfillmentStatus);
          return (
            <Tr key={order.id}>
              <Td className="whitespace-nowrap">
                <Link
                  href={orderHref(order)}
                  className="font-mono font-medium tabular-nums text-foreground underline-offset-4 hover:underline"
                >
                  #{order.displayId}
                </Link>
                <div className="text-[12px] text-muted-foreground md:hidden">{shortDate(order.createdAt)}</div>
              </Td>
              <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">
                {shortDate(order.createdAt)}
              </Td>
              <Td className="max-w-[14rem]">
                <div className="truncate text-foreground">{customerName(order)}</div>
                <div className="truncate text-[12px] text-muted-foreground lg:hidden">
                  {shipToRegion(order.shippingAddress) ?? "No address"}
                </div>
              </Td>
              <Td priority={3} className="max-w-[12rem] truncate text-muted-foreground">
                {shipToRegion(order.shippingAddress) ?? "No address"}
              </Td>
              <Td priority={2}>
                <StatusWord tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</StatusWord>
              </Td>
              <Td>
                <StatusWord tone={pay.tone}>{pay.label}</StatusWord>
              </Td>
              <Td priority={2}>
                <StatusWord tone={ful.tone}>{ful.label}</StatusWord>
              </Td>
              <Td align="right" className="whitespace-nowrap font-medium text-foreground">
                {order.total}
              </Td>
              <Td className="w-10 pr-2">
                <OrderRowActions order={order} />
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}

/**
 * "Needs you" queue: held orders first, then paid orders waiting to ship, oldest first.
 * Built from the orders already on this page.
 */
export function OrderQueue({ orders }: { orders: any[] }) {
  return (
    <DataTable aria-label="Orders needing action">
      <thead>
        <tr>
          <Th>Order</Th>
          <Th>Needs</Th>
          <Th priority={2}>Waiting</Th>
          <Th priority={2}>Customer</Th>
          <Th priority={3}>Ship to</Th>
          <Th align="right" priority={3}>Total</Th>
          <Th align="right"><span className="sr-only">Next step</span></Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const held = isHeld(order);
          return (
            <Tr key={order.id}>
              <Td className="whitespace-nowrap">
                <Link
                  href={orderHref(order)}
                  className="font-mono font-medium tabular-nums text-foreground underline-offset-4 hover:underline"
                >
                  #{order.displayId}
                </Link>
              </Td>
              <Td>
                {held ? (
                  <StatusWord tone="warn">Held, needs action</StatusWord>
                ) : (
                  <StatusWord tone="ok">Paid, ready to ship</StatusWord>
                )}
              </Td>
              <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">
                {ageLabel(order.createdAt)}
              </Td>
              <Td priority={2} className="max-w-[14rem] truncate text-foreground">{customerName(order)}</Td>
              <Td priority={3} className="max-w-[12rem] truncate text-muted-foreground">
                {shipToRegion(order.shippingAddress) ?? "No address"}
              </Td>
              <Td align="right" priority={3} className="whitespace-nowrap text-foreground">
                {order.total}
              </Td>
              <Td align="right" className="whitespace-nowrap">
                <Link
                  href={held ? orderHref(order) : `${orderHref(order)}/fulfill`}
                  className={cn(buttonClass.base, held ? buttonClass.outline : buttonClass.primary)}
                >
                  {held ? "Review" : "Fulfil"}
                </Link>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
