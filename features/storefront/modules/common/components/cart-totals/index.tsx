import React from "react";
import { cn } from "@/lib/utils";

interface CartTotalsProps {
  data: {
    subtotal?: number | string | null;
    discount?: number | string | null;
    giftCardTotal?: number | string | null;
    shipping?: number | string | null;
    tax?: number | string | null;
    regulatedTax?: number | string | null;
    total?: number | string | null;
  } | null;
}

const Row = ({ label, value, tone }: { label: React.ReactNode; value: React.ReactNode; tone?: "accent" }) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="text-[14px] leading-[20px] text-vp-ink-2">{label}</dt>
    <dd className={cn("text-right font-vp-mono text-[14px] leading-[20px] text-vp-ink", tone === "accent" && "text-vp-accent")}>
      {value}
    </dd>
  </div>
);

const CartTotals = ({ data }: CartTotalsProps) => {
  if (!data) {
    return null;
  }

  return (
    <div>
      <dl className="flex flex-col gap-2.5">
        <Row label={<>Subtotal <span className="text-vp-ink-3">excl. shipping and tax</span></>} value={data.subtotal} />

        {data.discount && data.discount !== "0" && (
          <Row label="Discount" value={<>-{data.discount}</>} tone="accent" />
        )}

        {data.giftCardTotal && data.giftCardTotal !== "0" && (
          <Row label="Gift card" value={<>-{data.giftCardTotal}</>} tone="accent" />
        )}

        <Row label="Shipping" value={data.shipping} />
        <Row label="Taxes" value={data.tax} />

        {data.regulatedTax && (
          <Row label="Regulated sales, excise and local taxes" value={data.regulatedTax} />
        )}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-vp-line pt-4">
        <span className="text-[15px] font-semibold text-vp-ink">Total</span>
        <span className="font-vp-mono text-[22px] leading-[28px] font-medium text-vp-ink">
          {data.total}
        </span>
      </div>
    </div>
  );
};

export default CartTotals;
