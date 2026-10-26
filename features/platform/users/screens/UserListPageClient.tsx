/**
 * UserListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for users
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlatformEmptyState } from '../../components/PlatformEmptyState'
import { Button } from '@/components/ui/button'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar, platformCreateButtonClass } from '../../components/PlatformFilterBar'
import Link from 'next/link'
import { DataTable, ListBand, PageTitle, SectionTitle, StatusWord, Th } from '../../components/vape-ui'
import { StatusTabs } from '../components/StatusTabs'
import { UserDetailsComponent } from '../components/UserDetailsComponent'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { CreateItemDrawerClientWrapper } from '@/features/platform/components/CreateItemDrawerClientWrapper'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

interface UserListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts: {
    withAccount: number
    all: number
    withoutAccount: number
  } | null
}

function EmptyStateDefault() {
  return <PlatformEmptyState title="No users" />
}

function EmptyStateSearch({ onResetFilters }: { onResetFilters: () => void }) {
  return <PlatformEmptyState title="No results" onReset={onResetFilters} />
}

export function UserListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts
}: UserListPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const { basePath } = useDashboard()
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list)
  const sort = useSort(list)

  // Extract current search params (reactive to URL changes)
  const currentSearchParams = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
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

  // For users, use raw GraphQL string to include relationship fields (from working repomix)
  const querySelectedFields = `
    id
    name
    email
    firstName
    lastName
    hasAccount
    role {
      id
      name
    }
    orders {
      id
      displayId
      status
      email
      taxRate
      canceledAt
      createdAt
      updatedAt
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
        variantData
        productData
      }
      total
    }
    createdAt
    updatedAt
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
    { type: 'page' as const, label: 'Users' }
  ]

  const header = <PageTitle title="Users" />

  // Customers on this page with orders held for action, oldest held order first.
  const heldQueue = (data?.items || [])
    .map((user: any) => {
      const held = (user.orders || []).filter((order: any) => order.status === 'requires_action')
      const oldest = held.reduce(
        (min: any, order: any) => (!min || new Date(order.createdAt) < new Date(min.createdAt) ? order : min),
        null
      )
      return { user, held, oldest }
    })
    .filter((entry: any) => entry.held.length > 0)
    .sort((a: any, b: any) => new Date(a.oldest.createdAt).getTime() - new Date(b.oldest.createdAt).getTime())

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="Users" header={header} breadcrumbs={breadcrumbs}>
      {heldQueue.length > 0 && (
        <section aria-label="Customers with held orders" className="px-4 pb-6 md:px-6">
          <SectionTitle meta={heldQueue.length}>Needs you</SectionTitle>
          <ListBand>
            {heldQueue.map(({ user, held, oldest }: any) => (
              <div key={user.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
                  <StatusWord tone="warn">{held.length} held</StatusWord>
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.name || user.email}
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground">#{oldest.displayId}</span>
                  <span className="text-[12px] tabular-nums text-muted-foreground">
                    since {new Date(oldest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  </span>
                </span>
                <Link
                  href={`/dashboard/platform/orders/${oldest.id}`}
                  className="inline-flex min-h-8 items-center rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-muted max-sm:min-h-10"
                >
                  Review order
                </Link>
              </div>
            ))}
          </ListBand>
        </section>
      )}

      {/* Filter Bar - includes search, filters, sorting, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar 
          list={list}
          customCreateButton={
            <Button 
              onClick={() => setIsCreateDrawerOpen(true)}
              size="icon"
              className={platformCreateButtonClass}
            >
              <Plus />
              <span className="hidden lg:inline">Create {list.singular}</span>
            </Button>
          }
        />
      </div>

      {/* Status Tabs */}
      {statusCounts && (
        <StatusTabs statusCounts={statusCounts} />
      )}

      {/* Active Filters */}
      <div className="px-4 md:px-6">
        <FilterList list={list} />
      </div>

      {/* Users list */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load items: {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : isEmpty ? (
        <div className="px-4 md:px-6">
          <EmptyStateDefault />
        </div>
      ) : data?.count === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyStateSearch onResetFilters={handleResetFilters} />
        </div>
      ) : (
        <>
          {/* Data grid - full width */}
          <div className="px-4 md:px-6 pb-6">
            <DataTable aria-label="Users">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th priority={2}>Email</Th>
                  <Th priority={2}>Role</Th>
                  <Th>Status</Th>
                  <Th align="right" priority={3}>Orders</Th>
                  <Th priority={3}>Joined</Th>
                  <Th align="right"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((user: any) => (
                  <UserDetailsComponent key={user.id} user={user} list={list} />
                ))}
              </tbody>
            </DataTable>
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'user', plural: 'users' }}
              />
            </div>
          )}
        </>
      )}

      {/* Create Item Drawer */}
      <CreateItemDrawerClientWrapper
        listKey="users"
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={() => {
          window.location.reload();
        }}
      />
    </PageContainer>
  )
}
