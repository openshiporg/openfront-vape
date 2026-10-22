import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import CatalogLayout from "@/features/storefront/modules/store/components/catalog-layout"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <CatalogLayout title="Shop all" activeCategory="all" sortBy={sort}>
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts sortBy={sort} page={pageNumber} countryCode={countryCode} />
      </Suspense>
    </CatalogLayout>
  )
}

export default StoreTemplate
