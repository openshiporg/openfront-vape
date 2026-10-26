import React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"

// Shared presentation for the account area: page headers, labeled fields,
// pill buttons and the order status dot. No hooks, so server and client
// components can both use it.

export const fieldClass =
  "block h-12 w-full appearance-none rounded-[4px] border border-vp-line bg-vp-surface px-4 text-[15px] text-vp-ink placeholder:text-vp-ink-3 outline-none transition-[border-color,box-shadow] focus:border-vp-accent focus:ring-2 focus:ring-vp-accent/20 disabled:bg-vp-well disabled:text-vp-ink-3"

export const labelClass = "text-[13px] leading-[18px] font-medium text-vp-ink-2"

export const primaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-vp-ink px-6 text-[15px] font-medium text-vp-on-ink transition-opacity hover:bg-vp-ink hover:opacity-90 disabled:cursor-not-allowed disabled:bg-vp-well disabled:text-vp-ink-3 disabled:opacity-100"

export const secondaryButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-vp-well px-6 text-[15px] font-medium text-vp-ink transition-colors hover:bg-vp-line disabled:cursor-not-allowed disabled:text-vp-ink-3"

// White pill for actions that sit on a recessed band row.
export const rowPillClass =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[4px] bg-vp-surface px-4 text-[13px] font-medium text-vp-ink shadow-[0_1px_2px_rgb(20_24_22/0.12)] transition-colors hover:text-vp-accent disabled:cursor-not-allowed disabled:text-vp-ink-3"

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string
  name: string
  "data-testid"?: string
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, name, className, ...props }, ref) => {
    const fieldId = id || `field-${name}`
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={fieldId} className={labelClass}>
          {label}
          {props.required ? null : <span className="ml-1 text-vp-ink-3">optional</span>}
        </label>
        <input ref={ref} id={fieldId} name={name} className={cn(fieldClass, className)} {...props} />
      </div>
    )
  }
)
Field.displayName = "Field"

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  name: string
  "data-testid"?: string
}

export const SelectField = ({ label, id, name, className, children, ...props }: SelectFieldProps) => {
  const fieldId = id || `field-${name}`
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select id={fieldId} name={name} className={cn(fieldClass, "pr-10", className)} {...props}>
          {children}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-vp-ink-3" />
      </div>
    </div>
  )
}

// Labels a non-native control (the checkout CountrySelect) and brings its
// trigger to the shared field size.
export const FieldFrame = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className={labelClass}>{label}</span>
    <div className="[&_button[role=combobox]]:h-12 [&_button[role=combobox]]:rounded-[4px] [&_button[role=combobox]]:border-vp-line [&_button[role=combobox]]:bg-vp-surface [&_button[role=combobox]]:px-4 [&_button[role=combobox]]:text-[15px]">
      {children}
    </div>
  </div>
)

export const InlineError = ({ children, ...props }: { children: React.ReactNode; "data-testid"?: string }) => (
  <p role="alert" className="text-[13px] leading-[18px] text-vp-danger" {...props}>
    {children}
  </p>
)

export function AccountPageHeader({
  title,
  count,
  action,
  id,
}: {
  title: string
  count?: number
  action?: React.ReactNode
  id?: string
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h2 id={id} className="vp-sign text-[30px] text-vp-ink">{title}</h2>
        {typeof count === "number" && <span className="font-vp-mono text-[13px] text-vp-ink-3">{count}</span>}
      </div>
      {action}
    </div>
  )
}

const ORDER_STATUS: Record<string, { tone: "ok" | "warn" | "danger" | "muted" | "accent"; label: string }> = {
  pending: { tone: "accent", label: "Pending" },
  completed: { tone: "ok", label: "Completed" },
  archived: { tone: "muted", label: "Archived" },
  canceled: { tone: "danger", label: "Canceled" },
  requires_action: { tone: "warn", label: "Needs action" },
}

export function orderStatus(status?: string | null) {
  if (!status) return null
  const key = status.toLowerCase()
  return ORDER_STATUS[key] || { tone: "muted" as const, label: key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) }
}

// Status dot for the title line; the parent must be items-baseline.
export function OrderStatusDot({ status }: { status?: string | null }) {
  const info = orderStatus(status)
  if (!info) return null
  return <StatusDot tone={info.tone} label={info.label} />
}

export function formatAccountDate(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}
