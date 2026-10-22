"use client"

import { useParams, usePathname } from "next/navigation"
import { useState } from "react"

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
]

const AccountNav = ({ customer: _customer }: AccountNavProps) => {
  const params = useParams()
  const route = usePathname() || ""
  const [signingOut, setSigningOut] = useState(false)

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Account" className="min-w-0" data-testid="account-nav">
        <SegmentedTrack label="Account sections">
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
        className="inline-flex min-h-11 w-fit items-center rounded-full bg-vp-well px-4 text-[13px] font-medium text-vp-ink-2 transition-colors hover:text-vp-ink disabled:text-vp-ink-3"
      >
        {signingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  )
}

export default AccountNav
