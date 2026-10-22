import { cn } from "@/lib/utils"

interface LineItemUnitPriceProps {
  item: {
    percentageOff: number
    originalPrice: string | number
    unitPrice: string | number
  }
  style?: "default" | string
}

const LineItemUnitPrice = ({
  item,
  style = "default"
}: LineItemUnitPriceProps) => {
  const hasReducedPrice = item.percentageOff > 0

  return (
    <span className="inline-flex items-baseline gap-1.5 font-vp-mono">
      {hasReducedPrice && (
        <>
          {style === "default" && (
            <span className="text-vp-accent">-{item.percentageOff}%</span>
          )}
          <span className="text-vp-ink-3 line-through">{item.originalPrice}</span>
        </>
      )}
      <span className={cn({ "text-vp-accent": hasReducedPrice })}>
        {item.unitPrice}
      </span>
    </span>
  );
}

export default LineItemUnitPrice
