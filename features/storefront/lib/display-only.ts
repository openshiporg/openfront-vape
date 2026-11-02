// A product the public can see but not buy: anything not published. Only the store's
// demo catalogue setting makes such products visible; the server refuses them in carts.
export const DISPLAY_ONLY = "Display only"

export function isDisplayOnly(product: { status?: string | null } | null | undefined): boolean {
  return !!product && product.status !== "published"
}
