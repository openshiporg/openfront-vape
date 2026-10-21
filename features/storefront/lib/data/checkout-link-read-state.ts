export type CheckoutLinkCart = {
  id: string;
  total: string;
  subtotal: string;
  shipping: string | null;
  lineItems: Array<{
    id: string;
    quantity: number;
    title: string | null;
    thumbnail: string | null;
  }>;
};

export type CheckoutLinkReadResult =
  | { status: "found"; cart: CheckoutLinkCart }
  | { status: "not-found" }
  | { status: "unavailable" };

export type CheckoutLinkUpdateResult =
  | { status: "ready"; cartId: string }
  | { status: "failed" };

export type CheckoutLinkActionState = { status: "idle" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasGraphQLErrors(error: unknown): boolean {
  if (!isRecord(error)) return false;
  const response = error.response;
  if (!isRecord(response)) return false;
  return Array.isArray(response.errors) && response.errors.length > 0;
}

export function classifyCheckoutLinkUpdateResult({
  response,
  expectedCartId,
  failed,
}: {
  response: unknown;
  expectedCartId: string;
  failed: boolean;
}): CheckoutLinkUpdateResult {
  if (failed || !expectedCartId || !isRecord(response)) return { status: "failed" };
  if (
    Object.prototype.hasOwnProperty.call(response, "errors") &&
    (!Array.isArray(response.errors) || response.errors.length > 0)
  ) {
    return { status: "failed" };
  }
  const updatedCart = response.updateActiveCart;
  if (!isRecord(updatedCart) || updatedCart.id !== expectedCartId) return { status: "failed" };
  return { status: "ready", cartId: expectedCartId };
}

export function classifyCheckoutLinkRead({
  response,
  requestedCartId,
  error,
  failed,
}: {
  response: unknown;
  requestedCartId: string;
  error?: unknown;
  failed: boolean;
}): CheckoutLinkReadResult {
  if (failed) return hasGraphQLErrors(error) ? { status: "not-found" } : { status: "unavailable" };
  if (!isRecord(response)) return { status: "unavailable" };
  if (Object.prototype.hasOwnProperty.call(response, "errors")) {
    if (!Array.isArray(response.errors)) return { status: "unavailable" };
    if (response.errors.length > 0) return { status: "not-found" };
  }
  if (!Object.prototype.hasOwnProperty.call(response, "activeCart")) {
    return { status: "unavailable" };
  }

  const value = response.activeCart;
  if (value === null) return { status: "not-found" };
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    value.id !== requestedCartId ||
    typeof value.total !== "string" ||
    typeof value.subtotal !== "string" ||
    (value.shipping !== null && typeof value.shipping !== "string") ||
    !Array.isArray(value.lineItems) ||
    value.lineItems.some(
      (item) =>
        !isRecord(item) ||
        typeof item.id !== "string" ||
        !Number.isSafeInteger(item.quantity) ||
        (item.title !== null && typeof item.title !== "string") ||
        (item.thumbnail !== null && typeof item.thumbnail !== "string"),
    )
  ) {
    return { status: "unavailable" };
  }

  return { status: "found", cart: value as unknown as CheckoutLinkCart };
}
