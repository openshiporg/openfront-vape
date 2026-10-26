"use client"

import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

type Link = { id: string; title: string; handle: string }

export default function NavLinks({ categories }: { categories: Link[] }) {
  const pathname = usePathname() || ""
  const { countryCode } = useParams() as { countryCode?: string }
  const base = countryCode ? `/${countryCode}` : ""

  const items = [
    { key: "all", title: "Shop all", href: "/store" },
    ...categories.slice(0, 5).map((c) => ({ key: c.id, title: c.title, href: `/categories/${c.handle}` })),
  ]

  return (
    <div className="hidden lg:flex items-center gap-1">
      {items.map((item) => {
        const active = pathname === `${base}${item.href}` || pathname.startsWith(`${base}${item.href}/`)
        return (
          <LocalizedClientLink
            key={item.key}
            href={item.href}
            data-active={active}
            className="inline-flex min-h-11 items-center rounded-[4px] px-3 text-[14px] font-medium text-vp-ink-2 underline-offset-[6px] decoration-2 transition-colors hover:text-vp-ink data-[active=true]:text-vp-ink data-[active=true]:underline"
          >
            {item.title}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
