import Link from 'next/link';
import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dot, ListBand, PageTitle } from '@/features/platform/components/vape-ui';

export default async function InventoryListPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search.slice(0, 100) : '';
  const page = Math.min(10000, Math.max(1, Number.parseInt(String(params.page || '1'), 10) || 1));
  const auth = await keystoneClient(`{ authenticatedItem { ... on User { role { canReadProducts canManageProducts } } } }`);
  const role = auth.success ? auth.data?.authenticatedItem?.role : null;
  const allowed = role?.canReadProducts || role?.canManageProducts;
  const result = allowed ? await keystoneClient(`query($where: ProductVariantWhereInput!, $skip: Int!) {
    items: productVariants(where: $where, take: 20, skip: $skip, orderBy: [{id: asc}]) {
      id sku title inventoryQuantity manageInventory
    }
    count: productVariantsCount(where: $where)
  }`, {
    where: search ? { OR: [{ sku: { contains: search, mode: 'insensitive' } }, { title: { contains: search, mode: 'insensitive' } }] } : {},
    skip: (page - 1) * 20,
  }) : null;
  const items = result?.success ? result.data.items : [];
  const count = result?.success ? result.data.count : 0;
  const LOW_STOCK_AT = 5;
  const stockTone = (item: any) => {
    if (!item.manageInventory) return 'muted' as const;
    const qty = Number(item.inventoryQuantity) || 0;
    if (qty <= 0) return 'danger' as const;
    if (qty <= LOW_STOCK_AT) return 'warn' as const;
    return 'ok' as const;
  };
  const stockLabel = (item: any) => {
    const tone = stockTone(item);
    if (tone === 'muted') return 'Not tracked';
    if (tone === 'danger') return 'Out of stock';
    if (tone === 'warn') return 'Low stock';
    return 'In stock';
  };
  const pageLink = 'inline-flex min-h-10 items-center rounded-full bg-muted px-4 text-sm font-medium text-foreground hover:bg-muted/70';

  return (
    <PageContainer
      title="Inventory"
      breadcrumbs={[
        { type: 'link', label: 'Dashboard', href: '/dashboard' },
        { type: 'page', label: 'Platform' },
        { type: 'page', label: 'Inventory' },
      ]}
      header={
        <PageTitle
          title="Inventory"
          meta={result?.success ? <span className="font-mono tabular-nums">{count} variants</span> : undefined}
        />
      }
    >
      <div className="space-y-4 px-4 pb-10 md:px-6">
        {!allowed ? (
          <ListBand>
            <p role="alert" className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
              <Dot tone="danger" />
              Inventory access is not available for this account.
            </p>
          </ListBand>
        ) : <>
          <form className="flex items-center gap-2" role="search">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search inventory</span>
              <Input
                name="search"
                defaultValue={search}
                maxLength={100}
                placeholder="Search SKU or variant"
                className="h-10 rounded-full bg-background px-4"
              />
            </label>
            <Button type="submit" className="h-10 rounded-full px-5">Search</Button>
          </form>
          {!result?.success ? (
            <ListBand>
              <p role="alert" className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
                <Dot tone="danger" />
                Inventory is temporarily unavailable. Please try again.
              </p>
            </ListBand>
          ) : items.length === 0 ? (
            <ListBand>
              <p className="px-4 py-3 text-sm text-muted-foreground">
                {search ? 'No inventory matches this search.' : 'No inventory yet'}
              </p>
            </ListBand>
          ) : (
            <ListBand>
              <div className="hidden grid-cols-[minmax(0,1fr)_10rem_7rem] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Variant</span>
                <span>SKU</span>
                <span className="text-right">Quantity</span>
              </div>
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_10rem_7rem] sm:items-baseline"
                >
                  <div className="flex min-w-0 items-baseline gap-2.5">
                    <Dot tone={stockTone(item)} />
                    <span className="min-w-0 truncate font-mono text-sm tabular-nums text-foreground">{item.title}</span>
                  </div>
                  <span className="col-start-1 row-start-2 truncate pl-[18px] font-mono text-xs tabular-nums text-muted-foreground sm:col-start-auto sm:row-start-auto sm:pl-0">
                    {item.sku || '-'}
                  </span>
                  <div className="col-start-2 row-span-2 row-start-1 text-right sm:col-start-auto sm:row-span-1 sm:row-start-auto">
                    <span className="block font-mono text-sm tabular-nums text-foreground">
                      {item.manageInventory ? item.inventoryQuantity : '-'}
                    </span>
                    <span className="block text-xs text-muted-foreground">{stockLabel(item)}</span>
                  </div>
                </div>
              ))}
            </ListBand>
          )}
          <nav aria-label="Inventory pages" className="flex flex-wrap items-center gap-2">
            {page > 1 && <Link className={pageLink} href={`?page=${page - 1}&search=${encodeURIComponent(search)}`}>Previous</Link>}
            {page * 20 < count && <Link className={pageLink} href={`?page=${page + 1}&search=${encodeURIComponent(search)}`}>Next</Link>}
            {count > 20 && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {(page - 1) * 20 + 1}-{Math.min(page * 20, count)} of {count}
              </span>
            )}
          </nav>
        </>}
      </div>
    </PageContainer>
  );
}
