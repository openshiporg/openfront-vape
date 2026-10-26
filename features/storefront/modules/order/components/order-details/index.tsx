import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"

type OrderDetailsProps = {
  order: any;
  showStatus?: boolean;
};

const formatStatus = (str: string | null | undefined) => {
  if (!str) return "N/A"
  if (typeof str !== 'string') return String(str)
  const formatted = str.split("_").join(" ")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const statusTone = (str: string | null | undefined) => {
  const s = (str || "").toLowerCase()
  if (s.includes("cancel") || s.includes("return")) return "danger" as const
  if (s.includes("partial")) return "warn" as const
  if (s.includes("fulfilled") && !s.includes("unfulfilled")) return "ok" as const
  if (s.includes("ship") || s.includes("deliver") || s.includes("complete")) return "ok" as const
  if (s.includes("unfulfilled") || s.includes("pending") || s.includes("not")) return "warn" as const
  return "muted" as const
}

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
    <dt className="text-[13px] leading-[18px] font-medium text-vp-ink-3">{label}</dt>
    <dd className="text-[14px] leading-[20px] text-vp-ink [overflow-wrap:anywhere]">{children}</dd>
  </div>
)

// Order header: number large in mono, status dot on the title line, then the facts.
const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const fulfillment = order.fulfillmentStatus?.status

  const paymentStatus = (() => {
    const totalPaid = parseFloat(order.formattedTotalPaid?.replace(/[^0-9.-]+/g, "") || "0")
    const total = parseFloat(order.total?.replace(/[^0-9.-]+/g, "") || "0")

    if (totalPaid === 0) return "Unpaid"
    if (totalPaid >= total) return "Paid"
    return "Partially paid"
  })()

  const createdAt = order.createdAt ? new Date(order.createdAt) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 className="flex flex-wrap items-baseline gap-x-3 text-vp-ink">
          <span className="vp-sign text-[44px] sm:text-[60px]">Order</span>
          <span className="font-vp-mono text-[36px] leading-[40px] font-medium sm:text-[48px] sm:leading-[52px]">#<span data-testid="order-id">{order.displayId}</span></span>
        </h1>
        {showStatus ? (
          <span className="inline-flex items-baseline gap-1.5 text-[14px] text-vp-ink-2">
            <StatusDot tone={statusTone(fulfillment)} />
            <span data-testid="order-status">{formatStatus(fulfillment)}</span>
          </span>
        ) : (
          <span className="inline-flex items-baseline gap-1.5 text-[14px] text-vp-ink-2">
            <StatusDot tone="ok" />
            Placed
          </span>
        )}
      </div>

      <dl className="vp-band grid grid-cols-1 divide-y divide-vp-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Fact label="Date">
          <span className="font-vp-mono" data-testid="order-date">
            {createdAt ? createdAt.toDateString() : ""}
          </span>
        </Fact>
        <Fact label="Confirmation sent to">
          <span data-testid="order-email">{order.email}</span>
        </Fact>
        {showStatus ? (
          <Fact label="Payment">
            <span className="inline-flex items-baseline gap-1.5">
              <StatusDot tone={paymentStatus === "Paid" ? "ok" : paymentStatus === "Unpaid" ? "danger" : "warn"} />
              <span data-testid="order-payment-status">{paymentStatus}</span>
            </span>
          </Fact>
        ) : (
          <Fact label="Total">
            <span className="font-vp-mono">{order.total}</span>
          </Fact>
        )}
      </dl>
    </div>
  )
}

export default OrderDetails
