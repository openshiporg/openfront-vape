import { Metadata } from "next"
import type { StorefrontOrderOverviewItem } from '@/features/storefront/types'

import OrderOverview from "@/features/storefront/modules/account/components/order-overview"
import { AccountPageHeader } from "@/features/storefront/modules/account/components/account-ui"
import { notFound } from "next/navigation"
import { listCustomerOrders } from "@/features/storefront/lib/data/orders"

export const metadata: Metadata = {
  title: "Orders",
  description: "Your orders and their status.",
}

export async function AccountOrdersPage() {
  const orders: StorefrontOrderOverviewItem[] | null = await listCustomerOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <AccountPageHeader title="Orders" />
      <OrderOverview orders={orders} />
      {/* <TransferRequestForm /> */}
    </div>
  )
}
