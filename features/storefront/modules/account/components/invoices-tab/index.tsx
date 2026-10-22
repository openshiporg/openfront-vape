"use client"

import type { StorefrontAccountCustomer as User } from "@/features/storefront/types"
import { ArrowUpRight } from "lucide-react"
import { format } from "date-fns"

import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { AccountPageHeader } from "@/features/storefront/modules/account/components/account-ui"

type InvoicesTabProps = {
  customer: User
  invoices: any[]
}

const InvoicesTab = ({ customer: _customer, invoices }: InvoicesTabProps) => {
  return (
    <div className="w-full">
      <AccountPageHeader title="Invoices" count={invoices.length} />

      {invoices.length === 0 ? (
        <div className="vp-band px-4 py-8 text-[15px] text-vp-ink-2 sm:px-5">No paid invoices</div>
      ) : (
        <ul className="vp-band divide-y divide-vp-line">
          {invoices.map((invoice: any) => (
            <li key={invoice.id}>
              <InvoiceCard invoice={invoice} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type InvoiceCardProps = {
  invoice: any
}

const InvoiceCard = ({ invoice }: InvoiceCardProps) => {
  const orders: any[] = invoice.lineItems || []

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <StatusDot tone="ok" label="Paid" />
            <h3 className="text-[15px] font-medium text-vp-ink">
              Invoice <span className="font-vp-mono">{invoice.invoiceNumber}</span>
            </h3>
          </div>
          <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-vp-ink-2">
            {invoice.paidAt && (
              <div className="flex gap-1.5">
                <dt>Paid</dt>
                <dd className="font-vp-mono text-vp-ink">{format(new Date(invoice.paidAt), "MMM d, yyyy")}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt>Created</dt>
              <dd className="font-vp-mono text-vp-ink">{format(new Date(invoice.createdAt), "MMM d, yyyy")}</dd>
            </div>
            {invoice.account?.accountNumber && (
              <div className="flex gap-1.5">
                <dt>Account</dt>
                <dd className="font-vp-mono text-vp-ink">{invoice.account.accountNumber}</dd>
              </div>
            )}
          </dl>
        </div>
        <span className="shrink-0 font-vp-mono text-[15px] text-vp-ink">{invoice.formattedTotal}</span>
      </div>

      {orders.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-vp-mono text-[12px] uppercase tracking-[0.12em] text-vp-ink-3">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
          <ul className="flex flex-col divide-y divide-vp-line overflow-hidden rounded-[14px] bg-vp-surface">
            {orders.map((lineItem: any) => (
              <li key={lineItem.id}>
                <button
                  type="button"
                  className="grid min-h-12 w-full grid-cols-[1fr_auto_18px] items-center gap-x-3 px-3 py-2.5 text-left hover:bg-vp-bg"
                  onClick={() => window.open(`/account/orders/details/${lineItem.accountLineItem?.order?.id}`, '_blank')}
                  aria-label={`Open order #${lineItem.orderDetails?.displayId || lineItem.orderDisplayId} in a new tab`}
                >
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                    <span className="font-vp-mono text-[13px] text-vp-ink">
                      #{lineItem.orderDetails?.displayId || lineItem.orderDisplayId}
                    </span>
                    <span className="font-vp-mono text-[12px] text-vp-ink-2">
                      {lineItem.orderDetails?.createdAt ? new Date(lineItem.orderDetails.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </span>
                  <span className="font-vp-mono text-[13px] text-vp-ink">
                    {lineItem.orderDetails?.total || lineItem.formattedAmount}
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" className="text-vp-ink-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default InvoicesTab
