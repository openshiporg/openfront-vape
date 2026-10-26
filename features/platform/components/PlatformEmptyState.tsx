"use client"

import { ListBand } from "./vape-ui"

/** Empty and no-results states for platform lists: a label, and a reset when filtered. */
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
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 items-center rounded-[4px] border border-input bg-background px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </ListBand>
  )
}
