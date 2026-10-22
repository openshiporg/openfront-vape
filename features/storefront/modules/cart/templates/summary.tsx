"use client"

import CartTotals from "@/features/storefront/modules/common/components/cart-totals"
import DiscountCode from "@/features/storefront/modules/checkout/components/discount-code"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"

// Define inline type based on GraphQL schema and usage
type PromotionInfo = {
  code: string;
};

type RegionInfoForSummary = {
  id: string;
  currencyCode: string;
};

type CartSummary = {
  id: string;
  checkoutStep?: string | null;
  subtotal?: number | null;
  discountTotal?: number | null;
  shippingTotal?: number | null;
  taxTotal?: number | null;
  total?: number | null;
  promotions?: PromotionInfo[] | null;
  discounts?: any[];
  giftCards?: any[];
  region?: RegionInfoForSummary | null;
  currencyCode?: string;
  lineItems?: any[];
} | null;

type SummaryProps = {
  cart: CartSummary;
};

const Summary = ({ cart }: SummaryProps) => {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">Summary</h2>
      <CartTotals data={cart} />
      {cart && (
        <div className="border-t border-vp-line pt-2">
          <DiscountCode cart={cart} />
        </div>
      )}
      <LocalizedClientLink
        href={`/checkout?step=${cart?.checkoutStep ?? 'address'}`}
        data-testid="checkout-button"
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-vp-ink text-[16px] font-medium text-white transition-opacity hover:opacity-90"
      >
        <LinkStatus />
        Check out
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
