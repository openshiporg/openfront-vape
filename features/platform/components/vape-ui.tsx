// Vape platform kit: the same raised-pill-in-recessed-track control, title-line
// status dots and list bands used on the storefront, built on the dashboard's
// own tokens so pages sit naturally in the shared shell in light and dark.

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Dot, type DotTone } from "./vape-primitives"

export { DOT_TONES, Dot, trackClass, pillClass, Track, Pill, Count } from "./vape-primitives"
export type { DotTone } from "./vape-primitives"
export { StatusFilter } from "./vape-status-filter"
export type { StatusOption } from "./vape-status-filter"

/** Page title with an optional state dot on the same line. */
export function PageTitle({
  title,
  tone,
  state,
  meta,
}: {
  title: string
  tone?: DotTone
  state?: string
  meta?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {state && (
          <span className="inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
            {tone && <Dot tone={tone} />}
            {state}
          </span>
        )}
      </div>
      {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
    </div>
  )
}

/** One recessed band with hairline rows, instead of stacked cards. */
export function ListBand({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl bg-muted/40 shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-inset ring-border/60",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
      {meta && <span className="font-mono text-xs tabular-nums text-muted-foreground">{meta}</span>}
    </div>
  )
}
