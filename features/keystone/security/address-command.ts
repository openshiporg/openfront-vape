import { currentCommerceActor, insideCommerceFence, sortedIds, withCommerceFence, type CommerceContext } from "./commerce-fence";

type AddressUpdate = { where: { id: string }; data: Record<string, unknown> };
const EDITABLE = new Set(["company", "firstName", "lastName", "address1", "address2", "city", "province", "postalCode", "phone", "isBilling", "metadata", "country", "user"]);

export function validateAddressData(data: Record<string, unknown>) {
    if (Object.keys(data).some(key => !EDITABLE.has(key))) throw new Error("Address could not be updated");
    for (const name of ["user", "country"]) {
      const value = data[name];
      if (value === undefined) continue;
      if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).join() !== "connect") throw new Error("Address could not be updated");
      const connect = (value as { connect: unknown }).connect;
      if (!connect || typeof connect !== "object" || Array.isArray(connect) || Object.keys(connect).length !== 1 ||
          !Object.entries(connect).every(([key, id]) => (key === "id" || (name === "country" && key === "iso2")) && typeof id === "string" && Boolean(id))) throw new Error("Address could not be updated");
    }
}

/** Both direct and custom bulk writes commit all-or-nothing; inverses are not edit inputs. */
export async function addressCommand(context: CommerceContext, entries: AddressUpdate[], deleting = false) {
  if (!entries.length || entries.length > 100 || entries.some(entry => !entry.where?.id) ||
      sortedIds(entries.map(entry => entry.where.id)).length !== entries.length) throw new Error("Address could not be updated");
  for (const entry of entries) validateAddressData(entry.data);
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId) throw new Error("Not authenticated");
    for (const id of sortedIds(entries.map(entry => entry.where.id))) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id} FOR UPDATE`;
    }
    const items: { id: { toString(): string } }[] = [];
    const referenced = new Set<string>();
    for (const entry of entries) {
      // Normal Context applies current owner/manager filter, independent of cart delegation.
      const visible = await tx.query.Address.findOne({ where: entry.where, query: "id" });
      if (!visible) throw new Error("Address not found");
      const owner = (entry.data.user as { connect?: { id?: string } } | undefined)?.connect?.id;
      if (owner && owner !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Address could not be updated");
      if (await isAddressReferenced(tx, entry.where.id)) referenced.add(entry.where.id);
    }
    const resultIds = new Map<string, string>();
    for (const entry of [...entries].sort((a, b) => a.where.id.localeCompare(b.where.id))) {
      const id = entry.where.id;
      if (referenced.has(id)) {
        // Carts and orders keep the original row as history. The customer's
        // address book moves to a copy (update) or drops the row (delete).
        const current = await tx.prisma.address.findUnique({ where: { id } });
        if (!current) throw new Error("Address not found");
        if (!deleting) {
          const copy = await tx.db.Address.createOne({
            data: {
              company: current.company, firstName: current.firstName, lastName: current.lastName,
              address1: current.address1, address2: current.address2, city: current.city,
              province: current.province, postalCode: current.postalCode, phone: current.phone,
              isBilling: current.isBilling,
              ...(current.metadata !== null ? { metadata: current.metadata } : {}),
              ...(current.countryId ? { country: { connect: { id: current.countryId } } } : {}),
              ...(current.userId ? { user: { connect: { id: current.userId } } } : {}),
              ...entry.data,
            },
          });
          resultIds.set(id, copy.id.toString());
          items.push(copy);
        } else {
          items.push(current);
        }
        await tx.prisma.address.update({ where: { id }, data: { userId: null } });
        continue;
      }
      items.push(deleting
        ? await tx.db.Address.deleteOne({ where: entry.where })
        : await tx.db.Address.updateOne(entry));
    }
    // Preserve caller order while transactionally validating the entire set first.
    return entries.map(entry => {
      const id = resultIds.get(entry.where.id) ?? entry.where.id;
      return items.find(item => item.id.toString() === id);
    });
  });
}

async function isAddressReferenced(context: CommerceContext, id: string): Promise<boolean> {
  const address = await context.prisma.address.findUnique({ where: { id }, select: { cartId: true } });
  const cart = await context.prisma.cart.findFirst({ where: { OR: [{ shippingAddressId: id }, { billingAddressId: id }] }, select: { id: true } });
  const order = await context.prisma.order.findFirst({ where: { OR: [{ shippingAddressId: id }, { billingAddressId: id }] }, select: { id: true } });
  return Boolean(address?.cartId || cart || order);
}

export async function assertAddressUnreferenced(context: CommerceContext, id: string): Promise<void> {
  if (!insideCommerceFence(context)) throw new Error("Address could not be updated");
  if (await isAddressReferenced(context, id)) throw new Error("Address could not be updated");
}

async function createAddresses(context: CommerceContext, data: Record<string, unknown>[]) {
  if (!data.length || data.length > 100) throw new Error("Address could not be created");
  data.forEach(validateAddressData);
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId) throw new Error("Not authenticated");
    for (const entry of data) {
      const owner = (entry.user as { connect?: { id?: string } } | undefined)?.connect?.id;
      if (owner && owner !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Address could not be created");
      if (owner && !await tx.query.User.findOne({ where: { id: owner }, query: "id" })) throw new Error("Address owner not found");
    }
    const result = [];
    for (const entry of data) result.push(await tx.db.Address.createOne({ data: entry }));
    return result;
  });
}

export const controlledAddressResolvers = {
  createAddress: async (_: unknown, { data }: { data: Record<string, unknown> }, context: CommerceContext) => (await createAddresses(context, [data]))[0],
  createAddresses: async (_: unknown, { data }: { data: Record<string, unknown>[] }, context: CommerceContext) => createAddresses(context, data),
  updateAddress: async (_: unknown, args: AddressUpdate, context: CommerceContext) => (await addressCommand(context, [args]))[0],
  updateAddresses: async (_: unknown, args: { data: AddressUpdate[] }, context: CommerceContext) => addressCommand(context, args.data),
  deleteAddress: async (_: unknown, args: { where: { id: string } }, context: CommerceContext) => (await addressCommand(context, [{ ...args, data: {} }], true))[0],
  deleteAddresses: async (_: unknown, args: { where: { id: string }[] }, context: CommerceContext) => addressCommand(context, args.where.map(where => ({ where, data: {} })), true),
};
