"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/features/dashboard/context/DashboardProvider"
import { Pagination } from "@/features/dashboard/components/Pagination"
import { deleteManyItemsAction } from "@/features/dashboard/actions/item-actions"
import {
  DataTable,
  ListBand,
  SectionTitle,
  StatusWord,
  Td,
  Th,
  Tr,
  type DotTone,
} from "@/features/platform/components/vape-ui"

type ApiKeyRow = {
  id: string
  name?: string | null
  tokenPreview?: string | null
  scopes?: string[] | null
  status?: string | null
  expiresAt?: string | null
  lastUsedAt?: string | null
  usageCount?: { total?: number } | null
  restrictedToIPs?: string[] | null
  user?: { id: string; name?: string | null; email?: string | null } | null
  createdAt?: string | null
}

const DAY = 24 * 60 * 60 * 1000

const STATUS: Record<string, { label: string; tone: DotTone }> = {
  active: { label: "Active", tone: "ok" },
  inactive: { label: "Inactive", tone: "muted" },
  revoked: { label: "Revoked", tone: "danger" },
}

function day(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
}

function keyState(key: ApiKeyRow, now: number): { label: string; tone: DotTone } {
  const expires = key.expiresAt ? new Date(key.expiresAt).getTime() : NaN
  if (key.status !== "revoked" && Number.isFinite(expires) && expires <= now) {
    return { label: "Expired", tone: "danger" }
  }
  return STATUS[key.status || ""] ?? { label: key.status || "Unknown", tone: "muted" }
}

/** Keys that need the operator: expired-but-not-revoked first, then active keys expiring within 14 days. */
function needsYou(items: ApiKeyRow[], now: number) {
  const rows: Array<{ key: ApiKeyRow; tone: DotTone; word: string; detail: string; at: number }> = []
  for (const key of items) {
    if (key.status === "revoked") continue
    const expires = key.expiresAt ? new Date(key.expiresAt).getTime() : NaN
    if (!Number.isFinite(expires)) continue
    if (expires <= now) {
      rows.push({ key, tone: "danger", word: "Expired", detail: `Expired ${day(key.expiresAt)}`, at: expires })
    } else if (key.status === "active" && expires - now <= 14 * DAY) {
      rows.push({ key, tone: "warn", word: "Expiring", detail: `Expires ${day(key.expiresAt)}`, at: expires })
    }
  }
  return rows.sort((a, b) => (a.tone === b.tone ? a.at - b.at : a.tone === "danger" ? -1 : 1))
}

/** The "needs you" queue for API keys, shown above the filter bar. */
export function ApiKeyQueue({ items, list }: { items: ApiKeyRow[]; list: any }) {
  const { basePath } = useDashboard()
  const [now] = useState(() => Date.now())
  const href = (id: string) => `${basePath}/${list.path}/${encodeURIComponent(id)}`
  const queue = needsYou(items || [], now)
  if (queue.length === 0) return null
  return (
    <>
        <section aria-label="Keys that need you" className="px-4 pb-6 md:px-6">
          <SectionTitle meta={queue.length}>Needs you</SectionTitle>
          <ListBand>
            {queue.map(({ key, tone, word, detail }) => (
              <div key={key.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
                  <StatusWord tone={tone}>{word}</StatusWord>
                  <span className="truncate text-sm font-medium text-foreground">{key.name || "Untitled key"}</span>
                  <span className="font-mono text-[12px] text-muted-foreground">{key.tokenPreview}</span>
                  <span className="text-[12px] tabular-nums text-muted-foreground">{detail}</span>
                </span>
                <Link
                  href={href(key.id)}
                  className="inline-flex min-h-8 items-center rounded-[4px] border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-muted max-sm:min-h-10"
                >
                  {tone === "danger" ? "Revoke or renew" : "Renew"}
                </Link>
              </div>
            ))}
          </ListBand>
        </section>
    </>
  )
}

export function ApiKeyRecordsTable({
  data,
  list,
  selectedFields,
  currentPage,
  pageSize,
}: {
  data: { items: ApiKeyRow[]; count: number }
  list: any
  selectedFields: Set<string>
  currentPage: number
  pageSize: number
}) {
  const { basePath } = useDashboard()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [now] = useState(() => Date.now())

  const items = data.items || []
  const show = (field: string) => selectedFields.has(field)
  const href = (id: string) => `${basePath}/${list.path}/${encodeURIComponent(id)}`
  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id))

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })

  const handleDelete = async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (!list.gqlNames?.deleteManyMutationName) {
      toast.error("Delete functionality not available for this list")
      return
    }
    setIsDeleteLoading(true)
    try {
      const response = await deleteManyItemsAction(list.key, ids, {
        deleteManyMutationName: list.gqlNames.deleteManyMutationName,
        whereUniqueInputName: list.gqlNames.whereUniqueInputName,
      })
      if (response.errors.length > 0) {
        toast.error(response.errors[0].message)
      } else {
        toast.success(`Successfully deleted ${ids.length} ${ids.length === 1 ? list.singular : list.plural}`)
        setSelected(new Set())
        await queryClient.invalidateQueries({ queryKey: ["lists", list.key, "items"] })
      }
    } catch {
      toast.error("Unable to delete the selected items. Please try again.")
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-4 md:px-6">
        <DataTable aria-label="API keys">
          <thead>
            <tr>
              <Th className="w-10">
                <Checkbox
                  aria-label="Select all keys on this page"
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? new Set(items.map((item) => item.id)) : new Set())
                  }
                  className="rounded-[2px]"
                />
              </Th>
              <Th>Name</Th>
              <Th>Prefix</Th>
              <Th>Status</Th>
              {show("scopes") && <Th priority={3}>Scopes</Th>}
              {show("user") && <Th priority={3}>Owner</Th>}
              {show("lastUsedAt") && <Th priority={2}>Last used</Th>}
              {show("usageCount") && <Th priority={3} align="right">Requests</Th>}
              {show("expiresAt") && <Th priority={2}>Expires</Th>}
              {show("createdAt") && <Th priority={3}>Created</Th>}
            </tr>
          </thead>
          <tbody>
            {items.map((key) => {
              const state = keyState(key, now)
              const scopes = key.scopes || []
              return (
                <Tr key={key.id} data-state={selected.has(key.id) ? "selected" : undefined}>
                  <Td className="w-10">
                    <Checkbox
                      aria-label={`Select ${key.name || key.id}`}
                      checked={selected.has(key.id)}
                      onCheckedChange={(checked) => toggle(key.id, !!checked)}
                      className="rounded-[2px]"
                    />
                  </Td>
                  <Td className="max-w-[14rem]">
                    <Link href={href(key.id)} className="block truncate font-medium text-foreground hover:underline">
                      {key.name || "Untitled key"}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-[12px] text-foreground">{key.tokenPreview || "—"}</Td>
                  <Td>
                    <StatusWord tone={state.tone}>{state.label}</StatusWord>
                  </Td>
                  {show("scopes") && (
                    <Td priority={3} className="max-w-[18rem]">
                      <span className="flex flex-wrap gap-1">
                        {scopes.slice(0, 3).map((scope) => (
                          <span key={scope} className="rounded-[2px] border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {scope}
                          </span>
                        ))}
                        {scopes.length > 3 && <span className="text-[12px] text-muted-foreground">+{scopes.length - 3}</span>}
                      </span>
                    </Td>
                  )}
                  {show("user") && (
                    <Td priority={3} className="max-w-[12rem] truncate text-muted-foreground">
                      {key.user?.name || key.user?.email || ""}
                    </Td>
                  )}
                  {show("lastUsedAt") && (
                    <Td priority={2} className={cn("whitespace-nowrap tabular-nums", !key.lastUsedAt && "text-muted-foreground")}>
                      {key.lastUsedAt ? day(key.lastUsedAt) : "Never"}
                    </Td>
                  )}
                  {show("usageCount") && (
                    <Td priority={3} align="right">{key.usageCount?.total ?? 0}</Td>
                  )}
                  {show("expiresAt") && (
                    <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">
                      {key.expiresAt ? day(key.expiresAt) : "No expiry"}
                    </Td>
                  )}
                  {show("createdAt") && (
                    <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{day(key.createdAt)}</Td>
                  )}
                </Tr>
              )
            })}
          </tbody>
        </DataTable>
      </div>

      {items.length > 0 && (
        <Pagination
          currentPage={currentPage}
          total={data.count || 0}
          pageSize={pageSize}
          list={{ singular: list.singular, plural: list.plural }}
          selectedItems={selected}
          onResetSelection={() => setSelected(new Set())}
          onDelete={handleDelete}
          isDeleteLoading={isDeleteLoading}
        />
      )}
    </div>
  )
}
