import { Metadata } from "next"

import FeaturedProducts from "@/features/storefront/modules/home/components/featured-products"
import Hero from "@/features/storefront/modules/home/components/hero"
import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import { getCollectionsListByRegion } from "@/features/storefront/lib/data/collections"
import { getRegion } from "@/features/storefront/lib/data/regions"
import { getStore } from "@/features/storefront/lib/data/store"
import type { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()

  return {
    title: store?.name ? `${store.name}: ${store.homepageTitle || "Shop"}` : store?.homepageTitle || "Shop",
    description: store?.homepageDescription || undefined,
  }
}

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [region, store, { productCategories }] = await Promise.all([
    getRegion(countryCode) as Promise<StoreRegion | undefined>,
    getStore(),
    getCategoriesList(0, 8),
  ])

  const { collections }: { collections: StoreCollection[] } = region
    ? await getCollectionsListByRegion(0, 3, region.id)
    : { collections: [] }

  const categories = (productCategories || [])
    .filter((c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false)
    .map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }))

  return (
    <>
      <Hero
        storeName={store?.name}
        title={store?.homepageTitle}
        description={store?.homepageDescription}
        categories={categories}
        collections={(collections || []).map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }))}
      />
      {region && collections?.length > 0 && (
        <ul className="flex flex-col">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      )}
    </>
  )
}
