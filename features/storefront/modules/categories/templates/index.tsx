import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import CatalogLayout from "@/features/storefront/modules/store/components/catalog-layout"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/features/storefront/modules/store/templates/paginated-products"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { SegmentedLink, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import type { StorefrontProductCategory } from "@/features/storefront/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: StorefrontProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  if (!category || !countryCode) notFound()

  const parents = [] as StorefrontProductCategory[]
  const getParents = (current: StorefrontProductCategory) => {
    if (current.parent_category) {
      parents.unshift(current.parent_category)
      getParents(current.parent_category)
    }
  }
  getParents(category)
  const root = parents[0] || category

  const trail = parents.length ? (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] text-vp-ink-2">
      {parents.map((parent) => (
        <span key={parent.id} className="inline-flex items-center gap-2">
          <LocalizedClientLink className="hover:text-vp-ink" href={`/categories/${parent.handle}`} data-testid="sort-by-link">
            {parent.title}
          </LocalizedClientLink>
          <span className="text-vp-ink-3">/</span>
        </span>
      ))}
    </nav>
  ) : null

  return (
    <CatalogLayout title={category.title} activeCategory={root.handle} sortBy={sort} trail={trail}>
      {category.category_children && category.category_children.length > 0 && (
        <SegmentedTrack label={`${category.title} types`} className="mb-6">
          {category.category_children.map((c: StorefrontProductCategory) => (
            <SegmentedLink key={c.id} href={`/categories/${c.handle}`}>
              {c.title}
            </SegmentedLink>
          ))}
        </SegmentedTrack>
      )}
      <span className="sr-only" data-testid="category-page-title">{category.title}</span>
      <Suspense fallback={<SkeletonProductGrid numberOfProducts={8} />}>
        <PaginatedProducts sortBy={sort} page={pageNumber} categoryId={category.id} countryCode={countryCode} />
      </Suspense>
    </CatalogLayout>
  )
}
