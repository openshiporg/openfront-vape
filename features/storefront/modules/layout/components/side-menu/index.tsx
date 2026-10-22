"use client"

import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import type { StoreRegion } from "@/features/storefront/types/storefront"

type Link = { id: string; title: string; handle: string }

const SideMenu = ({
  regions,
  categories = [],
  collections = [],
}: {
  regions: StoreRegion[] | null
  categories?: Link[]
  collections?: Link[]
}) => {
  const [open, setOpen] = useState(false);

  const linkClass =
    "flex min-h-12 items-center justify-between border-b border-vp-line text-[20px] font-medium tracking-[-0.01em] text-vp-ink"

  return (
    // TODO: Remove suppressHydrationWarning when React 19.2.0 useId bug is fixed upstream
    // Known issue: https://github.com/radix-ui/primitives/issues/3700
    <div suppressHydrationWarning>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            data-testid="nav-menu-button"
            aria-label="Open menu"
            className="inline-flex size-11 items-center justify-center rounded-full text-vp-ink hover:bg-vp-well"
            suppressHydrationWarning
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="vape-sf w-full sm:max-w-sm border-0 bg-vp-bg p-0 flex flex-col h-full [&>button]:hidden"
          data-testid="nav-menu-popup"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-vp-line">
            <SheetTitle className="text-[15px] font-semibold text-vp-ink">Menu</SheetTitle>
            <SheetClose asChild>
              <button aria-label="Close menu" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-vp-well">
                <X className="size-5" />
              </button>
            </SheetClose>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <p className="mt-6 mb-1 font-vp-mono text-[11px] uppercase tracking-[0.14em] text-vp-ink-3">Shop</p>
            <ul>
              <li>
                <LocalizedClientLink href="/store" className={linkClass} onClick={() => setOpen(false)} data-testid="store-link">
                  Shop all
                </LocalizedClientLink>
              </li>
              {categories.map((c, i) => (
                <li key={c.id}>
                  <LocalizedClientLink href={`/categories/${c.handle}`} className={linkClass} onClick={() => setOpen(false)}>
                    {c.title}
                    <span className="font-vp-mono text-[12px] text-vp-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>

            {collections.length > 0 && (
              <>
                <p className="mt-8 mb-1 font-vp-mono text-[11px] uppercase tracking-[0.14em] text-vp-ink-3">Collections</p>
                <ul>
                  {collections.map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/collections/${c.handle}`}
                        className="flex min-h-11 items-center border-b border-vp-line text-[16px] text-vp-ink"
                        onClick={() => setOpen(false)}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-8 grid grid-cols-2 gap-2">
              <LocalizedClientLink
                href="/account"
                onClick={() => setOpen(false)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-vp-well text-[15px] font-medium text-vp-ink"
                data-testid="account-link"
              >
                Account
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/cart"
                onClick={() => setOpen(false)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-vp-ink text-[15px] font-medium text-white"
                data-testid="cart-link"
              >
                Bag
              </LocalizedClientLink>
            </div>
          </div>

          {regions && (
            <div className="border-t border-vp-line px-4 py-4">
              <CountrySelect regions={regions} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default SideMenu
