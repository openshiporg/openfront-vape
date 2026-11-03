"use client"

import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

type Link = { id: string; title: string; handle: string }

export default function NavLinks({ categories, support }: { categories: Link[]; support?: boolean }) {
  const pathname = usePathname() || ""
  const { countryCode } = useParams() as { countryCode?: string }
  const base = countryCode ? `/${countryCode}` : ""

  const items = [
    ...categories.slice(0, 5).map((c) => ({ key: c.id, title: c.title, href: `/categories/${c.handle}` })),
    ...(support ? [{ key: "support", title: "Support", href: "/policies/contact" }] : []),
  ]

  return (
    <div className="hidden items-center justify-center gap-[clamp(16px,2.2vw,44px)] lg:flex">
      {items.map((item) => {
        const active = pathname === `${base}${item.href}` || pathname.startsWith(`${base}${item.href}/`)
        return (
          <LocalizedClientLink
            key={item.key}
            href={item.href}
            data-active={active}
            className="deneb-nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[#16181b] underline-offset-[6px] transition-opacity hover:opacity-70 data-[active=true]:underline"
          >
            {item.title}
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
