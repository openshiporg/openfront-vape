import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import CatalogLayout from "@/features/storefront/modules/store/components/catalog-layout"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/features/storefront/modules/store/templates/paginated-products"
import type { StorefrontCollection } from "@/features/storefront/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: StorefrontCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <CatalogLayout title={collection.title} kicker="Collection" sortBy={sort}>
      <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
        <PaginatedProducts sortBy={sort} page={pageNumber} collectionId={collection.id} countryCode={countryCode} />
      </Suspense>
    </CatalogLayout>
  )
}
