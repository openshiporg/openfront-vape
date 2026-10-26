"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTable,
  Dot,
  ListBand,
  SectionTitle,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
} from "@/features/platform/components/vape-ui";
import { cn } from "@/lib/utils";
import {
  fulfilmentState,
  isUnfulfilled,
  orderStatusLabel,
  orderStatusTone,
  paymentState,
  type StateWord,
} from "../lib/order-state";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";


interface ExtendedOrder {
  id: string;
  displayId: string;
  status: string;
  email: string;
  createdAt: string;
  subtotal?: string;
  shipping?: string;
  tax?: string;
  total?: string;
  formattedTotalPaid?: string;
  paymentDetails?: Array<{
    status: string;
  }>;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    orders?: { id: string }[];
  };
  fulfillmentStatus?: unknown;
  billingAddress?: ExtendedOrder["shippingAddress"];
  fulfillments?: Array<{
    id: string;
    createdAt: string;
    canceledAt?: string | null;
    fulfillmentItems?: Array<{
      id: string;
      quantity: number;
      lineItem?: { id: string; title: string; variantTitle?: string };
    }>;
    shippingLabels?: Array<{
      id: string;
      labelUrl?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      carrier?: string;
    }>;
  }>;
  shippingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
    phone?: string;
    country?: { name: string };
  };
  lineItems?: Array<{
    id: string;
    title: string;
    quantity: number;
    sku?: string;
    thumbnail?: string;
    formattedUnitPrice?: string;
    formattedTotal?: string;
    variantTitle?: string;
    variantData?: any;
    productData?: any;
  }>;
  events?: Array<{
    id: string;
    type: string;
    createdAt: string;
    user?: { name: string };
  }>;
}

interface OrderPageClientProps {
  order: ExtendedOrder;
  listKey: string;
  id?: string;
  fieldModes?: Record<string, unknown>;
  fieldPositions?: Record<string, unknown>;
  uiConfig?: Record<string, unknown>;
  compliance?: ReactNode;
}

export function OrderPageClient({
  order,
  listKey,
  compliance,
}: OrderPageClientProps) {
  const [showComments, setShowComments] = useState(false);
  const [editDrawerConfig, setEditDrawerConfig] = useState<{
    open: boolean;
    listKey: string;
    itemId: string;
    fields?: string[];
  }>({
    open: false,
    listKey: '',
    itemId: '',
    fields: undefined,
  });

  if (!order) {
    return (
      <div className="p-4 md:p-6">
        <ListBand>
          <div className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
            <Dot tone="danger" />
            Order not found or you don&apos;t have access.
          </div>
        </ListBand>
      </div>
    );
  }

  const { lineItems = [] } = order;
  const pay = paymentState(order.paymentDetails);
  const ful = fulfilmentState(order.fulfillmentStatus);
  const paymentCaptured = pay.key === "captured";
  const closed = order.status === "canceled" || order.status === "archived";
  const needsFulfilment = !closed && isUnfulfilled(order.fulfillmentStatus);
  // One headline state in words, in the order an operator acts on it.
  const headline: StateWord = closed
    ? { label: orderStatusLabel(order.status), tone: orderStatusTone(order.status) }
    : order.status === "requires_action"
      ? { label: "Held, needs action", tone: "warn" }
      : needsFulfilment && (pay.key === "captured" || pay.key === "authorized")
        ? { label: ful.key === "partial" ? "Partly shipped, rest ready" : "Paid, ready to ship", tone: "ok" }
        : needsFulfilment
          ? { label: "Awaiting payment", tone: "warn" }
          : ful.key === "shipped" || ful.key === "fulfilled"
            ? { label: ful.label, tone: "ok" }
            : { label: orderStatusLabel(order.status), tone: orderStatusTone(order.status) };
  const humanize = (value: string) =>
    value.replace(/[_-]+/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "No date";
  const itemCount = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const ship = order.shippingAddress;
  const bill = order.billingAddress;
  const fulfillments = order.fulfillments || [];
  const editButton = cn(buttonClass.base, buttonClass.ghost, "min-h-7 px-2 text-[12px]");

  const renderAddress = (address: NonNullable<ExtendedOrder["shippingAddress"]>) => (
    <div className="space-y-0.5 px-4 py-3 text-sm">
      <div className="font-medium text-foreground">
        {[address.firstName, address.lastName].filter(Boolean).join(" ")}
      </div>
      {address.company && <div className="text-muted-foreground">{address.company}</div>}
      <div className="text-muted-foreground">{address.address1}</div>
      {address.address2 && <div className="text-muted-foreground">{address.address2}</div>}
      <div className="text-muted-foreground">
        {[address.city, address.province].filter(Boolean).join(", ")}{" "}
        {address.postalCode && <span className="font-mono tabular-nums">{address.postalCode}</span>}
      </div>
      {address.country?.name && <div className="text-muted-foreground">{address.country.name}</div>}
      {address.phone && <div className="text-xs tabular-nums text-muted-foreground">{address.phone}</div>}
    </div>
  );

  return (
    <div>
      <div className="max-w-6xl space-y-8 p-4 pb-24 sm:pb-10 md:p-6">
        <div className="space-y-3">
          <Link
            href="/dashboard/platform/orders"
            className="inline-flex min-h-8 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Orders
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
                  Order <span className="font-mono tabular-nums">#{order.displayId}</span>
                </h1>
                <StatusWord tone={headline.tone} className="text-[14px]">{headline.label}</StatusWord>
              </div>
              <div className="text-[13px] tabular-nums text-muted-foreground">
                Placed {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"} · {order.total}
              </div>
            </div>
            {!closed && (
              <Link
                href={`/dashboard/platform/orders/${order.id}/fulfill`}
                className={cn(
                  buttonClass.base,
                  needsFulfilment ? buttonClass.primary : buttonClass.outline,
                  "min-h-9"
                )}
              >
                {needsFulfilment ? "Fulfill items" : "View fulfilment"}
              </Link>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border bg-card px-4 py-3 text-[13px] md:grid-cols-4">
          {[
            ["Order", <StatusWord key="o" tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</StatusWord>],
            ["Payment", <StatusWord key="p" tone={pay.tone}>{pay.label}</StatusWord>],
            ["Fulfilment", <StatusWord key="f" tone={ful.tone}>{ful.label}</StatusWord>],
            ["Paid", <span key="t" className="tabular-nums text-foreground">{order.formattedTotalPaid ?? "None"}</span>],
            ["Customer", <span key="c" className="block truncate text-foreground">{order.user?.name || order.email || "Guest"}</span>],
            ["Ship to", <span key="s" className="block truncate text-foreground">{ship ? [ship.city, ship.province].filter(Boolean).join(", ") || "Address on file" : "No address"}</span>],
            ["Shipments", <span key="n" className="tabular-nums text-foreground">{fulfillments.filter((f) => !f.canceledAt).length}</span>],
            ["Total", <span key="g" className="font-medium tabular-nums text-foreground">{order.total}</span>],
          ].map(([term, value]) => (
            <div key={term as string} className="min-w-0">
              <dt className="text-[12px] font-medium text-muted-foreground">{term}</dt>
              <dd className="mt-0.5 min-w-0">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="min-w-0 space-y-8 lg:col-span-8">
            <section>
              <SectionTitle meta={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}>Line items</SectionTitle>
              {lineItems.length === 0 ? (
                <ListBand>
                  <div className="px-4 py-3 text-sm text-muted-foreground">No line items</div>
                </ListBand>
              ) : (
                <DataTable aria-label="Line items">
                  <thead>
                    <tr>
                      <Th>Item</Th>
                      <Th priority={2}>SKU</Th>
                      <Th align="right" priority={2}>Unit</Th>
                      <Th align="right">Qty</Th>
                      <Th align="right">Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => {
                      const spec = item.variantTitle || item.variantData?.title;
                      return (
                        <Tr key={item.id}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <div className="size-9 shrink-0 overflow-hidden rounded-[4px] bg-muted">
                                {item.thumbnail && (
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    width={36}
                                    height={36}
                                    className="size-9 object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground">{item.title}</div>
                                {spec && <div className="text-[12px] text-muted-foreground">{spec}</div>}
                              </div>
                            </div>
                          </Td>
                          <Td priority={2} className="font-mono text-[12px] text-muted-foreground">{item.sku || "None"}</Td>
                          <Td align="right" priority={2} className="text-muted-foreground">{item.formattedUnitPrice}</Td>
                          <Td align="right">{item.quantity}</Td>
                          <Td align="right" className="font-medium text-foreground">{item.formattedTotal}</Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </DataTable>
              )}
            </section>

            <section>
              <SectionTitle
                meta={
                  <span className="inline-flex items-baseline gap-1.5 font-sans">
                    <Dot tone={pay.tone} />
                    {paymentCaptured ? "Payment complete" : pay.label}
                  </span>
                }
              >
                Totals
              </SectionTitle>
              <ListBand>
                {[
                  ["Subtotal", order.subtotal],
                  ["Shipping", order.shipping],
                  ["Tax", order.tax],
                ].map(([name, value]) => (
                  <div key={name} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="tabular-nums text-foreground">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 px-4 py-3 text-sm font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="tabular-nums text-foreground">{order.total}</span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="tabular-nums text-foreground">{order.formattedTotalPaid}</span>
                </div>
              </ListBand>
            </section>

            {fulfillments.length > 0 && (
              <section>
                <SectionTitle meta={fulfillments.length}>Fulfilments</SectionTitle>
                <ListBand>
                  {fulfillments.map((fulfillment, index) => (
                    <div key={fulfillment.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-sm font-medium text-foreground">
                          Shipment <span className="tabular-nums">#{index + 1}</span>
                        </span>
                        <span className="inline-flex items-baseline gap-1.5 text-xs text-muted-foreground">
                          <Dot tone={fulfillment.canceledAt ? "danger" : "ok"} />
                          {fulfillment.canceledAt ? "Canceled" : "Fulfilled"}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatDate(fulfillment.createdAt)}
                        </span>
                      </div>
                      {fulfillment.fulfillmentItems?.length ? (
                        <ul className="mt-1.5 space-y-0.5 text-xs">
                          {fulfillment.fulfillmentItems.map((fi) => (
                            <li key={fi.id} className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-foreground">{fi.lineItem?.title}</span>
                              {fi.lineItem?.variantTitle && (
                                <span className="tabular-nums text-muted-foreground">{fi.lineItem.variantTitle}</span>
                              )}
                              <span className="tabular-nums text-muted-foreground">x{fi.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {fulfillment.shippingLabels?.map((label) => (
                        <div key={label.id} className="mt-1.5 flex flex-wrap items-baseline gap-x-3 text-xs">
                          {label.carrier && <span className="text-muted-foreground">{label.carrier}</span>}
                          {label.trackingNumber && (
                            label.trackingUrl ? (
                              <a
                                href={label.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-baseline gap-1 font-mono tabular-nums text-foreground hover:underline underline-offset-4"
                              >
                                {label.trackingNumber}
                                <ArrowUpRight className="size-3 self-center" />
                              </a>
                            ) : (
                              <span className="font-mono tabular-nums text-foreground">{label.trackingNumber}</span>
                            )
                          )}
                          {label.labelUrl && (
                            <a
                              href={label.labelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-baseline gap-1 text-foreground hover:underline underline-offset-4"
                            >
                              Label
                              <ArrowUpRight className="size-3 self-center" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </ListBand>
              </section>
            )}

            {compliance}

            <section>
              <SectionTitle
                meta={
                  <label htmlFor="show-comments" className="inline-flex cursor-pointer items-center gap-2 font-sans text-xs">
                    <Checkbox
                      id="show-comments"
                      checked={showComments}
                      onCheckedChange={(checked) => setShowComments(checked === true)}
                    />
                    Include notes
                  </label>
                }
              >
                Activity
              </SectionTitle>
              <ListBand>
                {!order.events?.filter((event) => (showComments ? true : event.type !== 'NOTE_ADDED')).length && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No activity</div>
                )}
                {order.events?.filter((event) =>
                  showComments ? true : event.type !== 'NOTE_ADDED'
                ).map((event) => (
                  <div key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm">
                    <span className="flex items-baseline gap-2.5 text-foreground">
                      <Dot tone="muted" />
                      {humanize(event.type)}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatDate(event.createdAt)}
                      {event.user?.name && <span className="font-sans"> by {event.user.name}</span>}
                    </span>
                  </div>
                ))}
              </ListBand>
            </section>
          </div>

          <div className="min-w-0 space-y-8 lg:col-span-4">
            <section>
              <SectionTitle>Customer</SectionTitle>
              <ListBand>
                <div className="px-4 py-3">
                  {order.user?.id ? (
                    <Link
                      href={`/dashboard/platform/users/${order.user.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline underline-offset-4"
                    >
                      {order.user.name || order.user.email}
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  ) : (
                    <div className="text-sm font-medium text-foreground">Guest</div>
                  )}
                  <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {order.user?.orders?.length || 1} order{order.user?.orders?.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-foreground">{order.email}</div>
                    <div className="text-xs tabular-nums text-muted-foreground">
                      {order.user?.phone || "No phone number"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={editButton}
                    onClick={() => setEditDrawerConfig({
                      open: true,
                      listKey: "users",
                      itemId: order.user?.id as string,
                      fields: ["email"]
                    })}
                  >
                    Edit
                  </button>
                </div>
              </ListBand>
            </section>

            <section>
              <SectionTitle
                meta={order.shippingAddress?.id ? (
                  <button
                    type="button"
                    className={editButton}
                    onClick={() => setEditDrawerConfig({
                      open: true,
                      listKey: "addresses",
                      itemId: order.shippingAddress!.id as string,
                      fields: [
                        "firstName",
                        "lastName",
                        "company",
                        "address1",
                        "address2",
                        "city",
                        "province",
                        "postalCode",
                        "country",
                        "phone"
                      ]
                    })}
                  >
                    Edit
                  </button>
                ) : undefined}
              >
                Shipping address
              </SectionTitle>
              <ListBand>
                {ship ? renderAddress(ship) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No shipping address</div>
                )}
              </ListBand>
            </section>

            <section>
              <SectionTitle>Billing address</SectionTitle>
              <ListBand>
                {bill && bill.id !== ship?.id ? renderAddress(bill) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Same as shipping address</div>
                )}
              </ListBand>
            </section>
          </div>
        </div>
      </div>

      {/* Single Edit Drawer */}
      {editDrawerConfig.open && editDrawerConfig.itemId && (
        <EditItemDrawerClientWrapper
          listKey={editDrawerConfig.listKey}
          itemId={editDrawerConfig.itemId}
          open={editDrawerConfig.open}
          onClose={() => setEditDrawerConfig({ ...editDrawerConfig, open: false })}
        />
      )}
    </div>
  );
} 