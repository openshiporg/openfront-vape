/** Effective state must distinguish an explicit null from an omitted update. */
export const effectiveValue = (resolved: any, item: any, field: string) => resolved[field] !== undefined ? resolved[field] : item?.[field];

/**
 * Whether a to-one relation is linked after this update. Keystone stores the
 * existing link on the item as `<field>Id`; only fields in the update appear
 * under their own name. Reading `item.<field>` finds nothing and makes every
 * update that omits the relation look unlinked.
 */
export function relationLinkedAfter(resolved: any, item: any, field: string): boolean {
  if (resolved[field] !== undefined) {
    const value = resolved[field];
    return Boolean(value && value.disconnect !== true && (typeof value === "string" || value.connect?.id || value.id));
  }
  return Boolean(item?.[`${field}Id`]);
}

export function validateAuthorityRevision({ item, resolvedData, inputData, addValidationError }: any, usable: string[], fields: string[]) {
  const nextStatus = effectiveValue(resolvedData, item, "status");
  if (item && usable.includes(item.status)) {
    if (fields.some(field => Object.prototype.hasOwnProperty.call(inputData || {}, field))) {
      addValidationError("Accepted evidence is immutable. Record a new revision; suspend or revoke the previous one without editing its content.");
    }
    if (!usable.includes(nextStatus) && !["suspended", "revoked", "expired", "retired", "emergency_disabled", "delisted"].includes(nextStatus)) {
      addValidationError("Accepted evidence cannot return to draft or review");
    }
  }
  if (!usable.includes(nextStatus)) return;
  const effective = new Date(effectiveValue(resolvedData, item, "effectiveAt") || NaN).getTime();
  const expiry = new Date(effectiveValue(resolvedData, item, "expiresAt") || NaN).getTime();
  if (!Number.isFinite(effective) || !Number.isFinite(expiry) || expiry <= effective) {
    addValidationError("Accepted evidence requires a valid bounded effective interval");
  }
}
