import { useMemo } from "react";
import type { StorefrontOrderOverviewItem } from "@/features/storefront/types";

import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link";
import {
  OrderStatusDot,
  formatAccountDate,
  orderStatus,
  rowPillClass,
} from "@/features/storefront/modules/account/components/account-ui";

type OrderCardProps = {
  order: StorefrontOrderOverviewItem & { status?: string | null };
};

// One row of the orders list band: status dot on the title line, number,
// date and total in mono, the first few items, and a details pill.
const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.lineItems?.reduce((acc: number, item) => {
        return acc + item.quantity;
      }, 0) ?? 0
    );
  }, [order]);

  const numberOfProducts = useMemo(() => {
    return order.lineItems?.length ?? 0;
  }, [order]);

  const status = orderStatus(order.status);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5" data-testid="order-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <OrderStatusDot status={order.status} />
            <h3 className="text-[15px] font-medium text-vp-ink">
              Order{" "}
              <span className="font-vp-mono">
                #<span data-testid="order-display-id">{order.displayId}</span>
              </span>
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[13px] text-vp-ink-2">
            <span className="font-vp-mono" data-testid="order-created-at">
              {formatAccountDate(order.createdAt)}
            </span>
            {status && (
              <>
                <span aria-hidden="true" className="text-vp-ink-3">·</span>
                <span>{status.label}</span>
              </>
            )}
            <span aria-hidden="true" className="text-vp-ink-3">·</span>
            <span className="font-vp-mono">{`${numberOfLines} ${numberOfLines === 1 ? "item" : "items"}`}</span>
          </div>
        </div>
        <span className="shrink-0 font-vp-mono text-[15px] text-vp-ink" data-testid="order-amount">
          {order.total}
        </span>
      </div>

      {numberOfProducts > 0 && (
        <ul className="flex flex-col gap-2">
          {order.lineItems?.slice(0, 3).map((item) => {
            return (
              <li key={item.id} className="flex items-center gap-3" data-testid="order-item">
                <div className="w-11 shrink-0">
                  <Thumbnail thumbnail={item.thumbnail} images={[]} size="square" title={item.title} />
                </div>
                <span className="min-w-0 flex-1 truncate text-[14px] text-vp-ink" data-testid="item-title">
                  {item.title}
                </span>
                <span className="shrink-0 font-vp-mono text-[13px] text-vp-ink-2">
                  x<span data-testid="item-quantity">{item.quantity}</span>
                </span>
              </li>
            );
          })}
          {numberOfProducts > 3 && (
            <li className="font-vp-mono text-[13px] text-vp-ink-3">+{numberOfProducts - 3} more</li>
          )}
        </ul>
      )}

      <div className="flex justify-end">
        <LocalizedClientLink
          href={`/account/orders/details/${order.id}`}
          className={rowPillClass}
          data-testid="order-details-link"
        >
          Details
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default OrderCard;
