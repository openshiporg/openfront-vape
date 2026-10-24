import { REASON_CODE_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels';
import { merchantError, sessionContext, type SaveResult } from './session-context';

const GENERIC_ERROR = 'Unable to save. Please try again.';

// Custom mutations (labels, inventory, fulfilment) throw plain errors written for
// operators. Those messages are shown; anything that looks like an internal failure
// (database, network, stack output) stays generic.
const INTERNAL = /prisma|invalid `|econn|etimedout|fetch failed|socket|unexpected token|cannot read prop|undefined is not|is not a function|\n/i;

export function commandError(errors: readonly any[] | undefined): string {
  const known = merchantError(errors);
  if (known !== GENERIC_ERROR) return known;
  for (const error of errors || []) {
    const message = String(error?.message || '').trim();
    if (!message || message.length > 300 || INTERNAL.test(message)) continue;
    const denied = message.match(/^Regulated commerce denied: (.+)$/);
    if (denied) {
      const reasons = denied[1].split(',').map(code => regulatedLabel(REASON_CODE_LABELS, code.trim())).filter(Boolean);
      return `Compliance denied: ${reasons.join(', ')}`;
    }
    if (/^access denied/i.test(message)) return "You don't have permission to do this.";
    return message;
  }
  return GENERIC_ERROR;
}

/** Like runMutation, but also surfaces the operator-facing errors thrown by custom mutations. */
export async function runCommand<T>(query: string, variables: Record<string, unknown>, pick: (data: any) => T): Promise<SaveResult<T>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  try {
    const result = await context.graphql.raw({ query, variables });
    if (result.errors?.length) return { success: false, error: commandError(result.errors) };
    return { success: true, data: pick(result.data) };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}
