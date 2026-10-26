import { ChevronDown } from "lucide-react"

import ItemsPreviewTemplate from "@/features/storefront/modules/cart/templates/preview"
import DiscountCode from "@/features/storefront/modules/checkout/components/discount-code"
import CartTotals from "@/features/storefront/modules/common/components/cart-totals"

const SummaryBody = ({ cart }: { cart: any }) => (
  <div className="flex flex-col gap-5">
    <ItemsPreviewTemplate region={cart?.region} items={cart?.lineItems} />
    <div className="border-b border-vp-line pb-2">
      <DiscountCode cart={cart} />
    </div>
    <CartTotals data={cart} />
  </div>
)

// Phone: a collapsed summary above the steps. Desktop: a sticky panel on the right.
const CheckoutSummary = ({ cart }: { cart: any }) => {
  const count = cart?.lineItems?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0

  return (
    <div className="lg:col-start-2 lg:row-start-2">
      <details className="group rounded-[4px] border border-vp-line bg-vp-surface lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-baseline gap-2 text-[15px] font-medium text-vp-ink">
            Summary
            <span className="font-vp-mono text-[12px] text-vp-ink-3">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-vp-mono text-[15px] font-medium text-vp-ink">{cart?.total}</span>
            <ChevronDown className="size-4 text-vp-ink-3 transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="px-4 pb-4">
          <SummaryBody cart={cart} />
        </div>
      </details>

      <aside className="sticky top-6 hidden rounded-[4px] border border-vp-line bg-vp-surface p-6 lg:block">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="vp-sign text-[26px] text-vp-ink">Summary</h2>
          <span className="font-vp-mono text-[12px] text-vp-ink-3">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
        <SummaryBody cart={cart} />
      </aside>
    </div>
  )
}

export default CheckoutSummary
