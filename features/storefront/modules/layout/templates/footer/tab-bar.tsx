"use client"

import { Home, Search, ShoppingBag, UserRound } from "lucide-react"
import { useParams, usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { cn } from "@/lib/utils"

const TABS = [
  { title: "Shop", href: "", Icon: Home },
  { title: "Search", href: "/search", Icon: Search },
  { title: "Bag", href: "/cart", Icon: ShoppingBag },
  { title: "Account", href: "/account", Icon: UserRound },
]

// Phone tab bar: Shop, Search, Bag, Account, then the 21+ line. Pinned to the bottom of the
// screen, except on product pages, where the add-to-bag bar takes that place.
export default function TabBar({ ageLine }: { ageLine: string }) {
  const pathname = usePathname() || ""
  const { countryCode } = (useParams() || {}) as { countryCode?: string }
  const base = countryCode ? `/${countryCode}` : ""
  const rest = pathname.slice(base.length) || ""
  const product = rest.startsWith("/products/")
  const barRef = useRef<HTMLElement>(null)

  // The spacer always equals the bar's real height (safe-area inset and wrapped text included),
  // so no page content ever scrolls underneath the fixed bar.
  useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar || product) return
    const root = document.documentElement
    const sync = () => root.style.setProperty("--tabbar-h", `${Math.ceil(bar.getBoundingClientRect().height)}px`)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(bar)
    return () => {
      observer.disconnect()
      root.style.removeProperty("--tabbar-h")
    }
  }, [product])
  const activeTab =
    rest === "" || rest === "/"
      ? "Shop"
      : rest.startsWith("/search")
      ? "Search"
      : rest.startsWith("/cart")
      ? "Bag"
      : rest.startsWith("/account")
      ? "Account"
      : null

  return (
    <>
      {/* Fallback before hydration: 54px tabs + 18px age line + 1px border + the bottom padding. */}
      {!product && (
        <div aria-hidden="true" className="h-[var(--tabbar-h,calc(73px+max(8px,env(safe-area-inset-bottom))))] shrink-0 lg:hidden" />
      )}
      <nav
        ref={barRef}
        aria-label="Shop navigation"
        className={cn(
          "deneb-tabbar z-[60] border-t border-[#e3e3e3] bg-[#fafafa] [backdrop-filter:none] lg:hidden",
          product ? "relative" : "fixed inset-x-0 bottom-0"
        )}
        data-testid="tab-bar"
      >
        <ul className="grid grid-cols-4">
          {TABS.map(({ title, href, Icon }) => {
            const active = activeTab === title
            return (
              <li key={title}>
                <LocalizedClientLink
                  href={href || "/"}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[54px] flex-col items-center justify-center gap-0.5 pt-1.5 text-[12px] leading-[16px] text-[#3a3d42]",
                    active && "font-semibold text-[#111214]"
                  )}
                >
                  <Icon
                    className="size-[22px]"
                    strokeWidth={active ? 2.25 : 1.6}
                    fill={active && title === "Shop" ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  {title}
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
        <p className="pb-[max(8px,env(safe-area-inset-bottom))] text-center text-[12px] leading-[18px] text-[#3a3d42]">
          {ageLine}
        </p>
      </nav>
    </>
  )
}
