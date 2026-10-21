import { withCommerceFence, currentCommerceActor, sortedIds, type CommerceContext } from "../security/commerce-fence";
import { assertAddressUnreferenced, validateAddressData } from "../security/address-command";

export default async function createActiveUserAddress(_root: unknown, { data }: { data: Record<string, unknown> }, context: CommerceContext) {
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    const id = tx.session?.itemId;
    if (!id) throw new Error("Not authenticated");
    // A new address belongs to the current user; no nested actor/cart/order changes.
    if (Object.keys(data).some(key => ["user", "cart", "cartsUsingBilling", "cartsUsingShipping", "ordersUsingBilling", "ordersUsingShipping"].includes(key))) throw new Error("Address could not be created");
    validateAddressData(data);
    const existing = await tx.query.Address.findMany({ where: { user: { id: { equals: id } }, isBilling: { equals: true } }, query: "id" });
    if (data.isBilling) {
      for (const addressId of sortedIds(existing.map(address => address.id))) await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${addressId} FOR UPDATE`;
      for (const address of existing) {
        try { await assertAddressUnreferenced(tx, address.id); }
        catch { continue; /* Referenced historical billing classification is immutable; choose replacement explicitly on cart. */ }
        await tx.db.Address.updateOne({ where: { id: address.id }, data: { isBilling: false } });
      }
    }
    await tx.sudo().db.Address.createOne({ data: { ...data, user: { connect: { id } } } });
    return tx.db.User.findOne({ where: { id } });
  });
}
