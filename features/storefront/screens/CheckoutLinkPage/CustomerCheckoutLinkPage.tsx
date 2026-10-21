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
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import Divider from "@/features/storefront/modules/common/components/divider";

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
      <section className="mx-auto max-w-2xl space-y-3 px-6 py-16" role="alert" data-testid="checkout-link-unavailable">
        <h2 className="text-xl font-semibold">Checkout link unavailable</h2>
        <p className="text-sm text-muted-foreground">We couldn&apos;t retrieve checkout details. Refresh to try again.</p>
      </section>
    );
  }

  if (cartRead.status === "not-found") {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-[400px]">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-gray-900">Cart Not Found</h2>
        <p className="text-gray-600 text-center max-w-md">
          The cart associated with this checkout link could not be found or may have expired.
        </p>
      </div>
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

  const numberOfLines = cart.lineItems.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0) ?? 0;

  const numberOfProducts = cart.lineItems?.length ?? 0;

  return (
    <div className="w-full" data-testid="checkout-link-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Complete Your Order</h1>
        <p className="text-sm font-normal">
          Review your cart and continue to secure checkout to complete your order.
        </p>
      </div>

      <div>
        <div className="flex flex-col gap-y-8 w-full">
          <div className="border-b pb-6">
            <div className="bg-background flex flex-col" data-testid="cart-card">
              <div className="uppercase text-base leading-6 font-semibold mb-1">
                CART #{cart.id.slice(-8).toUpperCase()}
              </div>
              <div className="flex items-center divide-x divide-gray-200 text-xs leading-5 font-normal text-foreground">
                <span className="pr-2" data-testid="cart-total">
                  {cart.total}
                </span>
                <span className="px-2" data-testid="cart-subtotal">
                  Subtotal: {cart.subtotal}
                </span>
                <span className="px-2" data-testid="cart-shipping">
                  Shipping: {cart.shipping}
                </span>
                <span className="pl-2">{`${numberOfLines} ${
                  numberOfLines > 1 ? "items" : "item"
                }`}</span>
              </div>

              {cart.lineItems && cart.lineItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                  {cart.lineItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-y-2"
                      data-testid="cart-item"
                    >
                      <Thumbnail thumbnail={item.thumbnail} images={[]} size="full" />
                      <div className="flex items-center text-xs leading-5 font-normal text-foreground">
                        <span
                          className="text-foreground font-semibold"
                          data-testid="item-title"
                        >
                          {item.title}
                        </span>
                        <span className="ml-2">x</span>
                        <span data-testid="item-quantity">{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {numberOfProducts > 3 && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-xs leading-5 font-normal text-foreground">
                        + {numberOfLines - 3}
                      </span>
                      <span className="text-xs leading-5 font-normal text-foreground">
                        more
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <CheckoutLinkSubmit action={continueToCheckout} />
              </div>
            </div>
          </div>
        </div>
      </div>
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
