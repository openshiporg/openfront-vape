interface PreviewPriceProps {
  price: any;
  region: any;
  from?: boolean;
}

export default function PreviewPrice({ price, region, from }: PreviewPriceProps) {
  if (!price || !price.calculatedAmount) {
    return <span className="text-[13px] text-vp-ink-2">Unavailable</span>;
  }

  const format = (amount: number) =>
    new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: price.currencyCode,
    }).format(amount / 100);

  const isOnSale = price.calculatedAmount < price.originalAmount;

  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-1.5 font-vp-mono text-[14px] font-medium text-vp-ink">
      {from && <span className="font-vp text-[12px] font-normal text-vp-ink-2">From</span>}
      <span className={isOnSale ? "text-vp-accent font-medium" : undefined} data-testid="price">
        {format(price.calculatedAmount)}
      </span>
      {isOnSale && (
        <span className="text-[12px] font-normal text-vp-ink-2 line-through" data-testid="original-price">
          {format(price.originalAmount)}
        </span>
      )}
    </span>
  );
}
