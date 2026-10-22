"use client"

import { cn } from "@/lib/utils"
import React, { useMemo, useState } from "react"
import { X, ChevronUp } from "lucide-react"
import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import OptionSelect from "./option-select"
import { StoreRegion, StoreProduct } from "@/features/storefront/types/storefront"

type ProductVariantInfo = {
  id: string
  title?: string | null
  inventoryQuantity?: number | null
  allowBackorder?: boolean | null
  productOptionValues?: { id: string; value: string; productOption?: { id: string } | null }[] | null
  prices?: { amount: number; currencyCode: string }[] | null
}

type MobileActionsProps = {
  product: StoreProduct
  region: StoreRegion
  variant?: ProductVariantInfo
  options: Record<string, string | undefined>
  updateOptions: (update: Record<string, string>) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

export default function MobileActions({
  product,
  region,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}: MobileActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
    region,
  })

  const selectedPrice = useMemo(() => {
    if (!price) return null
    return price.variantPrice || price.cheapestPrice || null
  }, [price])

  const isSimple = (product.productVariants?.length ?? 0) <= 1

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(region.locale || "en-US", {
      style: "currency",
      currency,
    }).format(amount / 100)
  }

  const actionLabel = isAdding
    ? "Adding"
    : !variant
    ? "Choose options"
    : !inStock
    ? "Out of stock"
    : "Add to bag"

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-vp-ink/40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 z-[100]" : "opacity-0 pointer-events-none z-[-1]"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Options"
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-x-0 rounded-t-[28px] bg-vp-bg shadow-[0_-12px_40px_rgb(20_24_22/0.18)] transition-all duration-300 ease-out lg:hidden",
          isOpen ? "bottom-0 z-[101]" : "-bottom-full z-[-1]"
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-[17px] font-semibold text-vp-ink">{product.title}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-full bg-vp-well"
            aria-label="Close options"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            {(product.productOptions || []).map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={updateOptions}
                title={option.title}
                disabled={optionsDisabled}
              />
            ))}
          </div>
        </div>

        <div className="px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={async () => {
              await handleAddToCart()
              setIsOpen(false)
            }}
            disabled={!inStock || !variant || !!isAdding}
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-vp-ink text-[16px] font-medium text-white disabled:bg-vp-well disabled:text-vp-ink-3"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[99] border-t border-vp-line bg-vp-bg/95 backdrop-blur-md transition-all duration-300 lg:hidden",
          show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-vp-ink">{product.title}</p>
            {selectedPrice && (
              <p className={cn("font-vp-mono text-[13px] text-vp-ink-2", selectedPrice.calculatedAmount < selectedPrice.originalAmount && "text-vp-accent")}>
                {formatPrice(selectedPrice.calculatedAmount, selectedPrice.currencyCode)}
              </p>
            )}
          </div>
          {!isSimple && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-12 max-w-[40%] items-center gap-1.5 rounded-full bg-vp-well px-4 text-[14px] font-medium text-vp-ink"
            >
              <span className="truncate font-vp-mono text-[12px]">
                {variant ? Object.values(options).filter(Boolean).join(" / ") : "Options"}
              </span>
              <ChevronUp className={cn("size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || !variant || !!isAdding}
            className="inline-flex h-12 items-center rounded-full bg-vp-ink px-5 text-[14px] font-medium text-white disabled:bg-vp-well disabled:text-vp-ink-3"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </>
  )
}
