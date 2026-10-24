'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Count, Dot, ListBand, Pill, StatusFilter, Track, type DotTone } from '@/features/platform/components/vape-ui'
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
import { actionClass, TransitionActions, type TransitionAction } from './TransitionActions'

const STATUS_PARAM = '!status_matches'
const DAY = 24 * 60 * 60 * 1000

const CLASSIFICATION_TONES: Record<string, DotTone> = { draft: 'muted', review: 'warn', approved: 'ok', rejected: 'danger', revoked: 'danger' }
const AUTHORIZATION_TONES: Record<string, DotTone> = { pending: 'warn', authorized: 'ok', suspended: 'danger', delisted: 'danger', denied: 'danger', expired: 'muted' }

const VIEWS = [
  ['classifications', 'Classifications'],
  ['unclassified', 'Unclassified variants'],
  ['authorizations', 'Authorizations'],
] as const

const FLAGS = [
  ['all', 'All'],
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
  if (!value) return <span className="shrink-0 font-mono text-xs text-muted-foreground">No expiry</span>
  const time = new Date(value).getTime()
  const tone = time < now ? 'text-red-600 dark:text-red-400' : time <= now + 30 * DAY ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
  return <span className={`shrink-0 font-mono text-xs ${tone}`}>{time < now ? 'Expired' : 'Until'} {day(value)}</span>
}

function ProductLink({ variant }: { variant: EvidenceVariant | null }) {
  if (!variant) return <span className="truncate">No variant</span>
  const label = variant.productTitle || variant.sku || 'Product'
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      {variant.productId ? (
        <Link href={`/dashboard/platform/products/${variant.productId}`} className="inline-flex min-w-0 items-baseline gap-0.5 hover:underline underline-offset-4">
          <span className="truncate">{label}</span>
          <ArrowUpRight className="size-3 shrink-0 translate-y-[0.1em] text-muted-foreground" />
        </Link>
      ) : <span className="truncate">{label}</span>}
      {variant.title && <span className="truncate text-xs font-normal text-muted-foreground">{variant.title}</span>}
    </span>
  )
}

function matches(text: string, values: Array<string | null | undefined>) {
  if (!text) return true
  const needle = text.toLowerCase()
  return values.some(value => value && value.toLowerCase().includes(needle))
}

export function ProductEvidenceClient({ data }: { data: ProductEvidence }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [sheetVariant, setSheetVariant] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const view = searchParams?.get('view') || 'classifications'
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

  const classificationBase = flag === 'expiring' ? flagged.expiring : flag === 'federal' ? flagged.federal : data.classifications
  const classifications = classificationBase.filter(item =>
    (status === 'all' || item.status === status) &&
    matches(search, [item.variant?.productTitle, item.variant?.title, item.variant?.sku, item.brand, item.flavor]))
  const authorizations = data.authorizations.filter(item =>
    (status === 'all' || item.status === status) &&
    matches(search, [item.variant?.productTitle, item.variant?.title, item.authority, item.authorizationIdentifier, item.jurisdiction]))
  const unclassified = data.unclassified.filter(item => matches(search, [item.productTitle, item.title, item.sku]))

  const filtered = Boolean(search) || status !== 'all' || flag !== 'all'
  const reset = () => { setSearch(''); setParams({ [STATUS_PARAM]: null, flag: null }) }

  const viewCounts: Record<string, number> = {
    classifications: data.classifications.length,
    unclassified: data.unclassified.length,
    authorizations: data.authorizations.length,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 px-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Track label="View">
          {VIEWS.map(([key, label]) => (
            <Pill key={key} active={view === key} onClick={() => setParams({ view: key === 'classifications' ? null : key, [STATUS_PARAM]: null, flag: null })}>
              {label} <Count>{viewCounts[key]}</Count>
            </Pill>
          ))}
        </Track>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search" className="h-10 rounded-full pl-9" />
        </label>
      </div>

      {view === 'classifications' && (
        <>
          <StatusFilter
            className="py-0"
            allCount={classificationBase.length}
            statuses={Object.entries(CLASSIFICATION_STATUS_LABELS).map(([value, label]) => ({
              value, label, tone: CLASSIFICATION_TONES[value], count: classificationBase.filter(item => item.status === value).length,
            }))}
          />
          <div className="px-4 md:px-6">
            <Track label="Evidence filter">
              {FLAGS.map(([key, label]) => (
                <Pill key={key} active={flag === key} onClick={() => setParams({ flag: key === 'all' ? null : key })}>
                  {label} <Count>{key === 'all' ? data.classifications.length : flagged[key].length}</Count>
                </Pill>
              ))}
            </Track>
          </div>
          <div className="px-4 md:px-6">
            {classifications.length ? (
              <ListBand>
                {classifications.map(item => (
                  <ClassificationRow key={item.id} item={item} now={now} onOpen={() => item.variant && setSheetVariant(item.variant.id)} />
                ))}
              </ListBand>
            ) : (
              <PlatformEmptyState title={filtered ? 'No matching classifications' : 'No classifications'} onReset={filtered ? reset : undefined} />
            )}
          </div>
        </>
      )}

      {view === 'unclassified' && (
        <div className="px-4 md:px-6">
          {unclassified.length ? (
            <ListBand>
              {unclassified.map(variant => (
                <div key={variant.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-3">
                  <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone="warn" />
                    <ProductLink variant={variant} />
                    {variant.sku && <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">{variant.sku}</span>}
                  </span>
                  <button type="button" className={actionClass} onClick={() => setSheetVariant(variant.id)}>Classify</button>
                </div>
              ))}
            </ListBand>
          ) : (
            <PlatformEmptyState title={search ? 'No matching variants' : 'Every regulated variant is classified'} onReset={search ? reset : undefined} />
          )}
        </div>
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
              <ListBand>
                {authorizations.map(item => (
                  <AuthorizationRow key={item.id} item={item} now={now} onOpen={() => item.variant && setSheetVariant(item.variant.id)} />
                ))}
              </ListBand>
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
    <div className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
          <Dot tone={CLASSIFICATION_TONES[item.status] || 'muted'} />
          <ProductLink variant={item.variant} />
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{regulatedLabel(CLASSIFICATION_STATUS_LABELS, item.status)}</span>
        </span>
        <Expiry value={item.expiresAt} now={now} />
      </div>
      <p className="pl-[1.125rem] text-xs text-muted-foreground">{facts.join(' · ')}</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">
        <span>Marketing: <span className="text-foreground">{regulatedLabel(REVIEW_STATUS_LABELS, item.marketingReviewStatus)}</span></span>
        <span>
          Federal authorization:{' '}
          <span className={item.federal === 'current' ? 'text-foreground' : 'text-red-600 dark:text-red-400'}>
            {item.federal === 'current' ? 'Current' : 'Missing'}
          </span>
        </span>
        <span>Authorizations: <span className="font-mono text-foreground">{item.authorizationCount}</span></span>
      </p>
      <TransitionActions actions={actions} className="pl-[1.125rem]">
        {item.variant && (
          <button type="button" className={actionClass} onClick={onOpen}>
            {['draft', 'review'].includes(item.status) ? 'Edit' : 'Open'}
          </button>
        )}
      </TransitionActions>
    </div>
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
    <div className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
          <Dot tone={AUTHORIZATION_TONES[item.status] || 'muted'} />
          <span className="truncate">{regulatedLabel(AUTHORIZATION_TYPE_LABELS, item.authorizationType)}</span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{regulatedLabel(AUTHORIZATION_STATUS_LABELS, item.status)}</span>
        </span>
        <Expiry value={item.expiresAt} now={now} />
      </div>
      <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1 pl-[1.125rem] text-xs text-muted-foreground">
        <span className="min-w-0 text-sm text-foreground"><ProductLink variant={item.variant} /></span>
        <span className="font-mono">{item.authority} {item.authorizationIdentifier}</span>
        <span className="font-mono">{item.jurisdiction || 'Federal'}</span>
        {item.delistedAt && <span>Delisted {day(item.delistedAt)}</span>}
        {item.lastVerifiedAt && <span>Verified {day(item.lastVerifiedAt)}</span>}
      </div>
      <TransitionActions actions={actions} className="pl-[1.125rem]">
        {item.variant && <button type="button" className={actionClass} onClick={onOpen}>Open</button>}
      </TransitionActions>
    </div>
  )
}
