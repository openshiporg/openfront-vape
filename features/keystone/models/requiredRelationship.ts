interface RelationshipValidationArgs {
  operation: 'create' | 'update';
  fieldKey: string;
  resolvedData: Record<string, unknown>;
  inputData?: Record<string, unknown>;
  addValidationError(message: string): void;
}

// Keystone 6 relationships do not implement text/integer's validation.isRequired.
// Validate the resolved connection instead of leaving an ignored configuration.
export function requireRelationship({ operation, fieldKey, resolvedData, inputData, addValidationError }: RelationshipValidationArgs): void {
  // Keystone includes unchanged relationship keys with value undefined. That is
  // not a disconnect. Explicit null/disconnect inputs must still fail closed.
  if (operation === 'update' && resolvedData[fieldKey] === undefined && inputData?.[fieldKey] === undefined) return;
  const value = resolvedData[fieldKey];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const connection = value as { connect?: unknown; create?: unknown; disconnect?: unknown };
    const connected = connection.connect;
    const created = connection.create;
    // Resolved unique selectors can be id, Country.iso2, Currency.code, etc.
    // Keystone validates the selector and existence; this hook enforces presence.
    const hasConnection = connected && typeof connected === 'object' && !Array.isArray(connected)
      && Object.values(connected).some(selector =>
        (typeof selector === 'string' && selector.length > 0)
        || (typeof selector === 'number' && Number.isSafeInteger(selector)));
    const hasNestedCreate = created && typeof created === 'object' && !Array.isArray(created) && Object.keys(created).length > 0;
    if (!connection.disconnect && (hasConnection || hasNestedCreate)) return;
  }
  addValidationError(`${fieldKey} is required`);
}
