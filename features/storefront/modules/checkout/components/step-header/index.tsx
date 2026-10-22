import { cn } from "@/lib/utils"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"

// Numbered checkout step title: mono index, title, a dot on the title line when
// the step is complete, and an Edit pill once it can be reopened.
export default function StepHeader({
  index,
  title,
  state,
  onEdit,
  editLabel,
  editTestId,
}: {
  index: number
  title: string
  state: "open" | "done" | "todo"
  onEdit?: () => void
  editLabel?: string
  editTestId?: string
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <h2
        className={cn(
          "flex items-baseline gap-3 text-[20px] leading-[26px] font-semibold tracking-[-0.02em] sm:text-[22px] sm:leading-[28px]",
          state === "todo" ? "text-vp-ink-3 select-none" : "text-vp-ink"
        )}
      >
        <span
          className={cn(
            "font-vp-mono text-[13px] leading-none font-normal tracking-normal",
            state === "open" ? "text-vp-accent" : "text-vp-ink-3"
          )}
        >
          {String(index).padStart(2, "0")}
        </span>
        <span>{title}</span>
        {state === "done" && <StatusDot tone="ok" label="Complete" />}
      </h2>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          data-testid={editTestId}
          aria-label={editLabel}
          className="inline-flex min-h-11 flex-none items-center justify-center rounded-full bg-vp-well px-4 text-[14px] font-medium text-vp-ink transition-colors hover:bg-vp-line"
        >
          Edit
        </button>
      )}
    </div>
  )
}

// Two-line summary block used in completed steps.
export function StepFact({
  label,
  children,
  testId,
  className,
}: {
  label: string
  children: React.ReactNode
  testId?: string
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)} data-testid={testId}>
      <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">{label}</p>
      <div className="text-[14px] leading-[20px] text-vp-ink-2 [overflow-wrap:anywhere]">{children}</div>
    </div>
  )
}
