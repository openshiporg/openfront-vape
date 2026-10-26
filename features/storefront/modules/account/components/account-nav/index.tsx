"use client"

import { useParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { SegmentedLink, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import { signOut } from "@/features/storefront/lib/data/user"

type CustomerInfoForNav = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
};

type AccountNavProps = {
  customer: CustomerInfoForNav | null;
};

const SECTIONS = [
  { href: "/account", label: "Overview", testId: "overview-link" },
  { href: "/account/orders", label: "Orders", testId: "orders-link" },
  { href: "/account/addresses", label: "Addresses", testId: "addresses-link" },
  { href: "/account/profile", label: "Profile", testId: "profile-link" },
  { href: "/account/invoicing", label: "Invoicing", testId: "invoicing-link" },
  { href: "/account/invoices", label: "Invoices", testId: "invoices-link" },
  { href: "/account/privacy", label: "Privacy", testId: "privacy-link" },
]

const AccountNav = ({ customer: _customer }: AccountNavProps) => {
  const params = useParams()
  const route = usePathname() || ""
  const [signingOut, setSigningOut] = useState(false)
  const scrollRef = useRef<HTMLElement>(null)
  const [fade, setFade] = useState({ start: false, end: false })

  // Fade the edges that have more sections hidden behind them.
  const updateFade = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const start = el.scrollLeft > 1
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setFade((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateFade()
    el.addEventListener("scroll", updateFade, { passive: true })
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateFade) : null
    observer?.observe(el)
    if (el.firstElementChild) observer?.observe(el.firstElementChild)
    return () => {
      el.removeEventListener("scroll", updateFade)
      observer?.disconnect()
    }
  }, [updateFade])

  // Keep the active section in view on phone.
  useEffect(() => {
    const el = scrollRef.current
    const active = el?.querySelector<HTMLElement>('[aria-current="page"]')
    if (el && active) {
      const left = active.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft
      const right = left + active.offsetWidth
      if (left < el.scrollLeft) el.scrollLeft = Math.max(0, left - 28)
      else if (right > el.scrollLeft + el.clientWidth) el.scrollLeft = right - el.clientWidth + 28
    }
    updateFade()
  }, [route, updateFade])

  const maskImage =
    fade.start || fade.end
      ? `linear-gradient(to right, ${fade.start ? "transparent, #000 28px" : "#000"}, ${fade.end ? "#000 calc(100% - 28px), transparent" : "#000"})`
      : undefined

  if (typeof params?.countryCode !== "string") {
    return null
  }
  const countryCode = params.countryCode
  const current = route.split(`/${countryCode}`)[1] || "/"

  const isActive = (href: string) =>
    href === "/account" ? current === href : current === href || current.startsWith(`${href}/`)

  const handleLogout = async () => {
    setSigningOut(true)
    await signOut(countryCode)
  }

  return (
    <div className="flex items-center gap-2 sm:justify-between sm:gap-3">
      {/* The track scrolls sideways on phone; the faded edge shows there are more sections. */}
      <nav
        ref={scrollRef}
        aria-label="Account"
        className="no-scrollbar -ml-4 min-w-0 flex-1 overflow-x-auto pl-4 sm:ml-0 sm:flex-initial sm:pl-0"
        style={maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined}
        data-overflow={fade.start || fade.end ? "true" : undefined}
        data-testid="account-nav"
      >
        <SegmentedTrack label="Account sections" className="w-max max-w-none overflow-visible">
          {SECTIONS.map((s) => (
            <SegmentedLink key={s.href} href={s.href} active={isActive(s.href)} className="max-sm:min-h-11" data-testid={s.testId}>
              {s.label}
            </SegmentedLink>
          ))}
        </SegmentedTrack>
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={signingOut}
        data-testid="logout-button"
        className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-[4px] bg-vp-well px-4 text-[13px] font-medium text-vp-ink-2 transition-colors hover:text-vp-ink disabled:text-vp-ink-3"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  )
}

export default AccountNav
