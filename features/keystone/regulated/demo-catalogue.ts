// Demo catalogue: an explicit, compliance-owned store setting that lets the public SEE draft
// products as display-only. It never makes anything sellable: carts, payment and checkout refuse
// any product that is not published, and the release gate stays closed while it is on.

import { GraphQLError } from "graphql";

export const DEMO_ITEM_NOT_FOR_SALE = "DEMO_ITEM_NOT_FOR_SALE";
export const DEMO_CATALOGUE_ACTIVE = "DEMO_CATALOGUE_ACTIVE";

const TTL_MS = 5_000;
let cached: { on: boolean; at: number } | null = null;

/** Forget the cached flag (called after the Store row changes). */
export function resetDemoCatalogueCache() {
  cached = null;
}

export async function isDemoCatalogueOn(context: any): Promise<boolean> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.on;
  const store = await context.sudo().prisma.store.findFirst({ select: { demoCatalogue: true } }).catch(() => null);
  const on = store?.demoCatalogue === true;
  cached = { on, at: Date.now() };
  return on;
}

/** Product statuses an anonymous visitor may read. */
export function publicStatusesFor(demoOn: boolean): string[] {
  return demoOn ? ["published", "draft"] : ["published"];
}

export async function publicProductStatuses(context: any): Promise<string[]> {
  return publicStatusesFor(await isDemoCatalogueOn(context));
}

/** Sale check by product status alone; evidence checks still run after this. */
export function assertProductForSale(status: string | null | undefined) {
  if (status !== "published") {
    // Yoga preserves expected GraphQLErrors in production; never expose arbitrary errors.
    throw new GraphQLError("This item is display only.", { extensions: { code: DEMO_ITEM_NOT_FOR_SALE } });
  }
}

export async function assertVariantForSale(context: any, variantId: string) {
  const variant = await context.sudo().query.ProductVariant.findOne({ where: { id: variantId }, query: "id product { status }" });
  if (!variant) throw new Error("Product variant is not available");
  assertProductForSale(variant.product?.status);
}

/** Every line in the cart must be a published product. */
export async function assertCartLinesForSale(context: any, cartId: string) {
  const cart = await context.sudo().query.Cart.findOne({ where: { id: cartId }, query: "id lineItems { id productVariant { id product { status } } }" });
  if (!cart) throw new Error("Cart not found");
  for (const line of cart.lineItems || []) assertProductForSale(line.productVariant?.product?.status);
}
