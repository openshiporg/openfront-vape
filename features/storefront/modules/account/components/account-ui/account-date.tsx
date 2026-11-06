"use client"

import { useFormattedTime } from "@/features/dashboard/lib/useViewerTime"

/**
 * An account date in the shopper's own time zone. Server components and client lists both
 * render through this, so one order never shows two different days (the server runs in UTC).
 * Text appears after mount, so server and hydration output match.
 */
export function AccountDate({ value }: { value?: string | null }) {
  const text = useFormattedTime(value, "date")
  if (!value) return null
  return <span suppressHydrationWarning>{text}</span>
}
