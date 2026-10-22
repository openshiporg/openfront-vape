"use client"

import { cn } from "@/lib/utils"
import LocalizedClientLink from "../localized-client-link"

// Raised pill in a recessed track: the one in-page switch used across the storefront.

export function SegmentedTrack({
  label,
  className,
  stretch,
  children,
}: {
  label: string
  className?: string
  stretch?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "vp-track max-w-full overflow-x-auto no-scrollbar",
        stretch && "flex w-full [&>*]:flex-1",
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
