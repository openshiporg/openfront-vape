import type { GraphQLFieldResolver, GraphQLSchema } from "graphql";
import { insideCommerceFence, type CommerceContext } from "./commerce-fence";

/** Keystone Context.db/query mutations execute the extended GraphQL roots too.
 * Capture the original Keystone resolvers before extension so validated internal
 * writes retain native hooks/access without recursively re-entering the public
 * DTO command. Only the private transaction capability admits this path; neither
 * sudo alone nor a caller-supplied flag grants it.
 */
export function controlledNativeMutations(
  schema: GraphQLSchema,
  commands: Record<string, GraphQLFieldResolver<unknown, CommerceContext>>,
): Record<string, GraphQLFieldResolver<unknown, CommerceContext>> {
  const fields = schema.getMutationType()?.getFields();
  return Object.fromEntries(Object.entries(commands).map(([name, command]) => {
    const native = fields?.[name]?.resolve;
    if (!native) throw new Error(`Missing native mutation ${name}`);
    const resolver: GraphQLFieldResolver<unknown, CommerceContext> = (root, args, context, info) => insideCommerceFence(context)
      ? native(root, args, context, info)
      : command(root, args, context, info);
    return [name, resolver];
  }));
}
