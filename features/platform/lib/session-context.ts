import type { IncomingMessage } from 'http';
import { cookies } from 'next/headers';

import { keystoneContext } from '@/features/keystone/context';

const SESSION_COOKIE = 'keystonejs-session';
const GENERIC_ERROR = 'Unable to save. Please try again.';

/**
 * A Keystone context for the signed-in dashboard user, so platform actions run with
 * that user's access rules but can still read the hooks' own error messages.
 * Only the session cookie is forwarded.
 */
export async function sessionContext() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return keystoneContext.withRequest({
    headers: { cookie: token ? `${SESSION_COOKIE}=${token}` : '' },
    method: 'POST',
    url: '/dashboard',
  } as IncomingMessage);
}

/**
 * Keystone's validation and access errors are written for merchants; anything else
 * stays generic.
 */
export function merchantError(errors: readonly any[] | undefined): string {
  for (const error of errors || []) {
    const code = error?.extensions?.code;
    if (code === 'KS_VALIDATION_FAILURE') {
      const lines = String(error.message || '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.slice(2).replace(/^[A-Za-z]+(\.[A-Za-z]+)?: /, ''));
      if (lines.length) return lines.join('. ');
    }
    if (code === 'KS_ACCESS_DENIED') return "You don't have permission to change this record.";
  }
  return GENERIC_ERROR;
}

export type SaveResult<T = { id: string }> = { success: true; data: T } | { success: false; error: string };

export async function runMutation<T>(query: string, variables: Record<string, unknown>, pick: (data: any) => T): Promise<SaveResult<T>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  try {
    const result = await context.graphql.raw({ query, variables });
    if (result.errors?.length) return { success: false, error: merchantError(result.errors) };
    return { success: true, data: pick(result.data) };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}

/** A yyyy-mm-dd date input as an ISO timestamp at midnight UTC, or null when empty. */
export const isoDay = (value: string | null | undefined) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null);
