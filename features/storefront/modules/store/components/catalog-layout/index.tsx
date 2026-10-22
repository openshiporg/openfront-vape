import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import { SegmentedLink, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import RefinementList from "@/features/storefront/modules/store/components/refinement-list"
import type { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"

// Shared frame for Shop all, category and collection listings.
export default async function CatalogLayout({
  title,
  kicker,
  activeCategory,
  sortBy,
  trail,
  children,
}: {
  title: string
  kicker?: string
  activeCategory?: string
  sortBy: SortOptions
  trail?: React.ReactNode
  children: React.ReactNode
}) {
  const { productCategories } = await getCategoriesList(0, 12)
  const categories = (productCategories || []).filter(
    (c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false
  )

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12" data-testid="category-container">
      <header className="flex flex-col gap-2">
        {kicker && <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">{kicker}</p>}
        {trail}
        <h1
          className="text-[36px] leading-[40px] font-semibold tracking-[-0.03em] text-vp-ink sm:text-[52px] sm:leading-[56px]"
          data-testid="store-page-title"
        >
          {title}
        </h1>
      </header>

      <div className="mt-6 flex flex-col gap-3 border-b border-vp-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        {categories.length > 0 && (
          <SegmentedTrack label="Categories">
            <SegmentedLink href="/store" active={activeCategory === "all"}>All</SegmentedLink>
            {categories.map((c: any) => (
              <SegmentedLink key={c.id} href={`/categories/${c.handle}`} active={activeCategory === c.handle}>
                {c.title}
              </SegmentedLink>
            ))}
          </SegmentedTrack>
        )}
        <RefinementList sortBy={sortBy} data-testid="sort-by-container" />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
