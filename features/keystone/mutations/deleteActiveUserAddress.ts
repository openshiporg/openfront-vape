import type { CommerceContext } from "../security/commerce-fence";
import { addressCommand } from "../security/address-command";

export default async function deleteActiveUserAddress(_root: unknown, args: { where: { id: string } }, context: CommerceContext) {
  return (await addressCommand(context, [{ ...args, data: {} }], true))[0];
}
