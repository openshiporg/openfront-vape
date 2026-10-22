import { cn } from "@/lib/utils";
import { useMemo } from "react"

import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"

import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront";

export default function ProductPrice({
  product,
  variant,
  region,
}: {
  product: StoreProduct;
  variant?: any;
  region: StoreRegion;
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
    region,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  const hasOnlyOneVariant = useMemo(() => {
    return (product.productVariants?.length || 0) === 1
  }, [product])

  if (!selectedPrice) {
    return <div className="block h-9 w-32 animate-pulse rounded-full bg-vp-well" />;
  }

  const format = (amount: number) =>
    new Intl.NumberFormat(region.locale, {
      style: 'currency',
      currency: selectedPrice.currencyCode,
    }).format(amount / 100);

  const isOnSale = selectedPrice.calculatedAmount < selectedPrice.originalAmount;

  return (
    <div className="flex items-baseline gap-3 text-vp-ink">
      {!variant && !hasOnlyOneVariant && <span className="text-[13px] text-vp-ink-3">From</span>}
      <span className={cn("font-vp-mono text-[28px] leading-[32px] font-medium", isOnSale && "text-vp-accent")} data-testid="product-price">
        {format(selectedPrice.calculatedAmount)}
      </span>
      {isOnSale && (
        <>
          <span className="font-vp-mono text-[15px] text-vp-ink-3 line-through" data-testid="original-product-price">
            {format(selectedPrice.originalAmount)}
          </span>
          <span className="rounded-full bg-vp-tint px-2 py-0.5 font-vp-mono text-[12px] text-vp-accent">
            -{Math.round((1 - selectedPrice.calculatedAmount / selectedPrice.originalAmount) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}
