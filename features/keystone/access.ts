import { permissionsList } from "./models/fields";
import { hasPermission, type OAuthScope, type Permission } from "./oauth/scopes";

type RuleSession = { itemId?: string; data?: { role?: Record<string, unknown> }; oauthScopes?: unknown; apiKeyScopes?: unknown; customerToken?: unknown };
type RuleArgs = { session?: RuleSession };

// At it's simplest, the access control returns a yes or no value depending on the users session

export function isSignedIn({ session }: { session?: any }) {
  return !!session;
}

// Machine credentials (API keys, OAuth tokens) may only exercise a permission
// when BOTH the credential scope grants it AND the owner's current role (re-read
// by @keystone-6/auth on every request) allows it. An empty or missing scope
// array grants nothing; there is no fallback to the role alone.
function hasCredentialPermission(session: any, permission: string): boolean {
  const hasApiKeyScopes = Object.prototype.hasOwnProperty.call(session || {}, "apiKeyScopes");
  const hasOAuthScopes = Object.prototype.hasOwnProperty.call(session || {}, "oauthScopes");
  if (hasApiKeyScopes === hasOAuthScopes) return false;

  const scopes = hasApiKeyScopes ? session.apiKeyScopes : session.oauthScopes;
  if (!Array.isArray(scopes)) return false;

  const roleAllowsPermission = session?.data?.role?.[permission] === true;
  return roleAllowsPermission && hasPermission(scopes as OAuthScope[], permission as Permission);
}

export function isInteractiveUser({ session }: RuleArgs): boolean {
  return Boolean(session?.itemId) && !hasMachineCredential(session)
    && !Object.prototype.hasOwnProperty.call(session || {}, 'customerToken');
}

function hasMachineCredential(session: any): boolean {
  return Object.prototype.hasOwnProperty.call(session || {}, "apiKeyScopes")
    || Object.prototype.hasOwnProperty.call(session || {}, "oauthScopes");
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: { session?: any }) {
      // Customer tokens are account-scoped identities, never administrative role credentials.
      if (Object.prototype.hasOwnProperty.call(session || {}, "customerToken")) return false;
      if (hasMachineCredential(session)) return hasCredentialPermission(session, permission);
      // Human cookie/session-token users: current role checkbox only.
      return session?.data?.role?.[permission] === true;
    },
  ])
) as Record<(typeof permissionsList)[number], (args: { session?: any }) => boolean>;


// Permissions check if someone meets a criteria - yes or no.
export const permissions = {
  ...generatedPermissions,
};

// Rule based function
// Rules can return a boolean - yes or no - or a filter which limits which products they can CRUD.
export const rules = {
  canManageOrders({ session }: RuleArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { user: { id: { equals: session?.itemId } } };
  },
  canManageProducts({ session }: RuleArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { user: { id: { equals: session?.itemId } } };
  },
  canManageOrderItems({ session }: RuleArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageCheckouts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { order: { user: { id: { equals: session?.itemId } } } };
  },
  canReadProducts({ session }: RuleArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything!
    }
    // They should only see available products (based on the status field)
    // return { status: { equals: "AVAILABLE" } };
  },
  canManageUsers({ session }: RuleArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // Otherwise they may only update themselves!
    return { id: { equals: session?.itemId } };
  },

  canManageKeys({ session }: RuleArgs) {
    if (!isSignedIn({ session }) || typeof session?.itemId !== "string" || !session.itemId) {
      return false;
    }
    // Customer integration tokens never see or change API key metadata.
    if (Object.prototype.hasOwnProperty.call(session, "customerToken")) {
      return false;
    }
    if (permissions.canManageKeys({ session })) {
      return true;
    }
    // No credential scope maps to canManageKeys, so API keys and OAuth tokens get no
    // own-key fallback: only interactive humans may manage their own API keys.
    if (hasMachineCredential(session)) {
      return false;
    }
    return { user: { id: { equals: session.itemId } } };
  },
};
