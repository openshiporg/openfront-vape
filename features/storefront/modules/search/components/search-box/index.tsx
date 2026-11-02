"use client"

import { Search } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"

import { SEARCH_MAX_LENGTH } from "@/features/storefront/lib/search-query"

// Header search. A plain GET form, so it works before hydration and without JS.
// Phones get an icon link to the search page; the field shows from sm up.
export default function SearchBox({ className }: { className?: string }) {
  const { countryCode } = useParams() as { countryCode?: string }
  const current = useSearchParams()?.get("q") || ""
  const action = `${countryCode ? `/${countryCode}` : ""}/search`

  return (
    <>
      <a
        href={action}
        aria-label="Search"
        className="inline-flex size-11 items-center justify-center rounded-[4px] text-vp-ink-2 hover:text-vp-ink sm:hidden"
        data-testid="nav-search-link"
      >
        <Search className="size-5" aria-hidden="true" />
      </a>
      <form role="search" action={action} method="get" className={`hidden sm:block ${className || ""}`}>
        <label className="relative flex items-center">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 size-4 text-vp-ink-3" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={current}
            maxLength={SEARCH_MAX_LENGTH}
            placeholder="Search"
            className="h-10 w-40 rounded-[4px] border border-vp-line bg-vp-bg pr-3 pl-9 text-[14px] text-vp-ink placeholder:text-vp-ink-3 focus:border-vp-ink focus:outline-none lg:w-52"
            data-testid="nav-search-input"
          />
        </label>
      </form>
    </>
  )
}
