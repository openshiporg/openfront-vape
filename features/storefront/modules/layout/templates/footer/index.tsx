import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import { getCollectionsList } from "@/features/storefront/lib/data/collections"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Logo from "@/features/storefront/modules/layout/components/logo"
import { getStore } from "@/features/storefront/lib/data/store"

export default async function Footer() {
  const [{ collections }, { productCategories }, store] = await Promise.all([
    getCollectionsList(0, 6),
    getCategoriesList(0, 8),
    getStore(),
  ])
  const storeName = store?.name || "Store"
  const categories = (productCategories || []).filter(
    (c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false
  )

  const heading = "mb-3 font-vp-mono text-[11px] uppercase tracking-[0.14em] text-vp-ink-3"
  const link = "inline-flex min-h-9 items-center text-[14px] text-vp-ink-2 hover:text-vp-ink"

  return (
    <footer className="mt-24 border-t border-vp-line bg-vp-bg">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-[14px] text-vp-ink-2">{store?.homepageDescription}</p>
          </div>
          {categories.length > 0 && (
            <div>
              <p className={heading}>Shop</p>
              <ul>
                {categories.slice(0, 6).map((c: any) => (
                  <li key={c.id}>
                    <LocalizedClientLink className={link} href={`/categories/${c.handle}`}>
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {collections && collections.length > 0 && (
            <div>
              <p className={heading}>Collections</p>
              <ul>
                {collections.slice(0, 6).map((c: any) => (
                  <li key={c.id}>
                    <LocalizedClientLink className={link} href={`/collections/${c.handle}`}>
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className={heading}>Account</p>
            <ul>
              <li><LocalizedClientLink className={link} href="/account">Sign in</LocalizedClientLink></li>
              <li><LocalizedClientLink className={link} href="/account/orders">Orders</LocalizedClientLink></li>
              <li><LocalizedClientLink className={link} href="/cart">Bag</LocalizedClientLink></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-vp-line py-6 text-[12px] text-vp-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-vp-mono uppercase tracking-[0.08em]">Adults 21+ only</p>
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {storeName}
          </p>
        </div>
      </div>
    </footer>
  )
}
