import { Search } from "lucide-react"

import { searchProducts } from "@/features/storefront/lib/data/products"
import { getRegion } from "@/features/storefront/lib/data/regions"
import { SEARCH_MAX_LENGTH } from "@/features/storefront/lib/search-query"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import SalesPausedNote from "@/features/storefront/modules/common/components/vape/sales-paused-note"
import ProductPreview from "@/features/storefront/modules/products/components/product-preview"

export default async function SearchTemplate({ query, countryCode }: { query: string; countryCode: string }) {
  const region = await getRegion(countryCode)
  const { products, count } = query && region ? await searchProducts({ query, countryCode }) : { products: [], count: 0 }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12" data-testid="search-container">
      <h1 className="vp-sign text-[44px] text-vp-ink sm:text-[64px]">Search</h1>

      <form role="search" action={`/${countryCode}/search`} method="get" className="mt-5 border-b border-vp-line pb-5">
        <label className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="sr-only">Search products</span>
          <span className="relative flex min-w-0 flex-1 items-center sm:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3 size-4 text-vp-ink-3" aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder="Devices, e-liquids, pods, coils"
              className="h-12 w-full min-w-0 rounded-[4px] border border-vp-line bg-vp-bg pr-3 pl-9 text-[16px] text-vp-ink placeholder:text-vp-ink-3 focus:border-vp-ink focus:outline-none"
              data-testid="search-input"
            />
          </span>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-[4px] bg-vp-ink px-6 text-[15px] font-medium text-vp-on-ink transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </label>
      </form>

      <div className="mt-6">
        {!query ? (
          <p className="text-[15px] leading-[24px] text-vp-ink-2" data-testid="search-prompt">
            Search by product name, category or tag.
          </p>
        ) : products.length === 0 ? (
          <div className="grid gap-6 border-y-2 border-vp-ink py-10 lg:grid-cols-12" role="status" data-testid="search-empty">
            <div className="flex min-w-0 flex-col gap-2 lg:col-span-7">
              <h2 className="vp-sign break-words text-[32px] text-vp-ink sm:text-[40px]">
                Nothing found for &ldquo;{query}&rdquo;
              </h2>
              <p className="max-w-[48ch] text-[14px] leading-[22px] text-vp-ink-2">
                Only products on sale show up here. Try a shorter word, or browse the shop.
              </p>
            </div>
            <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:self-end">
              <SalesPausedNote />
              <LocalizedClientLink
                href="/store"
                className="inline-flex h-11 items-center justify-center rounded-[4px] border border-vp-ink px-5 text-[14px] font-medium text-vp-ink transition-colors hover:bg-vp-ink hover:text-vp-on-ink"
              >
                Shop all
              </LocalizedClientLink>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-5 font-vp-mono text-[12px] text-vp-ink-2" data-testid="search-count">
              {count} {count === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
            </p>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4" data-testid="search-results">
              {products.map((p: any) => (
                <li key={p.id}>
                  <ProductPreview productPreview={p} region={region as any} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
