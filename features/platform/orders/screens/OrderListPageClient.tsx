/**
 * OrderListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for orders
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ListBand, PageTitle, SectionTitle, buttonClass } from '@/features/platform/components/vape-ui'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { StatusTabs } from '../components/StatusTabs'
import { OrderQueue, OrderTable } from '../components/OrderTable'
import { isHeld, isReadyToShip } from '../lib/order-state'
import { cn } from '@/lib/utils'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

interface OrderListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts?: {
    pending: number
    requires_action: number
    completed: number
    archived: number
    canceled: number
    all: number
  }
}

function EmptyStateDefault() {
  return (
    <ListBand>
      <div className="px-4 py-3 text-[13px] text-muted-foreground">No orders</div>
    </ListBand>
  )
}

function EmptyStateSearch({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <ListBand>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-muted-foreground">No matching orders</span>
        <button
          type="button"
          onClick={onResetFilters}
          className={cn(buttonClass.base, buttonClass.outline)}
        >
          Reset filters
        </button>
      </div>
    </ListBand>
  )
}


export function OrderListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts
}: OrderListPageClientProps) {
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

  // For orders, use raw GraphQL string to include relationship fields (same as server)
  const querySelectedFields = `
    id
    displayId
    status
    email
    taxRate
    canceledAt
    createdAt
    updatedAt
    total
    subtotal
    shipping
    tax
    fulfillmentStatus
    paymentDetails
    currency {
      id
      code
      symbol
    }
    user {
      id
      name
      email
    }
    shippingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    billingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    lineItems {
      id
      title
      quantity
      sku
      thumbnail
      formattedUnitPrice
      formattedTotal
      variantTitle
      variantData
      productData
      moneyAmount {
        id
        amount
        originalAmount
      }
    }
    returns {
      id
      status
      refundAmount
      receivedAt
      createdAt
      updatedAt
      returnItems {
        id
        quantity
        note
        lineItem {
          id
          title
        }
        returnReason {
          id
          label
          value
        }
      }
    }
    claimOrders {
      id
      type
      paymentStatus
      fulfillmentStatus
      refundAmount
      canceledAt
      createdAt
      updatedAt
      claimItems {
        id
        reason
        quantity
        note
        lineItem {
          id
          title
        }
        claimImages {
          id
          url
          altText
        }
        claimTags {
          id
          value
          description
        }
      }
    }
  `

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
    { type: 'page' as const, label: 'Orders' }
  ]

  const header = (
    <PageTitle
      title="Orders"
      meta={statusCounts ? (
        <span className="tabular-nums">
          {statusCounts.requires_action} held · {statusCounts.pending} open · {statusCounts.all} total
        </span>
      ) : undefined}
    />
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  // "Needs you" queue from the orders on this page: held first, then paid and unfulfilled, oldest first.
  const items: any[] = data?.items ?? []
  const byOldest = (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  const queue = [
    ...items.filter(isHeld).sort(byOldest),
    ...items.filter(isReadyToShip).sort(byOldest),
  ]
  const heldCount = items.filter(isHeld).length
  const shipCount = queue.length - heldCount

  return (
    <PageContainer title="Orders" header={header} breadcrumbs={breadcrumbs}>
      {!error && queue.length > 0 && (
        <section className="px-4 pt-2 md:px-6" aria-labelledby="orders-queue-title">
          <SectionTitle
            meta={
              <span>
                {heldCount} held · {shipCount} to ship
              </span>
            }
          >
            <span id="orders-queue-title">Needs you</span>
          </SectionTitle>
          <OrderQueue orders={queue} />
          {statusCounts && statusCounts.requires_action > heldCount && (
            <p className="mt-2 text-[12px] text-muted-foreground">
              {statusCounts.requires_action} held orders in total; this queue shows the ones on this page.
            </p>
          )}
        </section>
      )}

      {/* Status Tabs - abstracted status filtering */}
      {statusCounts && <StatusTabs statusCounts={statusCounts} />}

      {/* Filter Bar - includes search, filters, sorting, field selection, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar list={list} />
      </div>

      {/* Active Filters */}
      <div className="px-4 md:px-6">
        <FilterList list={list} />
      </div>

      {/* Data table */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive" className="rounded-md">
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
          <div className={cn("px-4 pb-4 md:px-6", isFetching && !isLoading && "opacity-70 transition-opacity")}>
            <OrderTable orders={items} />
          </div>

          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'order', plural: 'orders' }}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
