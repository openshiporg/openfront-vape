import { releaseBlockers } from "@/features/regulated-commerce/core/release-gate";
import { keystoneContext } from "@/features/keystone/context";
import Wrapper from "@/features/storefront/modules/checkout/components/payment-wrapper";
import CheckoutForm from "@/features/storefront/modules/checkout/templates/checkout-form";
import CheckoutSummary from "@/features/storefront/modules/checkout/templates/checkout-summary";
import { retrieveCart } from "@/features/storefront/lib/data/cart";
import { getUser } from "@/features/storefront/lib/data/user";
import React from "react"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import ChevronDown from "@/features/storefront/modules/common/icons/chevron-down"
import OpenfrontCTA from "@/features/storefront/modules/layout/components/openfront-cta"
import VapeShell from "@/features/storefront/modules/layout/components/vape-shell"
import Logo from "@/features/storefront/modules/layout/components/logo"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { Metadata } from "next"

export const metadata = {
  title: "Checkout",
};

const BLOCKER_STATES: Record<string, string> = {
  ACTIVE_MERCHANT_PROFILE_REQUIRED: "Sales paused: store setup isn't complete.",
  KILL_SWITCH_ENABLED: "Sales paused by the store.",
  LAUNCH_JURISDICTION_REQUIRED: "Sales paused: no sales region is open yet.",
  STORE_POLICIES_REQUIRED: "Sales paused: store policies aren't published yet.",
};

export async function CheckoutPage() {
  const [blockers, cart] = await Promise.all([releaseBlockers(keystoneContext), retrieveCart()]);
  const bagEmpty = !cart?.lineItems?.length;

  if (!cart || blockers.length || bagEmpty) {
    const reasons = [
      ...(bagEmpty ? ["Your bag is empty."] : []),
      ...blockers.map((code) => BLOCKER_STATES[code] || "Sales paused."),
    ];
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[1320px] flex-col justify-center gap-5 px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex items-baseline gap-3">
          <StatusDot tone={blockers.length ? "danger" : "muted"} />
          <h1 className="text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink sm:text-[40px] sm:leading-[44px]">
            Checkout isn&apos;t available right now.
          </h1>
        </div>
        <ul className="flex flex-col gap-1 text-[15px] leading-[24px] text-vp-ink-2" data-testid="checkout-unavailable-reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <div>
          <LocalizedClientLink
            href={bagEmpty ? "/store" : "/cart"}
            className="inline-flex h-12 items-center justify-center rounded-full bg-vp-ink px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {bagEmpty ? "Shop all" : "Back to bag"}
          </LocalizedClientLink>
        </div>
      </main>
    );
  }

  const customer = await getUser();

  return (
    <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-6 px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
      <h1 className="text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink sm:text-[40px] sm:leading-[44px] lg:col-span-2">
        Checkout
      </h1>
      <CheckoutSummary cart={cart} />
      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <Wrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </Wrapper>
      </div>
    </div>
  );
}

export function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VapeShell>
      <div className="relative w-full">
        <div className="border-b border-vp-line bg-vp-bg">
          <nav className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6">
            <LocalizedClientLink
              href="/cart"
              aria-label="Back to bag"
              className="flex min-h-11 min-w-11 flex-1 basis-0 items-center gap-x-2 text-[14px] font-medium text-vp-ink-2 hover:text-vp-ink"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90 shrink-0" size={16} />
              <span className="hidden sm:block">Back to bag</span>
            </LocalizedClientLink>
            <div>
              <Logo />
            </div>
            <div className="flex flex-1 basis-0 justify-end">
              <span className="font-vp-mono text-[12px] uppercase tracking-[0.12em] text-vp-ink-3">21+ only</span>
            </div>
          </nav>
        </div>
        <div className="relative" data-testid="checkout-container">{children}</div>
        <div className="flex w-full items-center justify-center py-4">
          <OpenfrontCTA />
        </div>
      </div>
    </VapeShell>
  )
}

export const NotFoundMetadata: Metadata = {
  title: "Page not found",
}

export function CheckoutNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1320px] flex-col justify-center gap-4 px-4 py-24 sm:px-6">
      <span className="font-vp-mono text-[13px] text-vp-ink-3">404</span>
      <h1 className="text-[40px] leading-[44px] font-semibold tracking-[-0.02em] text-vp-ink">Page not found</h1>
      <div className="mt-4">
        <InteractiveLink href="/cart">Back to bag</InteractiveLink>
      </div>
    </div>
  )
}
