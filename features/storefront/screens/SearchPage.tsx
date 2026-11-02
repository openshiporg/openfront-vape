import { Metadata } from "next"

import { normaliseSearch } from "@/features/storefront/lib/search-query"
import SearchTemplate from "@/features/storefront/modules/search/templates"

type Params = {
  searchParams: Promise<{ q?: string | string[] }>
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const q = normaliseSearch((await props.searchParams).q)
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } }
}

export async function SearchPage(props: Params) {
  const [{ countryCode }, searchParams] = await Promise.all([props.params, props.searchParams])
  return <SearchTemplate query={normaliseSearch(searchParams.q)} countryCode={countryCode} />
}
