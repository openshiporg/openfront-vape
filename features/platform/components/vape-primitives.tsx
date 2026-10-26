import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export const DOT_TONES = {
  ok: "bg-[oklch(0.48_0.1_160)] dark:bg-[oklch(0.7_0.12_160)]",
  warn: "bg-[oklch(0.7_0.13_75)] dark:bg-[oklch(0.78_0.13_75)]",
  danger: "bg-[oklch(0.52_0.17_27)] dark:bg-[oklch(0.68_0.17_27)]",
  info: "bg-sky-600 dark:bg-sky-400",
  accent: "bg-foreground",
  muted: "bg-zinc-400 dark:bg-zinc-500",
} as const

export type DotTone = keyof typeof DOT_TONES

const TEXT_TONES: Record<DotTone, string> = {
  ok: "text-[oklch(0.42_0.1_160)] dark:text-[oklch(0.78_0.11_160)]",
  warn: "text-[oklch(0.5_0.12_70)] dark:text-[oklch(0.82_0.12_75)]",
  danger: "text-[oklch(0.5_0.17_27)] dark:text-[oklch(0.75_0.15_27)]",
  info: "text-sky-700 dark:text-sky-300",
  accent: "text-foreground",
  muted: "text-muted-foreground",
}

const STAMP_FILL: Record<DotTone, string> = {
  ok: "bg-[oklch(0.48_0.1_160/0.12)]",
  warn: "bg-[oklch(0.7_0.13_75/0.18)]",
  danger: "bg-[oklch(0.52_0.17_27/0.12)]",
  info: "bg-sky-500/12",
  accent: "bg-foreground/10",
  muted: "bg-muted",
}

/** Square status mark meant to sit on a title line: give the parent `items-baseline`. Always beside its word. */
export function Dot({ tone = "muted", className }: { tone?: DotTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2 shrink-0 translate-y-[-0.1em] rounded-[1px]", DOT_TONES[tone], className)}
    />
  )
}

// Perforated top and bottom edges, like an excise stamp torn from its sheet.
const PERFORATION: CSSProperties = {
  WebkitMaskImage:
    "radial-gradient(circle at 2px 0, transparent 1px, #000 1.3px), radial-gradient(circle at 2px 100%, transparent 1px, #000 1.3px)",
  WebkitMaskSize: "4px 51%",
  WebkitMaskRepeat: "repeat-x",
  WebkitMaskPosition: "top, bottom",
  maskImage:
    "radial-gradient(circle at 2px 0, transparent 1px, #000 1.3px), radial-gradient(circle at 2px 100%, transparent 1px, #000 1.3px)",
  maskSize: "4px 51%",
  maskRepeat: "repeat-x",
  maskPosition: "top, bottom",
}

/**
 * Compliance state as a stamp: the word on a perforated plate in its state colour, with an optional serial.
 * Use for every regulated state (cleared, pending, denied, expired), never colour alone.
 */
export function Stamp({
  tone = "muted",
  serial,
  className,
  children,
}: {
  tone?: DotTone
  serial?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <span
      style={PERFORATION}
      className={cn(
        "inline-flex min-h-[22px] max-w-full items-center gap-1.5 whitespace-nowrap rounded-[2px] px-1.5 py-[3px] text-[12px] font-semibold leading-none",
        STAMP_FILL[tone],
        TEXT_TONES[tone],
        className
      )}
    >
      <span className="truncate">{children}</span>
      {serial != null && serial !== "" && <span className="font-mono text-[11px] font-medium opacity-80">{serial}</span>}
    </span>
  )
}

/** Status word with its mark, for table status columns. */
export function StatusWord({ tone = "muted", children, className }: { tone?: DotTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-baseline gap-1.5 whitespace-nowrap text-[13px] font-medium", TEXT_TONES[tone], className)}>
      <Dot tone={tone} />
      <span className="truncate">{children}</span>
    </span>
  )
}

// Underline tabs: a hairline under the row, the current choice underlined in ink. No pills.
export const trackClass =
  "flex max-w-full items-stretch gap-0 overflow-x-auto border-b border-border no-scrollbar"

export const pillClass =
  "-mb-px inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-none border-b-2 border-transparent px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 data-[active=true]:border-foreground data-[active=true]:text-foreground max-sm:min-h-10"

export function Track({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={cn(trackClass, className)}>
      {children}
    </div>
  )
}

export function Pill({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button type="button" aria-pressed={!!active} data-active={!!active} className={cn(pillClass, className)} {...props} />
  )
}

export function Count({ children }: { children: ReactNode }) {
  return <span className="text-[11px] tabular-nums text-muted-foreground">{children ?? 0}</span>
}

/** Flat 4px button for in-page actions. `primary` is ink; default is outlined; `ghost` is quiet. */
export const buttonClass = {
  base: "inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[4px] px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 max-sm:min-h-10 [&_svg]:size-4",
  primary: "bg-foreground text-background hover:bg-foreground/85",
  outline: "border border-input bg-background text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-[oklch(0.52_0.17_27)] text-white hover:bg-[oklch(0.46_0.17_27)]",
} as const
