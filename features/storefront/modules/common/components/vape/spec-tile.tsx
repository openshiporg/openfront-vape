import { cn } from "@/lib/utils"

// Product art for products without a photo: the store accent wash, the
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
      <div className={cn("absolute inset-0 flex items-end bg-vp-tint p-2", className)}>
        <span className="line-clamp-2 text-[10px] leading-[12px] font-medium text-vp-accent">{title}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between bg-vp-tint",
        size === "lg" ? "p-6 sm:p-10" : "p-3 sm:p-4",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 85% 0%, hsl(var(--vp-h, 178) 45% 96%) 0%, transparent 60%), radial-gradient(90% 70% at 0% 100%, hsl(var(--vp-h, 178) 40% 84%) 0%, transparent 70%)",
        }}
      />
      <span
        className={cn(
          "relative font-vp-mono uppercase tracking-[0.12em] text-vp-accent",
          size === "lg" ? "text-[12px]" : "text-[10px]"
        )}
      >
        {kicker || " "}
      </span>
      <div className="relative">
        <p
          className={cn(
            "font-semibold tracking-[-0.02em] text-vp-ink",
            size === "lg" ? "text-[32px] leading-[36px] sm:text-[44px] sm:leading-[48px] max-w-[14ch]" : "text-[15px] leading-[19px] sm:text-[17px] sm:leading-[21px] max-w-[16ch]"
          )}
        >
          {title}
        </p>
        {specs.length > 0 && (
          <dl className={cn("flex flex-col", size === "lg" ? "mt-6 gap-1.5" : "mt-2 gap-0.5")}>
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
