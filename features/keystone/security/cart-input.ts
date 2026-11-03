import { shopperError } from "../lib/shopperError";
/** A public cart command selects merchandise; it never supplies commercial writes. */
function object(value: unknown, keys: readonly string[], label: string): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw shopperError(`${label} must be an object`, "INVALID_INPUT");
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw shopperError(`${label}.${key} is server-owned or unsupported`, "INVALID_INPUT");
  return value as Record<string, any>;
}
function id(value: unknown) {
  const input = object(value, ["id"], "Record selection");
  if (typeof input.id !== "string" || !input.id.trim() || input.id.length > 200) throw shopperError("Record ID is required", "RECORD_ID_REQUIRED");
  return { id: input.id };
}
function connection(value: unknown) {
  const input = object(value, ["connect"], "Relationship");
  return { connect: id(input.connect) };
}
export function cartQuantity(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1 || Number(value) > 1_000_000) throw shopperError("Quantity must be a positive supported integer", "INVALID_QUANTITY");
  return value as number;
}
function entries(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > 100) throw shopperError("A cart command accepts at most 100 lines", "TOO_MANY_LINES");
  return value;
}
export function parseCartUpdate(value: unknown): Record<string, any> {
  const input = object(value, ["email", "region", "shippingAddress", "billingAddress", "lineItems"], "Cart");
  const data: Record<string, any> = {};
  if (input.email !== undefined) {
    if (typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw shopperError("A valid email address is required", "INVALID_EMAIL");
    data.email = input.email.trim().toLowerCase();
  }
  for (const field of ["region", "shippingAddress", "billingAddress"]) if (input[field] !== undefined) data[field] = connection(input[field]);
  if (input.lineItems !== undefined) {
    // Generated CartUpdateInput supports create/disconnect, not nested update/delete.
    // Quantity changes go through updateActiveCartLineItem instead.
    const lines = object(input.lineItems, ["create", "disconnect"], "Cart lines");
    data.lineItems = {};
    if (lines.create !== undefined) data.lineItems.create = entries(lines.create).map(entry => {
      const line = object(entry, ["productVariant", "quantity"], "New line");
      return { productVariant: connection(line.productVariant), quantity: cartQuantity(line.quantity) };
    });
    if (lines.disconnect !== undefined) data.lineItems.disconnect = entries(lines.disconnect).map(id);
    const created = data.lineItems.create || [];
    const removed = (data.lineItems.disconnect || []).map((entry: any) => entry.id);
    if (!created.length && !removed.length) throw shopperError("Cart lines must include a line to create or disconnect", "INVALID_CART_LINES");
    if (new Set(removed).size !== removed.length) throw shopperError("A line may be changed only once per command", "DUPLICATE_LINE_CHANGE");
  }
  if (!Object.keys(data).length) throw shopperError("A cart update must include a supported change", "EMPTY_CART_UPDATE");
  return data;
}
