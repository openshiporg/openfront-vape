import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot";

// Shared presentation for the guest and signed-in checkout-link screens.

export function CheckoutLinkHeader() {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">Checkout link</p>
      <h1 className="text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink sm:text-[40px] sm:leading-[44px]">
        Complete your order
      </h1>
    </div>
  );
}

export function CheckoutLinkMissing({ title, detail, role = "status", testId }: { title: string; detail: string; role?: "status" | "alert"; testId?: string }) {
  return (
    <section className="flex min-h-[320px] flex-col justify-center gap-2 py-12" role={role} data-testid={testId}>
      <h2 className="flex items-baseline gap-2.5 text-[22px] leading-[28px] font-semibold tracking-[-0.02em] text-vp-ink">
        <StatusDot tone="danger" />
        {title}
      </h2>
      <p className="text-[14px] leading-[20px] text-vp-ink-2">{detail}</p>
    </section>
  );
}

export function CheckoutLinkCart({ cart, actions }: { cart: any; actions: React.ReactNode }) {
  const lineItems: any[] = cart.lineItems || [];
  const numberOfLines = lineItems.reduce((acc: number, item: any) => acc + item.quantity, 0) ?? 0;
  const numberOfProducts = lineItems.length;

  return (
    <div className="flex flex-col gap-5 rounded-[22px] border border-vp-line bg-vp-surface p-4 sm:p-6" data-testid="cart-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-vp-mono text-[15px] font-medium text-vp-ink">
          Cart #{cart.id.slice(-8).toUpperCase()}
        </h2>
        <span className="font-vp-mono text-[13px] text-vp-ink-3">
          {`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}
        </span>
      </div>

      {lineItems.length > 0 && (
        <ul className="vp-band divide-y divide-vp-line">
          {lineItems.slice(0, 3).map((item: any) => (
            <li key={item.id} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3 p-3" data-testid="cart-item">
              <div className="w-12">
                <Thumbnail thumbnail={item.thumbnail} images={[]} size="square" title={item.title} />
              </div>
              <div className="flex min-w-0 items-baseline justify-between gap-3">
                <span className="truncate text-[14px] font-medium text-vp-ink" data-testid="item-title">
                  {item.title}
                </span>
                <span className="flex-none font-vp-mono text-[13px] text-vp-ink-2">
                  × <span data-testid="item-quantity">{item.quantity}</span>
                </span>
              </div>
            </li>
          ))}
          {numberOfProducts > 3 && (
            <li className="px-4 py-3 font-vp-mono text-[13px] text-vp-ink-3">
              + {numberOfLines - 3} more
            </li>
          )}
        </ul>
      )}

      <dl className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[14px] text-vp-ink-2">Subtotal</dt>
          <dd className="font-vp-mono text-[14px] text-vp-ink" data-testid="cart-subtotal">{cart.subtotal}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[14px] text-vp-ink-2">Shipping</dt>
          <dd className="font-vp-mono text-[14px] text-vp-ink" data-testid="cart-shipping">{cart.shipping}</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-vp-line pt-3">
          <dt className="text-[15px] font-semibold text-vp-ink">Total</dt>
          <dd className="font-vp-mono text-[20px] font-medium text-vp-ink" data-testid="cart-total">{cart.total}</dd>
        </div>
      </dl>

      {actions}
    </div>
  );
}
