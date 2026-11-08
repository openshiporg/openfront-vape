import { paymentInfoMap } from "@/features/storefront/lib/constants";

import { StoreOrder } from "@/features/storefront/types/storefront";

const PaymentDetails = ({ order }: { order: StoreOrder }) => {
  const payment = order.payments?.[0];

  return (
    <section className="flex flex-col gap-4 border-t border-vp-line pt-5" aria-label="Payment">
      <h2 className="vp-sign text-[26px] text-vp-ink">Payment</h2>
      {payment?.status === "pending" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6" data-testid="pay-at-pickup-summary">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Method</p>
            <p className="text-[14px] leading-[20px] text-vp-ink-2">Pay in store at pickup</p>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
            <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Amount due</p>
            <p className="text-[14px] leading-[20px] text-vp-ink-2">
              <span className="font-vp-mono text-vp-ink">{order.total}</span>
              {" at the counter. Bring photo ID showing you are 21 or older. Nothing has been charged."}
            </p>
          </div>
        </div>
      )}
      {(order.payments || []).filter((row: any) => row.status !== "pending").map((row: any) => {
        const isGift = row.data?.tender === "gift_card";
        const rowProvider = row.paymentCollection?.paymentSessions?.find((s: any) => s.isSelected)?.paymentProvider;
        const title = isGift ? "Gift card" : paymentInfoMap[rowProvider?.code]?.title || "Card";
        const money = (cents: number) => `${"$"}${(cents / 100).toFixed(2)}`;
        const refunded = row.amountRefunded || 0;
        return (
          <div key={row.id} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6" data-testid="payment-row">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Method</p>
              <p className="flex items-center gap-2 text-[14px] leading-[20px] text-vp-ink-2">
                {!isGift && rowProvider?.code && (
                  <span className="flex h-8 w-11 flex-none items-center justify-center rounded-[4px] bg-vp-well text-vp-ink">
                    {paymentInfoMap[rowProvider.code]?.icon}
                  </span>
                )}
                {title}
                {isGift && row.data?.giftCards?.[0]?.last4 ? ` ending ${row.data.giftCards[0].last4}` : ""}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
              <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">{refunded >= row.amount ? "Refunded" : "Paid"}</p>
              <p className="text-[14px] leading-[20px] text-vp-ink-2">
                <span className="font-vp-mono text-vp-ink">{money(row.amount)}</span>
                {refunded > 0 && refunded < row.amount ? ` (${money(refunded)} refunded)` : ""}
                {" on "}
                <span className="font-vp-mono text-[13px]">
                  {new Date(row.createdAt).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default PaymentDetails;
