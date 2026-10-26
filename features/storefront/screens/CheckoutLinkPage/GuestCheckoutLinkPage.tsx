import { notFound, redirect } from "next/navigation";
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { CheckoutLinkCart, CheckoutLinkHeader, CheckoutLinkMissing } from "./CheckoutLinkCart";
import Link from "next/link";

export const metadata = {
  title: "Complete Your Order",
  description: "Sign in to complete your order via checkout link"
};

interface PageProps {
  searchParams: Promise<{
    cartId?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
}

async function GuestCheckoutLinkContent({ cartId, countryCode }: { cartId: string, countryCode: string }) {

  // Check if cart exists
  const CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId)
    }
  `;

  let cart;
  try {
    const { activeCart } = await openfrontClient.request(CART_QUERY, { cartId });
    cart = activeCart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return (
      <CheckoutLinkMissing
        title="Cart not found"
        detail="This checkout link has expired or doesn't exist."
      />
    );
  }

  if (!cart) {
    return (
      <CheckoutLinkMissing
        title="Cart not found"
        detail="This checkout link has expired or doesn't exist."
      />
    );
  }

  const returnUrl = encodeURIComponent(`/${countryCode}/account/checkout-link?cartId=${cartId}`);

  return (
    <div className="flex w-full flex-col gap-6" data-testid="guest-checkout-link-page-wrapper">
      <CheckoutLinkHeader />
      <CheckoutLinkCart
        cart={cart}
        actions={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href={`/${countryCode}/account?view=register&returnUrl=${returnUrl}`}
              className="inline-flex h-12 items-center justify-center rounded-[4px] bg-vp-well px-6 text-[15px] font-medium text-vp-ink transition-colors hover:bg-vp-line"
            >
              Create account
            </Link>
            <Link
              href={`/${countryCode}/account?view=login&returnUrl=${returnUrl}`}
              data-testid="sign-in-to-complete-button"
              className="inline-flex h-12 items-center justify-center rounded-[4px] bg-vp-ink px-6 text-[15px] font-medium text-vp-on-ink transition-opacity hover:opacity-90"
            >
              Sign in to complete order
            </Link>
          </div>
        }
      />
    </div>
  );
}

export default async function GuestCheckoutLinkPage({ searchParams, params }: PageProps) {
  const { cartId } = await searchParams;
  const { countryCode } = await params;

  if (!cartId) {
    return notFound();
  }

  return <GuestCheckoutLinkContent cartId={cartId} countryCode={countryCode} />;
}
