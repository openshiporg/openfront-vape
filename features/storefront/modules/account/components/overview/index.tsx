import { ChevronRight } from "lucide-react"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import {
  AccountPageHeader,
  OrderStatusDot,
  formatAccountDate,
  orderStatus,
} from "@/features/storefront/modules/account/components/account-ui"
import { CustomerProfile, OrderSummary, OrdersList } from "@/features/storefront/types/account"

type OverviewProps = {
  user: CustomerProfile
  orders: OrdersList
}

const Overview = ({ user, orders }: OverviewProps) => {
  const recent = (orders || []).slice(0, 5)
  const completion = getProfileCompletion(user)
  const addressCount = user?.addresses?.length || 0

  return (
    <div className="flex flex-col gap-12" data-testid="overview-page-wrapper">
      <section aria-labelledby="recent-orders-title">
        <AccountPageHeader
          id="recent-orders-title"
          title="Recent orders"
          action={
            recent.length > 0 ? (
              <LocalizedClientLink
                href="/account/orders"
                className="inline-flex min-h-11 items-center rounded-full bg-vp-well px-4 text-[13px] font-medium text-vp-ink"
              >
                All orders
              </LocalizedClientLink>
            ) : undefined
          }
        />
        <ul className="vp-band divide-y divide-vp-line" data-testid="orders-wrapper">
          {recent.length > 0 ? (
            recent.map((order: OrderSummary) => {
              const status = (order as OrderSummary & { status?: string }).status
              const items = order.lineItems?.reduce((n, i) => n + (i.quantity || 0), 0) ?? 0
              return (
                <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="grid min-h-[72px] grid-cols-[1fr_auto_20px] items-center gap-x-3 px-4 py-3.5 transition-colors hover:bg-vp-line/40 sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <OrderStatusDot status={status} />
                        <span className="text-[15px] font-medium text-vp-ink">
                          Order{" "}
                          <span className="font-vp-mono" data-testid="order-id" data-value={order.displayId}>
                            #{order.displayId}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[13px] text-vp-ink-2">
                        <span className="font-vp-mono" data-testid="order-created-date">
                          {formatAccountDate(order.createdAt)}
                        </span>
                        {orderStatus(status) && (
                          <>
                            <span aria-hidden="true" className="text-vp-ink-3">·</span>
                            <span>{orderStatus(status)!.label}</span>
                          </>
                        )}
                        <span aria-hidden="true" className="text-vp-ink-3">·</span>
                        <span className="font-vp-mono">
                          {items} {items === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>
                    <span className="font-vp-mono text-[15px] text-vp-ink" data-testid="order-amount">
                      {order.total}
                    </span>
                    <span data-testid="open-order-button" className="text-vp-ink-3">
                      <span className="sr-only">Go to order #{order.displayId}</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </span>
                  </LocalizedClientLink>
                </li>
              )
            })
          ) : (
            <li className="flex flex-col items-start gap-4 px-4 py-8 sm:px-5">
              <span className="text-[15px] text-vp-ink-2" data-testid="no-orders-message">No orders yet</span>
              <LocalizedClientLink
                href="/store"
                className="inline-flex h-12 items-center justify-center rounded-full bg-vp-ink px-6 text-[15px] font-medium text-white"
              >
                Shop all
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="account-details-title">
        <h2 id="account-details-title" className="mb-5 text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-vp-ink">
          Details
        </h2>
        <dl className="vp-band divide-y divide-vp-line">
          <DetailRow label="Name" href="/account/profile">
            <span data-testid="welcome-message" data-value={user?.firstName}>
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Not set"}
            </span>
          </DetailRow>
          <DetailRow label="Email" href="/account/profile">
            <span className="break-all" data-testid="customer-email" data-value={user?.email}>
              {user?.email}
            </span>
          </DetailRow>
          <DetailRow label="Profile" href="/account/profile">
            <span className="font-vp-mono" data-testid="customer-profile-completion" data-value={completion}>
              {completion}%
            </span>{" "}
            <span className="text-vp-ink-2">complete</span>
          </DetailRow>
          <DetailRow label="Addresses" href="/account/addresses">
            <span className="font-vp-mono" data-testid="addresses-count" data-value={addressCount}>
              {addressCount}
            </span>{" "}
            <span className="text-vp-ink-2">saved</span>
          </DetailRow>
        </dl>
      </section>
    </div>
  )
}

const DetailRow = ({ label, href, children }: { label: string; href: string; children: React.ReactNode }) => (
  <div className="grid min-h-14 grid-cols-[96px_1fr_auto] items-center gap-x-3 px-4 py-3 sm:grid-cols-[160px_1fr_auto] sm:px-5">
    <dt className="text-[13px] font-medium text-vp-ink-2">{label}</dt>
    <dd className="min-w-0 text-[15px] text-vp-ink">{children}</dd>
    <LocalizedClientLink
      href={href}
      className="inline-flex min-h-11 items-center rounded-full bg-vp-surface px-4 text-[13px] font-medium text-vp-ink shadow-[0_1px_2px_rgb(20_24_22/0.12)] hover:text-vp-accent"
      aria-label={`Edit ${label.toLowerCase()}`}
    >
      Edit
    </LocalizedClientLink>
  </div>
)

const getProfileCompletion = (user: CustomerProfile) => {
  let count = 0

  if (!user) {
    return 0
  }

  if (user.email) {
    count++
  }

  if (user.firstName && user.lastName) {
    count++
  }

  if (user.phone) {
    count++
  }

  if (user.billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
