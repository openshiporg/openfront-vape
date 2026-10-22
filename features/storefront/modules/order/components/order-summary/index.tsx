import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderSummaryProps = {
  order: StoreOrder
}

const Row = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="text-[14px] leading-[20px] text-vp-ink-2">{label}</dt>
    <dd className={accent ? "font-vp-mono text-[14px] text-vp-accent" : "font-vp-mono text-[14px] text-vp-ink"}>{value}</dd>
  </div>
)

const OrderSummary = ({ order }: OrderSummaryProps) => {
  return (
    <div>
      <h2 className="mb-4 text-[20px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink">Summary</h2>
      <dl className="flex flex-col gap-2.5">
        <Row label="Subtotal" value={order.subtotal} />
        {Number.parseFloat(order.discount.replace(/[^0-9.-]/g, '')) > 0 && (
          <Row label="Discount" value={<>-{order.discount}</>} accent />
        )}
        {order.giftCard && (
          <Row label="Gift card" value={<>-{order.giftCard}</>} accent />
        )}
        <Row label="Shipping" value={order.shipping} />
        <Row label="Taxes" value={order.tax} />
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-vp-line pt-4">
        <span className="text-[15px] font-semibold text-vp-ink">Total</span>
        <span className="font-vp-mono text-[22px] leading-[28px] font-medium text-vp-ink">{order.total}</span>
      </div>
    </div>
  )
}

export default OrderSummary
