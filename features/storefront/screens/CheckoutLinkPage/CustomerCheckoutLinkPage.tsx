import { notFound, redirect } from "next/navigation";
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { getUser } from "@/features/storefront/lib/data/user";
import { getAuthHeaders, setCartId } from "@/features/storefront/lib/data/cookies";
import {
  classifyCheckoutLinkRead,
  classifyCheckoutLinkUpdateResult,
  type CheckoutLinkActionState,
  type CheckoutLinkReadResult,
  type CheckoutLinkUpdateResult,
} from "@/features/storefront/lib/data/checkout-link-read-state";
import { updateTag as revalidateTag } from "next/cache";
import CheckoutLinkSubmit from "@/features/storefront/modules/account/components/checkout-link-submit";
import { CheckoutLinkCart, CheckoutLinkHeader, CheckoutLinkMissing } from "./CheckoutLinkCart";

export const metadata = {
  title: "Checkout Link",
  description: "Cart details"
};

interface PageProps {
  searchParams: Promise<{
    cartId?: string;
  }>;
  params: Promise<{
    countryCode: string;
  }>;
}

async function CheckoutLinkContent({ cartId, countryCode }: { cartId: string, countryCode: string }) {
  const user = await getUser();

  if (!user) {
    // This should not happen as the route is protected, but just in case
    redirect(`/${countryCode}/account/login`);
  }

  // Check if cart exists and belongs to user
  const CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId)
    }
  `;

  let cartRead: CheckoutLinkReadResult;
  try {
    const authHeaders = await getAuthHeaders();
    const response: unknown = await openfrontClient.request(CART_QUERY, { cartId }, authHeaders);
    cartRead = classifyCheckoutLinkRead({ response, requestedCartId: cartId, failed: false });
  } catch (error) {
    cartRead = classifyCheckoutLinkRead({ response: undefined, requestedCartId: cartId, error, failed: true });
  }

  if (cartRead.status === "unavailable") {
    return (
      <CheckoutLinkMissing
        role="alert"
        testId="checkout-link-unavailable"
        title="Checkout link unavailable"
        detail="We couldn't retrieve checkout details. Refresh to try again."
      />
    );
  }

  if (cartRead.status === "not-found") {
    return (
      <CheckoutLinkMissing
        title="Cart not found"
        detail="This checkout link has expired or doesn't exist."
      />
    );
  }

  const cart = cartRead.cart;
  const authorizedCartId = cart.id;

  async function continueToCheckout(
    previousState: CheckoutLinkActionState,
    formData: FormData,
  ): Promise<CheckoutLinkActionState> {
    'use server';
    void previousState;
    void formData;

    let actionUser: Awaited<ReturnType<typeof getUser>> | null;
    try {
      actionUser = await getUser();
    } catch {
      return { status: "error" };
    }
    if (!actionUser || typeof actionUser.email !== "string" || !actionUser.email.trim()) {
      return { status: "error" };
    }

    const UPDATE_CART_MUTATION = gql`
      mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
        updateActiveCart(cartId: $cartId, data: $data) {
          id
        }
      }
    `;

    let updateResult: CheckoutLinkUpdateResult;
    try {
      const authHeaders = await getAuthHeaders();
      const response: unknown = await openfrontClient.request(
        UPDATE_CART_MUTATION,
        { cartId: authorizedCartId, data: { email: actionUser.email } },
        authHeaders,
      );
      updateResult = classifyCheckoutLinkUpdateResult({
        response,
        expectedCartId: authorizedCartId,
        failed: false,
      });
    } catch {
      updateResult = classifyCheckoutLinkUpdateResult({
        response: undefined,
        expectedCartId: authorizedCartId,
        failed: true,
      });
    }

    if (updateResult.status === "failed") return { status: "error" };

    await setCartId(updateResult.cartId);
    revalidateTag('cart');
    redirect(`/${countryCode}/checkout?step=payment`);
  }

  return (
    <div className="flex w-full flex-col gap-6" data-testid="checkout-link-page-wrapper">
      <CheckoutLinkHeader />
      <CheckoutLinkCart
        cart={cart}
        actions={
          <div className="flex justify-end">
            <CheckoutLinkSubmit action={continueToCheckout} />
          </div>
        }
      />
    </div>
  );
}

export default async function CheckoutLinkPage({ searchParams, params }: PageProps) {
  const { cartId } = await searchParams;
  const { countryCode } = await params;

  if (!cartId) {
    return notFound();
  }

  return <CheckoutLinkContent cartId={cartId} countryCode={countryCode} />;
}
