import { GraphQLError } from "graphql";

/**
 * A shopper-facing validation or state-rule failure on their OWN cart or checkout.
 * Yoga masks a plain Error as "Unexpected error." in production, so the shopper never saw why.
 * A GraphQLError carries the real message plus a stable machine code.
 *
 * Use only for messages that are safe to show: no ids, emails, secrets, stack details or provider
 * payloads. Internal failures (database, provider, configuration) stay plain Errors and stay masked.
 * Access refusals keep their own helper (security/cart-access.ts cartNotFound, code CART_NOT_FOUND).
 */
export function shopperError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } });
}
