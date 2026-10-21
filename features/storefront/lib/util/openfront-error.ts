function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

// ClientError.message includes the full request/variables (passwords, tokens and
// addresses). Match known states, but never return or log the transport envelope.
export function accountActionError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const response = record(record(error).response);
  const first = record(Array.isArray(response.errors) ? response.errors[0] : undefined);
  const extensions = record(first.extensions);
  const original = record(extensions.originalError);
  const message = typeof original.message === 'string' ? original.message : typeof first.message === 'string' ? first.message : error instanceof Error ? error.message : '';
  if (/unique.*email|email.*already exists/i.test(message)) return 'An account with this email already exists';
  if (/country.*required/i.test(message)) return 'Country is required';
  if (/password.*(?:do not match|mismatch)|confirmation.*match/i.test(message)) return 'Passwords do not match';
  if (/current password.*incorrect|invalid.*current password/i.test(message)) return 'Current password is incorrect';
  if (/not authenticated|authentication required/i.test(message)) return 'Authentication required';
  if (/address.*(?:preserved|in use)/i.test(message)) return 'This address is in use';
  if (/invalid data|validation failure/i.test(message)) return 'The supplied details are invalid';
  // Both are the server's GraphQL error text, never the ClientError request envelope.
  return (typeof original.message === 'string' && original.message) || (typeof first.message === 'string' && first.message) || fallback;
}

export default function openfrontError(error: unknown): never {
  throw new Error(accountActionError(error));
}
