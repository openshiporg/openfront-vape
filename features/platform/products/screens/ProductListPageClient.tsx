/**
 * ProductListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for products
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ListBand, PageTitle, buttonClass } from '@/features/platform/components/vape-ui'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { StatusTabs } from '../components/StatusTabs'
import { BlockedQueue, ProductTable } from '../components/ProductTable'
import type { ComplianceById } from '../components/product-blockers'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

interface ProductListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError?: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts: {
    all: number;
    draft: number;
    proposed: number;
    published: number;
    rejected: number;
  } | null
  complianceById?: ComplianceById
}

function EmptyStateDefault() {
  return (
    <ListBand>
      <div className="px-4 py-4 text-sm text-muted-foreground">No products</div>
    </ListBand>
  )
}

function EmptyStateSearch({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <ListBand>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-muted-foreground">No matching products</span>
        <button
          type="button"
          onClick={onResetFilters}
          className={`${buttonClass.base} ${buttonClass.outline}`}
        >
          Reset filters
        </button>
      </div>
    </ListBand>
  )
}


export function ProductListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts,
  complianceById = {}
}: ProductListPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const { basePath } = useDashboard()
  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list)
  const sort = useSort(list)

  // Extract current search params (reactive to URL changes)
  const currentSearchParams = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams?.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  const currentPage = parseInt(currentSearchParams.page || '1', 10) || 1
  const pageSize = parseInt(currentSearchParams.pageSize || list.pageSize?.toString() || '50', 10)
  const searchString = currentSearchParams.search || ''

  // Build query variables from current search params
  const variables = useMemo(() => {
    const orderBy = buildOrderByClause(list, currentSearchParams)
    const filterWhere = buildWhereClause(list, currentSearchParams)
    const searchParameters = searchString ? { search: searchString } : {}
    const searchWhere = buildWhereClause(list, searchParameters)

    // Combine search and filters
    const whereConditions = []
    if (Object.keys(searchWhere).length > 0) {
      whereConditions.push(searchWhere)
    }
    if (Object.keys(filterWhere).length > 0) {
      whereConditions.push(filterWhere)
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

    return {
      where,
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy
    }
  }, [list, currentSearchParams, currentPage, pageSize, searchString])

  // For products, use raw GraphQL string to include relationship fields (matching working repo)
  const querySelectedFields = `
    id
    title
    handle
    status
    description {
      document
    }
    thumbnail
    createdAt
    updatedAt
    productVariants(orderBy: { createdAt: asc }) {
      id
      title
      sku
      inventoryQuantity
      manageInventory
    }
    productImages(orderBy: { order: asc }) {
      id
      image {
        url
      }
      imagePath
      altText
      order
    }
    productCategories {
      id
      title
    }
    productCollections {
      id
      title
    }
  `

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
  )

  // Use query data, fallback to initial data
  const data = queryData || initialData
  const error = queryError ? queryError.message : initialError

  // Handle page change - simplified since FilterBar handles search/filters
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    
    if (newPage && newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(newUrl)
  }, [router])

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    router.push(window.location.pathname)
  }, [router])

  if (!list) {
    return (
      <PageContainer title="List not found">
        <Alert variant="destructive">
          <AlertDescription>
            The requested list was not found.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  const breadcrumbs = [
    { type: 'link' as const, label: 'Dashboard', href: basePath },
    { type: 'page' as const, label: 'Platform' },
    { type: 'page' as const, label: 'Products' }
  ]

  const header = (
    <PageTitle
      title="Products"
      meta={statusCounts ? (
        <span className="tabular-nums">
          {statusCounts.published} published · {statusCounts.draft} draft · {statusCounts.proposed} proposed · {statusCounts.rejected} rejected
        </span>
      ) : undefined}
    />
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="Products" header={header} breadcrumbs={breadcrumbs}>
      {/* Needs you: products not on sale, most severe first */}
      {!error && !isEmpty && (data?.items?.length ?? 0) > 0 && (
        <div className="px-4 pb-4 md:px-6">
          <BlockedQueue products={data.items} complianceById={complianceById} />
        </div>
      )}

      {/* Filter Bar - includes search, filters, sorting, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar list={list} />
      </div>

      {/* Status Tabs */}
      {statusCounts && <StatusTabs statusCounts={statusCounts} />}

      {/* Active Filters */}
      <div className="px-4 md:px-6">
        <FilterList list={list} />
      </div>

      {/* Products list */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load items: {error}
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
          {/* Full list */}
          <div className="px-4 md:px-6">
            <ProductTable products={data?.items || []} complianceById={complianceById} />
          </div>

          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'product', plural: 'products' }}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}