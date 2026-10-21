import type { JSONValue } from '@keystone-6/core/types';

// Match JSON transport semantics: omit undefined object properties and normalize
// selected records before returning them from a GraphQL JSON virtual field.
export function toJsonValue(value: unknown): JSONValue {
  return JSON.parse(JSON.stringify(value)) as JSONValue;
}
