import type { KeystoneContext } from '@keystone-6/core/types';

interface PasswordUpdate { oldPassword: string; newPassword: string; confirmPassword: string }
interface PasswordProof {
  authenticateUserWithPassword?: { __typename: string; item?: { id: string } } | null;
}

export default async function updateActiveUserPassword(_root: unknown, { oldPassword, newPassword, confirmPassword }: PasswordUpdate, context: KeystoneContext<any>) {
  const session = context.session;
  if (!session?.itemId) throw new Error('Not authenticated');
  if (session.apiKeyScopes || session.oauthScopes || Object.prototype.hasOwnProperty.call(session, 'customerToken')) {
    throw new Error('Interactive account session required');
  }
  if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({ where: { id: session.itemId }, query: 'id email' });
  if (!user) throw new Error('Invalid old password');
  // Reuse the canonical Keystone password verifier; accept only an explicit
  // success for this same user, never a failure-message string comparison.
  const proof = await sudo.graphql.raw<PasswordProof, { email: string; password: string }>({
    query: `mutation VerifyPassword($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        __typename
        ... on UserAuthenticationWithPasswordSuccess { item { id } }
      }
    }`,
    variables: { email: user.email, password: oldPassword },
  });
  if (proof.errors?.length || proof.data?.authenticateUserWithPassword?.__typename !== 'UserAuthenticationWithPasswordSuccess'
    || proof.data.authenticateUserWithPassword.item?.id !== session.itemId) throw new Error('Invalid old password');
  return sudo.db.User.updateOne({ where: { id: session.itemId }, data: { password: newPassword } });
}
