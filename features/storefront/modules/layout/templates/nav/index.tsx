import { Suspense } from 'react';

import { listRegions } from '@/features/storefront/lib/data/regions';
import { getCategoriesList } from '@/features/storefront/lib/data/categories';
import { getCollectionsList } from '@/features/storefront/lib/data/collections';

import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link';
import CartButton from '@/features/storefront/modules/layout/components/cart-button';
import SideMenu from '@/features/storefront/modules/layout/components/side-menu';
import Logo from '@/features/storefront/modules/layout/components/logo';
import NavLinks from './nav-links';

export default async function Nav() {
  const [{ regions }, { productCategories }, { collections }] = await Promise.all([
    listRegions(),
    getCategoriesList(0, 8),
    getCollectionsList(0, 6),
  ]);

  const categories = (productCategories || [])
    .filter((c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false)
    .map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }));
  const collectionLinks = (collections || []).map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }));

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <div className="border-b border-vp-line bg-vp-well text-vp-ink-2">
        <div className="mx-auto flex h-8 max-w-[1320px] items-center justify-between px-4 sm:px-6 text-[12px]">
          <span className="font-vp-mono tracking-[0.08em] uppercase">21+ only</span>
          <span className="hidden sm:inline">Adult signature may be required on delivery</span>
        </div>
      </div>
      <header className="border-b border-vp-line bg-vp-bg/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 sm:px-6">
          <div className="lg:hidden -ml-2">
            <SideMenu regions={regions} categories={categories} collections={collectionLinks} />
          </div>
          <Logo />
          <NavLinks categories={categories} />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LocalizedClientLink
              className="hidden lg:inline-flex min-h-11 items-center rounded-full px-3 text-[14px] font-medium text-vp-ink-2 hover:text-vp-ink"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-vp-ink"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Bag <span className="font-vp-mono text-vp-ink-3">0</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  );
}
