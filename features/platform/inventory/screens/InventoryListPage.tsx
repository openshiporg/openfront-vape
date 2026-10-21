import Link from 'next/link';
import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  return (
    <PageContainer
      title="Inventory"
      breadcrumbs={[
        { type: 'link', label: 'Dashboard', href: '/dashboard' },
        { type: 'page', label: 'Platform' },
        { type: 'page', label: 'Inventory' },
      ]}
      header={<div><h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Inventory</h1><p className="text-muted-foreground">Stock levels by product variant.</p></div>}
    >
      <div className="space-y-4 p-4 md:p-6">
        {!allowed ? <p role="alert">Inventory access is not available for this account.</p> : <>
          <form className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1 text-sm">Search inventory<Input name="search" defaultValue={search} maxLength={100} /></label>
            <Button type="submit">Search</Button>
          </form>
          {!result?.success ? <p role="alert">Inventory is temporarily unavailable. Please try again.</p> : items.length === 0 ?
            (search ? <p>No inventory matches this search.</p> : <div><p className="font-medium">No inventory yet</p><p className="text-sm text-muted-foreground">Inventory appears once products have variants.</p></div>) :
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>SKU</th><th>Variant</th><th>Quantity</th><th>Tracked</th></tr></thead><tbody>{items.map((item: any) => <tr key={item.id}><td>{item.sku || '—'}</td><td>{item.title}</td><td>{item.inventoryQuantity}</td><td>{item.manageInventory ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>}
          <nav aria-label="Inventory pages" className="flex gap-4">
            {page > 1 && <Link href={`?page=${page - 1}&search=${encodeURIComponent(search)}`}>Previous</Link>}
            {page * 20 < count && <Link href={`?page=${page + 1}&search=${encodeURIComponent(search)}`}>Next</Link>}
          </nav>
        </>}
      </div>
    </PageContainer>
  );
}
