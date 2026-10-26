import { Stamp, type DotTone } from '@/features/platform/components/vape-primitives'

export const DAY = 24 * 60 * 60 * 1000

export const APPROVAL_TONES: Record<string, DotTone> = {
  unconfigured: 'muted',
  review: 'warn',
  active: 'ok',
  suspended: 'danger',
  expired: 'muted',
  revoked: 'danger',
}

/** Unconfigured and in-review approvals can still be edited; usable ones are immutable. */
export const EDITABLE_APPROVAL_STATUSES = ['unconfigured', 'review']

export const day = (value: string | null | undefined) => (value ? value.slice(0, 10) : '')

export function boundProvider(item: { purpose: string; paymentProvider: { name: string } | null; shippingProvider: { name: string } | null }) {
  if (item.purpose === 'payment') return { label: 'Payment provider', name: item.paymentProvider?.name || '' }
  if (item.purpose === 'carrier') return { label: 'Shipping provider', name: item.shippingProvider?.name || '' }
  return null
}

export function Expiry({ value, now }: { value: string | null; now: number }) {
  if (!value) return <span className="shrink-0 whitespace-nowrap font-mono text-[12px] text-muted-foreground">No expiry</span>
  const time = new Date(value).getTime()
  if (time < now) return <Stamp tone="danger" serial={day(value)}>Expired</Stamp>
  if (time <= now + 30 * DAY) return <Stamp tone="warn" serial={day(value)}>Expiring</Stamp>
  return <span className="shrink-0 whitespace-nowrap font-mono text-[12px] text-muted-foreground">Until {day(value)}</span>
}

/** The purposes the compliance center requires an active approval for (regulatedCommerceReadiness). */
export const REQUIRED_PROVIDER_PURPOSES = ['identity', 'payment', 'tax', 'carrier', 'registry']

/** Same test the readiness query uses: active and inside its effective dates. */
export function approvalInForce(item: { status: string; effectiveAt: string | null; expiresAt: string | null }, now: number) {
  if (item.status !== 'active') return false
  const from = item.effectiveAt ? new Date(item.effectiveAt).getTime() : NaN
  const to = item.expiresAt ? new Date(item.expiresAt).getTime() : NaN
  return from <= now && to > now
}
