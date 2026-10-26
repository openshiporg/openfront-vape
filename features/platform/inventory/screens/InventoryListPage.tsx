import Link from 'next/link';
import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { Input } from '@/components/ui/input';
import {
  Count,
  DataTable,
  Dot,
  ListBand,
  PageTitle,
  StatusWord,
  Td,
  Th,
  Tr,
  Track,
  buttonClass,
  pillClass,
  type DotTone,
} from '@/features/platform/components/vape-ui';
import { AdjustStockSheet } from '../components/AdjustStockSheet';
import { BulkAdjustSheet } from '../components/BulkAdjustSheet';

const LOW_STOCK_AT = 5;
const PAGE_SIZE = 20;
const STOCK_FILTERS = ['all', 'out', 'low', 'in', 'untracked'] as const;
type StockFilter = (typeof STOCK_FILTERS)[number];

type VariantRow = {
  id: string;
  sku: string | null;
  title: string;
  inventoryQuantity: number | null;
  manageInventory: boolean | null;
  product?: { id: string; title: string } | null;
};

function stockState(item: VariantRow): { tone: DotTone; label: string } {
  if (!item.manageInventory) return { tone: 'muted', label: 'Not tracked' };
  const qty = Number(item.inventoryQuantity) || 0;
  if (qty <= 0) return { tone: 'danger', label: 'Out of stock' };
  if (qty <= LOW_STOCK_AT) return { tone: 'warn', label: 'Low stock' };
  return { tone: 'ok', label: 'In stock' };
}

function stockWhere(filter: StockFilter) {
  switch (filter) {
    case 'out':
      return { manageInventory: { equals: true }, inventoryQuantity: { lte: 0 } };
    case 'low':
      return { manageInventory: { equals: true }, inventoryQuantity: { gt: 0, lte: LOW_STOCK_AT } };
    case 'in':
      return { manageInventory: { equals: true }, inventoryQuantity: { gt: LOW_STOCK_AT } };
    case 'untracked':
      return { manageInventory: { equals: false } };
    default:
      return null;
  }
}

function hrefFor(params: { page?: number; search?: string; stock?: StockFilter }) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.stock && params.stock !== 'all') query.set('stock', params.stock);
  if (params.page && params.page > 1) query.set('page', String(params.page));
  const value = query.toString();
  return value ? `?${value}` : '?';
}

function VariantCell({ item }: { item: VariantRow }) {
  return (
    <>
      <span className="block truncate font-medium text-foreground">{item.title}</span>
      {item.product && (
        <Link
          href={`/dashboard/platform/products/${item.product.id}`}
          className="block truncate text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {item.product.title}
        </Link>
      )}
    </>
  );
}

function AdjustCell({ item, canManage }: { item: VariantRow; canManage: boolean }) {
  if (!canManage || !item.manageInventory) return null;
  return (
    <AdjustStockSheet
      variant={{ id: item.id, title: item.title, sku: item.sku, inventoryQuantity: Number(item.inventoryQuantity) || 0 }}
    />
  );
}

export default async function InventoryListPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search.slice(0, 100) : '';
  const stock: StockFilter = STOCK_FILTERS.includes(params.stock as StockFilter) ? (params.stock as StockFilter) : 'all';
  const page = Math.min(10000, Math.max(1, Number.parseInt(String(params.page || '1'), 10) || 1));
  const auth = await keystoneClient(`{ authenticatedItem { ... on User { role { canReadProducts canManageProducts } } } }`);
  const role = auth.success ? auth.data?.authenticatedItem?.role : null;
  const allowed = role?.canReadProducts || role?.canManageProducts;
  const canManage = !!role?.canManageProducts;
  const searchWhere = search ? { OR: [{ sku: { contains: search, mode: 'insensitive' } }, { title: { contains: search, mode: 'insensitive' } }] } : null;
  const filterWhere = stockWhere(stock);
  const where = searchWhere && filterWhere ? { AND: [searchWhere, filterWhere] } : searchWhere || filterWhere || {};
  const result = allowed ? await keystoneClient(`query($where: ProductVariantWhereInput!, $skip: Int!, $queueWhere: ProductVariantWhereInput!, $take: Int!) {
    items: productVariants(where: $where, take: $take, skip: $skip, orderBy: [{id: asc}]) {
      id sku title inventoryQuantity manageInventory product { id title }
    }
    count: productVariantsCount(where: $where)
    queue: productVariants(where: $queueWhere, take: 25, orderBy: [{inventoryQuantity: asc}, {id: asc}]) {
      id sku title inventoryQuantity manageInventory product { id title }
    }
    queueCount: productVariantsCount(where: $queueWhere)
    out: productVariantsCount(where: { manageInventory: { equals: true }, inventoryQuantity: { lte: 0 } })
    low: productVariantsCount(where: { manageInventory: { equals: true }, inventoryQuantity: { gt: 0, lte: ${LOW_STOCK_AT} } })
    in: productVariantsCount(where: { manageInventory: { equals: true }, inventoryQuantity: { gt: ${LOW_STOCK_AT} } })
    untracked: productVariantsCount(where: { manageInventory: { equals: false } })
    all: productVariantsCount
  }`, {
    where,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    queueWhere: { manageInventory: { equals: true }, inventoryQuantity: { lte: LOW_STOCK_AT } },
  }) : null;
  const items: VariantRow[] = result?.success ? result.data.items : [];
  const count: number = result?.success ? result.data.count : 0;
  const queue: VariantRow[] = result?.success ? result.data.queue : [];
  const queueCount: number = result?.success ? result.data.queueCount : 0;
  const counts: Record<StockFilter, number> = {
    all: result?.success ? result.data.all : 0,
    out: result?.success ? result.data.out : 0,
    low: result?.success ? result.data.low : 0,
    in: result?.success ? result.data.in : 0,
    untracked: result?.success ? result.data.untracked : 0,
  };
  const tabs: Array<{ value: StockFilter; label: string; tone?: DotTone }> = [
    { value: 'all', label: 'All' },
    { value: 'out', label: 'Out of stock', tone: 'danger' },
    { value: 'low', label: 'Low stock', tone: 'warn' },
    { value: 'in', label: 'In stock', tone: 'ok' },
    { value: 'untracked', label: 'Not tracked', tone: 'muted' },
  ];
  const pageLink = `${buttonClass.base} ${buttonClass.outline}`;

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
          meta={result?.success ? (
            <span className="tabular-nums">
              {counts.all} variants · {counts.out} out of stock · {counts.low} low
            </span>
          ) : undefined}
        />
      }
    >
      <div className="space-y-6 px-4 pb-24 sm:pb-10 md:px-6">
        {!allowed ? (
          <ListBand>
            <p role="alert" className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
              <Dot tone="danger" />
              Inventory access is not available for this account.
            </p>
          </ListBand>
        ) : !result?.success ? (
          <ListBand>
            <p role="alert" className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
              <Dot tone="danger" />
              Inventory is temporarily unavailable. Please try again.
            </p>
          </ListBand>
        ) : <>
          <section aria-labelledby="restock-title" className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="restock-title" className="text-[15px] font-semibold text-foreground">Restock</h2>
              <span className="text-[13px] tabular-nums text-muted-foreground">
                {queueCount > queue.length ? `${queue.length} of ${queueCount}` : queueCount} at or below {LOW_STOCK_AT}
              </span>
            </div>
            {queue.length === 0 ? (
              <div className="rounded-md border bg-card px-4 py-3 text-[13px] text-muted-foreground">
                No tracked SKU is out of stock or at {LOW_STOCK_AT} or fewer
              </div>
            ) : (
              <DataTable aria-labelledby="restock-title">
                <thead>
                  <tr>
                    <Th>SKU</Th>
                    <Th priority={2}>Variant</Th>
                    <Th>State</Th>
                    <Th align="right">Quantity</Th>
                    {canManage && <Th align="right"><span className="sr-only">Adjust</span></Th>}
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const state = stockState(item);
                    return (
                      <Tr key={item.id}>
                        <Td className="max-w-0 w-[26%]">
                          <span className="block truncate font-mono text-[12px] text-foreground">{item.sku || 'No SKU'}</span>
                          <span className="block truncate text-[12px] text-muted-foreground md:hidden">{item.title}</span>
                        </Td>
                        <Td priority={2} className="max-w-0">
                          <VariantCell item={item} />
                        </Td>
                        <Td><StatusWord tone={state.tone}>{state.label}</StatusWord></Td>
                        <Td align="right" className="font-medium text-foreground">{Number(item.inventoryQuantity) || 0}</Td>
                        {canManage && <Td align="right" className="w-0 whitespace-nowrap"><AdjustCell item={item} canManage={canManage} /></Td>}
                      </Tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
          </section>

          <section aria-labelledby="all-stock-title" className="space-y-3">
            <h2 id="all-stock-title" className="sr-only">All variants</h2>
            <Track label="Stock state">
              {tabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={hrefFor({ search, stock: tab.value })}
                  aria-current={stock === tab.value ? 'page' : undefined}
                  data-active={stock === tab.value}
                  className={pillClass}
                >
                  {tab.tone && <Dot tone={tab.tone} className="translate-y-0" />}
                  {tab.label} <Count>{counts[tab.value]}</Count>
                </Link>
              ))}
            </Track>
            <form className="flex flex-wrap items-center gap-2" role="search">
              {stock !== 'all' && <input type="hidden" name="stock" value={stock} />}
              <label className="min-w-0 flex-1">
                <span className="sr-only">Search inventory</span>
                <Input
                  name="search"
                  defaultValue={search}
                  maxLength={100}
                  placeholder="Search SKU or variant"
                  className="h-10 rounded-[4px] bg-background px-3"
                />
              </label>
              <button type="submit" className={`${buttonClass.base} ${buttonClass.primary} min-h-10`}>Search</button>
              {canManage && <BulkAdjustSheet />}
            </form>
            {items.length === 0 ? (
              <ListBand>
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {search || stock !== 'all' ? 'No inventory matches this search.' : 'No inventory yet'}
                </p>
              </ListBand>
            ) : (
              <DataTable aria-labelledby="all-stock-title">
                <thead>
                  <tr>
                    <Th>SKU</Th>
                    <Th priority={2}>Variant</Th>
                    <Th>State</Th>
                    <Th align="right">Quantity</Th>
                    {canManage && <Th align="right"><span className="sr-only">Adjust</span></Th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const state = stockState(item);
                    return (
                      <Tr key={item.id}>
                        <Td className="max-w-0 w-[26%]">
                          <span className="block truncate font-mono text-[12px] text-foreground">{item.sku || '-'}</span>
                          <span className="block truncate text-[12px] text-muted-foreground md:hidden">{item.title}</span>
                        </Td>
                        <Td priority={2} className="max-w-0">
                          <VariantCell item={item} />
                        </Td>
                        <Td><StatusWord tone={state.tone}>{state.label}</StatusWord></Td>
                        <Td align="right" className="text-foreground">{item.manageInventory ? Number(item.inventoryQuantity) || 0 : '-'}</Td>
                        {canManage && <Td align="right" className="w-0 whitespace-nowrap"><AdjustCell item={item} canManage={canManage} /></Td>}
                      </Tr>
                    );
                  })}
                </tbody>
              </DataTable>
            )}
            <nav aria-label="Inventory pages" className="flex flex-wrap items-center gap-2">
              {page > 1 && <Link className={pageLink} href={hrefFor({ page: page - 1, search, stock })}>Previous</Link>}
              {page * PAGE_SIZE < count && <Link className={pageLink} href={hrefFor({ page: page + 1, search, stock })}>Next</Link>}
              {count > PAGE_SIZE && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, count)} of {count}
                </span>
              )}
            </nav>
          </section>
        </>}
      </div>
    </PageContainer>
  );
}
