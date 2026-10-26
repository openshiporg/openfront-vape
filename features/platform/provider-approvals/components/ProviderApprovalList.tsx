'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { buttonClass, DataTable, ListBand, SectionTitle, Stamp, StatusFilter, Td, Th, Tr, type DotTone } from '@/features/platform/components/vape-ui'
import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState'
import { AddApprovalButton } from '@/features/platform/compliance-center/components/ProviderApprovalSheet'
import { PROVIDER_APPROVAL_STATUS_LABELS, PROVIDER_PURPOSE_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels'
import type { ApprovalRow } from '../actions/provider-approvals'
import { recordSerial } from '@/features/platform/product-evidence/lib/serial'
import { APPROVAL_TONES, approvalInForce, boundProvider, DAY, day, Expiry, REQUIRED_PROVIDER_PURPOSES } from './approval-display'

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

type Slot = { purpose: string; tone: DotTone; state: string; rank: number; pending: ApprovalRow | null }

/** Required purposes with no approval in force, and in-force ones about to lapse, most severe first. */
function missingSlots(approvals: ApprovalRow[], now: number): Slot[] {
  const slots: Slot[] = []
  for (const purpose of REQUIRED_PROVIDER_PURPOSES) {
    const mine = approvals.filter(item => item.purpose === purpose)
    const current = mine.filter(item => approvalInForce(item, now))
    if (current.length) {
      const soonest = current.reduce((a, b) => ((a.expiresAt || '') < (b.expiresAt || '') ? a : b))
      const ends = soonest.expiresAt ? new Date(soonest.expiresAt).getTime() : Infinity
      if (ends <= now + 30 * DAY) slots.push({ purpose, tone: 'warn', state: `Expires ${day(soonest.expiresAt)}`, rank: 2, pending: soonest })
      continue
    }
    const pending = mine.find(item => item.status === 'review') || mine.find(item => item.status === 'unconfigured')
      || mine.find(item => item.status === 'active') || null
    const state = !pending ? 'Missing'
      : pending.status === 'active' ? 'Outside its dates'
      : regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, pending.status)
    slots.push({ purpose, tone: pending ? 'warn' : 'danger', state, rank: pending ? 1 : 0, pending })
  }
  return slots.sort((a, b) => a.rank - b.rank)
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

  const slots = missingSlots(approvals, now)
  const byPurpose = purpose === 'all' ? approvals : approvals.filter(item => item.purpose === purpose)
  const needle = search.toLowerCase()
  const rows = byPurpose.filter(item =>
    (status === 'all' || item.status === status) &&
    (!needle || [item.providerCode, item.approvalReference, item.profile?.legalName, item.paymentProvider?.name, item.shippingProvider?.name]
      .some(value => value && value.toLowerCase().includes(needle))))
  const filtered = Boolean(search) || status !== 'all' || purpose !== 'all'

  return (
    <div className="space-y-8 px-4 md:px-6">
      <section>
        <SectionTitle meta={`${REQUIRED_PROVIDER_PURPOSES.length - slots.filter(slot => slot.rank < 2).length} of ${REQUIRED_PROVIDER_PURPOSES.length} in force`}>
          Required providers
        </SectionTitle>
        {slots.length === 0 ? (
          <ListBand><div className="px-4 py-3 text-[13px] text-muted-foreground">Every required provider has an approval in force</div></ListBand>
        ) : (
          <DataTable>
            <thead>
              <tr>
                <Th>Purpose</Th>
                <Th>State</Th>
                <Th priority={2}>Record</Th>
                <Th align="right"><span className="sr-only">Fix</span></Th>
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <Tr key={slot.purpose}>
                  <Td className="font-medium text-foreground">{regulatedLabel(PROVIDER_PURPOSE_LABELS, slot.purpose)}</Td>
                  <Td><Stamp tone={slot.tone}>{slot.state}</Stamp></Td>
                  <Td priority={2} className="font-mono text-[12px] text-muted-foreground">
                    {slot.pending ? slot.pending.providerCode || recordSerial(slot.pending.id) : 'No record'}
                  </Td>
                  <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                    {slot.pending && slot.rank === 1 ? (
                      <Link href={`/dashboard/platform/provider-approvals/${slot.pending.id}`} className={`${buttonClass.base} ${buttonClass.outline}`}>
                        Finish approval
                      </Link>
                    ) : (
                      <AddApprovalButton purpose={slot.purpose} className={`${buttonClass.base} ${buttonClass.outline}`}>
                        <Plus />
                        {slot.rank === 2 ? 'Renew' : 'Add approval'}
                      </AddApprovalButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle meta={rows.length}>All approvals</SectionTitle>
        {/* Status tabs keep the full row; search and purpose sit on their own row so no status clips. */}
        <div className="flex flex-col gap-3">
          <StatusFilter
            className="min-w-0 p-0 md:px-0"
            allCount={byPurpose.length}
            statuses={Object.entries(PROVIDER_APPROVAL_STATUS_LABELS).map(([value, label]) => ({
              value, label, tone: APPROVAL_TONES[value], count: byPurpose.filter(item => item.status === value).length,
            }))}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:w-56">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Code, reference or provider" className="h-10 rounded-[4px] pl-9" />
            </label>
            <label className="flex shrink-0 items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">Purpose</span>
              <select
                aria-label="Purpose"
                className="h-10 min-w-0 rounded-[4px] border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                value={purpose}
                onChange={event => setParams({ purpose: event.target.value === 'all' ? null : event.target.value })}
              >
                <option value="all">All purposes ({approvals.length})</option>
                {Object.entries(PROVIDER_PURPOSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label} ({approvals.filter(item => item.purpose === key).length})</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {rows.length ? (
          <DataTable>
            <thead>
              <tr>
                <Th>Purpose</Th>
                <Th priority={2}>Provider</Th>
                <Th>Status</Th>
                <Th priority={2}>Expiry</Th>
                <Th priority={3}>Profile</Th>
                <Th priority={3}>Serial</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(item => {
                const provider = boundProvider(item)
                return (
                  <Tr key={item.id}>
                    <Td>
                      <Link href={`/dashboard/platform/provider-approvals/${item.id}`} className="flex min-w-0 items-baseline gap-2 underline-offset-4 hover:underline max-sm:min-h-10 max-sm:items-center">
                        <span className="shrink-0 truncate font-medium text-foreground">{regulatedLabel(PROVIDER_PURPOSE_LABELS, item.purpose)}</span>
                        <span className="min-w-0 truncate font-mono text-[12px] text-muted-foreground md:hidden">{item.providerCode}</span>
                      </Link>
                    </Td>
                    <Td priority={2} className="max-w-[18rem]">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0 font-mono text-[12px] text-foreground">{item.providerCode}</span>
                        {provider && <span className="min-w-0 truncate text-[12px] text-muted-foreground">{provider.name || `${provider.label} not bound`}</span>}
                      </span>
                    </Td>
                    <Td>
                      <Stamp tone={APPROVAL_TONES[item.status] || 'muted'} serial={recordSerial(item.id)}>
                        {regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, item.status)}
                      </Stamp>
                    </Td>
                    <Td priority={2}><Expiry value={item.expiresAt} now={now} /></Td>
                    <Td priority={3} className="max-w-[12rem] truncate text-muted-foreground">{item.profile?.legalName || 'No profile'}</Td>
                    <Td priority={3} className="font-mono text-[12px] text-muted-foreground">{item.approvalReference}</Td>
                  </Tr>
                )
              })}
            </tbody>
          </DataTable>
        ) : (
          <PlatformEmptyState
            title={filtered ? 'No matching approvals' : 'No provider approvals'}
            onReset={filtered ? () => { setSearch(''); setParams({ [STATUS_PARAM]: null, purpose: null }) } : undefined}
          />
        )}
      </section>
    </div>
  )
}
