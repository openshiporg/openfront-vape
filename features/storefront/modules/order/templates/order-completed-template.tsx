// Removed Heading import
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@/features/storefront/modules/common/components/cart-totals"
import Help from "@/features/storefront/modules/order/components/help"
import Items from "@/features/storefront/modules/order/components/items"
import OnboardingCta from "@/features/storefront/modules/order/components/onboarding-cta"
import OrderDetails from "@/features/storefront/modules/order/components/order-details"
import ShippingDetails from "@/features/storefront/modules/order/components/shipping-details"
import PaymentDetails from "@/features/storefront/modules/order/components/payment-details"
import FulfillmentCard from "@/features/storefront/modules/order/components/fulfillment-card"
import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderCompletedTemplateProps = {
  order: StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      {isOnboarding && <OnboardingCta orderId={order.id} />}
      <div className="flex flex-col gap-8" data-testid="order-complete-container">
        <div className="flex flex-col gap-3">
          <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">Order confirmed</p>
          <OrderDetails order={order} />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-8">
            <section className="flex flex-col gap-4" aria-label="Items">
              <h2 className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">Items</h2>
              <Items items={order.lineItems} region={order.region} />
            </section>
            <FulfillmentCard order={order} />
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
          </div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <aside className="rounded-[22px] border border-vp-line bg-vp-surface p-5 sm:p-6">
              <h2 className="mb-4 text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">Summary</h2>
              <CartTotals data={order} />
            </aside>
            <Help />
          </div>
        </div>
      </div>
    </div>
  )
}
