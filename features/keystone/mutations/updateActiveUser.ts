import type { KeystoneContext } from '@keystone-6/core/types';
import type { UserUpdateInput } from '.keystone/types';

interface ProfileInput { email?: string | null; name?: string | null; phone?: string | null; onboardingStatus?: string | null }

export default async function updateActiveUser(_root: unknown, { data }: { data: ProfileInput }, context: KeystoneContext<any>) {
  const session = context.session;
  if (!session?.itemId) throw new Error('Not authenticated');
  if (session.apiKeyScopes || session.oauthScopes || Object.prototype.hasOwnProperty.call(session, 'customerToken')) {
    throw new Error('Interactive account session required');
  }
  const allowed = new Set(['email', 'name', 'phone', 'onboardingStatus']);
  if (!data || typeof data !== 'object' || Object.keys(data).some(key => !allowed.has(key))) throw new Error('Invalid profile update');
  const update: UserUpdateInput = {};
  for (const key of ['email', 'name', 'phone'] as const) {
    const value = data[key];
    if (value !== undefined) {
      if (value !== null && typeof value !== 'string') throw new Error('Invalid profile update');
      Object.assign(update, { [key]: value });
    }
  }
  if (data.onboardingStatus !== undefined) {
    if (!['not_started', 'in_progress', 'completed', 'dismissed'].includes(data.onboardingStatus || '')) {
      throw new Error('Invalid onboarding update');
    }
    Object.assign(update, { onboardingStatus: data.onboardingStatus });
  }
  // The actor and field allowlist are proven before bypassing raw User access.
  return context.sudo().db.User.updateOne({ where: { id: session.itemId }, data: update });
}
