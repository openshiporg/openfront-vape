import { Metadata } from "next"

import { ComingSoonShelf } from "@/features/storefront/modules/home/components/featured-products"
import DenebHome from "@/features/storefront/modules/home/components/deneb-home"
import { getRegion } from "@/features/storefront/lib/data/regions"
import { getStore } from "@/features/storefront/lib/data/store"
import type { StoreRegion } from "@/features/storefront/types/storefront"

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()

  return {
    title: {
      absolute: store?.name ? `${store.name}: ${store.homepageTitle || "Shop"}` : store?.homepageTitle || "Shop",
    },
    description: store?.homepageDescription || undefined,
  }
}

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const [region, store] = await Promise.all([
    getRegion(countryCode) as Promise<StoreRegion | undefined>,
    getStore(),
  ])

  const home = region ? await DenebHome({ region, countryCode }) : null

  // With nothing published the release gate explains why the shelves are empty.
  return home ?? <ComingSoonShelf storeName={store?.name} />
}
