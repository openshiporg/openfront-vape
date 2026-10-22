import { cn } from "@/lib/utils";

interface LineItemPriceProps {
  item: {
    percentageOff: number;
    originalPrice: string | number;
    total: string | number;
  };
  style?: "default" | string;
}

const LineItemPrice = ({
  item,
  style = "default"
}: LineItemPriceProps) => {
  const hasReducedPrice = item.percentageOff > 0;

  return (
    <div className="flex flex-col items-end text-right font-vp-mono">
      {hasReducedPrice && (
        <span className="flex items-baseline gap-1.5 text-[12px] leading-[16px] text-vp-ink-3">
          {style === "default" && (
            <span className="text-vp-accent">-{item.percentageOff}%</span>
          )}
          <span className="line-through">{item.originalPrice}</span>
        </span>
      )}
      <span className={cn("text-vp-ink", { "text-vp-accent": hasReducedPrice })}>
        {item.total}
      </span>
    </div>
  );
}

export default LineItemPrice
