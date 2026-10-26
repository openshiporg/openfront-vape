import { cn } from "@/lib/utils"

// Product art for products without a photo: a plain shelf label with the
// category and the product's real option ranges. Nothing invented.
export default function SpecTile({
  title,
  kicker,
  specs = [],
  size = "md",
  className,
}: {
  title: string
  kicker?: string | null
  specs?: { label: string; value: string }[]
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  if (size === "sm") {
    return (
      <div className={cn("absolute inset-0 flex items-end border border-vp-line bg-vp-well p-2", className)}>
        <span className="line-clamp-2 text-[10px] leading-[12px] font-medium text-vp-ink-2">{title}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between border border-vp-line bg-vp-well",
        size === "lg" ? "p-6 sm:p-10" : "p-3 sm:p-4",
        className
      )}
    >
      <span
        className={cn(
          "relative text-vp-ink-2",
          size === "lg" ? "text-[13px]" : "text-[12px]"
        )}
      >
        {kicker || "\u00a0"}
      </span>
      <div className="relative">
        <p
          className={cn(
            "vp-sign text-vp-ink",
            size === "lg" ? "text-[40px] sm:text-[56px] max-w-[14ch]" : "text-[20px] sm:text-[24px] max-w-[16ch]"
          )}
        >
          {title}
        </p>
        {specs.length > 0 && (
          <dl className={cn("flex flex-col border-t border-vp-line", size === "lg" ? "mt-6 pt-3 gap-1.5" : "mt-2 pt-1.5 gap-0.5")}>
            {specs.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className={cn("text-vp-ink-2", size === "lg" ? "text-[13px] w-20" : "text-[10px] sm:text-[11px] w-14")}>{s.label}</dt>
                <dd className={cn("font-vp-mono text-vp-ink", size === "lg" ? "text-[14px]" : "text-[10px] sm:text-[11px]")}>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
