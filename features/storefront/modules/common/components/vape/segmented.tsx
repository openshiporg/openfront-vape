"use client"

import { cn } from "@/lib/utils"
import LocalizedClientLink from "../localized-client-link"

// Joined square plates (.vp-track / .vp-pill): the one in-page switch used across the storefront.

// `wrap`: on phone the plates wrap onto further rows instead of scrolling out of sight. The joins stay square:
// the track keeps only its top and left rule and every plate draws its own right and bottom rule.
const WRAP_ON_PHONE =
  "max-sm:flex max-sm:flex-wrap max-sm:overflow-visible max-sm:rounded-none max-sm:border-0 max-sm:border-t max-sm:border-l max-sm:border-vp-ink " +
  "max-sm:[&>*]:border-0 max-sm:[&>*]:border-r max-sm:[&>*]:border-b max-sm:[&>*]:border-vp-ink"

export function SegmentedTrack({
  label,
  className,
  stretch,
  wrap,
  children,
}: {
  label: string
  className?: string
  stretch?: boolean
  wrap?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "vp-track max-w-full overflow-x-auto no-scrollbar",
        stretch && "flex w-full [&>*]:flex-1",
        wrap && WRAP_ON_PHONE,
        className
      )}
    >
      {children}
    </div>
  )
}

export function SegmentedButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      data-active={!!active}
      className={cn("vp-pill", className)}
      {...props}
    />
  )
}

export function SegmentedLink({
  active,
  href,
  className,
  children,
  ...props
}: {
  active?: boolean
  href: string
  className?: string
  children: React.ReactNode
  [x: string]: any
}) {
  return (
    <LocalizedClientLink
      href={href}
      data-active={!!active}
      aria-current={active ? "page" : undefined}
      className={cn("vp-pill", className)}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  )
}
