interface LineItemOptionsProps {
  variant?: {
    sku?: string
  }
  variantTitle?: string
}

// Variant spec (for example "6 mg / 60 ml") and SKU, set in mono.
const LineItemOptions = ({
  variant,
  variantTitle
}: LineItemOptionsProps) => {
  if (!variantTitle && !variant?.sku) return null

  return (
    <div className="mt-0.5 flex min-w-0 flex-col font-vp-mono text-[12px] leading-[16px]">
      {variantTitle && (
        <p className="truncate text-vp-ink-2">
          {variantTitle}
        </p>
      )}
      {variant?.sku && (
        <p className="truncate text-vp-ink-3">
          SKU {variant.sku}
        </p>
      )}
    </div>
  )
}

export default LineItemOptions
