'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  buttonClass,
  Count,
  DataTable,
  ListBand,
  Pill,
  SectionTitle,
  Stamp,
  StatusFilter,
  Td,
  Th,
  Tr,
  Track,
  type DotTone,
} from '@/features/platform/components/vape-ui'
import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState'
import { ClassifySheet } from '@/features/platform/products/components/ClassifySheet'
import {
  AUTHORIZATION_STATUS_LABELS,
  AUTHORIZATION_TYPE_LABELS,
  CLASSIFICATION_CATEGORY_LABELS,
  CLASSIFICATION_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels'
import {
  transitionAuthorization,
  transitionClassification,
  type EvidenceAuthorization,
  type EvidenceClassification,
  type EvidenceVariant,
  type ProductEvidence,
} from '../actions/evidence'
import { recordSerial } from '../lib/serial'
import { actionClass, TransitionActions, type TransitionAction } from './TransitionActions'

const STATUS_PARAM = '!status_matches'
const DAY = 24 * 60 * 60 * 1000

const CLASSIFICATION_TONES: Record<string, DotTone> = { draft: 'muted', review: 'warn', approved: 'ok', rejected: 'danger', revoked: 'danger' }
const AUTHORIZATION_TONES: Record<string, DotTone> = { pending: 'warn', authorized: 'ok', suspended: 'danger', delisted: 'danger', denied: 'danger', expired: 'muted' }

// The work queue leads: unclassified variants block every sale of their product
const VIEWS = [
  ['unclassified', 'Needs classification'],
  ['classifications', 'Classifications'],
  ['authorizations', 'Authorizations'],
] as const

const FLAGS = [
  ['all', 'All evidence'],
  ['expiring', 'Expiring in 30 days'],
  ['federal', 'Missing federal authorization'],
] as const

const day = (value: string | null) => (value ? value.slice(0, 10) : '')

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

function expiringSoon(expiresAt: string | null, now: number) {
  if (!expiresAt) return false
  const time = new Date(expiresAt).getTime()
  return time >= now && time <= now + 30 * DAY
}

function Expiry({ value, now }: { value: string | null; now: number }) {
  if (!value) return <span className="whitespace-nowrap font-mono text-[12px] text-muted-foreground">No expiry</span>
  const time = new Date(value).getTime()
  if (time < now) return <Stamp tone="danger" serial={day(value)}>Expired</Stamp>
  if (time <= now + 30 * DAY) return <Stamp tone="warn" serial={day(value)}>Expiring</Stamp>
  return <span className="whitespace-nowrap font-mono text-[12px] text-muted-foreground">Until {day(value)}</span>
}

function ProductLink({ variant }: { variant: EvidenceVariant | null }) {
  if (!variant) return <span className="truncate">No variant</span>
  const label = variant.productTitle || variant.sku || 'Product'
  return (
    <span className="flex min-w-0 items-baseline gap-2">
      {variant.productId ? (
        <Link href={`/dashboard/platform/products/${variant.productId}`} className="inline-flex min-w-0 max-w-[65%] shrink-0 items-baseline gap-0.5 font-medium text-foreground underline-offset-4 hover:underline">
          <span className="truncate">{label}</span>
          <ArrowUpRight className="size-3 shrink-0 translate-y-[0.1em] text-muted-foreground" />
        </Link>
      ) : <span className="max-w-[65%] shrink-0 truncate font-medium text-foreground">{label}</span>}
      {variant.title && <span className="min-w-0 truncate text-[12px] text-muted-foreground">{variant.title}</span>}
    </span>
  )
}

function matches(text: string, values: Array<string | null | undefined>) {
  if (!text) return true
  const needle = text.toLowerCase()
  return values.some(value => value && value.toLowerCase().includes(needle))
}

type Attention = { item: EvidenceClassification; rank: number; tone: DotTone; reason: string }

/** Classifications that still need a decision, most severe first. */
function needsAttention(items: EvidenceClassification[], now: number): Attention[] {
  const out: Attention[] = []
  for (const item of items) {
    if (['rejected', 'revoked'].includes(item.status)) continue
    const expired = item.expiresAt ? new Date(item.expiresAt).getTime() < now : false
    if (item.status === 'approved' && expired) out.push({ item, rank: 0, tone: 'danger', reason: 'Expired' })
    else if (item.status === 'approved' && item.federal === 'missing') out.push({ item, rank: 1, tone: 'danger', reason: 'No federal authorization' })
    else if (expiringSoon(item.expiresAt, now)) out.push({ item, rank: 2, tone: 'warn', reason: 'Expiring in 30 days' })
    else if (item.status === 'review') out.push({ item, rank: 3, tone: 'warn', reason: 'Awaiting review' })
    else if (item.status === 'draft') out.push({ item, rank: 4, tone: 'muted', reason: 'Draft' })
  }
  return out.sort((a, b) => a.rank - b.rank || (a.item.expiresAt || '9').localeCompare(b.item.expiresAt || '9'))
}

export function ProductEvidenceClient({ data }: { data: ProductEvidence }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [sheetVariant, setSheetVariant] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const view = searchParams?.get('view') || 'unclassified'
  const flag = searchParams?.get('flag') || 'all'
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

  const flagged = useMemo(() => ({
    expiring: data.classifications.filter(item => !['rejected', 'revoked'].includes(item.status) && expiringSoon(item.expiresAt, now)),
    federal: data.classifications.filter(item => !['rejected', 'revoked'].includes(item.status) && item.federal === 'missing'),
  }), [data.classifications, now])

  const attention = useMemo(() => needsAttention(data.classifications, now), [data.classifications, now])

  const classificationBase = flag === 'expiring' ? flagged.expiring : flag === 'federal' ? flagged.federal : data.classifications
  const classifications = classificationBase.filter(item =>
    (status === 'all' || item.status === status) &&
    matches(search, [item.variant?.productTitle, item.variant?.title, item.variant?.sku, item.brand, item.flavor]))
  const authorizations = data.authorizations.filter(item =>
    (status === 'all' || item.status === status) &&
    matches(search, [item.variant?.productTitle, item.variant?.title, item.authority, item.authorizationIdentifier, item.jurisdiction]))
  const unclassified = data.unclassified.filter(item => matches(search, [item.productTitle, item.title, item.sku]))
  // Shown only when a variant actually carries a SKU; the stamp serial identifies the record otherwise.
  const anySku = unclassified.some(item => Boolean(item.sku))
  const attentionRows = attention.filter(({ item }) =>
    matches(search, [item.variant?.productTitle, item.variant?.title, item.variant?.sku, item.brand, item.flavor]))

  const filtered = Boolean(search) || status !== 'all' || flag !== 'all'
  const reset = () => { setSearch(''); setParams({ [STATUS_PARAM]: null, flag: null }) }

  const viewCounts: Record<string, number> = {
    classifications: data.classifications.length,
    unclassified: data.unclassified.length,
    authorizations: data.authorizations.length,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 px-4 md:px-6 lg:flex-row lg:items-end lg:justify-between">
        <Track label="View">
          {VIEWS.map(([key, label]) => (
            <Pill key={key} active={view === key} onClick={() => setParams({ view: key === 'unclassified' ? null : key, [STATUS_PARAM]: null, flag: null })}>
              {label} <Count>{viewCounts[key]}</Count>
            </Pill>
          ))}
        </Track>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Product, SKU or brand" className="h-10 rounded-[4px] pl-9" />
        </label>
      </div>

      {view === 'unclassified' && (
        <div className="space-y-8 px-4 md:px-6">
          <section>
            <SectionTitle meta={unclassified.length}>Unclassified variants</SectionTitle>
            {unclassified.length ? (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    {anySku && <Th priority={2}>SKU</Th>}
                    <Th>State</Th>
                    <Th align="right"><span className="sr-only">Action</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {unclassified.map(variant => (
                    <Tr key={variant.id}>
                      <Td className="max-w-[16rem]"><ProductLink variant={variant} /></Td>
                      {anySku && <Td priority={2} className="font-mono text-[12px] text-muted-foreground">{variant.sku || ''}</Td>}
                      <Td><Stamp tone="warn" serial={recordSerial(variant.id)}>Unclassified</Stamp></Td>
                      <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                        <button type="button" className={`${buttonClass.base} ${buttonClass.outline}`} onClick={() => setSheetVariant(variant.id)}>Classify</button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <PlatformEmptyState title={search ? 'No matching variants' : 'Every regulated variant is classified'} onReset={search ? reset : undefined} />
            )}
          </section>

          <section>
            <SectionTitle meta={attentionRows.length}>Classifications needing a decision</SectionTitle>
            {attentionRows.length ? (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>State</Th>
                    <Th priority={2}>Why</Th>
                    <Th align="right"><span className="sr-only">Action</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {attentionRows.map(({ item, tone, reason }) => (
                    <Tr key={item.id}>
                      <Td className="max-w-[16rem]"><ProductLink variant={item.variant} /></Td>
                      <Td>
                        <Stamp tone={CLASSIFICATION_TONES[item.status] || 'muted'} serial={recordSerial(item.id)}>
                          {regulatedLabel(CLASSIFICATION_STATUS_LABELS, item.status)}
                        </Stamp>
                      </Td>
                      <Td priority={2}><Stamp tone={tone}>{reason}</Stamp></Td>
                      <Td align="right" className="w-0 whitespace-nowrap py-0.5">
                        {item.variant && (
                          <button type="button" className={actionClass} onClick={() => item.variant && setSheetVariant(item.variant.id)}>
                            {['draft', 'review'].includes(item.status) ? 'Edit' : 'Open'}
                          </button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <ListBand><div className="px-4 py-3 text-[13px] text-muted-foreground">No classification needs a decision</div></ListBand>
            )}
          </section>
        </div>
      )}

      {view === 'classifications' && (
        <>
          <div className="flex flex-col gap-3 px-4 md:px-6 lg:flex-row lg:items-end lg:justify-between">
            <StatusFilter
              className="min-w-0 p-0 md:px-0"
              allCount={classificationBase.length}
              statuses={Object.entries(CLASSIFICATION_STATUS_LABELS).map(([value, label]) => ({
                value, label, tone: CLASSIFICATION_TONES[value], count: classificationBase.filter(item => item.status === value).length,
              }))}
            />
            <label className="flex shrink-0 items-center gap-2">
              <span className="text-[12px] font-medium text-muted-foreground">Evidence</span>
              <select
                aria-label="Evidence filter"
                className="h-10 rounded-[4px] border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                value={flag}
                onChange={event => setParams({ flag: event.target.value === 'all' ? null : event.target.value })}
              >
                {FLAGS.map(([key, label]) => (
                  <option key={key} value={key}>{label} ({key === 'all' ? data.classifications.length : flagged[key].length})</option>
                ))}
              </select>
            </label>
          </div>
          <div className="px-4 md:px-6">
            {classifications.length ? (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Classification</Th>
                    <Th priority={2}>Federal</Th>
                    <Th priority={3}>Product facts</Th>
                    <Th priority={3}>Marketing</Th>
                    <Th priority={2}>Expiry</Th>
                    <Th align="right"><span className="sr-only">Actions</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {classifications.map(item => (
                    <ClassificationRow key={item.id} item={item} now={now} onOpen={() => item.variant && setSheetVariant(item.variant.id)} />
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <PlatformEmptyState title={filtered ? 'No matching classifications' : 'No classifications'} onReset={filtered ? reset : undefined} />
            )}
          </div>
        </>
      )}

      {view === 'authorizations' && (
        <>
          <StatusFilter
            className="py-0"
            allCount={data.authorizations.length}
            statuses={Object.entries(AUTHORIZATION_STATUS_LABELS).map(([value, label]) => ({
              value, label, tone: AUTHORIZATION_TONES[value], count: data.authorizations.filter(item => item.status === value).length,
            }))}
          />
          <div className="px-4 md:px-6">
            {authorizations.length ? (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Authorization</Th>
                    <Th priority={2}>Product</Th>
                    <Th>Status</Th>
                    <Th priority={3}>Jurisdiction</Th>
                    <Th priority={2}>Expiry</Th>
                    <Th align="right"><span className="sr-only">Actions</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {authorizations.map(item => (
                    <AuthorizationRow key={item.id} item={item} now={now} onOpen={() => item.variant && setSheetVariant(item.variant.id)} />
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <PlatformEmptyState title={filtered ? 'No matching authorizations' : 'No authorizations'} onReset={filtered ? reset : undefined} />
            )}
          </div>
        </>
      )}

      <ClassifySheet
        variantId={sheetVariant}
        open={Boolean(sheetVariant)}
        onOpenChange={open => { if (!open) setSheetVariant(null) }}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}

function ClassificationRow({ item, now, onOpen }: { item: EvidenceClassification; now: number; onOpen: () => void }) {
  const actions: TransitionAction[] = []
  if (item.status === 'review') {
    actions.push({ key: 'reject', label: 'Reject', done: 'Classification rejected', danger: true, run: () => transitionClassification(item.id, 'reject') })
  }
  if (item.status === 'approved') {
    actions.push({ key: 'revoke', label: 'Revoke', done: 'Classification revoked', danger: true, run: () => transitionClassification(item.id, 'revoke') })
  }
  const facts = [
    regulatedLabel(CLASSIFICATION_CATEGORY_LABELS, item.category),
    item.nicotineConcentrationMgMl !== null ? `${Number(item.nicotineConcentrationMgMl)} mg/ml` : null,
    item.liquidVolumeMl !== null ? `${Number(item.liquidVolumeMl)} ml` : null,
    item.flavor || null,
  ].filter(Boolean)

  return (
    <Tr>
      <Td className="max-w-[16rem]"><ProductLink variant={item.variant} /></Td>
      <Td>
        <Stamp tone={CLASSIFICATION_TONES[item.status] || 'muted'} serial={recordSerial(item.id)}>
          {regulatedLabel(CLASSIFICATION_STATUS_LABELS, item.status)}
        </Stamp>
      </Td>
      <Td priority={2}>
        <Stamp tone={item.federal === 'current' ? 'ok' : 'danger'}>
          {item.federal === 'current' ? 'Current' : 'Missing'}
        </Stamp>
      </Td>
      <Td priority={3} className="max-w-[14rem] truncate text-[12px] text-muted-foreground">{facts.join(' · ')}</Td>
      <Td priority={3} className="whitespace-nowrap text-muted-foreground">{regulatedLabel(REVIEW_STATUS_LABELS, item.marketingReviewStatus)}</Td>
      <Td priority={2}><Expiry value={item.expiresAt} now={now} /></Td>
      <Td align="right" className="whitespace-nowrap py-0.5">
        <TransitionActions actions={actions} className="flex flex-col items-end">
          {item.variant && (
            <button type="button" className={actionClass} onClick={onOpen}>
              {['draft', 'review'].includes(item.status) ? 'Edit' : 'Open'}
            </button>
          )}
        </TransitionActions>
      </Td>
    </Tr>
  )
}

function AuthorizationRow({ item, now, onOpen }: { item: EvidenceAuthorization; now: number; onOpen: () => void }) {
  const actions: TransitionAction[] = []
  if (item.status === 'authorized') {
    actions.push({ key: 'suspend', label: 'Suspend', done: 'Authorization suspended', danger: true, run: () => transitionAuthorization(item.id, 'suspend') })
  }
  if (['pending', 'authorized', 'suspended'].includes(item.status)) {
    actions.push({ key: 'delist', label: 'Delist', done: 'Authorization delisted', danger: true, run: () => transitionAuthorization(item.id, 'delist') })
  }
  if (['authorized', 'suspended'].includes(item.status)) {
    actions.push({ key: 'expire', label: 'Mark expired', done: 'Authorization expired', danger: true, run: () => transitionAuthorization(item.id, 'expire') })
  }

  return (
    <Tr>
      <Td className="max-w-[18rem]">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 font-medium text-foreground">{regulatedLabel(AUTHORIZATION_TYPE_LABELS, item.authorizationType)}</span>
          <span className="min-w-0 truncate text-[12px] text-muted-foreground">
            {item.authority}
            {item.delistedAt && ` · delisted ${day(item.delistedAt)}`}
            {item.lastVerifiedAt && ` · verified ${day(item.lastVerifiedAt)}`}
          </span>
        </span>
      </Td>
      <Td priority={2} className="max-w-[14rem]"><ProductLink variant={item.variant} /></Td>
      <Td>
        <Stamp tone={AUTHORIZATION_TONES[item.status] || 'muted'} serial={item.authorizationIdentifier || recordSerial(item.id)}>
          {regulatedLabel(AUTHORIZATION_STATUS_LABELS, item.status)}
        </Stamp>
      </Td>
      <Td priority={3} className="font-mono text-[12px] text-muted-foreground">{item.jurisdiction || 'Federal'}</Td>
      <Td priority={2}><Expiry value={item.expiresAt} now={now} /></Td>
      <Td align="right" className="whitespace-nowrap py-0.5">
        <TransitionActions actions={actions} className="flex flex-col items-end">
          {item.variant && <button type="button" className={actionClass} onClick={onOpen}>Open</button>}
        </TransitionActions>
      </Td>
    </Tr>
  )
}
