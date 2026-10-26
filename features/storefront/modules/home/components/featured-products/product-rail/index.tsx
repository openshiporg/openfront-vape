import { StoreRegion } from "@/features/storefront/types/storefront"

import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import ProductPreview from "@/features/storefront/modules/products/components/product-preview"

// One shelf: a sign-painted heading on the shelf edge, then products on the shared 12-column grid.
export default function ProductRail({
  title,
  href,
  count,
  products,
  region,
}: {
  title: string
  href: string
  count?: number
  products: any[]
  region: StoreRegion
}) {
  if (!products?.length) {
    return null
  }

  return (
    <section className="mx-auto max-w-[1320px] px-4 pt-10 pb-6 sm:px-6 sm:pt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b-2 border-vp-ink pb-2">
        <h2 className="vp-sign text-[32px] text-vp-ink sm:text-[40px]">
          {title}
          {typeof count === "number" && (
            <span className="ml-3 align-middle font-vp-mono text-[13px] font-normal normal-case text-vp-ink-2">
              {count} {count === 1 ? "product" : "products"}
            </span>
          )}
        </h2>
        <InteractiveLink href={href}>View all</InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product: any) => (
          <li key={product.id}>
            <ProductPreview productPreview={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
