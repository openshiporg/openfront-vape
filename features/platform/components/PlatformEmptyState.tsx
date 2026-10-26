"use client"

import { cn } from "@/lib/utils"
import { buttonClass } from "./vape-primitives"
import { ListBand } from "./vape-ui"

/**
 * Empty and no-results states for platform lists, in one form everywhere: a short muted line, left aligned, in the
 * list's own hairline band, with a reset beside it when the list is filtered.
 */
export function PlatformEmptyState({
  title,
  onReset,
  resetLabel = "Reset filters",
}: {
  title: string
  onReset?: () => void
  resetLabel?: string
}) {
  return (
    <ListBand>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 text-[13px]">
        <p className="text-muted-foreground">{title}</p>
        {onReset && (
          <button type="button" onClick={onReset} className={cn(buttonClass.base, buttonClass.outline)}>
            {resetLabel}
          </button>
        )}
      </div>
    </ListBand>
  )
}
