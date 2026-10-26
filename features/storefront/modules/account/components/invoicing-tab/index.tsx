"use client"

import type { StorefrontAccountCustomer as User } from "@/features/storefront/types"
import { Copy, RefreshCw, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import BusinessAccountRequestForm from "./business-account-request-form"
import { toast } from "@/components/ui/use-toast"
import PaymentDialog from "./invoice-payment-dialog"
import OrderCard from "../order-card"
import { useState, useActionState, useEffect, startTransition } from "react"
import { regenerateCustomerToken } from "@/features/storefront/lib/data/business-accounts"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { SegmentedButton, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import {
  fieldClass,
  formatAccountDate,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/features/storefront/modules/account/components/account-ui"

type BusinessAccountTabProps = {
  customer: User
  businessAccount: any
  businessAccountRequest: any  
  orders: any[]
  unpaidLineItems: any
}

const InvoicingTab = ({ customer, businessAccount, businessAccountRequest, orders, unpaidLineItems }: BusinessAccountTabProps) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [orderFilter, setOrderFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  
  // Server actions with useActionState
  const [tokenState, tokenAction] = useActionState(regenerateCustomerToken, { success: false, error: '' })

  // Determine account status from server data
  const getAccountStatus = () => {
    if (businessAccount) {
      return businessAccount.status === 'suspended' ? 'suspended' : 'active'
    }
    if (businessAccountRequest) {
      return businessAccountRequest.status === 'pending' ? 'pending' : 'none'
    }
    return 'none'
  }

  const accountStatus = getAccountStatus()

  // Helper functions for order categorization
  // For business accounts, orders are paid/unpaid based on whether they have been included in paid invoices
  // We need to check if the order has AccountLineItems with paymentStatus 'paid' or 'unpaid'
  const getOrderCounts = () => {
    const allOrders = orders.length
    
    // For business accounts, an order is "paid" if it's NOT in the current unpaid balance
    // Check if order is in unpaidLineItems regions
    const unpaidOrderIds = new Set()
    if (unpaidLineItems?.regions) {
      unpaidLineItems.regions.forEach((region: any) => {
        region.lineItems?.forEach((lineItem: any) => {
          if (lineItem.order?.id) {
            unpaidOrderIds.add(lineItem.order.id)
          }
        })
      })
    }
    
    const unpaidOrders = orders.filter(order => unpaidOrderIds.has(order.id)).length
    const paidOrders = allOrders - unpaidOrders
    
    return {
      all: allOrders,
      paid: paidOrders,
      unpaid: unpaidOrders
    }
  }

  const filterOrdersByStatus = (status: string) => {
    // Build set of unpaid order IDs from unpaidLineItems
    const unpaidOrderIds = new Set()
    if (unpaidLineItems?.regions) {
      unpaidLineItems.regions.forEach((region: any) => {
        region.lineItems?.forEach((lineItem: any) => {
          if (lineItem.order?.id) {
            unpaidOrderIds.add(lineItem.order.id)
          }
        })
      })
    }

    switch (status) {
      case 'paid':
        return orders.filter(order => !unpaidOrderIds.has(order.id))
      case 'unpaid':
        return orders.filter(order => unpaidOrderIds.has(order.id))
      default:
        return orders
    }
  }

  const orderCounts = getOrderCounts()

  const currentToken = tokenState.success && 'token' in tokenState ? tokenState.token : null

  const copyToken = async () => {
    if (currentToken) {
      await navigator.clipboard.writeText(currentToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 1500)
    }
  }

  const handleTokenRegenerate = () => {
    const formData = new FormData()
    startTransition(() => tokenAction(formData))
  }

  useEffect(() => {
    if (tokenState.success && 'token' in tokenState) {
      toast({
        title: "Token regenerated",
        description: "Copy it now. It will not be shown again.",
      })
    } else if (tokenState.error) {
      toast({
        title: "Error",
        description: tokenState.error,
        variant: "destructive",
      })
    }
  }, [tokenState])

  const header = (status: { tone: "ok" | "warn" | "danger" | "muted" | "accent"; label: string }, action?: React.ReactNode) => (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="vp-sign text-[30px] text-vp-ink">Invoicing</h2>
        <span className="flex items-baseline gap-2 text-[13px] text-vp-ink-2">
          <StatusDot tone={status.tone} />
          {status.label}
        </span>
      </div>
      {action}
    </div>
  )

  // State 1: Empty State (No Account Request)
  if (accountStatus === 'none') {
    return (
      <div className="w-full">
        {header({ tone: "muted", label: "Not requested" })}
        <dl className="vp-band divide-y divide-vp-line">
          <FactRow label="Billing">Monthly invoice</FactRow>
          <FactRow label="Ordering">Store, or API with a customer token</FactRow>
          <FactRow label="Use">Wholesale and bulk orders</FactRow>
        </dl>
        <div className="mt-5">
          <BusinessAccountRequestForm customer={customer} />
        </div>
      </div>
    )
  }

  // State 2: Pending State
  if (accountStatus === 'pending') {
    return (
      <div className="w-full">
        {header({ tone: "accent", label: "Under review" })}
        <dl className="vp-band divide-y divide-vp-line">
          {businessAccountRequest?.submittedAt && (
            <FactRow label="Submitted">
              <span className="font-vp-mono">{formatAccountDate(businessAccountRequest.submittedAt)}</span>
            </FactRow>
          )}
          <FactRow label="Next">Email when approved, with your customer token</FactRow>
        </dl>
        <div className="mt-5">
          <button type="button" disabled className={primaryButtonClass}>
            Request pending
          </button>
        </div>
      </div>
    )
  }

  // State 3: Active State
  if (accountStatus === 'active' && businessAccount) {
    const hasUnpaidItems = unpaidLineItems?.success && unpaidLineItems?.regions?.some((region: any) => region.totalAmount > 0)
    const statusLabel =
      businessAccount?.status === 'active' ? 'Active'
        : businessAccount?.status === 'suspended' ? 'Suspended'
        : businessAccount?.status === 'not_approved' ? 'Not approved'
        : businessAccount?.status === 'overdue' ? 'Overdue'
        : businessAccount?.status === 'paid' ? 'Paid'
        : 'Unknown'
    const statusTone =
      businessAccount?.status === 'active' || businessAccount?.status === 'paid' ? 'ok'
        : businessAccount?.status === 'overdue' ? 'warn'
        : businessAccount?.status === 'suspended' || businessAccount?.status === 'not_approved' ? 'danger'
        : 'muted'
    const visibleOrders = filterOrdersByStatus(orderFilter)

    return (
      <div className="flex w-full flex-col gap-12">
        <section>
          {header(
            { tone: statusTone, label: statusLabel },
            <button
              type="button"
              onClick={() => setShowPaymentDialog(true)}
              disabled={!hasUnpaidItems}
              className={primaryButtonClass}
            >
              {hasUnpaidItems ? 'Pay balance' : 'No balance due'}
            </button>
          )}
          <dl className="vp-band divide-y divide-vp-line">
            <FactRow label="Balance">
              <span className="font-vp-mono text-[17px] font-medium">{businessAccount.formattedTotalOwedInAccountCurrency}</span>
            </FactRow>
            <FactRow label="Credit limit">
              <span className="font-vp-mono">{businessAccount.formattedCreditLimit}</span>
            </FactRow>
            <FactRow label="Available">
              <span className="font-vp-mono text-vp-ok">{businessAccount.formattedAvailableCreditInAccountCurrency}</span>
            </FactRow>
          </dl>
        </section>

        <section>
          <h3 className="mb-4 vp-sign text-[26px] text-vp-ink">API access</h3>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="customer-token" className="text-[13px] leading-[18px] font-medium text-vp-ink-2">
              Customer token
            </label>
            <div className="flex items-center gap-2">
              <input
                id="customer-token"
                value={currentToken || '••••••••••••••••••••••••'}
                readOnly
                className={cn(fieldClass, "min-w-0 flex-1 font-vp-mono text-[13px]")}
              />
              <button
                type="button"
                onClick={copyToken}
                className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-vp-well text-vp-ink-2 hover:text-vp-ink disabled:text-vp-ink-3"
                aria-label={tokenCopied ? "Copied" : "Copy token"}
                title={tokenCopied ? "Copied" : "Copy token"}
                disabled={tokenCopied || !currentToken}
              >
                {tokenCopied ? (
                  <CheckIcon className="text-vp-ok" size={18} aria-hidden="true" />
                ) : (
                  <Copy size={18} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleTokenRegenerate}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-vp-well text-vp-ink-2 hover:text-vp-ink"
                aria-label="Regenerate token"
                title="Regenerate token"
              >
                <RefreshCw size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="vp-sign text-[26px] text-vp-ink">Recent orders</h3>
            {orders.length > 0 && (
              <SegmentedTrack label="Filter orders by payment">
                {([
                  ['all', 'All', orderCounts.all],
                  ['paid', 'Paid', orderCounts.paid],
                  ['unpaid', 'Unpaid', orderCounts.unpaid],
                ] as const).map(([value, label, count]) => (
                  <SegmentedButton key={value} active={orderFilter === value} onClick={() => setOrderFilter(value)}>
                    {label}
                    <span className="font-vp-mono text-[12px] text-vp-ink-3">{count}</span>
                  </SegmentedButton>
                ))}
              </SegmentedTrack>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="vp-band px-4 py-8 text-[15px] text-vp-ink-2 sm:px-5">No orders yet</div>
          ) : visibleOrders.length === 0 ? (
            <div className="vp-band px-4 py-8 text-[15px] text-vp-ink-2 sm:px-5">
              {orderFilter === 'paid' ? 'No paid orders' : 'No unpaid orders'}
            </div>
          ) : (
            <ul className="vp-band divide-y divide-vp-line">
              {visibleOrders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payment Dialog */}
        {showPaymentDialog && (
          <PaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            businessAccount={businessAccount}
            unpaidLineItems={unpaidLineItems}
          />
        )}
      </div>
    )
  }

  // State 4: Suspended State
  if (accountStatus === 'suspended') {
    return (
      <div className="w-full">
        {header({ tone: "danger", label: "Suspended" })}
        <dl className="vp-band divide-y divide-vp-line">
          <FactRow label="Balance">
            <span className="font-vp-mono">{businessAccount?.formattedTotalOwedInAccountCurrency || "—"}</span>
          </FactRow>
        </dl>
        <div className="mt-5">
          <button type="button" className={secondaryButtonClass}>
            Contact billing
          </button>
        </div>
      </div>
    )
  }

  return null
}

const FactRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid min-h-14 grid-cols-[104px_1fr] items-center gap-x-3 px-4 py-3 sm:grid-cols-[160px_1fr] sm:px-5">
    <dt className="text-[13px] font-medium text-vp-ink-2">{label}</dt>
    <dd className="min-w-0 text-[15px] text-vp-ink">{children}</dd>
  </div>
)

export default InvoicingTab
