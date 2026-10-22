"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreOrder } from "@/features/storefront/types/storefront";
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot";
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";

const Title = () => (
  <h2 className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">Fulfillment</h2>
);

type FulfillmentCardProps = {
  order: StoreOrder & {
    unfulfilled?: Array<{
      id: string;
      quantity: number;
    }>;
    fulfillments?: Array<{
      id: string;
      createdAt: string;
      canceledAt?: string;
      fulfillmentItems?: Array<{
        id: string;
        quantity: number;
        lineItem: {
          title: string;
          variantTitle?: string;
          sku?: string;
          thumbnail?: string;
          formattedUnitPrice: string;
        };
      }>;
      shippingLabels?: Array<{
        id: string;
        carrier?: string;
        trackingNumber?: string;
        trackingUrl?: string;
        labelUrl?: string;
      }>;
    }>;
    fulfillmentDetails?: any;
  };
};

const FulfillmentCard: React.FC<FulfillmentCardProps> = ({ order }) => {
  const [expandedFulfillments, setExpandedFulfillments] = useState<string[]>(
    []
  );

  if (!order.fulfillments || order.fulfillments.length === 0) {
    return (
      <section className="flex flex-col gap-4 border-t border-vp-line pt-5" aria-label="Fulfillment">
        <Title />
        <p className="vp-band flex items-baseline gap-2.5 px-4 py-4 text-[14px] leading-[20px] text-vp-ink">
          <StatusDot tone="warn" />
          <span>
            Processing <span className="text-vp-ink-3">· not shipped yet</span>
          </span>
        </p>
      </section>
    );
  }

  const fulfillments = order.fulfillments;

  // Calculate fulfillment statistics
  const lineItemStats = fulfillments.reduce(
    (acc: any, fulfillment: any) => {
      if (!fulfillment.canceledAt && fulfillment.fulfillmentItems) {
        fulfillment.fulfillmentItems.forEach((item: any) => {
          acc.fulfilled += item.quantity;
        });
      }
      return acc;
    },
    { fulfilled: 0 }
  );

  const totalUnfulfilled = (order.unfulfilled || []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );
  const total = totalUnfulfilled + lineItemStats.fulfilled;
  const fulfilledPercentage =
    total > 0 ? (lineItemStats.fulfilled / total) * 100 : 0;
  const openPercentage = 100 - fulfilledPercentage;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleFulfillment = (id: string) => {
    setExpandedFulfillments((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  // Sort fulfillments by date (newest first)
  const sortedFulfillments = [...fulfillments].sort((a, b) => {
    if (a.canceledAt && !b.canceledAt) return 1;
    if (!a.canceledAt && b.canceledAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section className="flex flex-col gap-4 border-t border-vp-line pt-5" aria-label="Fulfillment">
      <Title />

      <div className="flex flex-col gap-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-vp-well"
          role="progressbar"
          aria-label="Items fulfilled"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(fulfilledPercentage)}
        >
          <div
            className="h-full rounded-full bg-vp-accent transition-all duration-300"
            style={{ width: `${fulfilledPercentage}%` }}
          />
        </div>
        <dl className="flex items-baseline justify-between gap-4 text-[13px] leading-[18px]">
          <div className="flex items-baseline gap-2">
            <dt className="text-vp-ink-2">Fulfilled</dt>
            <dd className="font-vp-mono text-vp-ink">
              {lineItemStats.fulfilled}{" "}
              <span className="text-vp-ink-3">({fulfilledPercentage.toFixed(1)}%)</span>
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-vp-ink-2">Open</dt>
            <dd className="font-vp-mono text-vp-ink">
              {totalUnfulfilled}{" "}
              <span className="text-vp-ink-3">({openPercentage.toFixed(1)}%)</span>
            </dd>
          </div>
        </dl>
      </div>

      <ul className="vp-band divide-y divide-vp-line">
        {sortedFulfillments.map((fulfillment, index) => {
          const itemCount =
            fulfillment.fulfillmentItems?.reduce(
              (sum, item) => sum + item.quantity,
              0
            ) || 0;
          const hasTracking = fulfillment.shippingLabels?.[0]?.trackingNumber;
          const expanded = expandedFulfillments.includes(fulfillment.id);
          const label = fulfillment.canceledAt ? "Cancelled" : hasTracking ? "Shipped" : "Fulfilled";
          const tone = fulfillment.canceledAt ? "danger" : "ok";

          return (
            <li key={fulfillment.id} className={cn(fulfillment.canceledAt && "opacity-70")}>
              <button
                type="button"
                aria-expanded={expanded}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left"
                onClick={() => toggleFulfillment(fulfillment.id)}
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[15px] leading-[20px] font-medium text-vp-ink">
                      Shipment <span className="font-vp-mono">{String(index + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-1.5 text-[13px] text-vp-ink-2">
                      <StatusDot tone={tone} />
                      {label}
                    </span>
                  </span>
                  <span className="font-vp-mono text-[12px] leading-[16px] text-vp-ink-3">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} · {formatDate(fulfillment.createdAt)}
                  </span>
                </span>
                <ChevronDown
                  className={cn("size-5 flex-none text-vp-ink-3 transition-transform", expanded && "rotate-180")}
                />
              </button>

              {expanded && fulfillment.fulfillmentItems && (
                <div className="flex flex-col gap-3 px-4 pb-4">
                  {fulfillment.shippingLabels?.[0] && (
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[14px] bg-vp-surface px-4 py-3 text-[13px] leading-[18px]">
                      {fulfillment.shippingLabels[0].carrier && (
                        <span className="text-vp-ink-2">
                          Carrier{" "}
                          <span className="font-vp-mono text-vp-ink">
                            {fulfillment.shippingLabels[0].carrier.toUpperCase()}
                          </span>
                        </span>
                      )}
                      {fulfillment.shippingLabels[0].trackingNumber && (
                        <a
                          href={fulfillment.shippingLabels[0].trackingUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex min-h-11 items-center gap-1 font-vp-mono text-vp-accent underline-offset-2 hover:underline"
                        >
                          {fulfillment.shippingLabels[0].trackingNumber}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  <ul className="flex flex-col gap-3">
                    {fulfillment.fulfillmentItems.map((item) => (
                      <li key={item.id} className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3">
                        <div className="w-12">
                          <Thumbnail thumbnail={item.lineItem.thumbnail} size="square" title={item.lineItem.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] leading-[20px] font-medium text-vp-ink">
                            {item.lineItem.title}
                          </p>
                          {item.lineItem.variantTitle && (
                            <p className="font-vp-mono text-[12px] leading-[16px] text-vp-ink-2">
                              {item.lineItem.variantTitle}
                            </p>
                          )}
                          <p className="font-vp-mono text-[12px] leading-[16px] text-vp-ink-3">
                            Qty {item.quantity}
                            {item.lineItem.sku && <> · SKU {item.lineItem.sku}</>}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FulfillmentCard;
