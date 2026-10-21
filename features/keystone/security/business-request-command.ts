import { permissions } from "../access";
import { currentCommerceActor, sortedIds, withCommerceFence, type CommerceContext } from "./commerce-fence";

type Entry = { where: { id: string }; data: Record<string, unknown> };

async function updateRequests(context: CommerceContext, entries: Entry[]) {
  if (!entries.length || entries.length > 100 || entries.some(entry => !entry.where?.id) ||
      sortedIds(entries.map(entry => entry.where.id)).length !== entries.length) throw new Error("Request could not be updated");
  return withCommerceFence(context, async original => {
    const tx = await currentCommerceActor(original);
    if (!permissions.canManageOrders({ session: tx.session })) throw new Error("Request review permission required");
    for (const id of sortedIds(entries.map(entry => entry.where.id))) {
      await tx.prisma.$queryRaw`SELECT id FROM "BusinessAccountRequest" WHERE id = ${id} FOR UPDATE`;
    }
    const results = [];
    // Native access and hooks are preserved by the bridge. Approval, account
    // creation and the generated-account link commit or roll back together.
    for (const entry of entries) results.push(await tx.db.BusinessAccountRequest.updateOne(entry));
    return results;
  });
}

export const controlledBusinessRequestResolvers = {
  updateBusinessAccountRequest: async (_: unknown, entry: Entry, context: CommerceContext) => (await updateRequests(context, [entry]))[0],
  updateBusinessAccountRequests: async (_: unknown, { data }: { data: Entry[] }, context: CommerceContext) => updateRequests(context, data),
};
