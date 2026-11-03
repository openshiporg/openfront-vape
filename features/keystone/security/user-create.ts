import { permissions } from "../access";

export const canCreateUserRole = permissions.canManageUsers;

const PUBLIC_USER_CREATE_FIELDS = new Set([
  "name",
  "email",
  "password",
  "phone",
  // createAuth merges initFirstItem.itemData into the DB API input before list
  // hooks run. Public callers cannot supply role because User.role field access
  // is enforced before resolveInput; allowing it here preserves the first admin.
  "role",
  // Guest checkout sends false; sign-ups send true or nothing (nothing means member).
  "hasAccount",
]);

type UserCreateData = Record<string, unknown>;

/**
 * Restrict fields supplied by an unauthenticated/non-manager caller without
 * deleting values added by Keystone field defaults or initFirstItem.itemData.
 */
export function resolvePublicUserCreateData({
  inputData,
  resolvedData,
}: {
  inputData?: UserCreateData;
  resolvedData: UserCreateData;
}): UserCreateData {
  const restrictedData = { ...resolvedData };

  // inputData is the caller-controlled boundary. resolvedData also contains
  // trusted field defaults and createAuth initFirstItem data (including the
  // first administrator's role), so iterating all resolved keys is unsafe.
  for (const key of Object.keys(inputData ?? {})) {
    if (!PUBLIC_USER_CREATE_FIELDS.has(key)) {
      delete restrictedData[key];
    }
  }

  // A new account is a MEMBER unless the guest-checkout flow says otherwise by sending
  // hasAccount:false explicitly. Defaulting to guest (=== true) made every sign-up that does
  // not send the flag look like a guest, and guest records can have their email retired
  // (security/guest-user.ts), which was an account takeover. The flag grants no privilege.
  restrictedData.hasAccount = inputData?.hasAccount !== false;
  return restrictedData;
}
