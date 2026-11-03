"use client"

import { useParams, usePathname } from "next/navigation"
import type { ReactNode } from "react"

// The home page's header floats on the hero's sweep; every other page sits on the page tone.
export function useIsHome() {
  const pathname = usePathname() || ""
  const { countryCode } = (useParams() || {}) as { countryCode?: string }
  return pathname === "/" || pathname === `/${countryCode}` || pathname === `/${countryCode}/`
}

export default function HeaderFrame({ children }: { children: ReactNode }) {
  const home = useIsHome()
  return (
    <div className="deneb-header sticky inset-x-0 top-0 z-50" data-home={home}>
      {children}
    </div>
  )
}

export function HomeOnly({ children, not }: { children: ReactNode; not?: boolean }) {
  const home = useIsHome()
  return home === !not ? <>{children}</> : null
}
