'use client'

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Columns3,
  Plus,
} from "lucide-react"
import { FilterAdd } from "../../dashboard/components/FilterAdd"
import { FilterList } from "../../dashboard/components/FilterList"
import { SortSelection } from "../../dashboard/components/SortSelection"
import { FieldSelection } from "../../dashboard/components/FieldSelection"
import Link from "next/link"
import { useDashboard } from '../../dashboard/context/DashboardProvider'
import { createButtonClass } from "./vape-primitives"

/** Lists with their own platform create page; others use the generic model route. */
const PLATFORM_CREATE_PATHS = new Set(["orders", "products"])

/** Class for a feature's own create button passed as `customCreateButton` (see `createButtonClass`). */
export const platformCreateButtonClass = createButtonClass

interface PlatformFilterBarProps {
  list: any
  customCreateButton?: React.ReactNode
  createMode?: 'button' | 'dropdown'
  onCreateClick?: (mode?: 'scratch' | 'popular') => void
  createLabel?: string
  showDisplayButton?: boolean
  selectedFields?: Set<string>
}

export function PlatformFilterBar({ 
  list, 
  customCreateButton, 
  createMode = 'button',
  onCreateClick,
  createLabel,
  showDisplayButton = false,
  selectedFields = new Set()
}: PlatformFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const { basePath } = useDashboard()

  const [searchString, setSearchString] = useState(
    searchParams?.get("search") || ""
  )

  // Create a new URLSearchParams instance to manipulate
  const createQueryString = (
    params: Record<string, string | number | null | undefined>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "")

    // Update or delete parameters based on the provided object
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, String(value))
      }
    })

    return newSearchParams.toString()
  }

  // Handle search submission
  const updateSearch = (value: string) => {
    const query = createQueryString({
      search: value.trim() || null,
      page: 1, // Reset to first page when search changes
    })
    router.push(`${pathname}?${query}`)
  }

  // Update search string when URL changes
  useEffect(() => {
    setSearchString(searchParams?.get("search") || "")
  }, [searchParams])

  const searchPlaceholder = `Search ${String(list.plural || list.label || "items").toLowerCase()}`
  const createHref = PLATFORM_CREATE_PATHS.has(list.path)
    ? `${basePath}/platform/${list.path}/create`
    : `${basePath}/${list.path}/create`

  const control =
    "h-10 rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-muted lg:w-auto lg:px-4 [&_svg]:size-4"
  const create = platformCreateButtonClass

  return (
    <div>
      {/* Controls Row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateSearch(searchString)
            }}
          >
            <Input
              type="search"
              className="h-10 w-full rounded-[4px] border border-input bg-background pl-10 text-sm placeholder:text-muted-foreground/80"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </form>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1.5">
          <FilterAdd list={list}>
            <Button variant="ghost" size="icon" className={control}>
              <SlidersHorizontal className="stroke-muted-foreground" />
              <span className="hidden lg:inline">Filter</span>
            </Button>
          </FilterAdd>

          <SortSelection listMeta={list}>
            <Button variant="ghost" size="icon" className={control}>
              <ArrowUpDown className="stroke-muted-foreground" />
              <span className="hidden lg:inline">Sort</span>
            </Button>
          </SortSelection>

          {showDisplayButton && (
            <FieldSelection listMeta={list} selectedFields={selectedFields}>
              <Button variant="ghost" size="icon" className={control}>
                <Columns3 className="stroke-muted-foreground" />
                <span className="hidden lg:inline">Display</span>
              </Button>
            </FieldSelection>
          )}

          {!list.hideCreate && (
            customCreateButton || (
              (createMode === 'dropdown' && onCreateClick) ? (
                <button
                  type="button"
                  onClick={() => onCreateClick?.()}
                  className={create}
                  aria-label={createLabel || `Create ${list.singular}`}
                >
                  <Plus />
                  <span className="hidden lg:inline">{createLabel || `Create ${list.singular}`}</span>
                </button>
              ) : (
                <Link
                  href={createHref}
                  className={create}
                  aria-label={`Create ${list.singular}`}
                >
                  <Plus />
                  <span className="hidden lg:inline">Create {list.singular}</span>
                </Link>
              )
            )
          )}
        </div>
      </div>

    </div>
  )
}
