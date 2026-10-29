import { getProductsList } from "@/features/storefront/lib/data/products"
import { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"
import SalesPausedNote from "@/features/storefront/modules/common/components/vape/sales-paused-note"
import ProductRail from "@/features/storefront/modules/home/components/featured-products/product-rail"

// The shelves behind the window. Collections with products first; if none, the newest
// products as one shelf; if the catalog has nothing published, a coming-soon shelf.
export default async function FeaturedProducts({
  collections,
  region,
  storeName,
}: {
  collections: StoreCollection[]
  region: StoreRegion
  storeName?: string
}) {
  const countryCode = region.countries?.[0]?.iso2 || "us"

  const shelves = (
    await Promise.all(
      collections.map(async (collection) => {
        const {
          response: { products, count },
        } = await getProductsList({ countryCode, queryParams: { collectionId: collection.id, limit: 4 } })
        return { collection, products: (products || []) as any[], count: count as number }
      })
    )
  ).filter((s) => s.products.length > 0)

  if (shelves.length) {
    return (
      <ul className="flex flex-col pb-6">
        {shelves.map(({ collection, products, count }) => (
          <li key={collection.id}>
            <ProductRail
              title={collection.title}
              href={`/collections/${collection.handle}`}
              count={count}
              products={products}
              region={region}
            />
          </li>
        ))}
      </ul>
    )
  }

  const {
    response: { products, count },
  } = await getProductsList({ countryCode, queryParams: { limit: 8 } })

  if (products?.length) {
    return (
      <div className="pb-6">
        <ProductRail title="On the shelf" href="/store" count={count} products={products} region={region} />
      </div>
    )
  }

  return <ComingSoonShelf storeName={storeName} />
}

export function ComingSoonShelf({ storeName }: { storeName?: string }) {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pt-14 pb-6 sm:px-6 sm:pt-20 sm:pb-8" data-testid="home-empty-shelf">
      <div className="grid gap-6 border-y-2 border-vp-ink py-8 sm:py-10 lg:grid-cols-12">
        <h2 className="vp-sign text-[40px] text-vp-ink sm:text-[56px] lg:col-span-7">Shelves are being stocked</h2>
        <div className="flex flex-col gap-3 lg:col-span-5 lg:self-end">
          <p className="max-w-[48ch] text-[15px] leading-[24px] text-vp-ink-2">
            {storeName ? `${storeName} hasn't` : "This shop hasn't"} put any products on sale here yet. Products
            appear on these shelves as soon as they're published.
          </p>
          <SalesPausedNote className="mt-2 border-t border-vp-line pt-4" />
        </div>
      </div>
    </section>
  )
}
