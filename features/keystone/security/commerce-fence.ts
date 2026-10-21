import type { KeystoneContext } from "@keystone-6/core/types";

const transactions = new WeakSet<object>();
export type CommerceContext = KeystoneContext<any>;
export const insideCommerceFence = (context: CommerceContext) => transactions.has(context.prisma);
export const sortedIds = (ids: readonly (string | null | undefined)[]) => [...new Set(ids.filter((id): id is string => typeof id === "string" && Boolean(id)))].sort();

/** Shared transaction for commerce writers. No external I/O in these callbacks.
 * Serialization is per row (see withCartSetFence), never store-wide.
 */
export async function withCommerceFence<T>(context: CommerceContext, run: (tx: CommerceContext) => Promise<T>): Promise<T> {
  if (insideCommerceFence(context)) return run(context);
  return context.transaction(async tx => {
    transactions.add(tx.prisma);
    try { return await run(tx); } finally { transactions.delete(tx.prisma); }
  });
}

/** Actual current role, not historical author or a cookie's cached delegation. */
export async function currentCommerceActor(context: CommerceContext): Promise<CommerceContext> {
  const session = context.session;
  if (!session?.itemId) return context;
  // API keys and OAuth tokens act within their scopes (permissions.* checks them).
  if (session.apiKeyScopes || session.oauthScopes) return context;
  // Customer tokens (ctok_) are account-scoped integration identities, never role
  // delegation: no sudo role reload, and any role attached by withAuth is removed so
  // raw delegation checks (cart-command, address-command)
  // fail. Own-user scoping by itemId and the explicit customerToken branches in
  // models/Cart.ts access/hooks remain the only customer-token capabilities.
  if (Object.prototype.hasOwnProperty.call(session, "customerToken")) {
    return context.withSession({ ...session, data: { ...session.data, role: null } });
  }
  const user = await context.sudo().prisma.user.findUnique({ where: { id: session.itemId }, select: { id: true, role: true } });
  if (!user) throw new Error("Not authenticated");
  return context.withSession({ ...session, data: { ...session.data, role: user.role } });
}

type CartFenceMode = "mutation" | "checkout" | "recovery";
export function withCartFence<T>(context: CommerceContext, cartId: string, mode: CartFenceMode, run: (tx: CommerceContext) => Promise<T>, proposed: readonly string[] = []) {
  return withCartSetFence(context, [cartId], mode, run, proposed);
}

/** One rank order for single/bulk native participants: sorted Address -> Cart -> attempt.
 * Current/prerequisite rows are reread under it. Unconverted configuration/catalog/
 * inventory/evidence writers still require the separately documented next gates.
 */
export async function withCartSetFence<T>(context: CommerceContext, ids: readonly string[], mode: CartFenceMode, run: (tx: CommerceContext) => Promise<T>, proposed: readonly string[] = []): Promise<T> {
  const cartIds = sortedIds(ids);
  if (!cartIds.length || cartIds.length !== ids.length || cartIds.length > 100) throw new Error("Cart could not be updated");
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    const { assertCartAccess } = await import("./cart-access");
    const access = { allowCompleted: mode === "recovery" || mode === "checkout" };
    for (const id of cartIds) await assertCartAccess(tx, id, access);
    const discovered = await tx.prisma.cart.findMany({ where: { id: { in: cartIds } }, select: { id: true, shippingAddressId: true, billingAddressId: true } });
    if (discovered.length !== cartIds.length) throw new Error("Cart not found");
    for (const id of sortedIds([...proposed, ...discovered.flatMap((cart: { shippingAddressId: string | null; billingAddressId: string | null }) => [cart.shippingAddressId, cart.billingAddressId])])) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id} FOR UPDATE`;
    }
    for (const id of cartIds) await tx.prisma.$queryRaw`SELECT id FROM "Cart" WHERE id = ${id} FOR UPDATE`;
    for (const cart of discovered) {
      const current = await tx.prisma.cart.findUnique({ where: { id: cart.id }, select: { shippingAddressId: true, billingAddressId: true } });
      if (!current || current.shippingAddressId !== cart.shippingAddressId || current.billingAddressId !== cart.billingAddressId) throw new Error("Cart could not be updated");
      await assertCartAccess(tx, cart.id, access);
    }
    for (const key of cartIds.map(id => `checkout:${id}`).sort()) {
      await tx.prisma.$queryRaw`SELECT id FROM "IdempotencyKey" WHERE "idempotencyKey" = ${key} FOR UPDATE`;
    }
    for (const cartId of cartIds) {
      const checkout = await tx.prisma.idempotencyKey.findUnique({ where: { idempotencyKey: `checkout:${cartId}` } });
      if (mode !== "checkout" && mode !== "recovery" && checkout && (checkout.lockedAt || !["started", "failed"].includes(checkout.recoveryPoint))) throw new Error("Checkout is in progress for this cart");
    }
    return run(tx);
  });
}
