import { cn } from "@/lib/utils"

const TONES = {
  ok: "bg-vp-ok",
  warn: "bg-vp-warn",
  danger: "bg-vp-danger",
  muted: "bg-vp-ink-3",
  accent: "bg-vp-accent",
} as const

// Sits inline on the title line; align the parent with items-baseline.
export default function StatusDot({ tone = "muted", className, label }: { tone?: keyof typeof TONES; className?: string; label?: string }) {
  return <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("vp-dot", TONES[tone], className)} />
}
