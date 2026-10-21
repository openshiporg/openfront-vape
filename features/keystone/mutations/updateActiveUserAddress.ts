import type { CommerceContext } from "../security/commerce-fence";
import { addressCommand } from "../security/address-command";

export default async function updateActiveUserAddress(_root: unknown, args: { where: { id: string }; data: Record<string, unknown> }, context: CommerceContext) {
  await addressCommand(context, [args]);
  // This custom GraphQL field returns User, not the Address-shaped historical result.
  return context.db.User.findOne({ where: { id: context.session?.itemId } });
}
