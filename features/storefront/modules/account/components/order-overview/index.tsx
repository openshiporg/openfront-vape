"use client"

import type { StorefrontOrderOverviewItem } from '@/features/storefront/types'

import OrderCard from "../order-card"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"

const OrderOverview = ({ orders }: { orders: StorefrontOrderOverviewItem[] }) => {
  if (orders?.length) {
    return (
      <ul className="vp-band divide-y divide-vp-line">
        {orders.map((o) => (
          <li key={o.id}>
            <OrderCard order={o} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      className="vp-band flex flex-col items-start gap-4 px-4 py-8 sm:px-5"
      data-testid="no-orders-container"
    >
      <h2 className="text-[15px] font-medium text-vp-ink-2">No orders yet</h2>
      <LocalizedClientLink href="/store" className={primaryButtonClass} data-testid="continue-shopping-button">
        Shop all
      </LocalizedClientLink>
    </div>
  )
}

export default OrderOverview
