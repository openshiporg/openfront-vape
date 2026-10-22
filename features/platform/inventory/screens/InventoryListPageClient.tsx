'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListBand, PageTitle } from '@/features/platform/components/vape-ui';
import { Button } from '@/components/ui/button';
import { PageContainer } from '../../../dashboard/components/PageContainer';
import { PlatformFilterBar } from '../../components/PlatformFilterBar';
import { StatusTabs } from '../components/StatusTabs';
import { InventoryDetailsComponent } from '../components/InventoryDetailsComponent';
import { Pagination } from '../../../dashboard/components/Pagination';
import { FilterList } from '../../../dashboard/components/FilterList';
import { CreateItemDrawerClientWrapper } from '@/features/platform/components/CreateItemDrawerClientWrapper';
import { useDashboard } from '../../../dashboard/context/DashboardProvider';
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields';
import { useSort } from '../../../dashboard/hooks/useSort';
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query';
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause';
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause';

interface InventoryListPageClientProps {
  list: any;
  initialData: { items: any[], count: number };
  initialError: string | null;
  initialSearchParams: {
    page: number;
    pageSize: number;
    search: string;
  };
  statusCounts: {
    all: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    backordered: number;
  } | null;
}

function EmptyStateDefault() {
  return (
    <ListBand>
      <div className="px-4 py-4 text-sm text-muted-foreground">No inventory items</div>
    </ListBand>
  )
}

function EmptyStateSearch({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <ListBand>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-muted-foreground">No matching inventory items</span>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex min-h-9 items-center rounded-full bg-background px-4 text-sm font-medium text-foreground shadow-xs ring-1 ring-border max-sm:min-h-10"
        >
          Reset filters
        </button>
      </div>
    </ListBand>
  )
}


export function InventoryListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts
}: InventoryListPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const { basePath } = useDashboard();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list);
  const sort = useSort(list);

  // Extract current search params (reactive to URL changes)
  const currentSearchParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const currentPage = parseInt(currentSearchParams.page || '1', 10) || 1;
  const pageSize = parseInt(currentSearchParams.pageSize || list.pageSize?.toString() || '50', 10);
  const searchString = currentSearchParams.search || '';

  // Build query variables from current search params
  const variables = useMemo(() => {
    const orderBy = buildOrderByClause(list, currentSearchParams);
    const filterWhere = buildWhereClause(list, currentSearchParams);
    const searchParameters = searchString ? { search: searchString } : {};
    const searchWhere = buildWhereClause(list, searchParameters);

    // Combine search and filters
    const whereConditions = [];
    if (Object.keys(searchWhere).length > 0) {
      whereConditions.push(searchWhere);
    }
    if (Object.keys(filterWhere).length > 0) {
      whereConditions.push(filterWhere);
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    return {
      where,
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy
    };
  }, [list, currentSearchParams, currentPage, pageSize, searchString]);

  // For inventory, use raw GraphQL string to include relationship fields (same as action)
  const querySelectedFields = `
    id
    sku
    location
    quantity
    reservedQuantity
    incomingQuantity
    status
    product {
      id
      title
      thumbnail
    }
    variant {
      id
      title
      sku
    }
    createdAt
    updatedAt
  `;

  // Use React Query hook with server-side initial data
  // Use React Query hook with server-side initial data
  const { data: queryData, error: queryError, isLoading, isFetching } = useListItemsQuery(
    {
      listKey: list.key,
      variables,
      selectedFields: querySelectedFields
    },
    {
      initialData: initialError ? undefined : initialData,
    }
  );

  // Use query data, fallback to initial data
  const data = queryData || initialData;
  const error = queryError ? queryError.message : initialError;

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    
    if (newPage && newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(newUrl);
  }, [router]);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  if (!list) {
    return (
      <PageContainer title="List not found">
        <Alert variant="destructive">
          <AlertDescription>
            The requested list was not found.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const breadcrumbs = [
    { type: 'link' as const, label: 'Dashboard', href: basePath },
    { type: 'page' as const, label: 'Platform' },
    { type: 'page' as const, label: 'Inventory' }
  ];

  const header = <PageTitle title="Inventory" />;

  // Check if we have any active filters
  const hasFilters = !!searchString;
  const isFiltered = hasFilters;
  const isEmpty = data?.count === 0 && !isFiltered;

  return (
    <PageContainer title="Inventory" header={header} breadcrumbs={breadcrumbs}>
      {/* Filter Bar with custom create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar 
          list={list}
          customCreateButton={
            <Button 
              onClick={() => setIsCreateDrawerOpen(true)}
              size="icon"
              className="rounded-full lg:px-4 lg:py-2 lg:w-auto"
            >
              <CirclePlus />
              <span className="hidden lg:inline">Create {list.singular}</span>
            </Button>
          }
        />
      </div>

      {/* Status Tabs */}
      {statusCounts && <StatusTabs statusCounts={statusCounts} />}

      {/* Active Filters */}
      <div className="px-4 md:px-6">
        <FilterList list={list} />
      </div>

      {/* Inventory list */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load inventory: {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : isEmpty ? (
        <div className="px-4 md:px-6 py-4">
          <EmptyStateDefault />
        </div>
      ) : data?.count === 0 ? (
        <div className="px-4 md:px-6 py-4">
          <EmptyStateSearch onResetFilters={handleResetFilters} />
        </div>
      ) : (
        <>
          {/* Data grid */}
          <div className="grid grid-cols-1 border-t border-border">
            {data?.items?.map((item: any) => (
              <InventoryDetailsComponent key={item.id} inventory={item} list={list} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'item', plural: 'items' }}
              />
            </div>
          )}
        </>
      )}

      {/* Create Item Drawer */}
      <CreateItemDrawerClientWrapper
        listKey="inventory"
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={() => {
          window.location.reload();
        }}
      />
    </PageContainer>
  );
}