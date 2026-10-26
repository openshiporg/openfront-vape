import { paymentInfoMap } from "@/features/storefront/lib/constants";

import { StoreOrder } from "@/features/storefront/types/storefront";

const PaymentDetails = ({ order }: { order: StoreOrder }) => {
  const payment = order.payments?.[0];
  const paymentSession = payment?.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  );
  const provider = paymentSession?.paymentProvider;

  return (
    <section className="flex flex-col gap-4 border-t border-vp-line pt-5" aria-label="Payment">
      <h2 className="vp-sign text-[26px] text-vp-ink">Payment</h2>
      {payment && provider?.code && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Method</p>
            <p className="flex items-center gap-2 text-[14px] leading-[20px] text-vp-ink-2">
              <span className="flex h-8 w-11 flex-none items-center justify-center rounded-[4px] bg-vp-well text-vp-ink">
                {paymentInfoMap[provider.code]?.icon}
              </span>
              {paymentInfoMap[provider.code]?.title}
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
            <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Paid</p>
            <p className="text-[14px] leading-[20px] text-vp-ink-2">
              <span className="font-vp-mono text-vp-ink">{order.total}</span>
              {" on "}
              <span className="font-vp-mono text-[13px]">
                {new Date(payment.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PaymentDetails;
