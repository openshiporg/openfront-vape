"use client"

import { ChevronLeft } from "lucide-react"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Help from "@/features/storefront/modules/order/components/help"
import Items from "@/features/storefront/modules/order/components/items"
import OrderDetails from "@/features/storefront/modules/order/components/order-details"
import OrderSummary from "@/features/storefront/modules/order/components/order-summary"
import ShippingDetails from "@/features/storefront/modules/order/components/shipping-details"
import FulfillmentCard from "@/features/storefront/modules/order/components/fulfillment-card"
import React from "react"
import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderDetailsTemplateProps = {
  order: StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <LocalizedClientLink
          href="/account/orders"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[4px] bg-vp-well pl-3 pr-4 text-[14px] font-medium text-vp-ink transition-colors hover:bg-vp-line"
          data-testid="back-to-overview-button"
        >
          <ChevronLeft className="size-4" /> Orders
        </LocalizedClientLink>
      </div>
      <div
        className="flex w-full flex-col gap-8"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <section className="flex flex-col gap-4" aria-label="Items">
          <h2 className="vp-sign text-[26px] text-vp-ink">Items</h2>
          <Items items={order.lineItems} region={order.region} />
        </section>
        <div className="rounded-[4px] border border-vp-line bg-vp-surface p-5 sm:p-6">
          <OrderSummary order={order} />
        </div>
        <FulfillmentCard order={order} />
        <ShippingDetails order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
