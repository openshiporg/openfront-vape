const allowedActions = new Set(["access", "correct", "delete", "restrict", "object"]);

// Data-subject actions are interactive only. API keys and OAuth tokens (credential
// scopes) and customer integration tokens must not export the account's personal data,
// change its consent or file privacy requests: the sudo reads below would otherwise
// bypass the Address/Order role∩scope and customer-token account controls.
function interactiveDataSubjectId(context: any): string {
  const session = context.session;
  const userId = session?.itemId;
  if (!userId) throw new Error("Authentication required");
  if (["apiKeyScopes", "oauthScopes", "customerToken"].some(marker => Object.prototype.hasOwnProperty.call(session, marker))) {
    throw new Error("Privacy actions require an interactive sign-in");
  }
  return userId;
}

export async function updatePrivacyPreferences(
  root: any,
  { preferences }: { preferences: any },
  context: any
) {
  const userId = interactiveDataSubjectId(context);
  const analytics = preferences?.analytics;
  const marketingEmail = preferences?.marketingEmail;
  if (typeof analytics !== "boolean" || typeof marketingEmail !== "boolean") {
    throw new Error("Privacy preferences must contain boolean analytics and marketingEmail values");
  }

  const receipt = {
    analytics,
    marketingEmail,
    recordedAt: new Date().toISOString(),
    source: "customer-account",
  };
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: "id userField { id preferences }",
  });
  if (!user) throw new Error("User not found");

  if (user.userField?.id) {
    await sudo.query.UserField.updateOne({
      where: { id: user.userField.id },
      data: {
        preferences: {
          ...(user.userField.preferences || {}),
          privacy: receipt,
        },
      },
    });
  } else {
    await sudo.query.UserField.createOne({
      data: {
        user: { connect: { id: userId } },
        preferences: { privacy: receipt },
      },
    });
  }
  return receipt;
}

export async function requestPrivacyAction(
  root: any,
  { action, details }: { action: string; details?: string },
  context: any
) {
  const userId = interactiveDataSubjectId(context);
  if (!allowedActions.has(action)) throw new Error("Unsupported privacy action");

  const request = await context.sudo().query.Notification.createOne({
    data: {
      eventName: "PRIVACY_REQUEST",
      resourceType: "User",
      resourceId: userId,
      to: "privacy-operations",
      user: { connect: { id: userId } },
      data: {
        action,
        details: typeof details === "string" ? details.slice(0, 2000) : null,
        status: "pending_identity_verification",
        requestedAt: new Date().toISOString(),
      },
    },
    query: "id eventName createdAt data",
  });
  return request;
}

// Keystone caps every list read at maxTake 100 (features/keystone/index.ts) and
// nested relationship reads without `take` silently default to that cap. A
// data-subject export must be complete or fail explicitly, never silently partial.
const PRIVACY_PAGE_SIZE = 100;
const PRIVACY_MAX_RECORDS = 10000;

async function readCompleteOwnedList(
  sudo: any,
  listKey: string,
  where: any,
  orderBy: any[],
  query: string,
  label: string
) {
  const expected = await sudo.query[listKey].count({ where });
  if (!Number.isSafeInteger(expected) || expected > PRIVACY_MAX_RECORDS) {
    throw new Error(`Privacy export exceeds the supported ${label} limit (${PRIVACY_MAX_RECORDS}); contact privacy operations`);
  }
  const rows: any[] = [];
  for (let skip = 0; skip < expected; skip += PRIVACY_PAGE_SIZE) {
    const page = await sudo.query[listKey].findMany({ where, orderBy, take: PRIVACY_PAGE_SIZE, skip, query });
    rows.push(...page);
    if (page.length < PRIVACY_PAGE_SIZE) break;
  }
  const finalCount = await sudo.query[listKey].count({ where });
  if (
    rows.length !== expected ||
    finalCount !== expected ||
    new Set(rows.map((row: any) => row.id)).size !== expected
  ) {
    throw new Error(`Privacy export is incomplete: ${label} changed during export; retry`);
  }
  return rows;
}

export async function getMyPrivacyData(root: any, args: any, context: any) {
  const userId = interactiveDataSubjectId(context);
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: `
      id name email phone createdAt updatedAt onboardingStatus
      userField { preferences }
    `,
  });
  if (!user) throw new Error("User not found");
  const ownedBy = { user: { id: { equals: userId } } };
  const addresses = await readCompleteOwnedList(
    sudo,
    "Address",
    ownedBy,
    [{ createdAt: "asc" }, { id: "asc" }],
    "id firstName lastName company address1 address2 city province postalCode phone country { iso2 }",
    "addresses"
  );
  const orders = await readCompleteOwnedList(
    sudo,
    "Order",
    ownedBy,
    [{ createdAt: "desc" }, { id: "desc" }],
    "id displayId status createdAt email",
    "orders"
  );
  return {
    generatedAt: new Date().toISOString(),
    user: { ...user, addresses, orders },
  };
}
