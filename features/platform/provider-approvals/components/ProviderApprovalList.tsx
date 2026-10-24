'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Count, Dot, ListBand, Pill, StatusFilter, Track } from '@/features/platform/components/vape-ui'
import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState'
import { AddApprovalButton } from '@/features/platform/compliance-center/components/ProviderApprovalSheet'
import { PROVIDER_APPROVAL_STATUS_LABELS, PROVIDER_PURPOSE_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels'
import type { ApprovalRow } from '../actions/provider-approvals'
import { APPROVAL_TONES, boundProvider, Expiry } from './approval-display'

const STATUS_PARAM = '!status_matches'

function currentStatus(searchParams: { get(name: string): string | null } | null) {
  const raw = searchParams?.get(STATUS_PARAM)
  if (!raw) return 'all'
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return Array.isArray(parsed) && parsed.length ? String(typeof parsed[0] === 'object' ? parsed[0].value : parsed[0]) : 'all'
  } catch {
    return 'all'
  }
}

export function ProviderApprovalList({ approvals }: { approvals: ApprovalRow[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [now] = useState(() => Date.now())

  const purpose = searchParams?.get('purpose') || 'all'
  const status = currentStatus(searchParams)

  const setParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname || "")
  }

  const byPurpose = purpose === 'all' ? approvals : approvals.filter(item => item.purpose === purpose)
  const needle = search.toLowerCase()
  const rows = byPurpose.filter(item =>
    (status === 'all' || item.status === status) &&
    (!needle || [item.providerCode, item.approvalReference, item.profile?.legalName, item.paymentProvider?.name, item.shippingProvider?.name]
      .some(value => value && value.toLowerCase().includes(needle))))
  const filtered = Boolean(search) || status !== 'all' || purpose !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 px-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Track label="Purpose">
          <Pill active={purpose === 'all'} onClick={() => setParams({ purpose: null })}>
            All purposes <Count>{approvals.length}</Count>
          </Pill>
          {Object.entries(PROVIDER_PURPOSE_LABELS).map(([key, label]) => (
            <Pill key={key} active={purpose === key} onClick={() => setParams({ purpose: key })}>
              {label} <Count>{approvals.filter(item => item.purpose === key).length}</Count>
            </Pill>
          ))}
        </Track>
        <div className="flex items-center gap-2">
          <label className="relative block w-full lg:w-60">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search" className="h-10 rounded-full pl-9" />
          </label>
          <AddApprovalButton
            purpose={purpose === 'all' ? 'identity' : purpose}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add approval
          </AddApprovalButton>
        </div>
      </div>

      <StatusFilter
        className="py-0"
        allCount={byPurpose.length}
        statuses={Object.entries(PROVIDER_APPROVAL_STATUS_LABELS).map(([value, label]) => ({
          value, label, tone: APPROVAL_TONES[value], count: byPurpose.filter(item => item.status === value).length,
        }))}
      />

      <div className="px-4 md:px-6">
        {rows.length ? (
          <ListBand>
            {rows.map(item => {
              const provider = boundProvider(item)
              return (
                <Link key={item.id} href={`/dashboard/platform/provider-approvals/${item.id}`} className="block space-y-1.5 px-4 py-3 transition-colors hover:bg-muted/60">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <Dot tone={APPROVAL_TONES[item.status] || 'muted'} />
                      <span className="truncate">{regulatedLabel(PROVIDER_PURPOSE_LABELS, item.purpose)}</span>
                      <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">{item.providerCode}</span>
                      <span className="shrink-0 text-xs font-normal text-muted-foreground">{regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, item.status)}</span>
                    </span>
                    <Expiry value={item.expiresAt} now={now} />
                  </div>
                  <p className="flex flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">
                    {provider && <span>{provider.label}: <span className="text-foreground">{provider.name || 'Not bound'}</span></span>}
                    <span>Product types: <span className="font-mono text-foreground">{item.coveredCategories.length}</span></span>
                    <span>Jurisdictions: <span className="font-mono text-foreground">{item.coveredJurisdictionCodes.length}</span></span>
                    <span>Capabilities: <span className="font-mono text-foreground">{item.capabilities.length}</span></span>
                    {item.profile && <span className="truncate">{item.profile.legalName}</span>}
                  </p>
                </Link>
              )
            })}
          </ListBand>
        ) : (
          <PlatformEmptyState
            title={filtered ? 'No matching approvals' : 'No provider approvals'}
            onReset={filtered ? () => { setSearch(''); setParams({ [STATUS_PARAM]: null, purpose: null }) } : undefined}
          />
        )}
      </div>
    </div>
  )
}
