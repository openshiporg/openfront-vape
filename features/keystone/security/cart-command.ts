import updateActiveCart from "../mutations/updateActiveCart";
import { permissions } from "../access";
import { parseCartUpdate } from "./cart-input";
import { assertAddressAccess } from "./cart-access";
import { withCommerceFence, currentCommerceActor, sortedIds, withCartSetFence, type CommerceContext } from "./commerce-fence";

type Entry = { where: { id: string }; data: Record<string, unknown> };
async function cartCommand(context: CommerceContext, entries: Entry[]) {
  const parsed = entries.map(entry => ({ ...entry, data: parseCartUpdate(entry.data) }));
  const addresses = parsed.flatMap(entry => [entry.data.shippingAddress?.connect.id, entry.data.billingAddress?.connect.id]).filter((id): id is string => Boolean(id));
  return withCartSetFence(context, entries.map(entry => entry.where?.id), "mutation", async tx => {
    // All-set validation and native changes share ONE Context transaction. No sudo root API.
    const result: Array<Awaited<ReturnType<CommerceContext["db"]["Cart"]["findOne"]>>> = [];
    for (const entry of [...parsed].sort((a, b) => a.where.id.localeCompare(b.where.id))) {
      await updateActiveCart(null, { cartId: entry.where.id, data: entry.data }, tx);
      result.push(await tx.sudo().db.Cart.findOne({ where: entry.where }));
    }
    return entries.map(entry => result.find(cart => cart?.id.toString() === entry.where.id));
  }, addresses);
}

async function createControlledCart(_root: unknown, { data }: { data: Record<string, unknown> }, context: CommerceContext) {
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId || !tx.session.data?.role?.canManageOrders) throw new Error("Cart could not be created");
    const allowed = new Set(["email", "region", "shippingAddress", "billingAddress", "lineItems", "user", "type"]);
    if (Object.keys(data).some(key => !allowed.has(key))) throw new Error("Cart could not be created");
    const { user, type, ...values } = data;
    const parsed = parseCartUpdate(values);
    if (type !== undefined && type !== "default") throw new Error("Cart could not be created");
    let ownerId = tx.session.itemId;
    if (user !== undefined) {
      const selected = user as { connect?: { id?: string } };
      if (!selected?.connect?.id || Object.keys(selected).join() !== "connect" || Object.keys(selected.connect).join() !== "id") throw new Error("Select one existing cart owner");
      ownerId = selected.connect.id;
      if (ownerId !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Cart could not be created");
      if (!await tx.query.User.findOne({ where: { id: ownerId }, query: "id" })) throw new Error("Cart owner not found");
    }
    for (const id of sortedIds([parsed.shippingAddress?.connect.id, parsed.billingAddress?.connect.id])) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id} FOR UPDATE`;
      await assertAddressAccess(tx, id);
      const address = await tx.prisma.address.findUnique({ where: { id }, select: { userId: true } });
      if (address?.userId !== ownerId) throw new Error("Selected address does not belong to the exact cart customer");
    }
    // Privileged write only after current actor, customer and related-address checks.
    return tx.sudo().db.Cart.createOne({ data: { ...parsed, type: "default", user: { connect: { id: ownerId } } } });
  });
}

const canManageCarts = (context: CommerceContext) => permissions.canManageOrders({ session: context.session });

// Order managers correct carts with the native Keystone mutation (list access and
// hooks still apply). Customers go through the narrow cart command above.
async function managedCartUpdate(context: CommerceContext, entries: Entry[]) {
  return withCommerceFence(context, async tx => {
    const result = [];
    for (const entry of entries) result.push(await tx.db.Cart.updateOne(entry));
    return result;
  });
}

async function deleteCarts(context: CommerceContext, where: { id: string }[]) {
  if (!canManageCarts(context)) throw new Error("Cart cannot be deleted");
  return withCommerceFence(context, async tx => {
    const result = [];
    for (const entry of where) result.push(await tx.db.Cart.deleteOne({ where: entry }));
    return result;
  });
}

export const controlledCartResolvers = {
  createCart: createControlledCart,
  updateCart: async (_: unknown, entry: Entry, context: CommerceContext) =>
    (await (canManageCarts(context) ? managedCartUpdate(context, [entry]) : cartCommand(context, [entry])))[0],
  updateCarts: async (_: unknown, { data }: { data: Entry[] }, context: CommerceContext) =>
    canManageCarts(context) ? managedCartUpdate(context, data) : cartCommand(context, data),
  deleteCart: async (_: unknown, { where }: { where: { id: string } }, context: CommerceContext) => (await deleteCarts(context, [where]))[0],
  deleteCarts: async (_: unknown, { where }: { where: { id: string }[] }, context: CommerceContext) => deleteCarts(context, where),
};
