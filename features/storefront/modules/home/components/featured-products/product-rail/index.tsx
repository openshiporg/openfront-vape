import { getProductsList } from "@/features/storefront/lib/data/products"
import { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"

import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import ProductPreview from "@/features/storefront/modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
  index,
}: {
  collection: StoreCollection
  region: StoreRegion
  index?: number
}) {
  const {
    response: { products, count },
  } = await getProductsList({
    countryCode: region.countries?.[0]?.iso2 || "us",
    queryParams: {
      collectionId: collection.id,
      limit: 4,
    },
  })

  if (!products?.length) {
    return null
  }

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex items-end justify-between gap-4 border-t border-vp-line pt-5">
        <div className="flex items-baseline gap-3">
          {typeof index === "number" && (
            <span className="font-vp-mono text-[12px] text-vp-ink-3">{String(index + 1).padStart(2, "0")}</span>
          )}
          <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-vp-ink sm:text-[28px] sm:leading-[34px]">
            {collection.title}
          </h2>
          <span className="font-vp-mono text-[12px] text-vp-ink-3">{count}</span>
        </div>
        <InteractiveLink href={`/collections/${collection.handle}`}>View all</InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
        {products.map((product: any) => (
          <li key={product.id}>
            <ProductPreview productPreview={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
