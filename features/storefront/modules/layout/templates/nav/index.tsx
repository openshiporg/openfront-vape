import { Suspense } from 'react';
import { Search, ShoppingBag, UserRound } from 'lucide-react';

import { listRegions } from '@/features/storefront/lib/data/regions';
import { getCategoriesList } from '@/features/storefront/lib/data/categories';
import { getCollectionsList } from '@/features/storefront/lib/data/collections';
import { getStore } from '@/features/storefront/lib/data/store';
import { hasBusinessDetails, readStoreBusiness } from '@/features/platform/store-settings/lib/store-info';

import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link';
import CartButton from '@/features/storefront/modules/layout/components/cart-button';
import SideMenu from '@/features/storefront/modules/layout/components/side-menu';
import Wordmark from '@/features/storefront/modules/common/components/deneb/wordmark';
import NavLinks from './nav-links';
import HeaderFrame, { HomeOnly } from './header-frame';

const icon = 'inline-flex size-11 items-center justify-center rounded-full text-[#16181b] transition-colors hover:bg-black/5';

export default async function Nav() {
  const [{ regions }, { productCategories }, { collections }, store] = await Promise.all([
    listRegions(),
    getCategoriesList(0, 8),
    getCollectionsList(0, 6),
    getStore(),
  ]);

  const categories = (productCategories || [])
    .filter((c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false)
    .map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }));
  const collectionLinks = (collections || []).map((c: any) => ({ id: c.id, title: c.title, handle: c.handle }));
  const support = hasBusinessDetails(readStoreBusiness(store?.metadata));

  return (
    <HeaderFrame>
      <header className="deneb-header-bar">
        <nav className="deneb-header-inner mx-auto grid items-center px-3 lg:px-6">
          <div className="flex items-center lg:hidden">
            <SideMenu regions={regions} categories={categories} collections={collectionLinks} />
          </div>
          <div className="flex min-w-0 justify-center lg:justify-start">
            <Wordmark />
          </div>
          <NavLinks categories={categories} support={support} />
          <div className="flex items-center justify-end gap-0.5 lg:gap-3">
            <LocalizedClientLink href="/search" aria-label="Search" className={icon} data-testid="nav-search-link">
              <Search className="size-[22px] lg:size-5" strokeWidth={1.75} aria-hidden="true" />
            </LocalizedClientLink>
            <HomeOnly not>
              <LocalizedClientLink
                href="/account"
                aria-label="Account"
                className={`${icon} max-lg:hidden`}
                data-testid="nav-account-link"
              >
                <UserRound className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </LocalizedClientLink>
            </HomeOnly>
            <Suspense
              fallback={
                <LocalizedClientLink className={icon} href="/cart" aria-label="View bag" data-testid="nav-cart-link">
                  <ShoppingBag className="size-[22px] lg:size-5" strokeWidth={1.75} aria-hidden="true" />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </HeaderFrame>
  );
}
