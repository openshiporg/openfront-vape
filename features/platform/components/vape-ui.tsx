// Vape platform kit: underline tabs, square status marks, excise-stamp compliance states,
// flat hairline lists and dense tables, built on the dashboard's own tokens so pages sit
// naturally in the shared shell in light and dark.

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Stamp, type DotTone } from "./vape-primitives"

export {
  DOT_TONES,
  Dot,
  Stamp,
  StatusWord,
  trackClass,
  pillClass,
  buttonClass,
  createButtonClass,
  primaryButtonClass,
  Track,
  Pill,
  Count,
} from "./vape-primitives"
export type { DotTone } from "./vape-primitives"
export { StatusFilter } from "./vape-status-filter"
export type { StatusOption } from "./vape-status-filter"

/** Page title; the page's state, when it has one, is a stamp beside it. */
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">{title}</h1>
        {state && <Stamp tone={tone ?? "muted"}>{state}</Stamp>}
      </div>
      {meta != null && meta !== "" ? <div className="text-[13px] text-muted-foreground">{meta}</div> : null}
    </div>
  )
}

/** A flat bordered list with hairline rows, instead of stacked cards. */
export function ListBand({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("divide-y divide-border overflow-hidden rounded-md border bg-card", className)}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-foreground/15 pb-2">
      <h2 className="text-[15px] font-semibold text-foreground">{children}</h2>
      {meta != null && meta !== "" ? <span className="text-[13px] tabular-nums text-muted-foreground">{meta}</span> : null}
    </div>
  )
}

/** Dense table in a bordered panel. Column `priority` 2 hides under md, 3 under lg. */
export function DataTable({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-md border bg-card">
      <table className={cn("w-full border-collapse text-[13px]", className)} {...props}>
        {children}
      </table>
    </div>
  )
}

const PRIORITY = { 1: "", 2: "max-md:hidden", 3: "max-lg:hidden" } as const

export function Th({
  className,
  align = "left",
  priority = 1,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right"; priority?: 1 | 2 | 3 }) {
  return (
    <th
      scope="col"
      className={cn(
        "sticky top-0 z-[1] h-9 whitespace-nowrap border-b bg-muted/60 px-3 text-[12px] font-medium text-muted-foreground first:pl-4 last:pr-4",
        align === "right" ? "text-right" : "text-left",
        PRIORITY[priority],
        className
      )}
      {...props}
    />
  )
}

export function Td({
  className,
  align = "left",
  priority = 1,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right"; priority?: 1 | 2 | 3 }) {
  return (
    <td
      className={cn("h-9 px-3 py-1.5 align-middle first:pl-4 last:pr-4", align === "right" && "text-right tabular-nums", PRIORITY[priority], className)}
      {...props}
    />
  )
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b transition-colors last:border-b-0 hover:bg-muted/40", className)} {...props} />
}
