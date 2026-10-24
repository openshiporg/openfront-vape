import type { DotTone } from '@/features/platform/components/vape-primitives'

const DAY = 24 * 60 * 60 * 1000

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
  if (!value) return <span className="shrink-0 font-mono text-xs text-muted-foreground">No expiry</span>
  const time = new Date(value).getTime()
  const tone = time < now ? 'text-red-600 dark:text-red-400' : time <= now + 30 * DAY ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
  return <span className={`shrink-0 font-mono text-xs ${tone}`}>{time < now ? 'Expired' : 'Until'} {day(value)}</span>
}
