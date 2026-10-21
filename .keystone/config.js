"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// features/keystone/models/fields.ts
var import_fields, permissionFields, permissionsList;
var init_fields = __esm({
  "features/keystone/models/fields.ts"() {
    "use strict";
    import_fields = require("@keystone-6/core/fields");
    permissionFields = {
      canAccessDashboard: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can access the dashboard"
      }),
      canReadOrders: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read orders"
      }),
      canManageOrders: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can update and delete any order"
      }),
      canReadProducts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read products"
      }),
      canManageProducts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can update and delete any product"
      }),
      canReadFulfillments: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read fulfillments"
      }),
      canManageFulfillments: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can update and delete any fulfillment"
      }),
      canReadUsers: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other users"
      }),
      canManageUsers: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can update and delete other users"
      }),
      canReadRoles: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other roles"
      }),
      canManageRoles: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can CRUD roles"
      }),
      canReadCheckouts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other checkouts"
      }),
      canManageCheckouts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage checkouts"
      }),
      canReadDiscounts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other discounts"
      }),
      canManageDiscounts: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage discounts"
      }),
      canReadGiftCards: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other gift cards"
      }),
      canManageGiftCards: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage gift cards"
      }),
      canReadReturns: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other returns"
      }),
      canManageReturns: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage returns"
      }),
      canReadSalesChannels: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other returns"
      }),
      canManageSalesChannels: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage returns"
      }),
      canReadPayments: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other payments"
      }),
      canManagePayments: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage payments"
      }),
      canReadIdempotencyKeys: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other idempotency keys"
      }),
      canManageIdempotencyKeys: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage idempotency keys"
      }),
      canReadApps: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can read other apps"
      }),
      canManageApps: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage apps"
      }),
      canManageKeys: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can see and manage API Keys"
      }),
      canManageOnboarding: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can access onboarding and store configuration"
      }),
      canReadWebhooks: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can view webhook endpoints and events"
      }),
      canManageWebhooks: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can create, update, and delete webhook endpoints (Warning: Grants access to ALL resource events)"
      }),
      canReadCompliance: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can view regulated-commerce status and non-sensitive evidence"
      }),
      canManageCompliance: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can manage regulated authority, policy, and review workflows"
      }),
      canReviewComplianceDecisions: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can review manual regulated-commerce decisions"
      }),
      canAccessIdentityEvidence: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can access restricted identity-verification evidence"
      }),
      canManageComplianceReports: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can generate, review, and record filing outcomes"
      }),
      canOperateComplianceKillSwitch: (0, import_fields.checkbox)({
        defaultValue: false,
        label: "User can suspend regulated transactions"
      })
    };
    permissionsList = Object.keys(permissionFields);
  }
});

// features/keystone/oauth/scopes.ts
function getPermissionsForScopes(scopes) {
  const permissions2 = /* @__PURE__ */ new Set();
  scopes.forEach((scope) => {
    const scopePermissions = SCOPE_TO_PERMISSIONS[scope];
    if (scopePermissions) {
      scopePermissions.forEach((permission) => permissions2.add(permission));
    }
  });
  return Array.from(permissions2);
}
function hasPermission(scopes, permission) {
  return getPermissionsForScopes(scopes).includes(permission);
}
var SCOPE_TO_PERMISSIONS, AVAILABLE_SCOPES, DEFAULT_SCOPES;
var init_scopes = __esm({
  "features/keystone/oauth/scopes.ts"() {
    "use strict";
    SCOPE_TO_PERMISSIONS = {
      // Products
      "read_products": ["canReadProducts"],
      "write_products": ["canReadProducts", "canManageProducts"],
      // Orders
      "read_orders": ["canReadOrders"],
      "write_orders": ["canReadOrders", "canManageOrders"],
      // Customers (maps to users in our system)
      "read_customers": ["canReadUsers"],
      "write_customers": ["canReadUsers", "canManageUsers"],
      // Fulfillments
      "read_fulfillments": ["canReadFulfillments"],
      "write_fulfillments": ["canReadFulfillments", "canManageFulfillments"],
      // Checkouts
      "read_checkouts": ["canReadCheckouts"],
      "write_checkouts": ["canReadCheckouts", "canManageCheckouts"],
      // Discounts
      "read_discounts": ["canReadDiscounts"],
      "write_discounts": ["canReadDiscounts", "canManageDiscounts"],
      // Gift Cards
      "read_gift_cards": ["canReadGiftCards"],
      "write_gift_cards": ["canReadGiftCards", "canManageGiftCards"],
      // Returns
      "read_returns": ["canReadReturns"],
      "write_returns": ["canReadReturns", "canManageReturns"],
      // Sales Channels
      "read_sales_channels": ["canReadSalesChannels"],
      "write_sales_channels": ["canReadSalesChannels", "canManageSalesChannels"],
      // Payments
      "read_payments": ["canReadPayments"],
      "write_payments": ["canReadPayments", "canManagePayments"],
      // Webhooks
      "read_webhooks": ["canReadWebhooks"],
      "write_webhooks": ["canReadWebhooks", "canManageWebhooks"],
      // Apps
      "read_apps": ["canReadApps"],
      "write_apps": ["canReadApps", "canManageApps"]
    };
    AVAILABLE_SCOPES = Object.keys(SCOPE_TO_PERMISSIONS);
    DEFAULT_SCOPES = ["read_products", "read_orders"];
  }
});

// features/keystone/access.ts
function isSignedIn({ session }) {
  return !!session;
}
function hasCredentialPermission(session, permission) {
  const hasApiKeyScopes = Object.prototype.hasOwnProperty.call(session || {}, "apiKeyScopes");
  const hasOAuthScopes = Object.prototype.hasOwnProperty.call(session || {}, "oauthScopes");
  if (hasApiKeyScopes === hasOAuthScopes) return false;
  const scopes = hasApiKeyScopes ? session.apiKeyScopes : session.oauthScopes;
  if (!Array.isArray(scopes)) return false;
  const roleAllowsPermission = session?.data?.role?.[permission] === true;
  return roleAllowsPermission && hasPermission(scopes, permission);
}
function isInteractiveUser({ session }) {
  return Boolean(session?.itemId) && !hasMachineCredential(session) && !Object.prototype.hasOwnProperty.call(session || {}, "customerToken");
}
function hasMachineCredential(session) {
  return Object.prototype.hasOwnProperty.call(session || {}, "apiKeyScopes") || Object.prototype.hasOwnProperty.call(session || {}, "oauthScopes");
}
var generatedPermissions, permissions, rules;
var init_access = __esm({
  "features/keystone/access.ts"() {
    "use strict";
    init_fields();
    init_scopes();
    generatedPermissions = Object.fromEntries(
      permissionsList.map((permission) => [
        permission,
        function({ session }) {
          if (Object.prototype.hasOwnProperty.call(session || {}, "customerToken")) return false;
          if (hasMachineCredential(session)) return hasCredentialPermission(session, permission);
          return session?.data?.role?.[permission] === true;
        }
      ])
    );
    permissions = {
      ...generatedPermissions
    };
    rules = {
      canManageOrders({ session }) {
        if (!isSignedIn({ session })) {
          return false;
        }
        if (permissions.canManageProducts({ session })) {
          return true;
        }
      },
      canManageProducts({ session }) {
        if (!isSignedIn({ session })) {
          return false;
        }
        if (permissions.canManageProducts({ session })) {
          return true;
        }
      },
      canManageOrderItems({ session }) {
        if (!isSignedIn({ session })) {
          return false;
        }
        if (permissions.canManageCheckouts({ session })) {
          return true;
        }
      },
      canReadProducts({ session }) {
        if (!isSignedIn({ session })) {
          return false;
        }
        if (permissions.canManageProducts({ session })) {
          return true;
        }
      },
      canManageUsers({ session }) {
        if (!isSignedIn({ session })) {
          return false;
        }
        if (permissions.canManageUsers({ session })) {
          return true;
        }
        return { id: { equals: session?.itemId } };
      },
      canManageKeys({ session }) {
        if (!isSignedIn({ session }) || typeof session?.itemId !== "string" || !session.itemId) {
          return false;
        }
        if (Object.prototype.hasOwnProperty.call(session, "customerToken")) {
          return false;
        }
        if (permissions.canManageKeys({ session })) {
          return true;
        }
        if (hasMachineCredential(session)) {
          return false;
        }
        return { user: { id: { equals: session.itemId } } };
      }
    };
  }
});

// features/keystone/security/token-crypto.ts
function requireSecret(purpose, explicitSecret) {
  const secret = explicitSecret || process.env.CREDENTIAL_PEPPER || process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      `${purpose} requires CREDENTIAL_PEPPER or SESSION_SECRET with at least 32 characters`
    );
  }
  return secret;
}
function generateOpaqueToken(prefix) {
  return `${prefix}${import_node_crypto.default.randomBytes(32).toString("base64url")}`;
}
function digestCredential(value, purpose, explicitSecret) {
  const secret = requireSecret(purpose, explicitSecret);
  return import_node_crypto.default.createHmac("sha256", secret).update(`${purpose}\0${value}`, "utf8").digest("hex");
}
function verifyCredentialDigest(value, expectedDigest, purpose, explicitSecret) {
  if (!value || !expectedDigest) return false;
  const actual = Buffer.from(
    digestCredential(value, purpose, explicitSecret),
    "hex"
  );
  const expected = Buffer.from(expectedDigest, "hex");
  return actual.length === expected.length && import_node_crypto.default.timingSafeEqual(actual, expected);
}
function createCartProof(cartId, options = {}) {
  if (!cartId) throw new Error("Cart ID is required");
  const expiresAt = options.expiresAt || Math.floor(Date.now() / 1e3) + DEFAULT_CART_PROOF_TTL_SECONDS;
  const payload = `${CART_PROOF_VERSION}.${cartId}.${expiresAt}`;
  const signature = digestCredential(payload, "cart-proof", options.secret);
  return `${payload}.${signature}`;
}
function verifyCartProof(proof, cartId, options = {}) {
  if (!proof || !cartId) return false;
  const [version, proofCartId, expiresAtRaw, signature, ...extra] = proof.split(".");
  if (extra.length || version !== CART_PROOF_VERSION || proofCartId !== cartId || !/^\d+$/.test(expiresAtRaw || "") || !/^[a-f0-9]{64}$/.test(signature || "")) {
    return false;
  }
  const expiresAt = Number(expiresAtRaw);
  const now = options.now || Math.floor(Date.now() / 1e3);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  return verifyCredentialDigest(
    `${version}.${proofCartId}.${expiresAt}`,
    signature,
    "cart-proof",
    options.secret
  );
}
function customerTokenDigest(token) {
  return digestCredential(token, "customer-token");
}
function oauthTokenDigest(token) {
  return digestCredential(token, "oauth-token");
}
function oauthClientSecretDigest(secret) {
  return digestCredential(secret, "oauth-client-secret");
}
var import_node_crypto, CART_PROOF_VERSION, DEFAULT_CART_PROOF_TTL_SECONDS;
var init_token_crypto = __esm({
  "features/keystone/security/token-crypto.ts"() {
    "use strict";
    import_node_crypto = __toESM(require("node:crypto"));
    CART_PROOF_VERSION = "v1";
    DEFAULT_CART_PROOF_TTL_SECONDS = 60 * 60 * 24 * 7;
  }
});

// features/keystone/security/commerce-fence.ts
async function withCommerceFence(context, run) {
  if (insideCommerceFence(context)) return run(context);
  return context.transaction(async (tx) => {
    transactions.add(tx.prisma);
    try {
      return await run(tx);
    } finally {
      transactions.delete(tx.prisma);
    }
  });
}
async function currentCommerceActor(context) {
  const session = context.session;
  if (!session?.itemId) return context;
  if (session.apiKeyScopes || session.oauthScopes) return context;
  if (Object.prototype.hasOwnProperty.call(session, "customerToken")) {
    return context.withSession({ ...session, data: { ...session.data, role: null } });
  }
  const user = await context.sudo().prisma.user.findUnique({ where: { id: session.itemId }, select: { id: true, role: true } });
  if (!user) throw new Error("Not authenticated");
  return context.withSession({ ...session, data: { ...session.data, role: user.role } });
}
function withCartFence(context, cartId, mode, run, proposed = []) {
  return withCartSetFence(context, [cartId], mode, run, proposed);
}
async function withCartSetFence(context, ids, mode, run, proposed = []) {
  const cartIds = sortedIds(ids);
  if (!cartIds.length || cartIds.length !== ids.length || cartIds.length > 100) throw new Error("Cart could not be updated");
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    const { assertCartAccess: assertCartAccess2 } = await Promise.resolve().then(() => (init_cart_access(), cart_access_exports));
    const access = { allowCompleted: mode === "recovery" || mode === "checkout" };
    for (const id2 of cartIds) await assertCartAccess2(tx, id2, access);
    const discovered = await tx.prisma.cart.findMany({ where: { id: { in: cartIds } }, select: { id: true, shippingAddressId: true, billingAddressId: true } });
    if (discovered.length !== cartIds.length) throw new Error("Cart not found");
    for (const id2 of sortedIds([...proposed, ...discovered.flatMap((cart) => [cart.shippingAddressId, cart.billingAddressId])])) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id2} FOR UPDATE`;
    }
    for (const id2 of cartIds) await tx.prisma.$queryRaw`SELECT id FROM "Cart" WHERE id = ${id2} FOR UPDATE`;
    for (const cart of discovered) {
      const current = await tx.prisma.cart.findUnique({ where: { id: cart.id }, select: { shippingAddressId: true, billingAddressId: true } });
      if (!current || current.shippingAddressId !== cart.shippingAddressId || current.billingAddressId !== cart.billingAddressId) throw new Error("Cart could not be updated");
      await assertCartAccess2(tx, cart.id, access);
    }
    for (const key of cartIds.map((id2) => `checkout:${id2}`).sort()) {
      await tx.prisma.$queryRaw`SELECT id FROM "IdempotencyKey" WHERE "idempotencyKey" = ${key} FOR UPDATE`;
    }
    for (const cartId of cartIds) {
      const checkout = await tx.prisma.idempotencyKey.findUnique({ where: { idempotencyKey: `checkout:${cartId}` } });
      if (mode !== "checkout" && mode !== "recovery" && checkout && (checkout.lockedAt || !["started", "failed"].includes(checkout.recoveryPoint))) throw new Error("Checkout is in progress for this cart");
    }
    return run(tx);
  });
}
var transactions, insideCommerceFence, sortedIds;
var init_commerce_fence = __esm({
  "features/keystone/security/commerce-fence.ts"() {
    "use strict";
    transactions = /* @__PURE__ */ new WeakSet();
    insideCommerceFence = (context) => transactions.has(context.prisma);
    sortedIds = (ids) => [...new Set(ids.filter((id2) => typeof id2 === "string" && Boolean(id2)))].sort();
  }
});

// features/keystone/security/cart-access.ts
var cart_access_exports = {};
__export(cart_access_exports, {
  assertAddressAccess: () => assertAddressAccess,
  assertCartAccess: () => assertCartAccess,
  assertLineItemBelongsToCart: () => assertLineItemBelongsToCart,
  assertPaymentSessionBelongsToCart: () => assertPaymentSessionBelongsToCart,
  getCartProofFromContext: () => getCartProofFromContext,
  withCartMutationLock: () => withCartMutationLock
});
async function withCartMutationLock(context, cartId, run, newAddresses = []) {
  return withCartFence(context, cartId, "mutation", run, newAddresses);
}
function headerValue(value) {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : void 0;
}
function cookieValue(cookieHeader, name) {
  if (!cookieHeader) return void 0;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(value.join("="));
      } catch {
        return void 0;
      }
    }
  }
  return void 0;
}
function getCartProofFromContext(context) {
  const headers = context?.req?.headers || {};
  return headerValue(headers["x-openfront-cart-proof"]) || cookieValue(headerValue(headers.cookie), "_openfront_cart_id");
}
async function assertCartAccess(context, cartId, options = {}) {
  if (!cartId) throw new Error("Cart ID is required");
  context = await currentCommerceActor(context);
  const canManage = permissions.canManageOrders({ session: context.session });
  const sessionUserId = context.session?.itemId;
  const proof = getCartProofFromContext(context);
  if (!canManage && !sessionUserId && !verifyCartProof(proof, cartId)) {
    throw new Error("Cart not found");
  }
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id user { id } order { id }"
  });
  if (!cart) throw new Error("Cart not found");
  if (!canManage) {
    const ownsCart = Boolean(sessionUserId && cart.user?.id === sessionUserId);
    const ownsGuestProof = Boolean(!cart.user && verifyCartProof(proof, cartId));
    if (!ownsCart && !ownsGuestProof) throw new Error("Cart not found");
  }
  if (!options.allowCompleted && cart.order?.id) {
    throw new Error("Cart has already been completed");
  }
  return cart;
}
async function assertLineItemBelongsToCart(context, cartId, lineItemId) {
  await assertCartAccess(context, cartId);
  const lineItem = await context.sudo().query.LineItem.findOne({
    where: { id: lineItemId },
    query: "id cart { id }"
  });
  if (lineItem?.cart?.id !== cartId) throw new Error("Line item not found");
}
async function assertAddressAccess(context, addressId) {
  context = await currentCommerceActor(context);
  const canManage = permissions.canManageOrders({ session: context.session });
  const address = await context.sudo().query.Address.findOne({
    where: { id: addressId },
    query: "id user { id } country { iso2 }"
  });
  if (!address || !canManage && (!context.session?.itemId || address.user?.id !== context.session.itemId)) {
    throw new Error("Address not found");
  }
  return address;
}
async function assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id paymentCollection { paymentSessions { id } }"
  });
  if (!cart?.paymentCollection?.paymentSessions?.some(
    (session) => session.id === paymentSessionId
  )) {
    throw new Error("Payment session not found");
  }
}
var init_cart_access = __esm({
  "features/keystone/security/cart-access.ts"() {
    "use strict";
    init_access();
    init_token_crypto();
    init_commerce_fence();
  }
});

// features/integrations/payment/stripe.ts
var stripe_exports = {};
__export(stripe_exports, {
  capturePaymentFunction: () => capturePaymentFunction,
  createPaymentFunction: () => createPaymentFunction,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction,
  getPaymentStatusFunction: () => getPaymentStatusFunction,
  handleWebhookFunction: () => handleWebhookFunction,
  refundPaymentFunction: () => refundPaymentFunction
});
async function createPaymentFunction({ cart, amount, currency }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true
    },
    metadata: cart?.id ? { cartId: cart.id } : void 0
  }, cart?.id ? { idempotencyKey: `cart:${cart.id}:${amount}:${currency.toLowerCase()}` } : void 0);
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}
async function capturePaymentFunction({ paymentId, amount, idempotencyKey }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.capture(
    paymentId,
    { ...amount ? { amount_to_capture: amount } : {} },
    idempotencyKey ? { idempotencyKey } : void 0
  );
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_received,
    currency: paymentIntent.currency,
    data: paymentIntent
  };
}
async function refundPaymentFunction({ paymentId, amount, idempotencyKey }) {
  const stripe = getStripeClient();
  const refund = await stripe.refunds.create({
    payment_intent: paymentId,
    ...amount ? { amount } : {}
  }, idempotencyKey ? { idempotencyKey } : void 0);
  return {
    status: refund.status,
    amount: refund.amount,
    currency: refund.currency,
    data: refund
  };
}
async function getPaymentStatusFunction({ paymentId }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
    data: paymentIntent
  };
}
async function generatePaymentLinkFunction({ paymentId }) {
  return `https://dashboard.stripe.com/payments/${paymentId}`;
}
async function handleWebhookFunction({ event, headers }) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not configured");
  }
  const stripe = getStripeClient();
  try {
    if (!headers.__rawBody) throw new Error("Raw webhook body is required");
    const stripeEvent = stripe.webhooks.constructEvent(
      headers.__rawBody,
      headers["stripe-signature"],
      webhookSecret
    );
    return {
      isValid: true,
      event: stripeEvent,
      type: stripeEvent.type,
      resource: stripeEvent.data.object
    };
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
var import_stripe, getStripeClient;
var init_stripe = __esm({
  "features/integrations/payment/stripe.ts"() {
    "use strict";
    import_stripe = __toESM(require("stripe"));
    getStripeClient = () => {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new Error("Stripe secret key not configured");
      }
      return new import_stripe.default(stripeKey, {
        apiVersion: "2025-05-28.basil"
      });
    };
  }
});

// features/integrations/payment/paypal.ts
var paypal_exports = {};
__export(paypal_exports, {
  capturePaymentFunction: () => capturePaymentFunction2,
  createPaymentFunction: () => createPaymentFunction2,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction2,
  getPaymentStatusFunction: () => getPaymentStatusFunction2,
  handleWebhookFunction: () => handleWebhookFunction2,
  refundPaymentFunction: () => refundPaymentFunction2
});
async function handleWebhookFunction2({ event, headers }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PayPal webhook ID is not configured");
  }
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: event
    })
  });
  const verification = await response.json();
  const isValid = verification.verification_status === "SUCCESS";
  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }
  return {
    isValid: true,
    event,
    type: event.event_type,
    resource: event.resource
  };
}
async function createPaymentFunction2({ cart, amount, currency }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...cart?.id ? { "PayPal-Request-Id": `cart-${cart.id}-${amount}-${currency.toUpperCase()}` } : {}
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: cart?.id,
            amount: {
              currency_code: currency.toUpperCase(),
              value: formatPayPalAmount(amount, currency)
            }
          }
        ]
      })
    }
  );
  const order = await response.json();
  if (order.error) {
    throw new Error(`PayPal order creation failed: ${order.error.message}`);
  }
  return {
    orderId: order.id,
    status: order.status
  };
}
async function capturePaymentFunction2({ paymentId, idempotencyKey }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}
      }
    }
  );
  const capture = await response.json();
  if (capture.error) {
    throw new Error(`PayPal capture failed: ${capture.error.message}`);
  }
  const capturedAmount = capture.purchase_units[0].payments.captures[0].amount;
  return {
    status: capture.status,
    amount: parsePayPalAmount(capturedAmount.value, capturedAmount.currency_code),
    currency: capturedAmount.currency_code,
    data: capture
  };
}
async function refundPaymentFunction2({ paymentId, amount = 0, currency = "USD", idempotencyKey }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/payments/captures/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}
      },
      body: JSON.stringify({
        amount: {
          value: formatPayPalAmount(amount, currency),
          currency_code: currency.toUpperCase()
        }
      })
    }
  );
  const refund = await response.json();
  if (refund.error) {
    throw new Error(`PayPal refund failed: ${refund.error.message}`);
  }
  return {
    status: refund.status,
    amount: parsePayPalAmount(refund.amount.value, refund.amount.currency_code),
    currency: refund.amount.currency_code,
    data: refund
  };
}
async function getPaymentStatusFunction2({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const order = await response.json();
  if (order.error) {
    throw new Error(`PayPal status check failed: ${order.error.message}`);
  }
  const orderAmount = order.purchase_units[0].amount;
  return {
    status: order.status,
    amount: parsePayPalAmount(orderAmount.value, orderAmount.currency_code),
    currency: orderAmount.currency_code,
    data: order
  };
}
async function generatePaymentLinkFunction2({ paymentId }) {
  return `https://www.paypal.com/activity/payment/${paymentId}`;
}
var NO_DIVISION_CURRENCIES, getPayPalBaseUrl, formatPayPalAmount, parsePayPalAmount, getPayPalAccessToken;
var init_paypal = __esm({
  "features/integrations/payment/paypal.ts"() {
    "use strict";
    NO_DIVISION_CURRENCIES = [
      "JPY",
      "KRW",
      "VND",
      "CLP",
      "PYG",
      "XAF",
      "XOF",
      "BIF",
      "DJF",
      "GNF",
      "KMF",
      "MGA",
      "RWF",
      "XPF",
      "HTG",
      "VUV",
      "XAG",
      "XDR",
      "XAU"
    ];
    getPayPalBaseUrl = () => {
      const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX !== "false";
      return isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    };
    formatPayPalAmount = (amount, currency) => {
      const upperCurrency = currency.toUpperCase();
      const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);
      if (isNoDivision) {
        return amount.toString();
      }
      return (amount / 100).toFixed(2);
    };
    parsePayPalAmount = (value, currency) => {
      const upperCurrency = currency.toUpperCase();
      const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);
      if (isNoDivision) {
        return parseInt(value, 10);
      }
      return Math.round(parseFloat(value) * 100);
    };
    getPayPalAccessToken = async () => {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured");
      }
      const baseUrl = getPayPalBaseUrl();
      const response = await fetch(
        `${baseUrl}/v1/oauth2/token`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Language": "en_US",
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`
          },
          body: "grant_type=client_credentials"
        }
      );
      const { access_token } = await response.json();
      if (!access_token) {
        throw new Error("Failed to get PayPal access token");
      }
      return access_token;
    };
  }
});

// features/integrations/payment/manual.ts
var manual_exports = {};
__export(manual_exports, {
  capturePaymentFunction: () => capturePaymentFunction3,
  createPaymentFunction: () => createPaymentFunction3,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction3,
  getPaymentStatusFunction: () => getPaymentStatusFunction3,
  handleWebhookFunction: () => handleWebhookFunction3,
  refundPaymentFunction: () => refundPaymentFunction3
});
async function handleWebhookFunction3() {
  throw new Error("Manual payment providers do not accept webhook ingress");
}
async function createPaymentFunction3({ cart, amount, currency }) {
  return {
    status: "pending",
    data: {
      status: "pending",
      amount,
      currency: currency.toLowerCase()
    }
  };
}
async function capturePaymentFunction3({ paymentId, amount = 0 }) {
  return {
    status: "captured",
    amount,
    data: {
      status: "captured",
      amount,
      captured_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
async function refundPaymentFunction3({ paymentId, amount = 0, currency = "USD" }) {
  return {
    status: "refunded",
    amount,
    currency,
    data: {
      status: "refunded",
      amount,
      refunded_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
async function getPaymentStatusFunction3({ paymentId }) {
  return {
    status: "succeeded",
    data: {
      status: "succeeded"
    }
  };
}
async function generatePaymentLinkFunction3({ paymentId }) {
  return null;
}
var init_manual = __esm({
  "features/integrations/payment/manual.ts"() {
    "use strict";
  }
});

// features/integrations/payment/index.ts
var payment_exports = {};
__export(payment_exports, {
  paymentProviderAdapters: () => paymentProviderAdapters
});
var paymentProviderAdapters;
var init_payment = __esm({
  "features/integrations/payment/index.ts"() {
    "use strict";
    paymentProviderAdapters = {
      stripe: () => Promise.resolve().then(() => (init_stripe(), stripe_exports)),
      paypal: () => Promise.resolve().then(() => (init_paypal(), paypal_exports)),
      manual: () => Promise.resolve().then(() => (init_manual(), manual_exports))
    };
  }
});

// features/integrations/shipping/shippo.ts
var shippo_exports = {};
__export(shippo_exports, {
  cancelLabelFunction: () => cancelLabelFunction,
  createLabelFunction: () => createLabelFunction,
  getRatesFunction: () => getRatesFunction,
  trackShipmentFunction: () => trackShipmentFunction,
  validateAddressFunction: () => validateAddressFunction
});
async function createLabelFunction({
  provider,
  order,
  rateId,
  dimensions,
  lineItems,
  idempotencyKey
}) {
  if (!dimensions) {
    throw new Error("Dimensions are required to create a shipping label");
  }
  if (!dimensions.length || !dimensions.width || !dimensions.height || !dimensions.weight) {
    throw new Error(
      "Invalid dimensions provided. All dimensions and weight are required"
    );
  }
  const addressToResponse = await fetch(`${SHIPPO_API_URL}/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone,
      email: order.shippingAddress.email
    })
  });
  const addressTo = await addressToResponse.json();
  if (!addressToResponse.ok) {
    throw new Error(addressTo.message || "Failed to create address");
  }
  const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      address_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        company: provider.fromAddress.company,
        street1: provider.fromAddress.address1,
        street2: provider.fromAddress.address2,
        city: provider.fromAddress.city,
        state: provider.fromAddress.province,
        zip: provider.fromAddress.postalCode,
        country: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      address_to: addressTo.object_id,
      parcels: [
        {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          distance_unit: dimensions.unit,
          weight: dimensions.weight || dimensions.value,
          mass_unit: dimensions.weightUnit || dimensions.unit
        }
      ],
      async: false
    })
  });
  const shipment = await shipmentResponse.json();
  if (!shipmentResponse.ok) {
    throw new Error(shipment.message || "Failed to create shipment");
  }
  const transactionResponse = await fetch(`${SHIPPO_API_URL}/transactions/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      rate: rateId,
      label_file_type: "PDF",
      async: false,
      ...idempotencyKey ? { metadata: idempotencyKey } : {}
    })
  });
  const transaction = await transactionResponse.json();
  if (!transactionResponse.ok) {
    throw new Error(transaction.message || "Failed to create label");
  }
  if (transaction.status === "ERROR") {
    const errorMessage = transaction.messages?.[0]?.text || "Label creation failed";
    throw new Error(errorMessage);
  }
  if (!transaction.label_url) {
    throw new Error("No label URL received from Shippo");
  }
  return {
    status: "purchased",
    data: transaction,
    rate: transaction.rate,
    carrier: transaction.provider,
    service: transaction.servicelevel?.name,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url
  };
}
async function getRatesFunction({ provider, order, dimensions }) {
  if (!dimensions) {
    throw new Error("Dimensions are required to get shipping rates");
  }
  const addressToResponse = await fetch(`${SHIPPO_API_URL}/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone
    })
  });
  const addressTo = await addressToResponse.json();
  if (!addressToResponse.ok) {
    throw new Error(addressTo.message || "Failed to create address");
  }
  const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      address_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        company: provider.fromAddress.company,
        street1: provider.fromAddress.address1,
        street2: provider.fromAddress.address2,
        city: provider.fromAddress.city,
        state: provider.fromAddress.province,
        zip: provider.fromAddress.postalCode,
        country: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      address_to: addressTo.object_id,
      parcels: [
        {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          distance_unit: dimensions.unit,
          weight: dimensions.weight,
          mass_unit: dimensions.weightUnit
        }
      ]
    })
  });
  const shipment = await shipmentResponse.json();
  if (!shipmentResponse.ok) {
    throw new Error(
      shipment.message || shipment.__all__ || "Failed to create shipment"
    );
  }
  return shipment.rates.map((rate) => ({
    id: rate.object_id,
    providerId: provider.id,
    service: rate.servicelevel.name,
    carrier: rate.provider,
    price: rate.amount,
    currency: rate.currency,
    estimatedDays: rate.estimated_days
  }));
}
async function validateAddressFunction({ provider, address }) {
  try {
    const response = await fetch(`${SHIPPO_API_URL}/addresses/`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${provider.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `${address.firstName} ${address.lastName}`,
        company: address.company,
        street1: address.address1,
        street2: address.address2,
        city: address.city,
        state: address.province,
        zip: address.postalCode,
        country: address.country.iso2,
        phone: address.phone,
        validate: true
      })
    });
    const validation = await response.json();
    if (!response.ok) {
      throw new Error(validation.message || "Address validation failed");
    }
    return {
      isValid: validation.validation_results.is_valid,
      suggestedAddress: validation.validation_results.is_valid ? {
        address1: validation.street1,
        address2: validation.street2,
        city: validation.city,
        province: validation.state,
        postalCode: validation.zip,
        country: validation.country
      } : null,
      errors: validation.validation_results.messages || []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Shipping provider request failed"]
    };
  }
}
async function trackShipmentFunction({ provider, trackingNumber }) {
  const response = await fetch(`${SHIPPO_API_URL}/tracks/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      carrier: "usps",
      tracking_number: trackingNumber
    })
  });
  const tracking = await response.json();
  if (!response.ok) {
    throw new Error(tracking.message || "Failed to track shipment");
  }
  return {
    status: tracking.tracking_status.status,
    estimatedDelivery: tracking.eta,
    trackingUrl: tracking.tracking_url,
    events: tracking.tracking_history.map((event) => ({
      status: event.status,
      location: event.location,
      timestamp: event.status_date,
      message: event.status_details
    }))
  };
}
async function cancelLabelFunction({ provider, labelId }) {
  try {
    const response = await fetch(`${SHIPPO_API_URL}/refunds/`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${provider.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction: labelId
      })
    });
    const refund = await response.json();
    if (!response.ok) {
      throw new Error(refund.message || "Failed to cancel label");
    }
    return {
      success: refund.status !== "ERROR",
      refundStatus: refund.status || "QUEUED"
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Shipping provider request failed"
    };
  }
}
var SHIPPO_API_URL;
var init_shippo = __esm({
  "features/integrations/shipping/shippo.ts"() {
    "use strict";
    SHIPPO_API_URL = "https://api.goshippo.com";
  }
});

// features/integrations/shipping/shipengine.ts
var shipengine_exports = {};
__export(shipengine_exports, {
  cancelLabelFunction: () => cancelLabelFunction2,
  createLabelFunction: () => createLabelFunction2,
  getRatesFunction: () => getRatesFunction2,
  listCarriersFunction: () => listCarriersFunction,
  trackShipmentFunction: () => trackShipmentFunction2,
  validateAddressFunction: () => validateAddressFunction2
});
function convertDimensions(dim) {
  if (dim.unit === "m") {
    return {
      length: dim.length * 100,
      width: dim.width * 100,
      height: dim.height * 100,
      unit: "centimeter"
    };
  } else if (dim.unit === "ft") {
    return {
      length: dim.length * 12,
      width: dim.width * 12,
      height: dim.height * 12,
      unit: "inch"
    };
  } else {
    return {
      length: dim.length,
      width: dim.width,
      height: dim.height,
      unit: DIMENSION_UNIT_MAP[dim.unit] || dim.unit
    };
  }
}
function convertWeight(dim) {
  if (dim.weightUnit in WEIGHT_UNIT_MAP) {
    return {
      value: dim.weight,
      unit: WEIGHT_UNIT_MAP[dim.weightUnit]
    };
  } else if (dim.weightUnit === "mg") {
    return {
      value: dim.weight / 1e3,
      unit: "gram"
    };
  } else {
    return {
      value: dim.weight,
      unit: "gram"
    };
  }
}
async function listCarriersFunction(provider) {
  const response = await fetch(`${SHIPENGINE_API_URL}/carriers`, {
    method: "GET",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to list carriers");
  }
  if (!result.carriers || result.carriers.length === 0) {
    throw new Error("No carriers found from ShipEngine");
  }
  return result.carriers;
}
async function createLabelFunction2({
  provider,
  order,
  rateId,
  dimensions,
  lineItems,
  idempotencyKey
}) {
  if (!dimensions) {
    throw new Error("Dimensions are required to create a shipping label");
  }
  if (!dimensions.length || !dimensions.width || !dimensions.height || !dimensions.weight) {
    throw new Error(
      "Invalid dimensions provided. All dimensions and weight are required"
    );
  }
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);
  let serviceCode = rateId;
  let finalRateId = rateId;
  try {
    const parsed = JSON.parse(rateId);
    serviceCode = parsed.service;
    finalRateId = parsed.id;
  } catch (e) {
  }
  const payload = {
    shipment: {
      ...idempotencyKey ? { external_shipment_id: idempotencyKey } : {},
      // Use the serviceCode variable instead of rateId directly
      service_code: serviceCode,
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone,
        email: order.shippingAddress.email
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit
          }
        }
      ]
    },
    label_format: "PDF"
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/labels`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create label");
  }
  const labelUrl = result.label_download?.pdf || result.label_download?.href;
  if (!labelUrl) {
    throw new Error("No label URL received from ShipEngine");
  }
  return {
    status: "purchased",
    data: result,
    rate: result.rate,
    carrier: result.carrier_code,
    service: result.service_type || result.service_code,
    trackingNumber: result.tracking_number,
    trackingUrl: result.tracking_url,
    labelUrl,
    rateId: finalRateId
  };
}
async function getRatesFunction2({ provider, order, dimensions }) {
  if (!dimensions) {
    throw new Error("Dimensions are required to get shipping rates");
  }
  const carriers = await listCarriersFunction(provider);
  const carrier_ids = carriers.map((carrier) => carrier.carrier_id);
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);
  const payload = {
    shipment: {
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit
          }
        }
      ]
    },
    // rate_options is mandatory – we supply the gathered carrier_ids.
    rate_options: { carrier_ids }
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/rates`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to get rates");
  }
  return result.rate_response.rates.map((rate) => {
    const shippingAmt = rate.shipping_amount && rate.shipping_amount.amount || 0;
    const otherAmt = rate.other_amount && rate.other_amount.amount || 0;
    const totalPrice = Number(shippingAmt + otherAmt).toFixed(2);
    const idValue = JSON.stringify({
      id: rate.rate_id,
      service: rate.service_code
    });
    return {
      id: idValue,
      providerId: provider.id,
      service: rate.service_type || rate.service_code,
      carrier: rate.carrier_friendly_name || rate.carrier_code,
      price: totalPrice,
      currency: rate.shipping_amount ? rate.shipping_amount.currency.toUpperCase() : "USD",
      estimatedDays: rate.delivery_days || rate.estimated_delivery_days
    };
  });
}
async function validateAddressFunction2({ provider, address }) {
  try {
    const payload = {
      address: {
        name: `${address.firstName} ${address.lastName}`,
        address_line1: address.address1,
        address_line2: address.address2,
        city_locality: address.city,
        state_province: address.province,
        postal_code: address.postalCode,
        country_code: address.country.iso2,
        phone: address.phone
      }
    };
    const response = await fetch(`${SHIPENGINE_API_URL}/addresses/validate`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const validation = await response.json();
    if (!response.ok) {
      throw new Error(validation.message || "Address validation failed");
    }
    return {
      isValid: validation.is_valid,
      suggestedAddress: validation.is_valid ? {
        address1: validation.address_line1,
        address2: validation.address_line2,
        city: validation.city_locality,
        province: validation.state_province,
        postalCode: validation.postal_code,
        country: validation.country_code
      } : null,
      errors: validation.messages || []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Shipping provider request failed"]
    };
  }
}
async function trackShipmentFunction2({ provider, trackingNumber }) {
  const payload = {
    tracking_number: trackingNumber
    // Optionally include additional fields like carrier_code if required
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/tracking`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const tracking = await response.json();
  if (!response.ok) {
    throw new Error(tracking.message || "Failed to track shipment");
  }
  return {
    status: tracking.status,
    estimatedDelivery: tracking.estimated_delivery_date,
    trackingUrl: tracking.tracking_url,
    events: tracking.events ? tracking.events.map((event) => ({
      status: event.status,
      location: event.location,
      timestamp: event.date,
      message: event.detail
    })) : []
  };
}
async function cancelLabelFunction2({ provider, labelId }) {
  try {
    const payload = { label_id: labelId };
    const response = await fetch(`${SHIPENGINE_API_URL}/labels/cancel`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel label");
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Shipping provider request failed"
    };
  }
}
var SHIPENGINE_API_URL, WEIGHT_UNIT_MAP, DIMENSION_UNIT_MAP;
var init_shipengine = __esm({
  "features/integrations/shipping/shipengine.ts"() {
    "use strict";
    SHIPENGINE_API_URL = "https://api.shipengine.com/v1";
    WEIGHT_UNIT_MAP = {
      oz: "ounce",
      lb: "pound",
      lbs: "pound",
      kg: "kilogram",
      g: "gram"
    };
    DIMENSION_UNIT_MAP = {
      in: "inch",
      cm: "centimeter"
    };
  }
});

// features/integrations/shipping/manual.ts
var manual_exports2 = {};
__export(manual_exports2, {
  cancelLabelFunction: () => cancelLabelFunction3,
  createLabelFunction: () => createLabelFunction3,
  getRatesFunction: () => getRatesFunction3,
  trackShipmentFunction: () => trackShipmentFunction3,
  validateAddressFunction: () => validateAddressFunction3
});
async function getRatesFunction3({ provider, order }) {
  await sleep(1e3);
  return [
    {
      id: "rate_usps_1",
      providerId: provider.id,
      service: "Priority Mail",
      carrier: "USPS",
      price: "7.99",
      currency: "USD",
      estimatedDays: 3
    },
    {
      id: "rate_usps_2",
      providerId: provider.id,
      service: "Priority Mail Express",
      carrier: "USPS",
      price: "26.99",
      currency: "USD",
      estimatedDays: 1
    },
    {
      id: "rate_ups_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "UPS",
      price: "8.99",
      currency: "USD",
      estimatedDays: 4
    },
    {
      id: "rate_ups_2",
      providerId: provider.id,
      service: "2nd Day Air",
      carrier: "UPS",
      price: "19.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_fedex_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "FedEx",
      price: "9.99",
      currency: "USD",
      estimatedDays: 4
    },
    {
      id: "rate_fedex_2",
      providerId: provider.id,
      service: "2Day",
      carrier: "FedEx",
      price: "21.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_dhl_1",
      providerId: provider.id,
      service: "Express Worldwide",
      carrier: "DHL",
      price: "29.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_dhl_2",
      providerId: provider.id,
      service: "Express Economy",
      carrier: "DHL",
      price: "18.99",
      currency: "USD",
      estimatedDays: 4
    }
  ];
}
async function createLabelFunction3({ provider, order, rate }) {
  await sleep(1500);
  const carrierPrefix = rate.carrier || "UNKNOWN";
  const trackingFormats = {
    "USPS": "94001234567890123456",
    "UPS": "1Z999AA1234567890",
    "FedEx": "123456789012",
    "DHL": "1234567890"
  };
  const baseTrackingUrls = {
    "USPS": "https://tools.usps.com/go/TrackConfirmAction?tLabels=",
    "UPS": "https://www.ups.com/track?tracknum=",
    "FedEx": "https://www.fedex.com/fedextrack/?trknbr=",
    "DHL": "https://www.dhl.com/en/express/tracking.html?AWB="
  };
  const trackingNumber = trackingFormats[rate.carrier] || carrierPrefix + Math.random().toString(36).substring(2, 10).toUpperCase();
  const trackingUrl2 = baseTrackingUrls[rate.carrier] ? baseTrackingUrls[rate.carrier] + trackingNumber : "https://example.com/track";
  return {
    status: "SUCCESS",
    data: {
      rate_id: rate.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    rate,
    trackingNumber,
    trackingUrl: trackingUrl2,
    labelUrl: `https://api.example.com/shipping/labels/${rate.carrier.toLowerCase()}/${trackingNumber}.pdf`
  };
}
async function validateAddressFunction3({ provider, address }) {
  await sleep(800);
  return {
    isValid: true,
    suggestedAddress: null,
    errors: []
  };
}
async function trackShipmentFunction3({ provider, trackingNumber }) {
  await sleep(700);
  const carrierFromTracking = trackingNumber.startsWith("94") ? "USPS" : trackingNumber.startsWith("1Z") ? "UPS" : trackingNumber.length === 12 ? "FedEx" : "DHL";
  const locations = {
    "USPS": ["USPS Facility", "Local Post Office", "Regional Distribution Center"],
    "UPS": ["UPS Hub", "Local UPS Facility", "UPS Distribution Center"],
    "FedEx": ["FedEx Hub", "Local FedEx Station", "FedEx Sort Facility"],
    "DHL": ["DHL Gateway", "Local DHL Facility", "DHL Service Center"]
  };
  const carrierLocations = locations[carrierFromTracking];
  return {
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString(),
    trackingUrl: `https://example.com/track/${carrierFromTracking.toLowerCase()}/${trackingNumber}`,
    events: [
      {
        status: "in_transit",
        location: carrierLocations[0],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString(),
        message: "Package is in transit"
      },
      {
        status: "picked_up",
        location: carrierLocations[1],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
        message: "Package has been picked up"
      },
      {
        status: "label_created",
        location: carrierLocations[2],
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1e3).toISOString(),
        message: "Shipping label created"
      }
    ]
  };
}
async function cancelLabelFunction3({ provider, labelId }) {
  await sleep(500);
  return {
    success: true,
    error: null
  };
}
var sleep;
var init_manual2 = __esm({
  "features/integrations/shipping/manual.ts"() {
    "use strict";
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  }
});

// features/integrations/shipping/index.ts
var shipping_exports = {};
__export(shipping_exports, {
  shippingProviderAdapters: () => shippingProviderAdapters
});
var shippingProviderAdapters;
var init_shipping = __esm({
  "features/integrations/shipping/index.ts"() {
    "use strict";
    shippingProviderAdapters = {
      shippo: () => Promise.resolve().then(() => (init_shippo(), shippo_exports)),
      shipengine: () => Promise.resolve().then(() => (init_shipengine(), shipengine_exports)),
      manual: () => Promise.resolve().then(() => (init_manual2(), manual_exports2))
    };
  }
});

// features/integrations/shipping/types.ts
var types_exports = {};
var init_types = __esm({
  "features/integrations/shipping/types.ts"() {
    "use strict";
  }
});

// features/keystone/utils/currencyConversion.ts
var currencyConversion_exports = {};
__export(currencyConversion_exports, {
  convertCurrency: () => convertCurrency,
  default: () => currencyConversion_default,
  formatCurrencyAmount: () => formatCurrencyAmount2,
  getCurrentExchangeRates: () => getCurrentExchangeRates,
  getSupportedCurrencies: () => getSupportedCurrencies,
  isConversionSupported: () => isConversionSupported,
  updateExchangeRates: () => updateExchangeRates
});
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  try {
    const rate = getConversionRate(from, to);
    if (!rate) {
      console.warn(`No conversion rate found for ${from} to ${to}, defaulting to 1:1`);
      return amount;
    }
    const convertedAmount = Math.round(amount * rate);
    console.log(`Currency conversion: ${amount} ${from} = ${convertedAmount} ${to} (rate: ${rate})`);
    return convertedAmount;
  } catch (error) {
    console.error(`Error converting currency from ${from} to ${to}:`, error);
    return amount;
  }
}
function getConversionRate(fromCurrency, toCurrency) {
  const rates = STATIC_EXCHANGE_RATES[fromCurrency];
  if (!rates) {
    return null;
  }
  return rates[toCurrency] || null;
}
function getSupportedCurrencies() {
  return Object.keys(STATIC_EXCHANGE_RATES);
}
function isConversionSupported(fromCurrency, toCurrency) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  return Boolean(STATIC_EXCHANGE_RATES[from]?.[to]);
}
function updateExchangeRates(rates) {
  Object.assign(STATIC_EXCHANGE_RATES, rates);
}
function getCurrentExchangeRates() {
  return { ...STATIC_EXCHANGE_RATES };
}
function formatCurrencyAmount2(amount, currencyCode) {
  const currency = currencyCode.toUpperCase();
  const noDivisionCurrencies = ["JPY", "KRW", "VND"];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount / divisor);
}
var STATIC_EXCHANGE_RATES, currencyConversion_default;
var init_currencyConversion = __esm({
  "features/keystone/utils/currencyConversion.ts"() {
    "use strict";
    STATIC_EXCHANGE_RATES = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 110,
        USD: 1
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        CAD: 1.59,
        AUD: 1.79,
        JPY: 129.5,
        EUR: 1
      },
      GBP: {
        USD: 1.37,
        EUR: 1.16,
        CAD: 1.85,
        AUD: 2.08,
        JPY: 150.6,
        GBP: 1
      }
      // Add more currencies as needed
    };
    currencyConversion_default = convertCurrency;
  }
});

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default2
});
module.exports = __toCommonJS(keystone_exports);

// features/keystone/index.ts
var import_auth = require("@keystone-6/auth");
var import_core94 = require("@keystone-6/core");
init_fields();
var import_config = require("dotenv/config");

// features/keystone/mutations/index.ts
var import_schema = require("@graphql-tools/schema");

// features/keystone/mutations/redirectToInit.ts
async function redirectToInit(root, _args, context) {
  const userCount = await context.sudo().query.User.count({});
  if (userCount === 0) {
    return true;
  }
  return false;
}
var redirectToInit_default = redirectToInit;

// features/keystone/mutations/activeCart.ts
init_cart_access();

// features/regulated-commerce/core/decision-engine.ts
var import_node_crypto2 = __toESM(require("node:crypto"));
var time = (value) => value ? new Date(value).getTime() : null;
function isCurrentEvidence(evidence, acceptedStatuses, now = /* @__PURE__ */ new Date()) {
  if (!evidence || !acceptedStatuses.includes(evidence.status)) return false;
  const effectiveAt = time(evidence.effectiveAt);
  const expiresAt = time(evidence.expiresAt);
  return effectiveAt !== null && Number.isFinite(effectiveAt) && effectiveAt <= now.getTime() && expiresAt !== null && Number.isFinite(expiresAt) && expiresAt > now.getTime() && expiresAt > effectiveAt;
}
function stable(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new Error("Invalid evidence timestamp");
    return value.toISOString();
  }
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, stable(entry)])
    );
  }
  return value;
}
function evidenceDigest(value) {
  return import_node_crypto2.default.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}
var SUPPORTED_RULE_TYPES = /* @__PURE__ */ new Set([
  "minimum_age",
  "category_prohibition",
  "flavor_prohibition",
  "directory_required",
  "license_required",
  "quantity_limit",
  "adult_signature_required",
  "package_marking",
  "marketing_restriction"
]);
function isSupportedRule(rule) {
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) return false;
  const type = rule.type;
  return typeof type === "string" && SUPPORTED_RULE_TYPES.has(type);
}
function evaluateRules(input, rules4, reasons, ruleIds) {
  const categories2 = new Set(input.products.map((product) => product.category));
  const flavors = new Set(input.products.map((product) => product.flavor?.toLowerCase()).filter(Boolean));
  for (const rule of rules4) {
    if (!isSupportedRule(rule)) {
      reasons.add("POLICY_REQUIREMENT_NOT_IMPLEMENTED");
      const id2 = rule?.id;
      if (typeof id2 === "string") ruleIds.add(id2);
      continue;
    }
    if (rule.type === "category_prohibition" && rule.categories.some((category) => categories2.has(category))) {
      reasons.add("CATEGORY_PROHIBITED");
      ruleIds.add(rule.id);
    }
    if (rule.type === "flavor_prohibition" && rule.flavors.some((flavor) => flavors.has(flavor.toLowerCase()))) {
      reasons.add("FLAVOR_PROHIBITED");
      ruleIds.add(rule.id);
    }
    if (rule.type === "quantity_limit") {
      const quantity = input.products.filter((product) => product.category === rule.category).reduce((sum, product) => sum + product.quantity * product.packageUnits, 0);
      if (!Number.isSafeInteger(quantity) || quantity > rule.maxUnits) {
        reasons.add("QUANTITY_LIMIT_EXCEEDED");
        ruleIds.add(rule.id);
      }
    }
    if (rule.type === "directory_required") {
      if (input.products.some((product) => product.destinationAuthorization?.authority !== rule.authority || !isCurrentEvidence(product.destinationAuthorization, ["authorized"], input.now))) {
        reasons.add("DESTINATION_AUTHORIZATION_REQUIRED");
        ruleIds.add(rule.id);
      }
    }
    if (rule.type === "marketing_restriction" || rule.type === "adult_signature_required") {
      reasons.add("POLICY_REQUIREMENT_NOT_IMPLEMENTED");
      ruleIds.add(rule.id);
    }
    if (rule.type === "package_marking" && ["shipping", "payment", "checkout", "fulfillment"].includes(input.purpose)) {
      const supplied = new Set(input.carrierEvidence?.packageMarkings ?? []);
      if (!rule.markings.every((marking) => supplied.has(marking))) {
        reasons.add("REQUIRED_PACKAGE_MARKING_MISSING");
        ruleIds.add(rule.id);
      }
    }
    if (rule.type === "license_required") {
      const currentTypes = new Set(input.licenses.filter((license) => isCurrentEvidence(license, ["active", "conditioned"], input.now)).map((license) => license.licenseType));
      if (!rule.licenseTypes.every((required) => currentTypes.has(required))) {
        reasons.add("MERCHANT_LICENSE_REQUIRED");
        ruleIds.add(rule.id);
      }
    }
  }
}
function evaluateRegulatedCommerce(input) {
  const now = input.now ?? /* @__PURE__ */ new Date();
  const reasons = /* @__PURE__ */ new Set();
  const ruleIds = /* @__PURE__ */ new Set();
  if (!input.merchant || !isCurrentEvidence(input.merchant, ["active"], now)) reasons.add("MERCHANT_NOT_ACTIVE");
  if (input.merchant?.killSwitch) reasons.add("MERCHANT_KILL_SWITCH_ACTIVE");
  if (!input.merchant?.pactRegistered) reasons.add("PACT_REGISTRATION_NOT_RECORDED");
  if (!input.jurisdiction) reasons.add("DESTINATION_JURISDICTION_UNRESOLVED");
  if (input.jurisdiction && !input.merchant?.launchJurisdictionCodes?.includes(input.jurisdiction.code)) {
    reasons.add("DESTINATION_NOT_IN_MERCHANT_LAUNCH_SCOPE");
  }
  if (input.genericTaxRate !== 0) reasons.add("GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART");
  if (!input.ruleSet || !input.ruleSet.approvedAt || !isCurrentEvidence(input.ruleSet, ["active"], now)) {
    reasons.add("ACTIVE_POLICY_REQUIRED");
  }
  for (const product of input.products) {
    if (!input.merchant?.enabledCategories?.includes(product.category)) {
      reasons.add("CATEGORY_NOT_ENABLED_FOR_MERCHANT");
    }
    if (product.marketingReviewStatus !== "approved") reasons.add("MARKETING_REVIEW_REQUIRED");
    if (!isCurrentEvidence({
      status: product.classificationStatus,
      effectiveAt: product.classificationEffectiveAt,
      expiresAt: product.classificationExpiresAt
    }, ["approved"], now)) reasons.add("PRODUCT_CLASSIFICATION_REQUIRED");
    if (!isCurrentEvidence(product.federalAuthorization, ["authorized"], now)) reasons.add("FEDERAL_AUTHORIZATION_REQUIRED");
    if (!Number.isSafeInteger(product.quantity) || product.quantity <= 0 || !Number.isSafeInteger(product.packageUnits) || product.packageUnits <= 0) reasons.add("INVALID_REGULATED_QUANTITY");
  }
  const rules4 = input.ruleSet?.rules ?? [];
  evaluateRules({ ...input, now }, rules4, reasons, ruleIds);
  if (["payment", "checkout", "fulfillment"].includes(input.purpose)) {
    const minimumAge = rules4.filter((rule) => isSupportedRule(rule) && rule.type === "minimum_age").reduce((minimum, rule) => Math.max(minimum, rule.value), 21);
    if (!input.ageEvidence || !isCurrentEvidence(input.ageEvidence, ["passed"], now) || input.ageEvidence.result !== "passed" || input.ageEvidence.age < minimumAge || input.ageEvidence.addressMatch !== "matched") reasons.add("CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED");
    const acceptedTaxStatuses = ["committed"];
    if (!input.taxEvidence || !isCurrentEvidence(input.taxEvidence, acceptedTaxStatuses, now)) {
      reasons.add(input.purpose === "payment" ? "CURRENT_TAX_EVIDENCE_REQUIRED" : "COMMITTED_TAX_EVIDENCE_REQUIRED");
    }
    if (!input.paymentApproval || !isCurrentEvidence(input.paymentApproval, ["active"], now)) {
      reasons.add("PAYMENT_PROVIDER_APPROVAL_REQUIRED");
    }
  }
  if (["shipping", "payment", "checkout", "fulfillment"].includes(input.purpose)) {
    if (!input.carrierEvidence || !isCurrentEvidence(input.carrierEvidence, ["allow"], now) || input.carrierEvidence.result !== "allow" || !input.carrierEvidence.adultSignature) {
      reasons.add("APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED");
    }
  }
  return {
    result: reasons.size ? "deny" : "allow",
    reasonCodes: [...reasons].sort(),
    ruleIds: [...ruleIds].sort(),
    policyVersion: input.ruleSet?.version ?? null,
    policyHash: input.ruleSet?.policyHash ?? null,
    evaluatedAt: now.toISOString()
  };
}

// features/regulated-commerce/core/decision-types.ts
var REGULATED_CATEGORIES = [
  "ends_device",
  "e_liquid",
  "component",
  "accessory",
  "tobacco_derived_nicotine",
  "synthetic_nicotine"
];

// features/regulated-commerce/core/policy-validation.ts
var categories = new Set(REGULATED_CATEGORIES);
var nonEmptyStrings = (value) => Array.isArray(value) && value.length > 0 && value.every((entry) => typeof entry === "string" && entry.trim());
function validateRules(value) {
  if (!Array.isArray(value) || value.length === 0) return { valid: false, errors: ["At least one rule is required"], rules: [] };
  const errors = [];
  const ids = /* @__PURE__ */ new Set();
  value.forEach((candidate, index) => {
    const rule = candidate;
    const prefix = `Rule ${index + 1}`;
    if (!rule || typeof rule !== "object" || typeof rule.id !== "string" || !rule.id.trim()) {
      errors.push(`${prefix} requires an ID`);
      return;
    }
    if (ids.has(rule.id)) errors.push(`${prefix} has a duplicate ID`);
    ids.add(rule.id);
    switch (rule.type) {
      case "minimum_age":
        if (!Number.isSafeInteger(rule.value) || rule.value < 18 || rule.value > 120) errors.push(`${prefix} has an invalid minimum age`);
        break;
      case "category_prohibition":
        if (!nonEmptyStrings(rule.categories) || !rule.categories.every((entry) => categories.has(entry))) errors.push(`${prefix} has invalid categories`);
        break;
      case "flavor_prohibition":
        if (!nonEmptyStrings(rule.flavors)) errors.push(`${prefix} requires flavors`);
        break;
      case "directory_required":
        if (typeof rule.authority !== "string" || !rule.authority.trim()) errors.push(`${prefix} requires an authority`);
        break;
      case "license_required":
        if (!nonEmptyStrings(rule.licenseTypes)) errors.push(`${prefix} requires license types`);
        break;
      case "quantity_limit":
        if (!categories.has(rule.category) || !Number.isSafeInteger(rule.maxUnits) || rule.maxUnits <= 0) errors.push(`${prefix} has an invalid quantity limit`);
        break;
      case "adult_signature_required":
        if (!Number.isSafeInteger(rule.minimumAge) || rule.minimumAge < 18 || rule.minimumAge > 120) errors.push(`${prefix} has an invalid signature age`);
        break;
      case "package_marking":
        if (!nonEmptyStrings(rule.markings)) errors.push(`${prefix} requires markings`);
        break;
      case "marketing_restriction":
        if (!nonEmptyStrings(rule.restrictedClaims)) errors.push(`${prefix} requires restricted claims`);
        break;
      default:
        errors.push(`${prefix} has an unsupported type`);
    }
  });
  return { valid: errors.length === 0, errors, rules: errors.length ? [] : value };
}

// features/regulated-commerce/core/release-gate.ts
async function releaseBlockers(context) {
  const profiles = await context.sudo().query.RegulatedMerchantProfile.findMany({
    where: { status: { equals: "active" } },
    query: "id killSwitch launchJurisdictionsCount"
  });
  if (!profiles.length) return ["ACTIVE_MERCHANT_PROFILE_REQUIRED"];
  const live = profiles.filter((profile) => !profile.killSwitch);
  if (!live.length) return ["KILL_SWITCH_ENABLED"];
  if (!live.some((profile) => (profile.launchJurisdictionsCount ?? 0) > 0)) return ["LAUNCH_JURISDICTION_REQUIRED"];
  return [];
}
async function assertCommerceReleaseEnabled(context) {
  if ((await releaseBlockers(context)).length) {
    throw new Error("Checkout isn't available for this store yet.");
  }
}

// features/keystone/regulated/cart-fingerprint.ts
async function cartEvidenceFingerprint(context, cartId) {
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: `id complianceRevision email user { id }
      region { id taxRate currency { id code } }
      shippingAddress { firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      billingAddress { firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      lineItems(orderBy: [{ id: asc }]) { id quantity productVariant {
        id sku updatedAt product { id updatedAt regulatedCommerceRequired }
        regulatedClassification { id updatedAt }
        prices(orderBy: [{ id: asc }]) { id amount compareAmount updatedAt region { id } currency { code } }
      } }
      discounts(orderBy: [{ id: asc }]) { id updatedAt discountRule { id updatedAt } }
      shippingMethods(orderBy: [{ id: asc }]) { id price shippingOption { id updatedAt } }`
  });
  if (!cart) throw new Error("Cart not found");
  return evidenceDigest(cart);
}

// features/keystone/regulated/snapshot-expiry.ts
var COMPLIANCE_SNAPSHOT_MAX_AGE_MS = 5 * 60 * 1e3;
function boundedComplianceSnapshotExpiry(now, evidence) {
  const nowMs = now.getTime();
  if (!Number.isFinite(nowMs)) throw new Error("A valid snapshot issue time is required");
  const expiryTimes = evidence.map((entry) => {
    if (!entry || typeof entry !== "object" || !("expiresAt" in entry)) return nowMs;
    const rawExpiry = entry.expiresAt;
    if (rawExpiry === null || rawExpiry === void 0) return nowMs;
    const expiry = new Date(rawExpiry).getTime();
    return Number.isFinite(expiry) ? expiry : nowMs;
  });
  return new Date(Math.min(nowMs + COMPLIANCE_SNAPSHOT_MAX_AGE_MS, ...expiryTimes));
}

// features/keystone/regulated/enforcement.ts
var FEDERAL_AUTHORIZATION_TYPES = /* @__PURE__ */ new Set(["federal_marketing_order", "preexisting_status"]);
var SHA256 = /^[a-f0-9]{64}$/i;
function hasCurrentRegulatedExemption(product, now = /* @__PURE__ */ new Date()) {
  return product?.regulatedCommerceRequired === false && Boolean(product.regulatedExemptionReference) && SHA256.test(product.regulatedExemptionDigest || "") && Boolean(product.regulatedExemptionReviewedAt) && new Date(product.regulatedExemptionExpiresAt || 0).getTime() > now.getTime();
}
async function assertVariantPublicationEvidence(context, variantId, now = /* @__PURE__ */ new Date()) {
  const variant = await context.sudo().query.ProductVariant.findOne({
    where: { id: variantId },
    query: `id product { regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt } regulatedClassification {
      id status effectiveAt expiresAt marketingReviewStatus marketingEvidenceDigest marketingReviewedAt
      authorizations { authorizationType status effectiveAt expiresAt delistedAt }
    }`
  });
  if (hasCurrentRegulatedExemption(variant?.product, now)) return null;
  const classification = variant?.regulatedClassification;
  if (!classification || classification.status !== "approved" || classification.marketingReviewStatus !== "approved" || !classification.marketingEvidenceDigest || !classification.marketingReviewedAt || !isCurrentEvidence(classification, ["approved"], now)) {
    throw new Error("Regulated product classification must be approved and current before publication or cart use");
  }
  const federal = classification.authorizations?.find((authorization) => FEDERAL_AUTHORIZATION_TYPES.has(authorization.authorizationType) && !authorization.delistedAt && isCurrentEvidence(authorization, ["authorized"], now));
  if (!federal) throw new Error("Current federal product authorization evidence is required");
  return classification;
}
async function assertProductPublicationEvidence(context, productId, now = /* @__PURE__ */ new Date()) {
  const product = await context.sudo().query.Product.findOne({
    where: { id: productId },
    query: "id regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt productVariants { id }"
  });
  if (hasCurrentRegulatedExemption(product, now)) return;
  if (!product.productVariants?.length) throw new Error("A regulated product needs at least one variant before publication");
  for (const variant of product.productVariants) await assertVariantPublicationEvidence(context, variant.id, now);
}
async function invalidateCartCompliance(context, cartId, reason = "CART_CHANGED", withinTransaction = false) {
  const now = /* @__PURE__ */ new Date();
  const invalidate = async (tx) => {
    await tx.cart.update({ where: { id: cartId }, data: { complianceRevision: { increment: 1 } } });
    await tx.ageVerificationAttempt.updateMany({ where: { cartId, orderId: null, result: "passed" }, data: { result: "revoked" } });
    await tx.regulatedTaxQuote.updateMany({ where: { cartId, orderId: null, status: "quoted" }, data: { status: "expired" } });
    await tx.complianceDecision.updateMany({
      where: { cartId, revokedAt: null },
      data: { revokedAt: now }
    });
    await tx.carrierEligibilityDecision.updateMany({
      where: { cartId, result: "allow", expiresAt: { gt: now } },
      data: { result: "revoked" }
    });
    await tx.complianceEvent.create({
      data: {
        eventType: "cart.compliance_invalidated",
        resourceType: "Cart",
        resourceId: cartId,
        reasonCode: reason,
        evidenceDigest: evidenceDigest({ cartId, reason, at: now.toISOString() }),
        data: { reason },
        occurredAt: now
      }
    });
  };
  if (withinTransaction) await invalidate(context.sudo().prisma);
  else await context.sudo().prisma.$transaction(invalidate);
}
function destinationCode(address) {
  const country = String(address?.country?.iso2 || "").trim().toUpperCase();
  const province = String(address?.province || "").trim().toUpperCase();
  return country && province ? `${country}-${province}` : null;
}
async function evaluateCartCompliance({
  context,
  cartId,
  purpose,
  paymentProviderId,
  persist = false
}) {
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id user { id } region { taxRate } shippingAddress { province country { iso2 } }
      lineItems { id quantity productVariant {
        id product { regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt } regulatedClassification {
          id category flavor packageUnits status effectiveAt expiresAt marketingReviewStatus
          authorizations {
            id authority authorizationType status effectiveAt expiresAt delistedAt
            jurisdiction { id code }
          }
        }
      } }
      paymentCollection { paymentSessions { isSelected paymentProvider { id code } } }
      shippingMethods { shippingOption { id name } }
    `
  });
  if (!cart) throw new Error("Cart not found");
  const regulatedLines = cart.lineItems.filter(
    (line) => !hasCurrentRegulatedExemption(line.productVariant?.product)
  );
  if (!regulatedLines.length) return { regulated: false, decision: null };
  const now = /* @__PURE__ */ new Date();
  const cartFingerprint = await cartEvidenceFingerprint(context, cartId);
  const code = destinationCode(cart.shippingAddress);
  const jurisdictions = code ? await sudo.query.Jurisdiction.findMany({
    where: { code: { equals: code }, status: { equals: "active" } },
    take: 2,
    query: "id code"
  }) : [];
  const jurisdiction = jurisdictions.length === 1 ? jurisdictions[0] : null;
  const profiles = await sudo.query.RegulatedMerchantProfile.findMany({
    where: { status: { equals: "active" } },
    take: 2,
    query: `id status pactRegistered killSwitch enabledCategories effectiveAt expiresAt originJurisdiction { code }
      launchJurisdictions { code }
      licenses { licenseType status effectiveAt expiresAt jurisdiction { code } }
      providerApprovals { id purpose providerCode status effectiveAt expiresAt coveredCategories coveredJurisdictionCodes capabilities paymentProvider { id } shippingProvider { id } }
    `
  });
  const merchant = profiles.length === 1 ? profiles[0] : null;
  const ruleSets = jurisdiction ? await sudo.query.RegulatedRuleSet.findMany({
    where: { jurisdiction: { id: { equals: jurisdiction.id } }, status: { equals: "active" } },
    take: 2,
    query: "id packName version policyHash rules status effectiveAt expiresAt approvedAt"
  }) : [];
  const candidateRuleSet = ruleSets.length === 1 ? ruleSets[0] : null;
  const validatedRules = validateRules(candidateRuleSet?.rules);
  const ruleSet = candidateRuleSet && validatedRules.valid ? { ...candidateRuleSet, rules: validatedRules.rules } : null;
  const ageAttempts = await sudo.query.AgeVerificationAttempt.findMany({
    where: { cart: { id: { equals: cartId } }, purpose: { equals: "checkout" } },
    orderBy: [{ issuedAt: "desc" }],
    take: 1,
    query: "id cartFingerprint result addressMatch verifiedAge issuedAt expiresAt evidenceDigest"
  });
  const taxQuotes = await sudo.query.RegulatedTaxQuote.findMany({
    where: { cart: { id: { equals: cartId } } },
    orderBy: [{ issuedAt: "desc" }],
    take: 1,
    query: "id cartFingerprint status issuedAt expiresAt evidenceDigest jurisdiction { code }"
  });
  const carrierDecisions = await sudo.query.CarrierEligibilityDecision.findMany({
    where: { cart: { id: { equals: cartId } } },
    orderBy: [{ issuedAt: "desc" }],
    take: 1,
    query: "id cartFingerprint result adultSignature packageMarkings issuedAt expiresAt evidenceDigest originJurisdictionCode destinationJurisdictionCode shippingOption { id } providerApproval { status effectiveAt expiresAt }"
  });
  const categories2 = regulatedLines.map(
    (line) => line.productVariant?.regulatedClassification?.category ?? "ends_device"
  );
  const effectivePaymentProviderId = paymentProviderId || cart.paymentCollection?.paymentSessions?.find((session) => session.isSelected)?.paymentProvider?.id;
  const paymentApproval = merchant?.providerApprovals?.find((approval) => approval.purpose === "payment" && approval.paymentProvider?.id === effectivePaymentProviderId && approval.coveredJurisdictionCodes?.includes(code) && categories2.every((category) => approval.coveredCategories?.includes(category)));
  const carrierEvidence = carrierDecisions[0];
  const selectedShippingOption = cart.shippingMethods?.[0]?.shippingOption?.id;
  const carrierMatchesSelection = Boolean(
    carrierEvidence?.shippingOption?.id && carrierEvidence.cartFingerprint === cartFingerprint && isCurrentEvidence(carrierEvidence.providerApproval, ["active"], now) && carrierEvidence.shippingOption.id === selectedShippingOption && carrierEvidence.destinationJurisdictionCode === code && carrierEvidence.originJurisdictionCode === merchant?.originJurisdiction?.code
  );
  const taxEvidence = taxQuotes[0]?.jurisdiction?.code === code && taxQuotes[0]?.cartFingerprint === cartFingerprint ? { ...taxQuotes[0], effectiveAt: taxQuotes[0].issuedAt } : null;
  const ageEvidence = ageAttempts[0]?.cartFingerprint === cartFingerprint ? ageAttempts[0] : null;
  const products = regulatedLines.map((line) => {
    const classification = line.productVariant?.regulatedClassification;
    const federal = classification?.authorizations?.find((authorization) => FEDERAL_AUTHORIZATION_TYPES.has(authorization.authorizationType) && !authorization.delistedAt) ?? null;
    const destination = classification?.authorizations?.find((authorization) => authorization.jurisdiction?.code === code && !authorization.delistedAt) ?? null;
    return {
      variantId: line.productVariant?.id ?? "missing",
      category: classification?.category ?? "ends_device",
      flavor: classification?.flavor ?? null,
      quantity: line.quantity,
      packageUnits: classification?.packageUnits ?? 0,
      classificationStatus: classification?.status ?? "missing",
      classificationEffectiveAt: classification?.effectiveAt ?? null,
      classificationExpiresAt: classification?.expiresAt ?? null,
      marketingReviewStatus: classification?.marketingReviewStatus ?? "missing",
      federalAuthorization: federal,
      destinationAuthorization: destination
    };
  });
  const scopedLicenses = (merchant?.licenses || []).filter((license) => !code || license.jurisdiction?.code === code);
  const decision = evaluateRegulatedCommerce({
    purpose,
    now,
    merchant: merchant ? {
      ...merchant,
      launchJurisdictionCodes: merchant.launchJurisdictions?.map((entry) => entry.code) ?? []
    } : null,
    jurisdiction,
    genericTaxRate: cart.region?.taxRate ?? null,
    ruleSet,
    licenses: scopedLicenses,
    products,
    ageEvidence: ageEvidence ? {
      ...ageEvidence,
      status: ageEvidence.result,
      age: ageEvidence.verifiedAge,
      effectiveAt: ageEvidence.issuedAt
    } : null,
    taxEvidence,
    paymentApproval,
    carrierEvidence: carrierMatchesSelection ? { ...carrierEvidence, status: carrierEvidence.result, effectiveAt: carrierEvidence.issuedAt } : null
  });
  const releaseReasons = purpose === "fulfillment" ? [] : await releaseBlockers(context);
  if (releaseReasons.length) {
    decision.result = "deny";
    decision.reasonCodes = [.../* @__PURE__ */ new Set([...decision.reasonCodes, ...releaseReasons])].sort();
  }
  const acceptanceReferences = {
    cartFingerprint,
    merchantProfileId: merchant?.id ?? null,
    jurisdictionId: jurisdiction?.id ?? null,
    jurisdictionCode: code,
    ruleSetId: ruleSet?.id ?? null,
    policyPack: ruleSet?.packName ?? "unconfigured",
    policyVersion: decision.policyVersion ?? "unconfigured",
    policyHash: decision.policyHash ?? "unconfigured",
    ageAttemptId: ageEvidence?.id ?? null,
    taxQuoteId: taxEvidence?.id ?? null,
    paymentApprovalId: paymentApproval?.id ?? null,
    carrierDecisionId: carrierEvidence?.id ?? null,
    evidenceDigests: {
      age: ageEvidence?.evidenceDigest ?? null,
      tax: taxEvidence?.evidenceDigest ?? null,
      carrier: carrierEvidence?.evidenceDigest ?? null
    }
  };
  const requiredLicenseTypes = new Set((ruleSet?.rules ?? []).flatMap(
    (rule) => rule.type === "license_required" ? rule.licenseTypes : []
  ));
  const requiredLicenseEvidence = scopedLicenses.filter(
    (license) => requiredLicenseTypes.has(license.licenseType) && isCurrentEvidence(license, ["active", "conditioned"], now)
  );
  const requiresDirectoryEvidence = (ruleSet?.rules ?? []).some((rule) => rule.type === "directory_required");
  const snapshotEvidence = [
    merchant,
    ruleSet,
    ageEvidence,
    taxEvidence,
    paymentApproval,
    carrierEvidence,
    carrierEvidence?.providerApproval,
    ...products.map((product) => ({ expiresAt: product.classificationExpiresAt })),
    ...products.map((product) => product.federalAuthorization),
    ...requiresDirectoryEvidence ? products.map((product) => product.destinationAuthorization) : [],
    ...requiredLicenseEvidence
  ];
  let decisionId = null;
  if (persist) {
    const snapshot = {
      cartId,
      cartFingerprint,
      purpose,
      merchantProfileId: acceptanceReferences.merchantProfileId,
      jurisdictionCode: code,
      products,
      ruleSetId: acceptanceReferences.ruleSetId,
      ruleIds: decision.ruleIds,
      policy: ruleSet,
      merchant,
      evidenceDigests: { age: ageEvidence?.evidenceDigest, tax: taxEvidence?.evidenceDigest, carrier: carrierEvidence?.evidenceDigest },
      ageAttemptId: acceptanceReferences.ageAttemptId,
      taxQuoteId: acceptanceReferences.taxQuoteId,
      paymentApprovalId: acceptanceReferences.paymentApprovalId,
      carrierDecisionId: acceptanceReferences.carrierDecisionId,
      result: decision.result,
      reasonCodes: decision.reasonCodes,
      evaluatedAt: decision.evaluatedAt
    };
    const idempotencyKey = `compliance:${purpose}:${cartId}:${evidenceDigest(snapshot)}`;
    const stored = await sudo.prisma.complianceDecision.upsert({
      where: { idempotencyKey },
      create: {
        cartId,
        merchantProfileId: merchant?.id ?? null,
        jurisdictionId: jurisdiction?.id ?? null,
        purpose,
        result: decision.result,
        policyPack: ruleSet?.packName ?? "unconfigured",
        policyVersion: decision.policyVersion ?? "unconfigured",
        policyHash: decision.policyHash ?? "unconfigured",
        ruleIds: decision.ruleIds,
        reasonCodes: decision.reasonCodes,
        evidenceReferences: snapshot,
        snapshot,
        cartFingerprint,
        snapshotDigest: evidenceDigest(snapshot),
        issuedAt: now,
        expiresAt: boundedComplianceSnapshotExpiry(now, snapshotEvidence),
        idempotencyKey
      },
      update: {}
    });
    decisionId = stored.id;
  }
  return {
    regulated: true,
    decision: { ...decision, id: decisionId },
    carrierScope: {
      cartFingerprint,
      destinationJurisdictionCode: code,
      originJurisdictionCode: merchant?.originJurisdiction?.code ?? null
    },
    acceptanceReferences
  };
}
async function currentRegulatedTaxQuote(context, cartId, acceptedStatuses) {
  const quotes = await context.sudo().query.RegulatedTaxQuote.findMany({
    where: { cart: { id: { equals: cartId } } },
    orderBy: [{ issuedAt: "desc" }],
    take: 1,
    query: "id cartFingerprint status salesTaxAmount exciseTaxAmount localFeeAmount expiresAt"
  });
  const quote = quotes[0];
  if (!quote || !acceptedStatuses.includes(quote.status) || new Date(quote.expiresAt).getTime() <= Date.now() || quote.cartFingerprint !== await cartEvidenceFingerprint(context, cartId)) return null;
  return quote;
}
async function regulatedTaxAmountForCart(context, cartId, acceptedStatuses) {
  const quote = await currentRegulatedTaxQuote(context, cartId, acceptedStatuses);
  if (!quote) throw new Error("Current regulated tax amount is unavailable");
  const amounts = [quote.salesTaxAmount, quote.exciseTaxAmount, quote.localFeeAmount];
  if (!amounts.every((amount) => Number.isSafeInteger(amount) && Number(amount) >= 0)) {
    throw new Error("Regulated tax amount is invalid");
  }
  return amounts.reduce((sum, amount) => sum + Number(amount), 0);
}
function matchesOrderBoundCarrierLabelEvidence(evidence, expected) {
  const now = expected.now ?? /* @__PURE__ */ new Date();
  const rateId = evidence?.rateId?.trim();
  const packageDigest = evidence?.packageDigest ?? "";
  const providerApproval = evidence?.providerApproval;
  return Boolean(
    evidence && expected.orderId && expected.shippingProviderId && expected.cartFingerprint && evidence.order?.id === expected.orderId && evidence.cartFingerprint === expected.cartFingerprint && rateId && SHA256.test(packageDigest) && (expected.rateId === void 0 || expected.rateId.trim() && rateId === expected.rateId) && (expected.packageDigest === void 0 || SHA256.test(expected.packageDigest) && packageDigest === expected.packageDigest) && evidence.carrierCode?.trim() && evidence.serviceCode?.trim() && evidence.adultSignature === true && isCurrentEvidence({ status: evidence.result ?? "", effectiveAt: evidence.issuedAt, expiresAt: evidence.expiresAt }, ["allow"], now) && providerApproval && isCurrentEvidence(providerApproval, ["active"], now) && providerApproval.shippingProvider?.id === expected.shippingProviderId
  );
}
function selectExactApprovedCarrierRate(rates, approvedRateId) {
  if (!approvedRateId?.trim() || !Array.isArray(rates)) return [];
  const matches = rates.filter(
    (rate) => Boolean(rate && typeof rate === "object" && !Array.isArray(rate) && typeof rate.id === "string" && rate.id === approvedRateId)
  );
  return matches.length === 1 ? matches : [];
}
async function requireApprovedCarrierProvider(context, cartId, orderId, shippingProviderId, contract) {
  const compliance = await requireAllowedCartCompliance({ context, cartId, purpose: "fulfillment" });
  if (!compliance.regulated) return { ...compliance, carrierEvidence: null };
  const now = /* @__PURE__ */ new Date();
  const currentFingerprint = await cartEvidenceFingerprint(context, cartId);
  const decisions = await context.sudo().query.CarrierEligibilityDecision.findMany({
    where: {
      order: { id: { equals: orderId } },
      cart: { id: { equals: cartId } },
      result: { equals: "allow" },
      adultSignature: { equals: true },
      expiresAt: { gt: now.toISOString() },
      cartFingerprint: { equals: currentFingerprint },
      ...contract ? { rateId: { equals: contract.rateId }, packageDigest: { equals: contract.packageDigest } } : {},
      providerApproval: { status: { equals: "active" }, effectiveAt: { lte: now.toISOString() }, expiresAt: { gt: now.toISOString() }, shippingProvider: { id: { equals: shippingProviderId } } }
    },
    take: 2,
    query: "order { id } cartFingerprint rateId packageDigest carrierCode serviceCode result adultSignature issuedAt expiresAt providerApproval { status effectiveAt expiresAt shippingProvider { id } }"
  });
  if (decisions.length !== 1 || !matchesOrderBoundCarrierLabelEvidence(decisions[0], {
    orderId,
    shippingProviderId,
    cartFingerprint: currentFingerprint,
    now,
    ...contract
  })) throw new Error("Selected label provider lacks exact order-bound carrier service/rate/package approval evidence");
  return { ...compliance, carrierEvidence: decisions[0] };
}
async function requireAllowedCartCompliance(args) {
  if (args.purpose !== "fulfillment") await assertCommerceReleaseEnabled(args.context);
  const result = await evaluateCartCompliance({ ...args, persist: true });
  if (result.regulated && result.decision?.result !== "allow") {
    throw new Error(`Regulated commerce denied: ${result.decision?.reasonCodes.join(", ") || "UNKNOWN"}`);
  }
  return result;
}

// features/keystone/mutations/activeCart.ts
async function activeCart(root, { cartId }, context) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      type
      checkoutStep
      region {
        id
        name
        countries {
          id
          name
          iso2
          region {
            id
          }
        }
        currency {
          code
          noDivisionCurrency
        }
        taxRate
      }
      subtotal
      total
      rawTotal
      discount
      giftCardTotal
      tax
      shipping
      lineItems(orderBy:  {
         createdAt: asc
      }) {
        id
        quantity
        title
        thumbnail
        description
        unitPrice
        originalPrice
        total
        percentageOff
        productVariant {
          id
          title
          product {
            id
            title
            thumbnail
            handle
          }
        }
      }
      giftCards {
        id
        code
        balance
      }
      discountsById
      discounts {
        id
        code
        isDynamic
        isDisabled
        discountRule {
          id
          type
          value
          allocation
        }
      }
      shippingMethods {
        id
        price
        shippingOption {
          id
          name
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
      addresses {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
    `
  });
  if (!cart) return null;
  const compliance = await evaluateCartCompliance({ context, cartId, purpose: "cart" });
  if (compliance.regulated) {
    const quote = await currentRegulatedTaxQuote(context, cartId, ["quoted", "committed"]);
    if (quote) {
      const regulatedTaxAmount = quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount;
      const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
      const currency = String(cart.region?.currency?.code || "USD").toUpperCase();
      const format = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / divisor);
      cart.regulatedTax = format(regulatedTaxAmount);
      cart.rawTotal += regulatedTaxAmount;
      cart.total = format(cart.rawTotal);
    } else {
      cart.regulatedTax = "Calculated at checkout";
    }
    cart.regulatedCompliance = compliance.decision;
  }
  return cart;
}
var activeCart_default = activeCart;

// features/keystone/mutations/updateActiveCart.ts
init_cart_access();

// features/keystone/security/cart-input.ts
function object(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`${label}.${key} is server-owned or unsupported`);
  return value;
}
function id(value) {
  const input = object(value, ["id"], "Record selection");
  if (typeof input.id !== "string" || !input.id.trim() || input.id.length > 200) throw new Error("Record ID is required");
  return { id: input.id };
}
function connection(value) {
  const input = object(value, ["connect"], "Relationship");
  return { connect: id(input.connect) };
}
function cartQuantity(value) {
  if (!Number.isSafeInteger(value) || Number(value) < 1 || Number(value) > 1e6) throw new Error("Quantity must be a positive supported integer");
  return value;
}
function entries(value) {
  if (!Array.isArray(value) || value.length > 100) throw new Error("A cart command accepts at most 100 lines");
  return value;
}
function parseCartUpdate(value) {
  const input = object(value, ["email", "region", "shippingAddress", "billingAddress", "lineItems"], "Cart");
  const data = {};
  if (input.email !== void 0) {
    if (typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("A valid email address is required");
    data.email = input.email.trim().toLowerCase();
  }
  for (const field of ["region", "shippingAddress", "billingAddress"]) if (input[field] !== void 0) data[field] = connection(input[field]);
  if (input.lineItems !== void 0) {
    const lines = object(input.lineItems, ["create", "disconnect"], "Cart lines");
    data.lineItems = {};
    if (lines.create !== void 0) data.lineItems.create = entries(lines.create).map((entry) => {
      const line = object(entry, ["productVariant", "quantity"], "New line");
      return { productVariant: connection(line.productVariant), quantity: cartQuantity(line.quantity) };
    });
    if (lines.disconnect !== void 0) data.lineItems.disconnect = entries(lines.disconnect).map(id);
    const created = data.lineItems.create || [];
    const removed = (data.lineItems.disconnect || []).map((entry) => entry.id);
    if (!created.length && !removed.length) throw new Error("Cart lines must include a line to create or disconnect");
    if (new Set(removed).size !== removed.length) throw new Error("A line may be changed only once per command");
  }
  if (!Object.keys(data).length) throw new Error("A cart update must include a supported change");
  return data;
}

// features/keystone/security/shipping-eligibility.ts
function shippingDestinationWithinRegion(regionCountryCodes, destinationCountryCode) {
  if (!Array.isArray(regionCountryCodes) || typeof destinationCountryCode !== "string") return false;
  const destination = destinationCountryCode.trim().toUpperCase();
  if (!destination) return false;
  return regionCountryCodes.some(
    (country) => typeof country === "string" && country.trim().toUpperCase() === destination
  );
}
function shippingOptionCharge(priceType, amount) {
  if (priceType === "free") return 0;
  if (priceType !== "flat_rate" || !Number.isSafeInteger(amount) || Number(amount) < 0) return null;
  return Number(amount);
}
function shippingSubtotalRequirementsMet(requirements, subtotal) {
  if (!Array.isArray(requirements) || !Number.isSafeInteger(subtotal) || Number(subtotal) < 0) return false;
  for (const requirement of requirements) {
    if (!requirement || !Number.isSafeInteger(requirement.amount) || Number(requirement.amount) < 0) return false;
    if (requirement.type === "min_subtotal") {
      if (Number(subtotal) < Number(requirement.amount)) return false;
    } else if (requirement.type === "max_subtotal") {
      if (Number(subtotal) > Number(requirement.amount)) return false;
    } else {
      return false;
    }
  }
  return true;
}
async function calculateCartSubtotalMinorUnits(sudoContext, cart) {
  const regionId = cart?.region?.id;
  const currencyCode = cart?.region?.currency?.code;
  if (!regionId || typeof currencyCode !== "string" || !currencyCode) {
    throw new Error("Cart region and currency are required");
  }
  let subtotal = 0;
  for (const line of cart.lineItems || []) {
    const quantity = line?.quantity;
    const variantId = line?.productVariant?.id;
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || typeof variantId !== "string" || !variantId) {
      throw new Error("Cart subtotal is unavailable");
    }
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: variantId } },
        region: { id: { equals: regionId } },
        currency: { code: { equals: currencyCode } }
      },
      query: "calculatedPrice { calculatedAmount }"
    });
    const amount = prices[0]?.calculatedPrice?.calculatedAmount;
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Cart subtotal is unavailable");
    subtotal += amount * quantity;
    if (!Number.isSafeInteger(subtotal)) throw new Error("Cart subtotal is unavailable");
  }
  return subtotal;
}
function matchesCurrentCartCarrierDecision(decision, expected) {
  const now = expected.now ?? /* @__PURE__ */ new Date();
  const approval = decision?.providerApproval;
  return Boolean(
    decision && /^[a-f0-9]{64}$/i.test(expected.cartFingerprint) && expected.shippingOptionId && expected.destinationJurisdictionCode && expected.originJurisdictionCode && decision.cartFingerprint === expected.cartFingerprint && decision.shippingOption?.id === expected.shippingOptionId && decision.destinationJurisdictionCode === expected.destinationJurisdictionCode && decision.originJurisdictionCode === expected.originJurisdictionCode && decision.result === "allow" && decision.adultSignature === true && typeof decision.rateId === "string" && decision.rateId.trim().length > 0 && typeof decision.packageDigest === "string" && /^[a-f0-9]{64}$/i.test(decision.packageDigest) && typeof decision.carrierCode === "string" && decision.carrierCode.trim().length > 0 && typeof decision.serviceCode === "string" && decision.serviceCode.trim().length > 0 && isCurrentEvidence({ status: String(decision.result), effectiveAt: decision.issuedAt, expiresAt: decision.expiresAt }, ["allow"], now) && approval && isCurrentEvidence({ status: String(approval.status), effectiveAt: approval.effectiveAt, expiresAt: approval.expiresAt }, ["active"], now) && typeof approval.shippingProvider?.id === "string" && approval.shippingProvider.id.length > 0
  );
}

// features/keystone/mutations/updateActiveCart.ts
async function updateActiveCart(_root, { cartId, data: input }, context) {
  const data = parseCartUpdate(input);
  return withCartMutationLock(context, cartId, async (tx) => {
    const sudo = tx.sudo();
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: "id region { id countries { iso2 } } shippingAddress { id country { iso2 } } lineItems { id quantity productVariant { id } }"
    });
    if (!cart) throw new Error("Cart not found");
    if (data.region && cart.lineItems.length) throw new Error("Region cannot change after items are added; start a new cart");
    let targetRegion = cart.region;
    if (data.region) {
      targetRegion = await sudo.query.Region.findOne({
        where: { id: data.region.connect.id },
        query: "id countries { iso2 }"
      });
      if (!targetRegion) throw new Error("Region not found");
    }
    let targetShippingAddress = cart.shippingAddress;
    for (const field of ["shippingAddress", "billingAddress"]) {
      if (!data[field]) continue;
      const address = await assertAddressAccess(tx, data[field].connect.id);
      if (field === "shippingAddress") targetShippingAddress = address;
    }
    if ((data.region || data.shippingAddress) && targetShippingAddress && !shippingDestinationWithinRegion(
      targetRegion?.countries?.map((country) => country.iso2),
      targetShippingAddress.country?.iso2
    )) {
      throw new Error("Shipping address is not available in this region");
    }
    const lines = data.lineItems;
    if (lines) {
      const removed = new Set((lines.disconnect || []).map((entry) => entry.id));
      for (const id2 of removed) if (!cart.lineItems.some((line) => line.id === id2)) throw new Error("Line item not found");
      const creates = /* @__PURE__ */ new Map();
      for (const line of lines.create || []) {
        const id2 = line.productVariant.connect.id;
        creates.set(id2, cartQuantity((creates.get(id2) || 0) + line.quantity));
      }
      lines.create = [];
      for (const [variantId, quantity] of creates) {
        const variant = await sudo.query.ProductVariant.findOne({ where: { id: variantId }, query: "id product { status }" });
        if (variant?.product?.status !== "published") throw new Error("Product variant is not available");
        await assertVariantPublicationEvidence(tx, variantId);
        const existing = cart.lineItems.find((line) => line.productVariant?.id === variantId);
        if (existing) {
          if (removed.has(existing.id)) throw new Error("A line may be changed only once per command");
          await sudo.db.LineItem.updateOne({ where: { id: existing.id }, data: { quantity: cartQuantity(existing.quantity + quantity) } });
        } else lines.create.push({ productVariant: { connect: { id: variantId } }, quantity });
      }
    }
    const updated = await sudo.db.Cart.updateOne({ where: { id: cartId }, data: { ...data, paymentCollection: { disconnect: true } } });
    await invalidateCartCompliance(tx, cartId, "CART_CHANGED", true);
    return updated;
  }, [data.shippingAddress?.connect.id, data.billingAddress?.connect.id].filter(Boolean));
}

// features/keystone/mutations/updateActiveCartLineItem.ts
init_cart_access();
async function updateActiveCartLineItem(_root, { cartId, lineId, quantity: input }, context) {
  const quantity = cartQuantity(input);
  return withCartMutationLock(context, cartId, async (tx) => {
    const sudo = tx.sudo();
    const line = await sudo.query.LineItem.findOne({ where: { id: lineId }, query: "id quantity cart { id } productVariant { id }" });
    if (line?.cart?.id !== cartId || !line.productVariant?.id) throw new Error("Line item not found");
    await assertVariantPublicationEvidence(tx, line.productVariant.id);
    if (line.quantity === quantity) {
      return sudo.db.Cart.findOne({ where: { id: cartId } });
    }
    await sudo.db.LineItem.updateOne({ where: { id: lineId }, data: { quantity } });
    await sudo.db.Cart.updateOne({ where: { id: cartId }, data: { paymentCollection: { disconnect: true } } });
    await invalidateCartCompliance(tx, cartId, "CART_CHANGED", true);
    return sudo.db.Cart.findOne({ where: { id: cartId } });
  });
}

// features/keystone/mutations/updateActiveUser.ts
async function updateActiveUser(_root, { data }, context) {
  const session = context.session;
  if (!session?.itemId) throw new Error("Not authenticated");
  if (session.apiKeyScopes || session.oauthScopes || Object.prototype.hasOwnProperty.call(session, "customerToken")) {
    throw new Error("Interactive account session required");
  }
  const allowed = /* @__PURE__ */ new Set(["email", "name", "phone", "onboardingStatus"]);
  if (!data || typeof data !== "object" || Object.keys(data).some((key) => !allowed.has(key))) throw new Error("Invalid profile update");
  const update = {};
  for (const key of ["email", "name", "phone"]) {
    const value = data[key];
    if (value !== void 0) {
      if (value !== null && typeof value !== "string") throw new Error("Invalid profile update");
      Object.assign(update, { [key]: value });
    }
  }
  if (data.onboardingStatus !== void 0) {
    if (!["not_started", "in_progress", "completed", "dismissed"].includes(data.onboardingStatus || "")) {
      throw new Error("Invalid onboarding update");
    }
    Object.assign(update, { onboardingStatus: data.onboardingStatus });
  }
  return context.sudo().db.User.updateOne({ where: { id: session.itemId }, data: update });
}

// features/keystone/mutations/updateActiveUserPassword.ts
async function updateActiveUserPassword(_root, { oldPassword, newPassword, confirmPassword }, context) {
  const session = context.session;
  if (!session?.itemId) throw new Error("Not authenticated");
  if (session.apiKeyScopes || session.oauthScopes || Object.prototype.hasOwnProperty.call(session, "customerToken")) {
    throw new Error("Interactive account session required");
  }
  if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({ where: { id: session.itemId }, query: "id email" });
  if (!user) throw new Error("Invalid old password");
  const proof = await sudo.graphql.raw({
    query: `mutation VerifyPassword($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        __typename
        ... on UserAuthenticationWithPasswordSuccess { item { id } }
      }
    }`,
    variables: { email: user.email, password: oldPassword }
  });
  if (proof.errors?.length || proof.data?.authenticateUserWithPassword?.__typename !== "UserAuthenticationWithPasswordSuccess" || proof.data.authenticateUserWithPassword.item?.id !== session.itemId) throw new Error("Invalid old password");
  return sudo.db.User.updateOne({ where: { id: session.itemId }, data: { password: newPassword } });
}

// features/keystone/security/address-command.ts
init_commerce_fence();
var EDITABLE = /* @__PURE__ */ new Set(["company", "firstName", "lastName", "address1", "address2", "city", "province", "postalCode", "phone", "isBilling", "metadata", "country", "user"]);
function validateAddressData(data) {
  if (Object.keys(data).some((key) => !EDITABLE.has(key))) throw new Error("Address could not be updated");
  for (const name of ["user", "country"]) {
    const value = data[name];
    if (value === void 0) continue;
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).join() !== "connect") throw new Error("Address could not be updated");
    const connect = value.connect;
    if (!connect || typeof connect !== "object" || Array.isArray(connect) || Object.keys(connect).length !== 1 || !Object.entries(connect).every(([key, id2]) => (key === "id" || name === "country" && key === "iso2") && typeof id2 === "string" && Boolean(id2))) throw new Error("Address could not be updated");
  }
}
async function addressCommand(context, entries2, deleting = false) {
  if (!entries2.length || entries2.length > 100 || entries2.some((entry) => !entry.where?.id) || sortedIds(entries2.map((entry) => entry.where.id)).length !== entries2.length) throw new Error("Address could not be updated");
  for (const entry of entries2) validateAddressData(entry.data);
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId) throw new Error("Not authenticated");
    for (const id2 of sortedIds(entries2.map((entry) => entry.where.id))) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id2} FOR UPDATE`;
    }
    const items = [];
    const referenced = /* @__PURE__ */ new Set();
    for (const entry of entries2) {
      const visible = await tx.query.Address.findOne({ where: entry.where, query: "id" });
      if (!visible) throw new Error("Address not found");
      const owner = entry.data.user?.connect?.id;
      if (owner && owner !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Address could not be updated");
      if (await isAddressReferenced(tx, entry.where.id)) referenced.add(entry.where.id);
    }
    const resultIds = /* @__PURE__ */ new Map();
    for (const entry of [...entries2].sort((a, b) => a.where.id.localeCompare(b.where.id))) {
      const id2 = entry.where.id;
      if (referenced.has(id2)) {
        const current = await tx.prisma.address.findUnique({ where: { id: id2 } });
        if (!current) throw new Error("Address not found");
        if (!deleting) {
          const copy = await tx.db.Address.createOne({
            data: {
              company: current.company,
              firstName: current.firstName,
              lastName: current.lastName,
              address1: current.address1,
              address2: current.address2,
              city: current.city,
              province: current.province,
              postalCode: current.postalCode,
              phone: current.phone,
              isBilling: current.isBilling,
              ...current.metadata !== null ? { metadata: current.metadata } : {},
              ...current.countryId ? { country: { connect: { id: current.countryId } } } : {},
              ...current.userId ? { user: { connect: { id: current.userId } } } : {},
              ...entry.data
            }
          });
          resultIds.set(id2, copy.id.toString());
          items.push(copy);
        } else {
          items.push(current);
        }
        await tx.prisma.address.update({ where: { id: id2 }, data: { userId: null } });
        continue;
      }
      items.push(deleting ? await tx.db.Address.deleteOne({ where: entry.where }) : await tx.db.Address.updateOne(entry));
    }
    return entries2.map((entry) => {
      const id2 = resultIds.get(entry.where.id) ?? entry.where.id;
      return items.find((item) => item.id.toString() === id2);
    });
  });
}
async function isAddressReferenced(context, id2) {
  const address = await context.prisma.address.findUnique({ where: { id: id2 }, select: { cartId: true } });
  const cart = await context.prisma.cart.findFirst({ where: { OR: [{ shippingAddressId: id2 }, { billingAddressId: id2 }] }, select: { id: true } });
  const order = await context.prisma.order.findFirst({ where: { OR: [{ shippingAddressId: id2 }, { billingAddressId: id2 }] }, select: { id: true } });
  return Boolean(address?.cartId || cart || order);
}
async function assertAddressUnreferenced(context, id2) {
  if (!insideCommerceFence(context)) throw new Error("Address could not be updated");
  if (await isAddressReferenced(context, id2)) throw new Error("Address could not be updated");
}
async function createAddresses(context, data) {
  if (!data.length || data.length > 100) throw new Error("Address could not be created");
  data.forEach(validateAddressData);
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId) throw new Error("Not authenticated");
    for (const entry of data) {
      const owner = entry.user?.connect?.id;
      if (owner && owner !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Address could not be created");
      if (owner && !await tx.query.User.findOne({ where: { id: owner }, query: "id" })) throw new Error("Address owner not found");
    }
    const result = [];
    for (const entry of data) result.push(await tx.db.Address.createOne({ data: entry }));
    return result;
  });
}
var controlledAddressResolvers = {
  createAddress: async (_, { data }, context) => (await createAddresses(context, [data]))[0],
  createAddresses: async (_, { data }, context) => createAddresses(context, data),
  updateAddress: async (_, args, context) => (await addressCommand(context, [args]))[0],
  updateAddresses: async (_, args, context) => addressCommand(context, args.data),
  deleteAddress: async (_, args, context) => (await addressCommand(context, [{ ...args, data: {} }], true))[0],
  deleteAddresses: async (_, args, context) => addressCommand(context, args.where.map((where) => ({ where, data: {} })), true)
};

// features/keystone/mutations/updateActiveUserAddress.ts
async function updateActiveUserAddress(_root, args, context) {
  await addressCommand(context, [args]);
  return context.db.User.findOne({ where: { id: context.session?.itemId } });
}

// features/keystone/mutations/createActiveUserAddress.ts
init_commerce_fence();
async function createActiveUserAddress(_root, { data }, context) {
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    const id2 = tx.session?.itemId;
    if (!id2) throw new Error("Not authenticated");
    if (Object.keys(data).some((key) => ["user", "cart", "cartsUsingBilling", "cartsUsingShipping", "ordersUsingBilling", "ordersUsingShipping"].includes(key))) throw new Error("Address could not be created");
    validateAddressData(data);
    const existing = await tx.query.Address.findMany({ where: { user: { id: { equals: id2 } }, isBilling: { equals: true } }, query: "id" });
    if (data.isBilling) {
      for (const addressId of sortedIds(existing.map((address) => address.id))) await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${addressId} FOR UPDATE`;
      for (const address of existing) {
        try {
          await assertAddressUnreferenced(tx, address.id);
        } catch {
          continue;
        }
        await tx.db.Address.updateOne({ where: { id: address.id }, data: { isBilling: false } });
      }
    }
    await tx.sudo().db.Address.createOne({ data: { ...data, user: { connect: { id: id2 } } } });
    return tx.db.User.findOne({ where: { id: id2 } });
  });
}

// features/keystone/mutations/deleteActiveUserAddress.ts
async function deleteActiveUserAddress(_root, args, context) {
  return (await addressCommand(context, [{ ...args, data: {} }], true))[0];
}

// features/keystone/mutations/addDiscountToActiveCart.ts
init_cart_access();

// features/keystone/security/discount-eligibility.ts
function discountRegionEligible(regions, cartRegionId) {
  if (!Array.isArray(regions)) return false;
  if (regions.length === 0) return true;
  return typeof cartRegionId === "string" && cartRegionId.length > 0 && regions.some((region2) => region2?.id === cartRegionId);
}
function discountHasUsageCapacity(usageLimit, usageCount) {
  if (!Number.isSafeInteger(usageCount) || Number(usageCount) < 0) return false;
  if (usageLimit === null) return true;
  return Number.isSafeInteger(usageLimit) && Number(usageLimit) >= 0 && Number(usageCount) < Number(usageLimit);
}

// features/keystone/mutations/addDiscountToActiveCart.ts
async function addDiscountToActiveCart(root, { cartId, code }, context) {
  return withCartMutationLock(context, cartId, async (context2) => {
    await assertCartAccess(context2, cartId);
    const sudoContext = context2.sudo();
    const cart = await sudoContext.query.Cart.findOne({
      where: { id: cartId },
      query: `
      id
      region {
        id
      }
      user {
        id
        customerGroups {
          id
        }
      }
      lineItems {
        id
      }
      discounts {
        id
        code
        stackable
      }
    `
    });
    if (!cart) {
      throw new Error(`Cart not found`);
    }
    if (!cart.lineItems || cart.lineItems.length === 0) {
      throw new Error(`Cannot apply discount to an empty cart`);
    }
    const discount = await sudoContext.query.Discount.findOne({
      where: { code },
      query: `
      id
      code
      isDynamic
      isDisabled
      stackable
      startsAt
      endsAt
      usageLimit
      usageCount
      regions {
        id
      }
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          customerGroups {
            id
          }
        }
      }
    `
    });
    if (!discount) {
      throw new Error(`Invalid discount code: ${code}`);
    }
    const cartDiscounts = cart.discounts || [];
    if (cartDiscounts?.some((d) => d.id === discount.id)) {
      throw new Error(`Discount ${code} is already applied to this cart`);
    }
    if (discount.isDisabled) {
      throw new Error(`Discount ${code} is no longer available`);
    }
    const now = /* @__PURE__ */ new Date();
    if (discount.startsAt && new Date(discount.startsAt) > now) {
      throw new Error(`Discount ${code} is not yet active`);
    }
    if (discount.endsAt && new Date(discount.endsAt) < now) {
      throw new Error(`Discount ${code} has expired`);
    }
    if (!discountHasUsageCapacity(discount.usageLimit, discount.usageCount)) {
      throw new Error(`Discount ${code} has reached its usage limit`);
    }
    if (!discountRegionEligible(discount.regions, cart.region?.id)) {
      throw new Error(`Discount ${code} is not available in your region`);
    }
    if (discount.discountRule?.discountConditions) {
      const customerGroupConditions = discount.discountRule.discountConditions.filter(
        (condition) => condition.type === "customer_groups"
      );
      for (const condition of customerGroupConditions) {
        const conditionGroupIds = condition.customerGroups?.map((g) => g.id) || [];
        const customerGroupIds = cart.user?.customerGroups?.map((group12) => group12.id) || [];
        if (conditionGroupIds.length === 0) continue;
        const hasMatch = customerGroupIds.some((id2) => conditionGroupIds.includes(id2));
        if (condition.operator === "in" && !hasMatch) {
          throw new Error(`Discount ${code} is not available for your customer group`);
        }
        if (condition.operator === "not_in" && hasMatch) {
          throw new Error(`Discount ${code} is not available for your customer group`);
        }
      }
    }
    let discountUpdate;
    if (cartDiscounts && cartDiscounts.length > 0) {
      const hasNonStackable = cartDiscounts.some((d) => !d.stackable);
      if (hasNonStackable) {
        discountUpdate = {
          disconnect: cartDiscounts.map((d) => ({ id: d.id })),
          connect: [{ id: discount.id }]
        };
      } else if (!discount.stackable) {
        discountUpdate = {
          disconnect: cartDiscounts.map((d) => ({ id: d.id })),
          connect: [{ id: discount.id }]
        };
      } else {
        discountUpdate = {
          connect: [{ id: discount.id }]
        };
      }
    } else {
      discountUpdate = {
        connect: [{ id: discount.id }]
      };
    }
    const updatedCart = await sudoContext.db.Cart.updateOne({
      where: { id: cartId },
      data: {
        discounts: discountUpdate,
        paymentCollection: { disconnect: true }
      }
    });
    await invalidateCartCompliance(context2, cartId, "DISCOUNT_CHANGED", true);
    return updatedCart;
  });
}
var addDiscountToActiveCart_default = addDiscountToActiveCart;

// features/keystone/mutations/removeDiscountFromActiveCart.ts
init_cart_access();
async function removeDiscountFromActiveCart(root, { cartId, code }, context) {
  return withCartMutationLock(context, cartId, async (context2) => {
    await assertCartAccess(context2, cartId);
    const sudoContext = context2.sudo();
    const discount = await sudoContext.query.Discount.findOne({
      where: { code },
      query: "id"
    });
    if (!discount) {
      throw new Error(`No discount found with code: ${code}`);
    }
    const cart = await sudoContext.db.Cart.updateOne({
      where: { id: cartId },
      data: {
        discounts: {
          disconnect: [{ id: discount.id }]
        },
        paymentCollection: { disconnect: true }
      }
    });
    await invalidateCartCompliance(context2, cartId, "DISCOUNT_CHANGED", true);
    return cart;
  });
}
var removeDiscountFromActiveCart_default = removeDiscountFromActiveCart;

// features/keystone/mutations/createActiveCartPaymentSessions.ts
init_cart_access();

// features/keystone/utils/paymentProviderConfig.ts
function isPaymentProviderConfigured(code) {
  if (code.startsWith("pp_stripe")) {
    return Boolean(
      (process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY) && process.env.STRIPE_SECRET_KEY
    );
  }
  if (code.startsWith("pp_paypal")) {
    return Boolean(
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    );
  }
  return code === "pp_system_default" || code.startsWith("pp_manual");
}
function getPublicPaymentProviderConfig(code) {
  if (!isPaymentProviderConfigured(code)) return null;
  if (code.startsWith("pp_stripe")) {
    return {
      provider: "stripe",
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || ""
    };
  }
  if (code.startsWith("pp_paypal")) {
    return {
      provider: "paypal",
      publishableKey: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
    };
  }
  return null;
}

// features/keystone/mutations/createActiveCartPaymentSessions.ts
async function createActiveCartPaymentSessions(root, { cartId }, context) {
  return withCartMutationLock(context, cartId, async (context2) => {
    await assertCartAccess(context2, cartId);
    const sudoContext = context2.sudo();
    const cart = await sudoContext.query.Cart.findOne({
      where: { id: cartId },
      query: `
      id
      region {
        id
        paymentProviders {
          id
          code
          isInstalled
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
    });
    if (!cart) {
      throw new Error("Cart not found");
    }
    const configuredProviders = cart.region?.paymentProviders?.filter(
      (provider) => provider.isInstalled && isPaymentProviderConfigured(provider.code || "")
    ) || [];
    const availableProviders = [];
    for (const provider of configuredProviders) {
      const compliance = await evaluateCartCompliance({
        context: context2,
        cartId,
        purpose: "payment",
        paymentProviderId: provider.id
      });
      if (!compliance.regulated || compliance.decision?.result === "allow") {
        availableProviders.push(provider);
      }
    }
    let paymentCollection = cart.paymentCollection;
    if (!paymentCollection) {
      paymentCollection = await sudoContext.db.PaymentCollection.createOne({
        data: {
          cart: { connect: { id: cartId } },
          description: "default",
          amount: 0
          // Will be updated when payment is initiated
        },
        query: "id"
      });
    }
    for (const provider of availableProviders) {
      const existingSession = cart.paymentCollection?.paymentSessions?.find(
        (s) => s.paymentProvider.id === provider.id
      );
      if (!existingSession) {
        await sudoContext.db.PaymentSession.createOne({
          data: {
            paymentCollection: { connect: { id: paymentCollection.id } },
            paymentProvider: { connect: { id: provider.id } },
            amount: 0,
            // Initialize with 0, will be updated when payment is initiated
            data: {},
            // Initialize with empty data object
            isSelected: false,
            isInitiated: false
          }
        });
      }
    }
    return await sudoContext.db.Cart.findOne({
      where: { id: cartId }
    });
  });
}
var createActiveCartPaymentSessions_default = createActiveCartPaymentSessions;

// features/keystone/mutations/createActiveCart.ts
init_commerce_fence();
init_token_crypto();
async function createActiveCart(_root, { regionId }, context) {
  return withCommerceFence(context, async (original) => {
    const context2 = await currentCommerceActor(original);
    if (!regionId) throw new Error("Region ID is required");
    const region2 = await context2.query.Region.findOne({
      where: { id: regionId },
      query: "id"
    });
    if (!region2) throw new Error("Region not found");
    const cart = await context2.sudo().query.Cart.createOne({
      data: {
        type: "default",
        region: { connect: { id: region2.id } },
        ...context2.session?.itemId ? { user: { connect: { id: context2.session.itemId } } } : {}
      },
      query: "id region { id }"
    });
    return {
      ...cart,
      proof: createCartProof(cart.id)
    };
  });
}
var createActiveCart_default = createActiveCart;

// features/keystone/mutations/setActiveCartPaymentSession.ts
init_cart_access();
async function setActiveCartPaymentSession(root, { cartId, providerId }, context) {
  return withCartMutationLock(context, cartId, async (context2) => {
    await assertCartAccess(context2, cartId);
    const sudoContext = context2.sudo();
    const cart = await sudoContext.query.Cart.findOne({
      where: { id: cartId },
      query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
    });
    if (!cart) {
      throw new Error("Cart not found");
    }
    if (!cart.paymentCollection) {
      throw new Error("Cart has no payment collection");
    }
    const selectedSession = cart.paymentCollection.paymentSessions?.find(
      (s) => s.paymentProvider.id === providerId
    );
    if (!selectedSession) {
      throw new Error("Payment session not found");
    }
    await requireAllowedCartCompliance({ context: context2, cartId, purpose: "payment", paymentProviderId: providerId });
    {
      const tx = sudoContext.prisma;
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentSession.update({ where: { id: selectedSession.id }, data: { isSelected: true } });
    }
    await invalidateCartCompliance(context2, cartId, "PAYMENT_PROVIDER_CHANGED", true);
    return await sudoContext.db.Cart.findOne({
      where: { id: cartId }
    });
  });
}
var setActiveCartPaymentSession_default = setActiveCartPaymentSession;

// features/keystone/mutations/completeActiveCart.ts
init_cart_access();

// import("../../integrations/payment/**/*.ts") in features/keystone/utils/paymentProviderAdapter.ts
var globImport_integrations_payment_ts = __glob({
  "../../integrations/payment/index.ts": () => Promise.resolve().then(() => (init_payment(), payment_exports)),
  "../../integrations/payment/manual.ts": () => Promise.resolve().then(() => (init_manual(), manual_exports)),
  "../../integrations/payment/paypal.ts": () => Promise.resolve().then(() => (init_paypal(), paypal_exports)),
  "../../integrations/payment/stripe.ts": () => Promise.resolve().then(() => (init_stripe(), stripe_exports))
});

// features/keystone/utils/paymentProviderAdapter.ts
async function executeAdapterFunction({ provider, functionName, args }) {
  const functionPath = provider[functionName];
  if (functionPath.startsWith("http")) {
    const response = await fetch(functionPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...args })
    });
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.statusText}`);
    }
    return response.json();
  }
  const adapter = await globImport_integrations_payment_ts(`../../integrations/payment/${functionPath}.ts`);
  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }
  try {
    return await fn({ provider, ...args });
  } catch (error) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}
async function createPayment({ provider, cart, amount, currency }) {
  return executeAdapterFunction({
    provider,
    functionName: "createPaymentFunction",
    args: { cart, amount, currency }
  });
}
async function capturePayment({ provider, paymentId, amount, currency, idempotencyKey }) {
  return executeAdapterFunction({
    provider,
    functionName: "capturePaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey }
  });
}
async function refundPayment({ provider, paymentId, amount, currency, idempotencyKey }) {
  return executeAdapterFunction({
    provider,
    functionName: "refundPaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey }
  });
}
async function getPaymentStatus({ provider, paymentId }) {
  return executeAdapterFunction({
    provider,
    functionName: "getPaymentStatusFunction",
    args: { paymentId }
  });
}
async function handleWebhook({ provider, event, headers }) {
  return executeAdapterFunction({
    provider,
    functionName: "handleWebhookFunction",
    args: { event, headers }
  });
}

// features/keystone/utils/idempotency.ts
var import_node_crypto3 = __toESM(require("node:crypto"));
function normalize(value) {
  if (value === null || value === void 0) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Idempotency request contains a non-finite number");
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== void 0).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, normalize(entry)])
    );
  }
  throw new Error(`Unsupported idempotency request value: ${typeof value}`);
}
function canonicalIdempotencyParams(params) {
  return normalize(params);
}
function idempotencyFingerprint(params) {
  return import_node_crypto3.default.createHash("sha256").update(JSON.stringify(canonicalIdempotencyParams(params))).digest("hex");
}
function storedFingerprint(requestParams) {
  const params = requestParams && typeof requestParams === "object" ? { ...requestParams } : {};
  const recorded = typeof params._fingerprint === "string" ? params._fingerprint : null;
  delete params._fingerprint;
  const calculated = idempotencyFingerprint(params);
  if (recorded && recorded !== calculated) {
    throw new Error("Stored idempotency request fingerprint is invalid");
  }
  return calculated;
}
function assertIdempotencyRequest(attempt, request) {
  const method = request.requestMethod || "POST";
  const expectedFingerprint = idempotencyFingerprint(request.requestParams);
  if (attempt.requestMethod !== method || attempt.requestPath !== request.requestPath || storedFingerprint(attempt.requestParams) !== expectedFingerprint) {
    throw new Error("Idempotency key was already used with a different request");
  }
}
async function findIdempotencyAttempt(prisma, request) {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const existing = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
  if (existing) assertIdempotencyRequest(existing, { ...request, key });
  return existing;
}
async function getOrCreateIdempotencyAttempt(prisma, request) {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const normalizedParams = canonicalIdempotencyParams(request.requestParams);
  const data = {
    idempotencyKey: key,
    requestMethod: request.requestMethod || "POST",
    requestPath: request.requestPath,
    requestParams: {
      ...normalizedParams,
      _fingerprint: idempotencyFingerprint(request.requestParams)
    },
    recoveryPoint: "started",
    lockedAt: /* @__PURE__ */ new Date()
  };
  const existing = await findIdempotencyAttempt(prisma, { ...request, key });
  if (existing) return { attempt: existing, replay: true };
  try {
    const attempt = await prisma.idempotencyKey.create({ data });
    return { attempt, replay: false };
  } catch (error) {
    if (error?.code !== "P2002") throw error;
    const raced = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
    if (!raced) throw error;
    assertIdempotencyRequest(raced, { ...request, key });
    return { attempt: raced, replay: true };
  }
}

// features/keystone/checkout/recovery.ts
function checkoutKey(cartId) {
  return `checkout:${cartId}`;
}
async function getOrCreateCheckoutAttempt(prisma, cartId, paymentSessionId, acceptedSnapshot) {
  const idempotencyKey = checkoutKey(cartId);
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: idempotencyKey,
    requestPath: "completeActiveCart",
    requestParams: { cartId, paymentSessionId: paymentSessionId || null, ...acceptedSnapshot ? { acceptedSnapshot } : {} }
  });
  if (attempt.recoveryPoint === "completed") return attempt;
  if (!replay) return attempt;
  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
      ]
    },
    data: { lockedAt: /* @__PURE__ */ new Date() }
  });
  if (acquired.count !== 1) throw new Error("Checkout is already in progress");
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}
async function updateCheckoutAttempt(prisma, id2, recoveryPoint, responseBody, responseCode) {
  await prisma.idempotencyKey.update({
    where: { id: id2 },
    data: {
      recoveryPoint,
      responseBody,
      responseCode,
      lockedAt: ["completed", "failed", "started"].includes(recoveryPoint) ? null : /* @__PURE__ */ new Date()
    }
  });
}
function aggregateLines(lines) {
  const byVariant = /* @__PURE__ */ new Map();
  for (const line of lines || []) {
    if (!line.productVariant?.id || !Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("Cart contains an invalid inventory line");
    }
    const current = byVariant.get(line.productVariant.id);
    byVariant.set(line.productVariant.id, {
      variant: line.productVariant,
      quantity: (current?.quantity || 0) + line.quantity
    });
  }
  return [...byVariant.values()];
}
async function reserveCartInventory(prisma, lines, idempotencyKey, checkoutAttemptId) {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx) => {
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      const result = await tx.productVariant.updateMany({
        where: {
          id: variant.id,
          ...variant.allowBackorder ? {} : { inventoryQuantity: { gte: quantity } }
        },
        data: { inventoryQuantity: { decrement: quantity } }
      });
      if (result.count !== 1) {
        throw new Error(`Insufficient stock for ${variant.title || variant.id}`);
      }
      await tx.stockMovement.create({
        data: {
          type: "REMOVE",
          quantity,
          reason: "checkout_reservation",
          note: idempotencyKey,
          variantId: variant.id
        }
      });
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "stock_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    }
  });
}
async function reserveDiscountUsage(prisma, discounts, checkoutAttemptId) {
  await prisma.$transaction(async (tx) => {
    for (const discount of discounts) {
      const current = await tx.discount.findUnique({
        where: { id: discount.id },
        select: {
          usageCount: true,
          usageLimit: true,
          isDisabled: true,
          startsAt: true,
          endsAt: true
        }
      });
      if (!current) throw new Error("Discount not found");
      const now = /* @__PURE__ */ new Date();
      if (current.isDisabled || current.startsAt > now || current.endsAt && current.endsAt <= now) {
        throw new Error(`Discount ${discount.code || discount.id} is no longer active`);
      }
      if (current.usageLimit !== null && current.usageCount >= current.usageLimit) {
        throw new Error(`Discount ${discount.code || discount.id} has reached its usage limit`);
      }
      const result = await tx.discount.updateMany({
        where: {
          id: discount.id,
          usageCount: current.usageCount,
          isDisabled: false,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }]
        },
        data: { usageCount: { increment: 1 } }
      });
      if (result.count !== 1) throw new Error("Discount usage changed; retry checkout");
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "resources_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    }
  });
}
async function releaseCheckoutResources(prisma, lines, discounts, idempotencyKey, checkoutAttemptId, errorMessage) {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx) => {
    for (const discount of discounts || []) {
      await tx.discount.updateMany({
        where: { id: discount.id, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } }
      });
    }
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { inventoryQuantity: { increment: quantity } }
      });
      await tx.stockMovement.create({
        data: {
          type: "RECEIVE",
          quantity,
          reason: "checkout_release",
          note: idempotencyKey,
          variantId: variant.id
        }
      });
    }
    await tx.idempotencyKey.update({
      where: { id: checkoutAttemptId },
      data: {
        recoveryPoint: "started",
        responseBody: { error: errorMessage },
        responseCode: 409,
        lockedAt: null
      }
    });
  });
}

// features/keystone/checkout/order-commit.ts
var import_node_crypto4 = __toESM(require("node:crypto"));
init_commerce_fence();

// features/webhooks/delivery-policy.ts
var WEBHOOK_DELIVERY_MAX_ATTEMPTS = 12;
var WEBHOOK_DELIVERY_TIMEOUT_MS = 15e3;
var WEBHOOK_DELIVERY_LEASE_MS = 2 * 6e4;
function webhookDeliveryLease(now = Date.now()) {
  return new Date(now + WEBHOOK_DELIVERY_LEASE_MS);
}
function nextWebhookAttempt(attempts, now = Date.now()) {
  if (attempts >= WEBHOOK_DELIVERY_MAX_ATTEMPTS) return null;
  const delay = Math.min(Math.pow(2, attempts) * 6e4, 24 * 60 * 60 * 1e3);
  return new Date(now + delay);
}

// features/webhooks/outbox.ts
async function subscribedWebhookEndpointIds(context, eventType, userId) {
  const scopeFilters = [{ scope: { equals: "STORE" } }];
  if (userId) {
    scopeFilters.push({
      scope: { equals: "USER" },
      user: { id: { equals: userId } }
    });
  }
  const endpoints = await context.query.WebhookEndpoint.findMany({
    where: {
      isActive: { equals: true },
      OR: scopeFilters
    },
    query: "id events"
  });
  return endpoints.filter(
    (endpoint2) => Array.isArray(endpoint2.events) && (endpoint2.events.includes(eventType) || endpoint2.events.includes("*"))
  ).map((endpoint2) => endpoint2.id);
}
async function enqueueWebhookOutbox(tx, endpointIds, eventType, resourceType, resourceId, data) {
  const payload = {
    event: eventType,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    listKey: resourceType,
    operation: eventType.split(".").pop(),
    data
  };
  const eventIds = [];
  for (const endpointId of endpointIds) {
    const event = await tx.webhookEvent.create({
      data: {
        eventType,
        resourceType,
        resourceId,
        payload,
        endpointId,
        delivered: false,
        deliveryAttempts: 0,
        nextAttempt: webhookDeliveryLease()
      },
      select: { id: true }
    });
    eventIds.push(event.id);
  }
  return eventIds;
}

// features/webhooks/webhook-plugin.ts
var import_crypto = __toESM(require("crypto"));

// features/webhooks/enrichers/base-enricher.ts
var BaseWebhookEnricher = class {
  /**
   * Helper method to query the entity with enriched data
   */
  async queryEnrichedEntity(item, context) {
    if (!item?.id) {
      return item;
    }
    try {
      const result = await context.query[this.entityType].findOne({
        where: { id: item.id },
        query: this.getQueryFields()
      });
      return result || item;
    } catch (error) {
      console.error(`Error querying ${this.entityType} for webhook enrichment:`, error);
      return item;
    }
  }
};

// features/webhooks/enrichers/order-enricher.ts
var OrderWebhookEnricher = class extends BaseWebhookEnricher {
  entityType = "Order";
  async enrich(item, context) {
    const enrichedItem = await this.queryEnrichedEntity(item, context);
    return enrichedItem || item;
  }
  getQueryFields() {
    return `
      id
      displayId
      email
      status
      rawTotal
      total
      subtotal
      shipping
      discount
      tax
      canceledAt
      metadata
      idempotencyKey
      noNotification
      externalId
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      lineItems {
        id
        title
        quantity
        sku
        variantTitle
        thumbnail
        formattedUnitPrice
        formattedTotal
        moneyAmount {
          amount
          originalAmount
        }
        productVariant {
          id
          title
          sku
          product {
            id
            title
            handle
            thumbnail
            productImages {
              image {
                url
              }
              imagePath
            }
          }
        }
        productData
        variantData
      }
      createdAt
      updatedAt
    `;
  }
};

// features/webhooks/enrichers/registry.ts
var WebhookEnricherRegistry = class {
  enrichers = /* @__PURE__ */ new Map();
  register(entityType, enricher) {
    this.enrichers.set(entityType, enricher);
  }
  get(entityType) {
    return this.enrichers.get(entityType);
  }
  has(entityType) {
    return this.enrichers.has(entityType);
  }
  /**
   * Get all registered entity types
   */
  getRegisteredTypes() {
    return Array.from(this.enrichers.keys());
  }
};
var webhookEnricherRegistry = new WebhookEnricherRegistry();
function registerWebhookEnricher(enricher) {
  webhookEnricherRegistry.register(enricher.entityType, enricher);
}

// features/webhooks/enrichers/index.ts
registerWebhookEnricher(new OrderWebhookEnricher());

// features/webhooks/webhook-plugin.ts
var WEBHOOK_INTERNAL_LISTS = /* @__PURE__ */ new Set(["WebhookEndpoint", "WebhookEvent"]);
function isWebhookInternalList(listKey2) {
  return WEBHOOK_INTERNAL_LISTS.has(listKey2);
}
function withWebhooks(config2) {
  const enhancedLists = Object.fromEntries(
    Object.entries(config2.lists || {}).map(([listKey2, listConfig]) => {
      if (isWebhookInternalList(listKey2)) return [listKey2, listConfig];
      return [
        listKey2,
        {
          ...listConfig,
          hooks: {
            ...listConfig.hooks,
            afterOperation: async (args) => {
              const originalAfterOperation = listConfig.hooks?.afterOperation;
              if (typeof originalAfterOperation === "function") {
                await originalAfterOperation(args);
              } else if (originalAfterOperation?.[args.operation]) {
                await originalAfterOperation[args.operation](args);
              }
              try {
                await triggerWebhook({
                  listKey: listKey2,
                  operation: args.operation,
                  item: args.item,
                  originalItem: args.originalItem,
                  context: args.context.sudo()
                });
              } catch (error) {
                console.error(`Webhook enqueue failed for ${listKey2}:`, error);
              }
            }
          }
        }
      ];
    })
  );
  return {
    ...config2,
    lists: enhancedLists
  };
}
async function triggerWebhook({ listKey: listKey2, operation, item, originalItem, context }) {
  if (isWebhookInternalList(listKey2)) return;
  try {
    const operationMap = {
      "create": "created",
      "update": "updated",
      "delete": "deleted"
    };
    const webhookOperation = operationMap[operation] || operation;
    const eventType = `${listKey2.toLowerCase()}.${webhookOperation}`;
    const webhooks = await context.query.WebhookEndpoint.findMany({
      where: {
        isActive: { equals: true },
        scope: { equals: "STORE" }
      },
      query: "id url secret events failureCount"
    });
    if (!webhooks || webhooks.length === 0) {
      return;
    }
    const subscribedWebhooks = webhooks.filter((webhook) => {
      if (!webhook.events || !Array.isArray(webhook.events)) {
        return false;
      }
      return webhook.events.includes(eventType) || webhook.events.includes("*");
    });
    if (subscribedWebhooks.length === 0) {
      return;
    }
    const payload = await formatPayload(listKey2, operation, item, originalItem, context);
    for (const webhook of subscribedWebhooks) {
      await deliverWebhook(webhook, eventType, payload, context);
    }
  } catch (error) {
    console.error("Webhook trigger error:", error);
  }
}
async function deliverWebhook(webhook, eventType, payload, context, existingEvent) {
  let webhookEvent = existingEvent;
  try {
    if (!webhookEvent) {
      webhookEvent = await context.query.WebhookEvent.createOne({
        data: {
          eventType,
          resourceType: payload.listKey,
          resourceId: payload.data?.id || "unknown",
          payload,
          endpoint: { connect: { id: webhook.id } },
          deliveryAttempts: 0,
          nextAttempt: webhookDeliveryLease()
        },
        query: "id deliveryAttempts"
      });
    }
    await context.query.WebhookEvent.updateOne({
      where: { id: webhookEvent.id },
      data: { deliveryAttempts: (webhookEvent.deliveryAttempts || 0) + 1, lastAttempt: /* @__PURE__ */ new Date() }
    });
    if (!webhook.secret) {
      throw new Error("Webhook endpoint secret is required");
    }
    const secret = webhook.secret;
    const signature = import_crypto.default.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OpenFront-Webhook-Signature": `sha256=${signature}`,
        "X-OpenFront-Topic": eventType,
        "X-OpenFront-ListKey": payload.listKey,
        "X-OpenFront-Operation": payload.operation,
        "X-OpenFront-Delivery-ID": webhookEvent.id
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_DELIVERY_TIMEOUT_MS)
    });
    if (response.ok) {
      const responseBody = (await response.text()).slice(0, 64e3);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent.id },
        data: {
          delivered: true,
          responseStatus: response.status,
          responseBody,
          lastAttempt: /* @__PURE__ */ new Date()
        }
      });
      if (webhook.failureCount > 0) {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: {
            failureCount: 0,
            lastTriggered: /* @__PURE__ */ new Date()
          }
        });
      } else {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: { lastTriggered: /* @__PURE__ */ new Date() }
        });
      }
    } else {
      const errorText = (await response.text()).slice(0, 64e3);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    try {
      const attempts = Number(webhookEvent?.deliveryAttempts || 0) + 1;
      const nextAttempt = nextWebhookAttempt(attempts);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent?.id },
        data: {
          delivered: false,
          responseStatus: 0,
          responseBody: error instanceof Error ? error.message : String(error),
          lastAttempt: /* @__PURE__ */ new Date(),
          nextAttempt,
          ...nextAttempt ? {} : { deadLetteredAt: /* @__PURE__ */ new Date() }
        }
      });
      await context.query.WebhookEndpoint.updateOne({
        where: { id: webhook.id },
        data: {
          failureCount: (webhook.failureCount || 0) + 1
        }
      });
    } catch (updateError) {
      console.error("Failed to update webhook event after delivery failure:", updateError);
    }
  }
}
async function formatPayload(listKey2, operation, item, originalItem, context) {
  const basePayload = {
    event: `${listKey2.toLowerCase()}.${operation}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    listKey: listKey2,
    operation
  };
  let enrichedData = item;
  if (webhookEnricherRegistry.has(listKey2) && item?.id) {
    try {
      const enricher = webhookEnricherRegistry.get(listKey2);
      if (enricher) {
        enrichedData = await enricher.enrich(item, context);
      }
    } catch (error) {
      console.error(`Error enriching webhook payload for ${listKey2}:`, error);
      enrichedData = item;
    }
  }
  switch (operation) {
    case "create":
      return {
        ...basePayload,
        data: enrichedData || item
      };
    case "update":
      return {
        ...basePayload,
        data: enrichedData || item,
        previousData: originalItem,
        changes: getChangedFields(originalItem, enrichedData || item)
      };
    case "delete":
      return {
        ...basePayload,
        data: originalItem
      };
    default:
      return {
        ...basePayload,
        data: enrichedData || item
      };
  }
}
function getChangedFields(original, updated) {
  if (!original || !updated) return {};
  const changes = {};
  for (const key in updated) {
    if (original[key] !== updated[key]) {
      changes[key] = {
        from: original[key],
        to: updated[key]
      };
    }
  }
  return changes;
}
async function deliverWebhookEventsById(context, eventIds) {
  const uniqueEventIds = [...new Set(eventIds.filter(Boolean))];
  for (const eventId of uniqueEventIds) {
    const event = await context.sudo().query.WebhookEvent.findOne({
      where: { id: eventId },
      query: `
        id eventType payload deliveryAttempts delivered
        endpoint { id url secret failureCount }
      `
    });
    if (!event || event.delivered || !event.endpoint) continue;
    await deliverWebhook(
      event.endpoint,
      event.eventType,
      event.payload,
      context.sudo(),
      event
    );
  }
  return uniqueEventIds.length;
}
async function retryPendingWebhookDeliveries(context, limit = 25) {
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const sudo = context.sudo();
  const now = /* @__PURE__ */ new Date();
  const candidates = await sudo.prisma.webhookEvent.findMany({
    where: {
      delivered: false,
      deadLetteredAt: null,
      nextAttempt: { lte: now },
      deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS },
      endpointId: { not: null }
    },
    orderBy: { nextAttempt: "asc" },
    take: boundedLimit,
    select: { id: true }
  });
  let claimed = 0;
  for (const candidate of candidates) {
    const claim = await sudo.prisma.webhookEvent.updateMany({
      where: {
        id: candidate.id,
        delivered: false,
        deadLetteredAt: null,
        nextAttempt: { lte: now },
        deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS }
      },
      data: { nextAttempt: webhookDeliveryLease() }
    });
    if (claim.count !== 1) continue;
    const event = await sudo.query.WebhookEvent.findOne({
      where: { id: candidate.id },
      query: `
        id eventType payload deliveryAttempts
        endpoint { id url secret failureCount }
      `
    });
    if (!event?.endpoint) continue;
    claimed += 1;
    await deliverWebhook(event.endpoint, event.eventType, event.payload, sudo, event);
  }
  return claimed;
}

// features/keystone/checkout/accepted-compliance-snapshot.ts
var SHA2562 = /^[a-f0-9]{64}$/;
function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function validId(value) {
  return typeof value === "string" && value.length > 0;
}
function validDigest(value) {
  return typeof value === "string" && SHA2562.test(value);
}
function matchesCurrentAcceptedCheckoutSnapshot(decisionValue, expected) {
  const decision = record(decisionValue);
  const snapshot = record(decision?.snapshot);
  const evidenceDigests = record(snapshot?.evidenceDigests);
  const policy = record(snapshot?.policy);
  if (!decision || !snapshot || !evidenceDigests || !policy) return false;
  const expiresAt = new Date(String(decision.expiresAt ?? "")).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= expected.now.getTime()) return false;
  try {
    return decision.cartId === expected.cartId && decision.cartFingerprint === expected.cartFingerprint && decision.purpose === "checkout" && decision.result === "allow" && decision.revokedAt === null && decision.orderId === null && typeof decision.snapshotDigest === "string" && evidenceDigest(snapshot) === decision.snapshotDigest && snapshot.cartId === expected.cartId && snapshot.cartFingerprint === expected.cartFingerprint && snapshot.purpose === "checkout" && snapshot.result === "allow" && snapshot.merchantProfileId === expected.current.merchantProfileId && snapshot.jurisdictionCode === expected.current.jurisdictionCode && snapshot.ruleSetId === expected.current.ruleSetId && policy.id === expected.current.ruleSetId && policy.packName === expected.current.policyPack && policy.version === expected.current.policyVersion && policy.policyHash === expected.current.policyHash && decision.merchantProfileId === expected.current.merchantProfileId && decision.jurisdictionId === expected.current.jurisdictionId && decision.policyPack === expected.current.policyPack && decision.policyVersion === expected.current.policyVersion && decision.policyHash === expected.current.policyHash && snapshot.ageAttemptId === expected.current.ageAttemptId && snapshot.taxQuoteId === expected.current.taxQuoteId && snapshot.paymentApprovalId === expected.current.paymentApprovalId && snapshot.carrierDecisionId === expected.current.carrierDecisionId && evidenceDigests.age === expected.current.evidenceDigests.age && evidenceDigests.tax === expected.current.evidenceDigests.tax && evidenceDigests.carrier === expected.current.evidenceDigests.carrier && validId(snapshot.ageAttemptId) && validId(snapshot.taxQuoteId) && validId(snapshot.paymentApprovalId) && validId(snapshot.carrierDecisionId) && validDigest(evidenceDigests.age) && validDigest(evidenceDigests.tax) && validDigest(evidenceDigests.carrier);
  } catch {
    return false;
  }
}
function acceptedCheckoutEvidenceWhere(snapshotValue, cartId, cartFingerprint, now) {
  const snapshot = record(snapshotValue);
  const evidenceDigests = record(snapshot?.evidenceDigests);
  if (!snapshot || !evidenceDigests || snapshot.cartId !== cartId || snapshot.cartFingerprint !== cartFingerprint || snapshot.purpose !== "checkout" || snapshot.result !== "allow" || !validId(snapshot.ageAttemptId) || !validId(snapshot.taxQuoteId) || !validId(snapshot.carrierDecisionId) || !validDigest(evidenceDigests.age) || !validDigest(evidenceDigests.tax) || !validDigest(evidenceDigests.carrier) || !Number.isFinite(now.getTime())) return null;
  return {
    age: {
      id: snapshot.ageAttemptId,
      cartId,
      cartFingerprint,
      purpose: "checkout",
      result: "passed",
      addressMatch: "matched",
      evidenceDigest: evidenceDigests.age,
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null
    },
    tax: {
      id: snapshot.taxQuoteId,
      cartId,
      cartFingerprint,
      status: "committed",
      evidenceDigest: evidenceDigests.tax,
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null
    },
    carrier: {
      id: snapshot.carrierDecisionId,
      cartId,
      cartFingerprint,
      result: "allow",
      adultSignature: true,
      evidenceDigest: evidenceDigests.carrier,
      providerApproval: {
        is: {
          purpose: "carrier",
          status: "active",
          effectiveAt: { lte: now },
          expiresAt: { gt: now }
        }
      },
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null
    }
  };
}

// features/keystone/checkout/order-commit.ts
var WEBHOOK_ADDRESS_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  company: true,
  address1: true,
  address2: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  country: { select: { id: true, iso2: true } }
};
async function createOrderFromCartAtomically(cart, sudo) {
  await assertCommerceReleaseEnabled(sudo);
  const deliverAfterCommit = !insideCommerceFence(sudo);
  const commit = deliverAfterCommit ? await withCartFence(sudo, cart.id, "checkout", (locked) => commitOrderFromCart(cart, locked.sudo())) : await commitOrderFromCart(cart, sudo);
  if (deliverAfterCommit && commit.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, commit.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate order webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  const order = await sudo.query.Order.findOne({
    where: { id: commit.orderId },
    query: `
      id status displayId secretKey subtotal total shipping discount tax paymentDetails
      shippingAddress { id firstName lastName company address1 address2 city province postalCode country { id iso2 } phone }
    `
  });
  if (!order || typeof order.id !== "string") throw new Error("Order could not be loaded");
  return order;
}
async function commitOrderFromCart(cart, sudo) {
  const prepared = [];
  for (const line of cart.lineItems) {
    const prices = await sudo.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: line.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } }
      },
      take: 1,
      query: "id calculatedPrice { calculatedAmount originalAmount currencyCode }"
    });
    const price = prices[0]?.calculatedPrice;
    if (!price) throw new Error(`No valid price for variant ${line.productVariant.id}`);
    const thumbnail = line.productVariant.primaryImage ? line.productVariant.primaryImage.image?.url || line.productVariant.primaryImage.imagePath : line.productVariant.product.thumbnail;
    prepared.push({ line, price, thumbnail });
  }
  const currentCompliance = await evaluateCartCompliance({ context: sudo, cartId: cart.id, purpose: "checkout" });
  const regulated = currentCompliance.regulated;
  const acceptanceReferences = currentCompliance.regulated ? currentCompliance.acceptanceReferences : null;
  if (regulated && currentCompliance.decision?.result !== "allow") {
    throw new Error("A current allowed checkout compliance snapshot is required");
  }
  const cartFingerprint = await cartEvidenceFingerprint(sudo, cart.id);
  if (!cart.acceptedCheckoutFingerprint || cart.acceptedCheckoutFingerprint !== cartFingerprint) throw new Error("Your cart changed during checkout. Review it and try again.");
  const now = /* @__PURE__ */ new Date();
  const complianceDecision = regulated ? await sudo.prisma.complianceDecision.findFirst({
    where: {
      cartId: cart.id,
      cartFingerprint,
      purpose: "checkout",
      result: "allow",
      revokedAt: null,
      orderId: null,
      expiresAt: { gt: now }
    },
    orderBy: { issuedAt: "desc" }
  }) : null;
  if (regulated && (!complianceDecision || !acceptanceReferences || !matchesCurrentAcceptedCheckoutSnapshot(complianceDecision, {
    cartId: cart.id,
    cartFingerprint,
    current: acceptanceReferences,
    now
  }))) {
    throw new Error("A current allowed checkout compliance snapshot is required");
  }
  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const orderWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "order.created",
    userId
  );
  const secretKey = userId ? "" : import_node_crypto4.default.randomBytes(32).toString("hex");
  const commercialSnapshot = {
    currency: cart.region.currency.code,
    cartFingerprint,
    acceptedTotal: cart.rawTotal,
    tax: {
      rate: cart.region.taxRate || 0,
      regionId: cart.region.id,
      destinationCountry: cart.shippingAddress?.country?.iso2 || null
    },
    acceptedAt: now.toISOString(),
    compliance: complianceDecision ? {
      decisionId: complianceDecision.id,
      snapshotDigest: complianceDecision.snapshotDigest,
      policyPack: complianceDecision.policyPack,
      policyVersion: complianceDecision.policyVersion,
      policyHash: complianceDecision.policyHash,
      result: complianceDecision.result
    } : null
  };
  const webhookTotals = orderWebhookEndpointIds.length ? await sudo.query.Cart.findOne({ where: { id: cart.id }, query: "subtotal shipping discount tax total" }).catch(() => null) : null;
  const commit = await (async (tx) => {
    const existing = await tx.order.findFirst({ where: { cart: { id: cart.id } }, select: { id: true } });
    if (existing) return { orderId: existing.id, webhookEventIds: [] };
    const lineItemIds = [];
    const webhookLineItems = [];
    for (const { line, price, thumbnail } of prepared) {
      const money = await tx.orderMoneyAmount.create({
        data: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
          currencyId: cart.region.currency.id,
          regionId: cart.region.id,
          priceData: {
            prices: line.productVariant.prices,
            currencyCode: cart.region.currency.code,
            regionId: cart.region.id,
            taxRate: cart.region.taxRate
          },
          metadata: line.metadata
        }
      });
      const item = await tx.orderLineItem.create({
        data: {
          quantity: line.quantity,
          title: line.productVariant.product.title,
          sku: line.productVariant.sku,
          metadata: line.metadata,
          productData: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
            description: line.productVariant.product.description,
            metadata: line.productVariant.product.metadata
          },
          variantData: {
            id: line.productVariant.id,
            sku: line.productVariant.sku,
            title: line.productVariant.title,
            measurements: line.productVariant.measurements || []
          },
          variantTitle: line.productVariant.title,
          formattedUnitPrice: line.unitPrice,
          formattedTotal: line.total,
          productVariantId: line.productVariant.id,
          originalLineItemId: line.id,
          moneyAmountId: money.id
        }
      });
      lineItemIds.push(item.id);
      webhookLineItems.push({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        thumbnail,
        moneyAmount: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount
        },
        productVariant: {
          id: line.productVariant.id,
          title: line.productVariant.title,
          sku: line.productVariant.sku,
          product: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail
          }
        }
      });
    }
    const order = await tx.order.create({
      data: {
        cart: { connect: { id: cart.id } },
        email: cart.email,
        userId,
        regionId: cart.region.id,
        currencyId: cart.region.currency.id,
        billingAddressId: cart.billingAddress.id,
        shippingAddressId: cart.shippingAddress.id,
        discounts: { connect: (cart.discounts || []).map((item) => ({ id: item.id })) },
        shippingMethods: { connect: (cart.shippingMethods || []).map((item) => ({ id: item.id })) },
        lineItems: { connect: lineItemIds.map((id2) => ({ id: id2 })) },
        status: "pending",
        displayId: Math.floor(Date.now() / 1e3),
        taxRate: cart.region.taxRate || 0,
        metadata: { ...cart.metadata || {}, commercialSnapshot },
        secretKey,
        events: {
          create: {
            type: "ORDER_PLACED",
            data: { cartId: cart.id, isGuestOrder: !userId }
          }
        }
      }
    });
    await tx.cart.update({ where: { id: cart.id }, data: { orderId: order.id } });
    if (complianceDecision) {
      const bindingTime = /* @__PURE__ */ new Date();
      const accepted = complianceDecision.snapshot;
      const evidenceWhere = acceptedCheckoutEvidenceWhere(accepted, cart.id, cartFingerprint, bindingTime);
      if (!evidenceWhere) throw new Error("Accepted evidence references are incomplete");
      const linkedDecision = await tx.complianceDecision.updateMany({
        where: {
          id: complianceDecision.id,
          cartId: cart.id,
          cartFingerprint,
          merchantProfileId: complianceDecision.merchantProfileId,
          jurisdictionId: complianceDecision.jurisdictionId,
          purpose: "checkout",
          result: "allow",
          policyPack: complianceDecision.policyPack,
          policyVersion: complianceDecision.policyVersion,
          policyHash: complianceDecision.policyHash,
          snapshotDigest: complianceDecision.snapshotDigest,
          revokedAt: null,
          orderId: null,
          expiresAt: { gt: bindingTime }
        },
        data: { orderId: order.id }
      });
      if (linkedDecision.count !== 1) throw new Error("Accepted compliance snapshot expired, changed, or was already consumed");
      for (const [model, where] of [
        [tx.ageVerificationAttempt, evidenceWhere.age],
        [tx.regulatedTaxQuote, evidenceWhere.tax],
        [tx.carrierEligibilityDecision, evidenceWhere.carrier]
      ]) {
        const linked3 = await model.updateMany({ where, data: { orderId: order.id } });
        if (linked3.count !== 1) throw new Error("Accepted evidence was expired, changed, or already consumed");
      }
      await tx.complianceEvent.create({
        data: {
          decisionId: complianceDecision.id,
          orderId: order.id,
          eventType: "checkout.compliance_committed",
          resourceType: "Order",
          resourceId: order.id,
          evidenceDigest: complianceDecision.snapshotDigest,
          data: { cartId: cart.id, policyVersion: complianceDecision.policyVersion },
          occurredAt: bindingTime
        }
      });
    }
    const webhookAddress = (id2) => orderWebhookEndpointIds.length ? tx.address.findUnique({ where: { id: id2 }, select: WEBHOOK_ADDRESS_SELECT }) : null;
    const shippingAddress = await webhookAddress(cart.shippingAddress.id);
    const billingAddress = await webhookAddress(cart.billingAddress.id);
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      orderWebhookEndpointIds,
      "order.created",
      "Order",
      order.id,
      {
        id: order.id,
        cartId: cart.id,
        displayId: order.displayId,
        email: order.email,
        status: order.status,
        rawTotal: cart.rawTotal,
        subtotal: webhookTotals?.subtotal ?? null,
        shipping: webhookTotals?.shipping ?? null,
        discount: webhookTotals?.discount ?? null,
        tax: webhookTotals?.tax ?? null,
        total: webhookTotals?.total ?? null,
        currency: { id: cart.region.currency.id, code: cart.region.currency.code },
        shippingAddress,
        billingAddress,
        lineItems: webhookLineItems
      }
    );
    if (cart.email) {
      await tx.notification.create({
        data: {
          eventName: "ORDER_CONFIRMATION",
          resourceType: "Order",
          resourceId: order.id,
          to: cart.email,
          userId: userId || null,
          data: { orderId: order.id, status: "pending_delivery" }
        }
      });
    }
    return { orderId: order.id, webhookEventIds };
  })(sudo.prisma);
  return commit;
}

// features/keystone/mutations/completeActiveCart.ts
init_commerce_fence();
async function completeActiveCart(root, { cartId, paymentSessionId }, context) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  if (paymentSessionId) {
    await assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId);
  }
  const sudoContext = context.sudo();
  const user = context.session?.itemId;
  const { cart, attempt } = await withCartFence(context, cartId, "checkout", async (locked) => {
    const context2 = locked;
    const sudoContext2 = locked.sudo();
    const cart2 = await sudoContext2.query.Cart.findOne({
      where: { id: cartId },
      query: `
      id
      email
      rawTotal
      metadata
      order {
        id
        status
        displayId
        secretKey
        payments { id }
        account { id }
        shippingAddress { country { iso2 } }
      }
      user {
        id
        hasAccount
      }
      shippingAddress {
        id
        country { iso2 }
        user {
          id
          hasAccount
        }
      }
      region {
        id
        taxRate
        currency {
          code
          id
        }
      }
      billingAddress {
        id
      }
      shippingAddress {
        id
      }
      discounts {
        id
        code
      }
      giftCards { id }
      shippingMethods {
        id
      }
      lineItems {
        id
        quantity
        metadata
        unitPrice
        total
        productVariant {
          id
          sku
          title
          inventoryQuantity
          manageInventory
          allowBackorder
          primaryImage {
            image {
              url
            }
            imagePath
          }
          product {
            id
            title
            thumbnail
            productTags { id }
            description {
              document
            }
            metadata
          }
          prices {
            id
            amount
            compareAmount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
          measurements {
            id
            value
            unit
            type
          }
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          amount
          data
          paymentProvider {
            id
            code
            capturePaymentFunction
            refundPaymentFunction
            getPaymentStatusFunction
            generatePaymentLinkFunction
          }
        }
      }
    `
    });
    if (!cart2) {
      throw new Error("Cart not found");
    }
    if (cart2.order?.id) return { cart: cart2, attempt: null };
    await assertCommerceReleaseEnabled(context2);
    cart2.acceptedCheckoutFingerprint = await cartEvidenceFingerprint(context2, cartId);
    const selectedProviderId = paymentSessionId ? cart2.paymentCollection?.paymentSessions?.find((session) => session.id === paymentSessionId)?.paymentProvider?.id : null;
    const compliance = await requireAllowedCartCompliance({
      context: context2,
      cartId,
      purpose: "checkout",
      paymentProviderId: selectedProviderId
    });
    if (compliance.regulated) {
      cart2.rawTotal += await regulatedTaxAmountForCart(context2, cartId, ["committed"]);
    }
    const attempt2 = await getOrCreateCheckoutAttempt(
      sudoContext2.prisma,
      cartId,
      paymentSessionId,
      {
        cartFingerprint: cart2.acceptedCheckoutFingerprint,
        amount: cart2.rawTotal,
        currency: cart2.region.currency.code,
        acceptanceDigest: evidenceDigest(compliance.regulated ? compliance.acceptanceReferences : { regulated: false })
      }
    );
    return { cart: cart2, attempt: attempt2 };
  });
  if (cart.order?.id) {
    const existingAttempt = await sudoContext.prisma.idempotencyKey.findUnique({
      where: { idempotencyKey: checkoutKey(cartId) }
    });
    if (paymentSessionId && !cart.order.payments?.length) {
      const selectedSession = cart.paymentCollection?.paymentSessions?.find(
        (session) => session.id === paymentSessionId
      );
      const paymentResult = existingAttempt?.responseBody?.paymentResult;
      if (!selectedSession || !paymentResult || existingAttempt.recoveryPoint !== "payment_confirmed") {
        throw new Error("Checkout requires payment reconciliation");
      }
      await createPaymentRecord(paymentResult, selectedSession, cart.order, cart, sudoContext);
    } else if (!paymentSessionId && !cart.order.account?.id) {
      if (!user) throw new Error("Checkout requires account reconciliation");
      const accounts = await sudoContext.query.Account.findMany({
        where: {
          user: { id: { equals: user } },
          accountType: { equals: "business" },
          status: { equals: "active" }
        },
        take: 1,
        query: "id"
      });
      if (!accounts[0]) throw new Error("Checkout requires account reconciliation");
      await addOrderToAccount(accounts[0].id, cart.order, sudoContext);
    }
    if (existingAttempt) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        existingAttempt.id,
        "completed",
        { orderId: cart.order.id },
        200
      );
    }
    return sudoContext.query.Order.findOne({
      where: { id: cart.order.id },
      query: "id status displayId secretKey shippingAddress { country { iso2 } }"
    });
  }
  if (!attempt) throw new Error("Checkout attempt is missing");
  if (attempt.recoveryPoint === "completed" && attempt.responseBody?.orderId) {
    return sudoContext.query.Order.findOne({
      where: { id: attempt.responseBody.orderId },
      query: "id status displayId secretKey shippingAddress { country { iso2 } }"
    });
  }
  let inventoryReserved = attempt.recoveryPoint !== "started";
  let discountsReserved = [
    "resources_reserved",
    "payment_unknown",
    "order_created",
    "payment_confirmed"
  ].includes(attempt.recoveryPoint);
  try {
    if (!inventoryReserved) {
      await reserveCartInventory(
        sudoContext.prisma,
        cart.lineItems,
        checkoutKey(cartId),
        attempt.id
      );
      inventoryReserved = true;
      attempt.recoveryPoint = "stock_reserved";
    }
    if (!discountsReserved) {
      await reserveDiscountUsage(
        sudoContext.prisma,
        cart.discounts || [],
        attempt.id
      );
      discountsReserved = true;
      attempt.recoveryPoint = "resources_reserved";
    }
    const order = !paymentSessionId ? await handleAccountOrder(cart, user, sudoContext, attempt) : await handlePaidOrder(cart, paymentSessionId, sudoContext, attempt);
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      "completed",
      { orderId: order.id },
      200
    );
    return order;
  } catch (error) {
    if (inventoryReserved && !["payment_unknown", "order_created", "payment_confirmed"].includes(attempt.recoveryPoint)) {
      await releaseCheckoutResources(
        sudoContext.prisma,
        cart.lineItems,
        discountsReserved ? cart.discounts || [] : [],
        checkoutKey(cartId),
        attempt.id,
        error instanceof Error ? error.message : "Checkout failed"
      );
    }
    throw error;
  }
}
async function handleAccountOrder(cart, user, sudoContext, attempt) {
  if (!user) {
    throw new Error("Authentication required for account orders");
  }
  if (cart.user?.id !== user) throw new Error("Checkout could not be completed");
  const cartCurrency = cart.region?.currency?.code;
  if (!cartCurrency) {
    throw new Error("Cart region or currency not found");
  }
  const accounts = await sudoContext.query.Account.findMany({
    where: {
      user: { id: { equals: user } },
      accountType: { equals: "business" },
      status: { equals: "active" }
    },
    query: `
      id
      totalAmount
      paidAmount
      creditLimit
      currency {
        id
        code
        noDivisionCurrency
      }
      user {
        id
        email
      }
    `
  });
  const activeAccount = accounts[0];
  if (!activeAccount) {
    throw new Error(`No active business account found. Contact administrator to set up business account access.`);
  }
  if (cartCurrency !== activeAccount.currency.code) {
    throw new Error("Cross-currency account orders are outside the supported launch boundary");
  }
  const orderInAccountCurrency = cart.rawTotal;
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await updateCheckoutAttempt(
    sudoContext.prisma,
    attempt.id,
    "order_created",
    { orderId: order.id }
  );
  attempt.recoveryPoint = "order_created";
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  return order;
}
async function handlePaidOrder(cart, paymentSessionId, sudoContext, attempt) {
  const selectedSession = cart.paymentCollection?.paymentSessions?.find(
    (session) => session.id === paymentSessionId
  );
  if (!selectedSession) {
    throw new Error(`Payment session not found. Looking for session ID: ${paymentSessionId}`);
  }
  if (!selectedSession.paymentProvider) {
    throw new Error("Payment provider not found in session");
  }
  if (!selectedSession.paymentProvider.code) {
    throw new Error("Payment provider code is missing");
  }
  if (selectedSession.amount !== cart.rawTotal) {
    throw new Error("Payment session amount no longer matches cart total");
  }
  let paymentResult = attempt.responseBody?.paymentResult;
  if (attempt.recoveryPoint !== "payment_confirmed" || !paymentResult) {
    try {
      paymentResult = await settlePaymentSession(selectedSession, cart);
    } catch (error) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        "payment_unknown",
        { error: error instanceof Error ? error.message : String(error) }
      );
      attempt.recoveryPoint = "payment_unknown";
      throw error;
    }
    if (paymentResult.status !== "succeeded") {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        "resources_reserved",
        { paymentResult }
      );
      attempt.recoveryPoint = "resources_reserved";
      throw new Error(`Payment failed: ${paymentResult.error || paymentResult.status}`);
    }
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      "payment_confirmed",
      { paymentResult }
    );
    attempt.recoveryPoint = "payment_confirmed";
    attempt.responseBody = { paymentResult };
  }
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext);
  return order;
}
async function settlePaymentSession(session, cart) {
  const provider = session.paymentProvider;
  if (provider.code === "pp_system_default") {
    throw new Error("Manual tender cannot complete storefront checkout");
  }
  const paymentId = session.data?.paymentIntentId || session.data?.clientSecret?.split("_secret_")[0] || session.data?.orderId;
  if (!paymentId) throw new Error("Payment provider reference is missing");
  let result = await getPaymentStatus({ provider, paymentId });
  const normalizedStatus = String(result.status || "").toLowerCase();
  if (["requires_capture", "approved", "authorized"].includes(normalizedStatus)) {
    result = await capturePayment({
      provider,
      paymentId,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: checkoutKey(cart.id)
    });
  }
  const finalStatus = String(result.status || "").toLowerCase();
  const succeeded = ["succeeded", "completed", "captured"].includes(finalStatus);
  const resultAmount = Number(result.amount);
  const expectedCurrency = String(cart.region.currency.code).toUpperCase();
  const resultCurrency = String(result.currency || expectedCurrency).toUpperCase();
  if (!succeeded) {
    return { status: "failed", paymentIntentId: paymentId, error: `Payment status: ${result.status}` };
  }
  if (!Number.isInteger(resultAmount) || resultAmount !== cart.rawTotal) {
    throw new Error("Provider payment amount does not match cart total");
  }
  if (resultCurrency !== expectedCurrency) {
    throw new Error("Provider payment currency does not match cart currency");
  }
  return {
    status: "succeeded",
    paymentIntentId: paymentId,
    amount: resultAmount,
    currency: resultCurrency,
    data: result.data
  };
}
async function addOrderToAccount(accountId, order, sudoContext) {
  const orderDetails = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      displayId
      rawTotal
      region {
        id
        name
        currency {
          code
        }
      }
      currency {
        code
      }
      lineItems {
        id
      }
    `
  });
  try {
    await sudoContext.prisma.$transaction(async (tx) => {
      const existing = await tx.accountLineItem.findUnique({
        where: { orderKey: order.id },
        select: { id: true, accountId: true }
      });
      if (existing && existing.accountId !== accountId) {
        throw new Error("Order is already posted to a different account");
      }
      if (!existing) {
        const amount = orderDetails.rawTotal || 0;
        const accountRows = await tx.$queryRaw`SELECT id, status, "totalAmount", "paidAmount", "creditLimit" FROM "Account" WHERE id = ${accountId} FOR UPDATE`;
        const account = accountRows[0];
        if (!account || account.status !== "active") {
          throw new Error("Business account is not active");
        }
        const availableCredit = account.creditLimit - ((account.totalAmount || 0) - (account.paidAmount || 0));
        if (amount > availableCredit) throw new Error("Insufficient account credit");
        await tx.account.update({
          where: { id: accountId },
          data: { totalAmount: { increment: amount } }
        });
        await tx.accountLineItem.create({
          data: {
            accountId,
            orderId: order.id,
            orderKey: order.id,
            regionId: orderDetails.region.id,
            description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
            amount,
            orderDisplayId: String(orderDetails.displayId),
            itemCount: orderDetails.lineItems?.length || 0,
            paymentStatus: "unpaid"
          }
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { accountId }
      });
    }, { isolationLevel: "Serializable" });
    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
  } catch (error) {
    console.error("Error adding order to account:", error);
    throw new Error(
      `Failed to add order to account: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
async function createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext) {
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudoContext,
    "payment.captured"
  );
  await sudoContext.prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findFirst({
      where: { orderId: order.id, paymentCollectionId: cart.paymentCollection.id }
    });
    if (existing) return;
    const payment = await tx.payment.create({
      data: {
        status: "captured",
        amount: cart.rawTotal,
        currencyCode: cart.region.currency.code,
        data: {
          ...selectedSession.data,
          ...paymentResult.data,
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId
        },
        metadata: { checkoutIdempotencyKey: checkoutKey(cart.id) },
        idempotencyKey: checkoutKey(cart.id),
        capturedAt: /* @__PURE__ */ new Date(),
        paymentCollectionId: cart.paymentCollection.id,
        orderId: order.id,
        userId: cart.user?.id || cart.shippingAddress?.user?.id || null
      }
    });
    await tx.capture.create({
      data: {
        amount: cart.rawTotal,
        paymentId: payment.id,
        metadata: {
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId
        },
        createdBy: "checkout"
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: "PAYMENT_CAPTURED",
        data: {
          paymentId: payment.id,
          amount: cart.rawTotal,
          currencyCode: cart.region.currency.code,
          source: "checkout"
        }
      }
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      "payment.captured",
      "Payment",
      payment.id,
      { id: payment.id, orderId: order.id, amount: cart.rawTotal, currencyCode: cart.region.currency.code }
    );
  });
}
var completeActiveCart_default = completeActiveCart;

// features/keystone/mutations/addActiveCartShippingMethod.ts
init_cart_access();
async function addActiveCartShippingMethod(root, { cartId, shippingMethodId }, context) {
  return withCartMutationLock(context, cartId, async (context2) => {
    await assertCartAccess(context2, cartId);
    const sudo = context2.sudo();
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: `id region { id currency { code } countries { iso2 } }
      shippingAddress { country { iso2 } }
      lineItems { quantity productVariant { id } }`
    });
    const option = await sudo.query.ShippingOption.findOne({
      where: { id: shippingMethodId },
      query: `id amount name priceType adminOnly isReturn region { id }
      shippingOptionRequirements { type amount }`
    });
    if (!cart?.region?.id || !option || !option.region?.id || option.region.id !== cart.region.id || option.adminOnly || option.isReturn || !shippingDestinationWithinRegion(
      cart.region.countries?.map((country) => country.iso2),
      cart.shippingAddress?.country?.iso2
    )) {
      throw new Error("Shipping option not found");
    }
    const price = shippingOptionCharge(option.priceType, option.amount);
    const subtotal = await calculateCartSubtotalMinorUnits(sudo, cart);
    if (price === null || !shippingSubtotalRequirementsMet(option.shippingOptionRequirements, subtotal)) {
      throw new Error("Shipping option is not eligible for this cart");
    }
    const compliance = await evaluateCartCompliance({ context: context2, cartId, purpose: "cart" });
    if (compliance.regulated) {
      if (compliance.decision?.result !== "allow") {
        throw new Error(`Regulated shipping denied: ${compliance.decision?.reasonCodes.join(", ")}`);
      }
      const scope = compliance.carrierScope;
      if (!scope?.cartFingerprint || !scope.destinationJurisdictionCode || !scope.originJurisdictionCode) {
        throw new Error("A current approved carrier decision is required");
      }
      const { cartFingerprint, destinationJurisdictionCode, originJurisdictionCode } = scope;
      const now = /* @__PURE__ */ new Date();
      const decisions = await sudo.query.CarrierEligibilityDecision.findMany({
        where: {
          cart: { id: { equals: cartId } },
          shippingOption: { id: { equals: option.id } },
          result: { equals: "allow" },
          adultSignature: { equals: true },
          cartFingerprint: { equals: scope.cartFingerprint },
          destinationJurisdictionCode: { equals: scope.destinationJurisdictionCode },
          originJurisdictionCode: { equals: scope.originJurisdictionCode },
          expiresAt: { gt: now.toISOString() },
          providerApproval: {
            status: { equals: "active" },
            effectiveAt: { lte: now.toISOString() },
            expiresAt: { gt: now.toISOString() }
          }
        },
        take: 2,
        query: `cartFingerprint shippingOption { id } destinationJurisdictionCode originJurisdictionCode
        result adultSignature rateId packageDigest carrierCode serviceCode issuedAt expiresAt
        providerApproval { status effectiveAt expiresAt shippingProvider { id } }`
      });
      const currentDecisions = decisions.filter(
        (decision) => matchesCurrentCartCarrierDecision(decision, {
          cartFingerprint,
          shippingOptionId: option.id,
          destinationJurisdictionCode,
          originJurisdictionCode,
          now
        })
      );
      if (currentDecisions.length !== 1) throw new Error("A current approved carrier decision is required");
    }
    {
      const tx = context2;
      await assertCartAccess(tx, cartId);
      const transactionPrisma = tx.sudo().prisma;
      await transactionPrisma.shippingMethod.deleteMany({ where: { cartId } });
      await transactionPrisma.shippingMethod.create({
        data: {
          cartId,
          shippingOptionId: option.id,
          price,
          data: { name: option.name }
        }
      });
      await transactionPrisma.cart.update({
        where: { id: cartId },
        data: { paymentCollectionId: null }
      });
      await invalidateCartCompliance(tx, cartId, "SHIPPING_METHOD_CHANGED", true);
    }
    return sudo.query.Cart.findOne({
      where: { id: cartId },
      query: "id shippingMethods { id price data shippingOption { id name } }"
    });
  });
}
var addActiveCartShippingMethod_default = addActiveCartShippingMethod;

// features/keystone/queries/activeCartShippingOptions.ts
init_cart_access();
var READ_LIMIT = 100;
async function activeCartShippingOptions(_root, { cartId }, context) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        countries { iso2 }
        currency {
          code
          noDivisionCurrency
        }
      }
      shippingAddress {
        id
        country { iso2 }
      }
      lineItemsCount
      lineItems(take: ${READ_LIMIT}) { quantity productVariant { id } }
    `
  });
  if (!cart?.region?.id) return [];
  if (!Number.isSafeInteger(cart.lineItemsCount) || cart.lineItemsCount > READ_LIMIT || (cart.lineItems || []).length !== cart.lineItemsCount) return [];
  if (cart.shippingAddress?.country?.iso2 && !shippingDestinationWithinRegion(
    cart.region.countries?.map((country) => country.iso2),
    cart.shippingAddress.country.iso2
  )) return [];
  const subtotal = await calculateCartSubtotalMinorUnits(sudoContext, cart);
  const shippingOptionWhere = {
    AND: [
      { region: { id: { equals: cart.region.id } } },
      { isReturn: { equals: false } },
      { adminOnly: { equals: false } }
    ]
  };
  const shippingOptionCount = await sudoContext.query.ShippingOption.count({ where: shippingOptionWhere });
  if (shippingOptionCount > READ_LIMIT) return [];
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: shippingOptionWhere,
    take: READ_LIMIT,
    orderBy: [{ id: "asc" }],
    query: `
      id
      name
      amount
      priceType
      data
      shippingOptionRequirementsCount
      shippingOptionRequirements(take: ${READ_LIMIT}) {
        id
        type
        amount
      }
      taxRates {
        id
        rate
      }
    `
  });
  if (shippingOptions.length !== shippingOptionCount) return [];
  const compliance = await evaluateCartCompliance({
    context,
    cartId,
    purpose: "cart"
  });
  let permittedOptions = shippingOptions.filter(
    (option) => (
      // A truncated requirement set could hide a minimum-subtotal rule: exclude the option.
      (option.shippingOptionRequirements || []).length === option.shippingOptionRequirementsCount && shippingOptionCharge(option.priceType, option.amount) !== null && shippingSubtotalRequirementsMet(option.shippingOptionRequirements, subtotal)
    )
  );
  if (compliance.regulated) {
    if (compliance.decision?.result !== "allow") return [];
    const scope = compliance.carrierScope;
    if (!scope?.cartFingerprint || !scope.destinationJurisdictionCode || !scope.originJurisdictionCode) return [];
    const now = /* @__PURE__ */ new Date();
    const carrierDecisionWhere = {
      cart: { id: { equals: cartId } },
      result: { equals: "allow" },
      expiresAt: { gt: now.toISOString() },
      adultSignature: { equals: true },
      cartFingerprint: { equals: scope.cartFingerprint },
      destinationJurisdictionCode: { equals: scope.destinationJurisdictionCode },
      originJurisdictionCode: { equals: scope.originJurisdictionCode },
      providerApproval: {
        status: { equals: "active" },
        effectiveAt: { lte: now.toISOString() },
        expiresAt: { gt: now.toISOString() }
      }
    };
    const carrierDecisionCount = await sudoContext.query.CarrierEligibilityDecision.count({
      where: carrierDecisionWhere
    });
    if (carrierDecisionCount > READ_LIMIT) return [];
    const carrierDecisions = await sudoContext.query.CarrierEligibilityDecision.findMany({
      where: carrierDecisionWhere,
      take: READ_LIMIT,
      orderBy: [{ id: "asc" }],
      query: `cartFingerprint shippingOption { id } destinationJurisdictionCode originJurisdictionCode
        result adultSignature rateId packageDigest carrierCode serviceCode issuedAt expiresAt
        providerApproval { status effectiveAt expiresAt shippingProvider { id } }`
    });
    if (carrierDecisions.length !== carrierDecisionCount) return [];
    const validDecisionCounts = /* @__PURE__ */ new Map();
    for (const decision of carrierDecisions) {
      const optionId = decision.shippingOption?.id;
      if (typeof optionId === "string" && matchesCurrentCartCarrierDecision(decision, {
        cartFingerprint: scope.cartFingerprint,
        shippingOptionId: optionId,
        destinationJurisdictionCode: scope.destinationJurisdictionCode,
        originJurisdictionCode: scope.originJurisdictionCode,
        now
      })) validDecisionCounts.set(optionId, (validDecisionCounts.get(optionId) || 0) + 1);
    }
    permittedOptions = permittedOptions.filter((option) => validDecisionCounts.get(option.id) === 1);
  }
  const currencyCode = cart.region?.currency?.code || "USD";
  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
  return permittedOptions.map((option) => {
    const taxRate = option.taxRates?.[0]?.rate || 0;
    const baseAmount = shippingOptionCharge(option.priceType, option.amount);
    const calculatedAmount = baseAmount * (1 + taxRate);
    return {
      ...option,
      amount: baseAmount,
      calculatedAmount: formatAmount(calculatedAmount / divisor, currencyCode),
      isTaxInclusive: true
    };
  });
}
function formatAmount(amount, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}
var activeCartShippingOptions_default = activeCartShippingOptions;

// features/keystone/queries/activeCartPaymentProviders.ts
async function activeCartPaymentProviders(root, { regionId }, context, info) {
  if (!regionId) {
    throw new Error("Region ID is required");
  }
  if ((await releaseBlockers(context)).length) return [];
  const providers = await context.sudo().query.PaymentProvider.findMany({
    where: {
      isInstalled: { equals: true },
      regions: { some: { id: { equals: regionId } } }
    },
    query: `
      id
      name
      code
      isInstalled
    `
  });
  return providers.filter(
    (provider) => isPaymentProviderConfigured(provider.code || "")
  );
}
var activeCartPaymentProviders_default = activeCartPaymentProviders;

// features/keystone/queries/activeCartRegion.ts
async function activeCartRegion(_root, { countryCode }, context) {
  if (!/^[a-z]{2}$/i.test(countryCode)) return null;
  const sudoContext = context.sudo();
  const regions = await sudoContext.query.Region.findMany({
    take: 1,
    where: {
      countries: {
        some: {
          iso2: { equals: countryCode.toLowerCase() }
        }
      }
    },
    query: `
      id
      name
      currency {
        code
        noDivisionCurrency
      }
      countries {
        id
        name
        iso2
      }
      paymentProviders {
        id
        code
        isInstalled
      }
      shippingOptions {
        id
        name
        amount
        priceType
      }
    `
  });
  return regions[0] || null;
}
var activeCartRegion_default = activeCartRegion;

// features/keystone/mutations/initiatePaymentSession.ts
init_cart_access();
async function initiatePaymentSession(root, { cartId, paymentProviderId }, context) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      metadata
      shippingAddress { id country { iso2 } }
      billingAddress { id }
      lineItems { productVariant { product { productTags { id } } } }
      region {
        id
        taxRate
        paymentProviders { id }
        currency {
          code
          noDivisionCurrency
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          isSelected
          isInitiated
          amount
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.shippingAddress?.id || !cart.billingAddress?.id || cart.rawTotal <= 0) {
    throw new Error("A positive cart with billing and shipping addresses is required");
  }
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: `
      id 
      code 
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      credentials
    `
  });
  if (!provider || !provider.isInstalled || !isPaymentProviderConfigured(provider.code) || !cart.region.paymentProviders?.some((item) => item.id === provider.id)) {
    throw new Error("Payment provider not found, installed, and configured for this region");
  }
  const compliance = await requireAllowedCartCompliance({
    context,
    cartId,
    purpose: "payment",
    paymentProviderId: provider.id
  });
  if (compliance.regulated) {
    cart.rawTotal += await regulatedTaxAmountForCart(context, cartId, ["committed"]);
  }
  if (!cart.paymentCollection) {
    cart.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cart.id } },
        amount: cart.rawTotal,
        description: "default"
      },
      query: "id"
    });
  }
  const existingSession = cart.paymentCollection?.paymentSessions?.find(
    (session) => session.paymentProvider.code === paymentProviderId
  );
  if (existingSession?.isInitiated && existingSession.amount === cart.rawTotal && existingSession.data && Object.keys(existingSession.data).length) {
    await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: { isSelected: true }
      });
    });
    return { ...existingSession, isSelected: true };
  }
  if (existingSession) {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code
    });
    await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: {
          isSelected: true,
          isInitiated: true,
          amount: cart.rawTotal,
          data: sessionData
        }
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal }
      });
    });
    return { ...existingSession, amount: cart.rawTotal, data: sessionData, isInitiated: true };
  }
  try {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code
    });
    const newSession = await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal }
      });
      return tx.paymentSession.create({
        data: {
          paymentCollectionId: cart.paymentCollection.id,
          paymentProviderId: provider.id,
          amount: cart.rawTotal,
          isSelected: true,
          isInitiated: true,
          data: sessionData
        }
      });
    });
    return newSession;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw error;
  }
}
var initiatePaymentSession_default = initiatePaymentSession;

// features/keystone/orders/order-lifecycle.ts
async function reconcileOrderFulfillmentStatus(tx, orderId, { reason, actorId = null, paymentRecovered = false }) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      lineItems: { select: { id: true, quantity: true } },
      fulfillments: {
        where: { canceledAt: null },
        select: {
          fulfillmentItems: { select: { lineItemId: true, quantity: true } }
        }
      }
    }
  });
  if (!order) throw new Error("Order not found");
  const fulfilledByLine = /* @__PURE__ */ new Map();
  for (const fulfillment of order.fulfillments) {
    for (const item of fulfillment.fulfillmentItems) {
      if (!item.lineItemId) continue;
      fulfilledByLine.set(
        item.lineItemId,
        (fulfilledByLine.get(item.lineItemId) || 0) + item.quantity
      );
    }
  }
  const fullyFulfilled = order.lineItems.length > 0 && order.lineItems.every(
    (line) => (fulfilledByLine.get(line.id) || 0) >= line.quantity
  );
  let status = order.status;
  if (!["canceled", "archived"].includes(order.status)) {
    if (fullyFulfilled) {
      status = "completed";
    } else if (order.status === "completed" || paymentRecovered && order.status === "requires_action") {
      status = "pending";
    }
  }
  if (status !== order.status) {
    await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: {
          previousStatus: order.status,
          newStatus: status,
          reason,
          projection: "active_fulfillment_quantities"
        },
        ...actorId ? { userId: actorId, createdById: actorId } : {}
      }
    });
  }
  return { previousStatus: order.status, status, fullyFulfilled };
}

// features/keystone/mutations/handlePaymentProviderWebhook.ts
var NO_DIVISION_CURRENCIES2 = /* @__PURE__ */ new Set([
  "JPY",
  "KRW",
  "VND",
  "CLP",
  "PYG",
  "XAF",
  "XOF",
  "BIF",
  "DJF",
  "GNF",
  "KMF",
  "MGA",
  "RWF",
  "XPF",
  "HTG",
  "VUV",
  "XAG",
  "XDR",
  "XAU"
]);
function assertProviderAmount(providerCode, resource, payment) {
  const expectedCurrency = String(payment.currencyCode).toUpperCase();
  if (providerCode.includes("stripe")) {
    const amount = Number(resource.amount_received ?? resource.amount);
    if (amount !== payment.amount || String(resource.currency).toUpperCase() !== expectedCurrency) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
    return;
  }
  if (providerCode.includes("paypal")) {
    const evidence = resource.amount;
    const divisor = NO_DIVISION_CURRENCIES2.has(expectedCurrency) ? 1 : 100;
    if (!evidence || Number(evidence.value) !== payment.amount / divisor || String(evidence.currency_code).toUpperCase() !== expectedCurrency) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
  }
}
function normalizedHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? String(value[0] || "") : String(value || "")
    ])
  );
}
async function handlePaymentProviderWebhook(root, { providerId, event, headers }, context) {
  const sudo = context.sudo();
  const provider = await sudo.query.PaymentProvider.findOne({
    where: { id: providerId },
    query: `
      id code isInstalled handleWebhookFunction credentials
    `
  });
  if (!provider?.isInstalled) throw new Error("Payment provider not found");
  const verified = await handleWebhook({
    provider,
    event,
    headers: normalizedHeaders(headers)
  });
  const type = String(verified.type || "");
  const resource = verified.resource || {};
  const providerEventId = String(verified.event?.id || event?.id || resource.id || "");
  if (!providerEventId) throw new Error("Provider event ID is required");
  const dedupeKey = `provider-webhook:${provider.id}:${providerEventId}`;
  const existing = await sudo.prisma.idempotencyKey.findUnique({
    where: { idempotencyKey: dedupeKey }
  });
  if (existing?.recoveryPoint === "completed") {
    return { success: true, message: "Duplicate event acknowledged" };
  }
  let attempt = existing;
  if (attempt) {
    const acquired = await sudo.prisma.idempotencyKey.updateMany({
      where: {
        id: attempt.id,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
        ]
      },
      data: { lockedAt: /* @__PURE__ */ new Date() }
    });
    if (acquired.count !== 1) {
      throw new Error("Event is already being processed");
    }
  }
  if (!attempt) {
    try {
      attempt = await sudo.prisma.idempotencyKey.create({
        data: {
          idempotencyKey: dedupeKey,
          requestMethod: "POST",
          requestPath: "payment-provider-webhook",
          requestParams: { providerId: provider.id, providerEventId, type },
          recoveryPoint: "verified",
          lockedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      attempt = await sudo.prisma.idempotencyKey.findUnique({
        where: { idempotencyKey: dedupeKey }
      });
      if (attempt?.recoveryPoint === "completed") {
        return { success: true, message: "Duplicate event acknowledged" };
      }
      if (attempt) {
        throw new Error("Event is already being processed");
      }
      throw error;
    }
  }
  const succeeded = /payment_intent\.succeeded|PAYMENT\.CAPTURE\.COMPLETED/.test(type);
  const failed = /payment_intent\.payment_failed|PAYMENT\.CAPTURE\.DENIED/.test(type);
  const authorized = /payment_intent\.amount_capturable_updated|PAYMENT\.AUTHORIZATION\.CREATED/.test(type);
  const voided = /payment_intent\.canceled|PAYMENT\.AUTHORIZATION\.VOIDED/.test(type);
  const cartId = resource.metadata?.cartId || resource.custom_id;
  const explicitPaymentId = resource.metadata?.paymentId;
  let orderId = resource.metadata?.orderId;
  let paymentId = explicitPaymentId;
  let checkoutAttemptId;
  let checkoutPaymentResult;
  if (cartId && (!paymentId || !orderId)) {
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: `
        id rawTotal
        region { currency { code } }
        paymentCollection {
          paymentSessions { id amount data isSelected paymentProvider { id } }
        }
        order {
          id payments { id data paymentCollection { paymentSessions { isSelected paymentProvider { id } } } }
        }
      `
    });
    orderId ||= cart?.order?.id;
    paymentId ||= cart?.order?.payments?.find(
      (payment) => payment.paymentCollection?.paymentSessions?.some(
        (session) => session.isSelected && session.paymentProvider?.id === provider.id
      )
    )?.id;
    if (succeeded && !paymentId) {
      const selectedSession = cart?.paymentCollection?.paymentSessions?.find(
        (session) => session.isSelected && session.paymentProvider?.id === provider.id
      );
      if (selectedSession) {
        assertProviderAmount(provider.code, resource, {
          amount: selectedSession.amount,
          currencyCode: cart.region.currency.code
        });
        const checkoutAttempt = await sudo.prisma.idempotencyKey.findUnique({
          where: { idempotencyKey: `checkout:${cartId}` }
        });
        checkoutAttemptId = checkoutAttempt?.id;
        checkoutPaymentResult = {
          status: "succeeded",
          paymentIntentId: selectedSession.data?.paymentIntentId || selectedSession.data?.orderId || resource.id,
          amount: selectedSession.amount,
          currency: cart.region.currency.code,
          data: resource
        };
      }
    }
  }
  await sudo.prisma.$transaction(async (tx) => {
    if (succeeded && checkoutAttemptId && checkoutPaymentResult) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: {
          recoveryPoint: "payment_confirmed",
          responseBody: { paymentResult: checkoutPaymentResult },
          lockedAt: null
        }
      });
    }
    if (paymentId) {
      if (succeeded) {
        const currentPayment = await tx.payment.findUnique({
          where: { id: paymentId },
          select: { amount: true, currencyCode: true }
        });
        if (!currentPayment) throw new Error("Payment not found for provider event");
        assertProviderAmount(provider.code, resource, currentPayment);
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "captured",
            capturedAt: /* @__PURE__ */ new Date(),
            data: resource
          }
        });
        const captureExists = await tx.capture.findFirst({
          where: { paymentId, metadata: { path: ["providerEventId"], equals: providerEventId } }
        });
        if (!captureExists && currentPayment) {
          await tx.capture.create({
            data: {
              amount: currentPayment.amount,
              paymentId,
              metadata: { providerId: provider.id, providerEventId, resourceId: resource.id },
              createdBy: "provider-webhook"
            }
          });
        }
      } else if (failed) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "failed", data: resource }
        });
      } else if (authorized) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "authorized", data: resource }
        });
      } else if (voided) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "canceled", canceledAt: /* @__PURE__ */ new Date(), data: resource }
        });
      }
    }
    if (orderId) {
      if (succeeded) {
        await reconcileOrderFulfillmentStatus(tx, orderId, {
          reason: "payment_provider_capture_reconciled",
          paymentRecovered: true
        });
        await tx.orderEvent.create({
          data: {
            orderId,
            type: "PAYMENT_CAPTURED",
            data: { paymentId: paymentId || null, providerId: provider.id, providerEventId }
          }
        });
      } else if (failed || voided) {
        const currentOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true }
        });
        if (currentOrder && !["completed", "canceled", "archived"].includes(currentOrder.status)) {
          await tx.order.update({ where: { id: orderId }, data: { status: "requires_action" } });
          if (currentOrder.status !== "requires_action") {
            await tx.orderEvent.create({
              data: {
                orderId,
                type: "STATUS_CHANGE",
                data: {
                  previousStatus: currentOrder.status,
                  newStatus: "requires_action",
                  reason: failed ? "payment_provider_failed" : "payment_provider_voided",
                  providerEventId
                }
              }
            });
          }
        }
      }
    }
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerEventId, type, paymentId: paymentId || null, orderId: orderId || null },
        lockedAt: null
      }
    });
  });
  return {
    success: true,
    message: paymentId || orderId ? "Provider event reconciled" : "Provider event recorded for manual reconciliation"
  };
}
var handlePaymentProviderWebhook_default = handlePaymentProviderWebhook;

// features/keystone/security/customer-order-access.ts
function hasCustomerOrderCredential(sessionUserId, secretKey) {
  return Boolean(sessionUserId || secretKey);
}
function canReadCustomerOrder(order, sessionUserId, secretKey) {
  if (!order) return false;
  if (secretKey) return Boolean(order.secretKey && order.secretKey === secretKey);
  return Boolean(sessionUserId && order.userId === sessionUserId);
}

// features/keystone/mutations/getCustomerOrder.ts
async function getCustomerOrder(root, { orderId, secretKey }, context) {
  if (!hasCustomerOrderCredential(context.session?.itemId, secretKey)) {
    throw new Error("Order not found");
  }
  const sudoContext = context.sudo();
  const order = await sudoContext.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      secretKey
      displayId
      status
      fulfillmentStatus
      fulfillmentDetails
      paymentDetails
      total
      formattedTotalPaid
      subtotal
      shipping
      discount
      tax
      createdAt
      email
      unfulfilled
      fulfillments {
        id
        createdAt
        canceledAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            quantity
            title
            sku
            thumbnail
            metadata
            variantTitle
            formattedUnitPrice
            formattedTotal
            productData
            variantData
          }
        }
        shippingLabels {
          id
          labelUrl
          trackingNumber
          trackingUrl
          carrier
        }
      }
      user {
        id
        name
        email
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      billingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
        }
      }
      payments {
        id
        amount
        status
        createdAt
        paymentCollection {
          paymentSessions {
            id
            isSelected
            paymentProvider {
              id
              code
            }
          }
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
        variantTitle
        formattedUnitPrice
        formattedTotal
        variantData
        productData
      }
      region {
        id
        name
        currency {
          code
        }
      }
    `
  });
  if (!canReadCustomerOrder(
    order ? { userId: order.user?.id, secretKey: order.secretKey } : null,
    context.session?.itemId,
    secretKey
  )) {
    throw new Error("Order not found");
  }
  return order;
}
var getCustomerOrder_default = getCustomerOrder;

// features/keystone/mutations/getCustomerOrders.ts
async function getCustomerOrders(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const orders = await sudoContext.query.Order.findMany({
    where: {
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit ?? 10, 1), 100),
    skip: Math.max(offset ?? 0, 0),
    query: `
      id
      displayId
      status
      fulfillmentStatus
      total
      formattedTotalPaid
      createdAt
      shippingAddress {
        country {
          id
          iso2
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
      }
      region {
        id
        currency {
          code
        }
      }
    `
  });
  return orders;
}
var getCustomerOrders_default = getCustomerOrders;

// features/keystone/mutations/getAnalytics.ts
init_access();
var displayAmount = (value) => Number.parseFloat((value || "0").replace(/[^0-9.-]/g, "")) || 0;
async function getAnalytics(_root, { timeframe = "7d" }, context) {
  if (!context.session?.itemId || !permissions.canReadOrders({ session: context.session }) || !permissions.canReadProducts({ session: context.session })) {
    throw new Error("Access denied");
  }
  const allowedTimeframes = /* @__PURE__ */ new Set(["24h", "7d", "30d", "90d"]);
  if (!allowedTimeframes.has(timeframe)) throw new Error("Invalid timeframe");
  const endDate = /* @__PURE__ */ new Date();
  const startDate = /* @__PURE__ */ new Date();
  switch (timeframe) {
    case "24h":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  const sudoContext = context.sudo();
  const orders = (await sudoContext.query.Order.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      status
      fulfillmentStatus
      createdAt
      user {
        id
      }
      total
      subtotal
      shipping
      tax
      discount
      lineItems {
        id
        quantity
        title
        variantData
        productData
        moneyAmount {
          amount
        }
      }
      payments {
        id
        amount
        status
      }
      returns {
        id
        status
        refundAmount
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
          fulfillmentProvider {
            id
          }
        }
      }
    `
  })).map((row) => row);
  const salesMetrics = orders.reduce((acc, order) => {
    const total = displayAmount(order.total);
    const subtotal = displayAmount(order.subtotal);
    const shipping = displayAmount(order.shipping);
    const tax = displayAmount(order.tax);
    const discount = displayAmount(order.discount);
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;
    acc.total += total;
    acc.subtotal += subtotal;
    acc.shipping += shipping;
    acc.tax += tax;
    acc.discount += discount;
    acc.refunds += refunds;
    acc.count += 1;
    return acc;
  }, { total: 0, subtotal: 0, shipping: 0, tax: 0, discount: 0, refunds: 0, count: 0 });
  salesMetrics.averageOrderValue = salesMetrics.count > 0 ? salesMetrics.total / salesMetrics.count : 0;
  const ordersByDay = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        refunds: 0,
        count: 0
      };
    }
    const total = displayAmount(order.total);
    const subtotal = displayAmount(order.subtotal);
    const shipping = displayAmount(order.shipping);
    const tax = displayAmount(order.tax);
    const discount = displayAmount(order.discount);
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;
    acc[date].total += total;
    acc[date].subtotal += subtotal;
    acc[date].shipping += shipping;
    acc[date].tax += tax;
    acc[date].discount += discount;
    acc[date].refunds += refunds;
    acc[date].count += 1;
    return acc;
  }, {});
  const orderTimeline = Object.entries(ordersByDay).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => a.date.localeCompare(b.date));
  const products = (await sudoContext.query.Product.findMany({
    query: `
      id
      title
      status
      productVariants {
        id
        title
        inventoryQuantity
        prices {
          amount
          currency {
            code
          }
        }
      }
    `
  })).map((row) => row);
  const inventoryMetrics = products.reduce((acc, product) => {
    const variants = product.productVariants || [];
    const isOutOfStock = variants.every((v) => v.inventoryQuantity === 0);
    const isLowStock = variants.some((v) => v.inventoryQuantity > 0 && v.inventoryQuantity < 10);
    const totalValue = variants.reduce((sum, v) => {
      const price = v.prices?.[0]?.amount || 0;
      return sum + v.inventoryQuantity * price;
    }, 0);
    if (isOutOfStock) acc.outOfStock += 1;
    if (isLowStock) acc.lowStock += 1;
    acc.total += 1;
    acc.totalValue += totalValue;
    acc.totalStock += variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    return acc;
  }, { total: 0, outOfStock: 0, lowStock: 0, totalValue: 0, totalStock: 0 });
  const productMetrics = {};
  orders.forEach((order) => {
    order.lineItems?.forEach((item) => {
      const productId = item.productData?.id;
      const productTitle = item.productData?.title;
      if (!productId) return;
      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          id: productId,
          title: productTitle,
          status: item.productData?.status,
          quantity: 0,
          revenue: 0,
          orders: /* @__PURE__ */ new Set()
        };
      }
      productMetrics[productId].quantity += item.quantity;
      productMetrics[productId].revenue += item.quantity * (item.moneyAmount?.amount || 0);
      productMetrics[productId].orders.add(order.id);
    });
  });
  const topProducts = Object.values(productMetrics).map((p) => ({
    ...p,
    orderCount: p.orders.size,
    averageOrderValue: p.revenue / p.orders.size
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const users = (await sudoContext.query.User.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      createdAt
      orders {
        id
        total
        createdAt
      }
    `
  })).map((row) => row);
  const totalUsers = await sudoContext.query.User.count();
  const newUsers = users.length;
  const customerMetrics = users.reduce((acc, user) => {
    const userOrders = user.orders || [];
    if (userOrders.length > 0) {
      acc.activeUsers += 1;
      acc.totalRevenue += userOrders.reduce((sum, order) => sum + displayAmount(order.total), 0);
    }
    return acc;
  }, { activeUsers: 0, totalRevenue: 0 });
  const shippingMetrics = orders.reduce((acc, order) => {
    order.shippingMethods?.forEach((method) => {
      const provider = method.shippingOption?.fulfillmentProvider?.id;
      const name = method.shippingOption?.name;
      if (provider && name) {
        const key = `${provider}-${name}`;
        if (!acc.methods[key]) {
          acc.methods[key] = {
            provider,
            name,
            count: 0,
            total: 0
          };
        }
        acc.methods[key].count += 1;
        acc.methods[key].total += method.price;
      }
    });
    return acc;
  }, { methods: {} });
  return {
    sales: {
      total: salesMetrics.total,
      subtotal: salesMetrics.subtotal,
      shipping: salesMetrics.shipping,
      tax: salesMetrics.tax,
      discount: salesMetrics.discount,
      refunds: salesMetrics.refunds,
      count: salesMetrics.count,
      averageOrderValue: salesMetrics.averageOrderValue,
      timeline: orderTimeline
    },
    inventory: {
      total: inventoryMetrics.total,
      outOfStock: inventoryMetrics.outOfStock,
      lowStock: inventoryMetrics.lowStock,
      totalValue: inventoryMetrics.totalValue,
      totalStock: inventoryMetrics.totalStock,
      topProducts
    },
    customers: {
      total: totalUsers,
      new: newUsers,
      active: customerMetrics.activeUsers,
      averageLifetimeValue: totalUsers > 0 ? customerMetrics.totalRevenue / totalUsers : 0,
      timeline: orderTimeline.map((day) => ({
        date: day.date,
        newUsers: users.filter((u) => u.createdAt.split("T")[0] === day.date).length
      }))
    },
    orders: {
      total: salesMetrics.count,
      byStatus: orders.reduce((acc, order) => {
        const status = order.status?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byFulfillmentStatus: orders.reduce((acc, order) => {
        const status = order.fulfillmentStatus?.status?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byPaymentStatus: orders.reduce((acc, order) => {
        const status = order.payments?.at(-1)?.status?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      timeline: orderTimeline
    },
    shipping: {
      total: salesMetrics.shipping,
      methods: Object.values(shippingMetrics.methods).sort((a, b) => b.count - a.count)
    }
  };
}
var getAnalytics_default = getAnalytics;

// features/keystone/mutations/importInventory.ts
async function importInventory(_root, _args, _context) {
  throw new Error("Select and validate a file through the inventory import workflow");
}

// features/keystone/mutations/adjustInventory.ts
init_access();
async function adjustInventory(root, { variantId, delta, reason, note }, context) {
  if (!permissions.canManageProducts({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!variantId || !Number.isInteger(delta) || delta === 0) {
    throw new Error("A non-zero integer inventory delta is required");
  }
  if (!reason?.trim()) throw new Error("Inventory adjustment reason is required");
  await context.sudo().prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, inventoryQuantity: true, allowBackorder: true }
    });
    if (!variant) throw new Error("Product variant not found");
    const adjusted = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        ...delta < 0 && !variant.allowBackorder ? { inventoryQuantity: { gte: Math.abs(delta) } } : {}
      },
      data: { inventoryQuantity: { increment: delta } }
    });
    if (adjusted.count !== 1) {
      throw new Error("Inventory adjustment would make stock negative");
    }
    await tx.stockMovement.create({
      data: {
        type: delta > 0 ? "RECEIVE" : "REMOVE",
        quantity: Math.abs(delta),
        reason: reason.trim(),
        note: note?.trim() || "",
        variantId
      }
    });
  });
  return context.query.ProductVariant.findOne({
    where: { id: variantId },
    query: "id title sku inventoryQuantity"
  });
}
var adjustInventory_default = adjustInventory;

// import("../../integrations/shipping/**/*.ts") in features/keystone/utils/shippingProviderAdapter.ts
var globImport_integrations_shipping_ts = __glob({
  "../../integrations/shipping/index.ts": () => Promise.resolve().then(() => (init_shipping(), shipping_exports)),
  "../../integrations/shipping/manual.ts": () => Promise.resolve().then(() => (init_manual2(), manual_exports2)),
  "../../integrations/shipping/shipengine.ts": () => Promise.resolve().then(() => (init_shipengine(), shipengine_exports)),
  "../../integrations/shipping/shippo.ts": () => Promise.resolve().then(() => (init_shippo(), shippo_exports)),
  "../../integrations/shipping/types.ts": () => Promise.resolve().then(() => (init_types(), types_exports))
});

// features/keystone/utils/shippingProviderAdapter.ts
async function executeAdapterFunction2({
  provider,
  functionName,
  args
}) {
  const functionPath = provider[functionName];
  if (functionPath.startsWith("http")) {
    const response = await fetch(functionPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...args })
    });
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.statusText}`);
    }
    return response.json();
  }
  const adapter = await globImport_integrations_shipping_ts(`../../integrations/shipping/${functionPath}.ts`);
  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }
  try {
    return await fn({ provider, ...args });
  } catch (error) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}
async function createLabel({ provider, order, rateId, dimensions, lineItems, idempotencyKey }) {
  return executeAdapterFunction2({
    provider,
    functionName: "createLabelFunction",
    args: { order, rateId, dimensions, lineItems, idempotencyKey }
  });
}
async function getRates({ provider, order, dimensions }) {
  return executeAdapterFunction2({
    provider,
    functionName: "getRatesFunction",
    args: { order, dimensions }
  });
}
async function validateAddress({ provider, address }) {
  return executeAdapterFunction2({
    provider,
    functionName: "validateAddressFunction",
    args: { address }
  });
}
async function trackShipment({ provider, trackingNumber }) {
  return executeAdapterFunction2({
    provider,
    functionName: "trackShipmentFunction",
    args: { trackingNumber }
  });
}
async function cancelLabel({ provider, labelId }) {
  return executeAdapterFunction2({
    provider,
    functionName: "cancelLabelFunction",
    args: { labelId }
  });
}

// features/keystone/mutations/getRatesForOrder.ts
init_access();
async function getRatesForOrder(root, { orderId, providerId, dimensions }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to get shipping rates"
    );
  }
  const sudoContext = context.sudo();
  try {
    const [order, provider] = await Promise.all([
      sudoContext.query.Order.findOne({
        where: { id: orderId },
        query: `
          id
          cart { id }
          shippingAddress {
            firstName
            lastName
            company
            address1
            address2
            city
            province
            postalCode
            country {
              iso2
            }
            phone
          }
          lineItems {
            id
            quantity
            variantData
          }
        `
      }),
      sudoContext.query.ShippingProvider.findOne({
        where: { id: providerId },
        query: `
          id
          name
          accessToken
          getRatesFunction
          isActive
          fromAddress {
            firstName
            lastName
            company
            address1
            address2
            city
            province
            postalCode
            country {
              iso2
            }
            phone
          }
        `
      })
    ]);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    if (!provider) {
      throw new Error(`Shipping provider not found: ${providerId}`);
    }
    if (!provider.isActive) {
      throw new Error(`Shipping provider ${provider.id} is not active`);
    }
    if (!provider.accessToken) {
      throw new Error(`Shipping provider ${provider.id} has no access token configured`);
    }
    let regulatedOrder = false;
    let approvedRateId = null;
    if (order.cart?.id) {
      const carrierAuthorization = await requireApprovedCarrierProvider(context, order.cart.id, orderId, provider.id);
      regulatedOrder = carrierAuthorization.regulated;
      approvedRateId = carrierAuthorization.carrierEvidence?.rateId ?? null;
    }
    let packageDimensions = dimensions;
    if (!packageDimensions) {
      let maxLength = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      let totalWeight = 0;
      let hasDimensions = false;
      let weightUnit = null;
      let dimensionUnit = null;
      order.lineItems.forEach((item) => {
        const variant = item.variantData;
        if (variant?.measurements?.length) {
          hasDimensions = true;
          variant.measurements.forEach((measurement) => {
            const { type, value, unit } = measurement;
            switch (type) {
              case "weight":
                totalWeight += value * item.quantity;
                weightUnit = unit;
                break;
              case "length":
                maxLength = Math.max(maxLength, value);
                dimensionUnit = unit;
                break;
              case "width":
                maxWidth = Math.max(maxWidth, value);
                dimensionUnit = unit;
                break;
              case "height":
                maxHeight = Math.max(maxHeight, value);
                dimensionUnit = unit;
                break;
            }
          });
        }
      });
      if (!hasDimensions) {
        throw new Error("No dimensions found for line items. Dimensions must be provided to get shipping rates.");
      }
      packageDimensions = {
        length: maxLength,
        width: maxWidth,
        height: maxHeight,
        weight: totalWeight,
        unit: dimensionUnit || "cm",
        // Default unit
        weightUnit: weightUnit || "kg"
        // Default weight unit
      };
    }
    const rates = await getRates({
      provider: {
        ...provider,
        accessToken: provider.accessToken
      },
      order,
      dimensions: packageDimensions
    });
    const visibleRates = regulatedOrder ? selectExactApprovedCarrierRate(rates, approvedRateId) : Array.isArray(rates) ? rates : [];
    return visibleRates.map((rate) => ({
      id: rate.id,
      provider: provider.name,
      service: rate.service,
      carrier: rate.carrier,
      price: rate.price,
      estimatedDays: rate.estimatedDays
    }));
  } catch (error) {
    console.error("Getting shipping rates failed:", error);
    throw error;
  }
}
var getRatesForOrder_default = getRatesForOrder;

// features/keystone/mutations/validateShippingAddress.ts
init_access();
async function validateShippingAddress(root, { providerId, address }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to validate shipping addresses"
    );
  }
  if (!address || typeof address !== "object" || Array.isArray(address)) throw new Error("Address is required");
  const provider = await context.query.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      validateAddressFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  return validateAddress({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    address
  });
}
var validateShippingAddress_default = validateShippingAddress;

// features/keystone/mutations/trackShipment.ts
init_access();
async function trackShipment2(root, { providerId, trackingNumber }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to track shipments"
    );
  }
  const provider = await context.query.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      trackShipmentFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  return trackShipment({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    trackingNumber
  });
}
var trackShipment_default = trackShipment2;

// features/keystone/mutations/cancelShippingLabel.ts
init_access();
async function cancelShippingLabel(root, { providerId, labelId }, context) {
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to cancel shipping labels"
    );
  }
  const sudo = context.sudo();
  const localLabel = await sudo.query.ShippingLabel.findOne({
    where: { id: labelId },
    query: "id data metadata provider { id }"
  });
  if (!localLabel || localLabel.provider?.id !== providerId) {
    throw new Error("Shipping label not found");
  }
  const provider = await sudo.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      cancelLabelFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  const labelData = localLabel.data;
  const providerLabelId = labelData?.label_id || labelData?.object_id || labelData?.id;
  if (!providerLabelId) throw new Error("Provider label reference is missing");
  const result = await cancelLabel({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    labelId: providerLabelId
  });
  await sudo.query.ShippingLabel.updateOne({
    where: { id: labelId },
    data: {
      metadata: {
        ...localLabel.metadata || {},
        cancellation: {
          status: result?.success && (!result?.refundStatus || result.refundStatus === "SUCCESS") ? "confirmed" : result?.success ? "pending" : "unknown",
          refundStatus: result?.refundStatus || null,
          canceledById: context.session.itemId,
          recordedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    }
  });
  return result;
}
var cancelShippingLabel_default = cancelShippingLabel;

// features/keystone/mutations/createProviderShippingLabel.ts
init_access();

// features/keystone/mutations/createOrderFulfillment.ts
var import_node_crypto5 = __toESM(require("node:crypto"));
init_access();
function trackingUrl(carrier, number) {
  const value = encodeURIComponent(number);
  switch (carrier.toLowerCase()) {
    case "ups":
      return `https://www.ups.com/track?tracknum=${value}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${value}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${value}`;
    case "dhl":
      return `https://www.dhl.com/en/express/tracking.html?AWB=${value}`;
    default:
      return "";
  }
}
async function createOrderFulfillment(root, {
  orderId,
  lineItems,
  trackingNumber,
  carrier,
  noNotification = false,
  idempotencyKey,
  deferWebhookDelivery = false,
  suppressWebhookEnqueue = false,
  deferLifecycleProjection = false,
  approvedShippingProviderId
}, context) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!Array.isArray(lineItems) || !lineItems.length) throw new Error("Line items are required");
  const requested = /* @__PURE__ */ new Map();
  for (const item of lineItems) {
    if (!item?.lineItemId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Fulfillment quantities must be positive integers");
    }
    requested.set(item.lineItemId, (requested.get(item.lineItemId) || 0) + item.quantity);
  }
  if (Boolean(trackingNumber) !== Boolean(carrier)) {
    throw new Error("Carrier and tracking number must be provided together");
  }
  const normalized = [...requested.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (!idempotencyKey?.trim()) throw new Error("Fulfillment idempotency key is required");
  const normalizedIdempotencyKey = idempotencyKey.trim();
  const isIntegrationTrackingRelay = normalizedIdempotencyKey.startsWith("openship-tracking:");
  const businessKey = `fulfillment:${orderId}:${import_node_crypto5.default.createHash("sha256").update(normalizedIdempotencyKey).digest("hex")}`;
  const sudo = context.sudo();
  const orderIdentity = await sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id user { id } cart { id }"
  });
  if (!orderIdentity) throw new Error("Order not found");
  if (orderIdentity.cart?.id) {
    const compliance = await requireAllowedCartCompliance({
      context,
      cartId: orderIdentity.cart.id,
      purpose: "fulfillment"
    });
    if (compliance.regulated) {
      if (!approvedShippingProviderId) {
        throw new Error("Manual fulfillment is disabled for regulated orders; purchase through an approved carrier provider");
      }
      await requireApprovedCarrierProvider(context, orderIdentity.cart.id, orderId, approvedShippingProviderId);
    }
  }
  const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "fulfillment.created",
    orderIdentity.user?.id
  );
  const fulfillmentResult = await sudo.prisma.$transaction(async (tx) => {
    const existing = await tx.fulfillment.findFirst({
      where: { idempotencyKey: businessKey, canceledAt: null },
      select: { id: true }
    });
    if (existing) return { fulfillmentId: existing.id, webhookEventIds: [] };
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });
    if (!order || !["pending", "completed"].includes(order.status)) {
      throw new Error("Order is not fulfillable");
    }
    const orderLines = await tx.orderLineItem.findMany({
      where: { orderId, id: { in: normalized.map(([id2]) => id2) } },
      select: { id: true, quantity: true, metadata: true }
    });
    if (orderLines.length !== normalized.length) throw new Error("Order line item not found");
    const fulfilled = await tx.fulfillmentItem.groupBy({
      by: ["lineItemId"],
      where: { lineItemId: { in: normalized.map(([id2]) => id2) }, fulfillment: { canceledAt: null } },
      _sum: { quantity: true }
    });
    const fulfilledByLine = new Map(
      fulfilled.map(
        (item) => [item.lineItemId, item._sum.quantity || 0]
      )
    );
    for (const line of orderLines) {
      const quantity = requested.get(line.id);
      if (quantity > line.quantity - (fulfilledByLine.get(line.id) || 0)) {
        throw new Error(`Fulfillment exceeds remaining quantity for line ${line.id}`);
      }
    }
    const orderLinesById = new Map(
      orderLines.map((line) => [line.id, line])
    );
    const webhookLineItems = normalized.map(([lineItemId, quantity]) => {
      const metadata = orderLinesById.get(lineItemId)?.metadata;
      const cartItemId = String(metadata?.openshipCartItemId || "").trim();
      return {
        lineItemId,
        quantity,
        ...cartItemId ? { cartItemId } : {}
      };
    });
    const fulfillmentProvider = await tx.fulfillmentProvider.findUnique({
      where: { code: "fp_manual" },
      select: { id: true }
    });
    if (!fulfillmentProvider) throw new Error("Manual fulfillment provider is not configured");
    const fulfillment = await tx.fulfillment.create({
      data: {
        orderId,
        fulfillmentProviderId: fulfillmentProvider.id,
        idempotencyKey: businessKey,
        noNotification,
        metadata: {
          source: isIntegrationTrackingRelay ? "openship-tracking-relay" : "operator-command",
          createdById: context.session.itemId
        },
        fulfillmentItems: {
          create: normalized.map(([lineItemId, quantity]) => ({
            quantity,
            lineItem: { connect: { id: lineItemId } }
          }))
        },
        ...trackingNumber && carrier ? {
          shippingLabels: {
            create: {
              status: "created",
              carrier,
              trackingNumber,
              trackingUrl: trackingUrl(carrier, trackingNumber),
              order: { connect: { id: orderId } },
              metadata: { source: "operator-command" }
            }
          }
        } : {}
      }
    });
    const webhookEventIds = isIntegrationTrackingRelay || suppressWebhookEnqueue ? [] : await enqueueWebhookOutbox(
      tx,
      fulfillmentWebhookEndpointIds,
      "fulfillment.created",
      "Fulfillment",
      fulfillment.id,
      {
        id: fulfillment.id,
        orderId,
        order: { id: orderId },
        lineItems: webhookLineItems,
        trackingNumber: trackingNumber || null,
        trackingCompany: carrier || null
      }
    );
    if (!noNotification) {
      await tx.notification.create({
        data: {
          eventName: "FULFILLMENT_CREATED",
          resourceType: "Fulfillment",
          resourceId: fulfillment.id,
          to: "notification-operations",
          data: { orderId, fulfillmentId: fulfillment.id, status: "pending_delivery" }
        }
      });
    }
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: {
          fulfillmentId: fulfillment.id,
          action: "created",
          lineItems: normalized,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null
        },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    if (trackingNumber && carrier) {
      await tx.orderEvent.create({
        data: {
          orderId,
          type: "TRACKING_NUMBER_ADDED",
          data: {
            shippingLabels: [{ number: trackingNumber, url: trackingUrl(carrier, trackingNumber), carrier }],
            fulfillmentId: fulfillment.id
          },
          userId: context.session.itemId,
          createdById: context.session.itemId
        }
      });
    }
    if (!deferLifecycleProjection) {
      await reconcileOrderFulfillmentStatus(tx, orderId, {
        reason: "fulfillment_created",
        actorId: context.session.itemId
      });
    }
    return { fulfillmentId: fulfillment.id, webhookEventIds };
  }, { isolationLevel: "Serializable" });
  if (!deferWebhookDelivery && fulfillmentResult.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, fulfillmentResult.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate fulfillment webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  return sudo.query.Fulfillment.findOne({
    where: { id: fulfillmentResult.fulfillmentId },
    query: "id idempotencyKey fulfillmentItems { id quantity lineItem { id } } shippingLabels { id status trackingNumber trackingUrl carrier }"
  });
}
var createOrderFulfillment_default = createOrderFulfillment;

// features/keystone/mutations/createProviderShippingLabel.ts
async function createProviderShippingLabel(root, { orderId, providerId, rateId, dimensions, lineItems, idempotencyKey }, context) {
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to create shipping labels");
  }
  const sudo = context.sudo();
  const order = await sudo.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      cart { id }
      user { id }
      lineItems {
        id
        quantity
        metadata
      }
      fulfillments {
        canceledAt
        fulfillmentItems {
          quantity
          lineItem {
            id
          }
        }
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          iso2
        }
        phone
      }
    `
  });
  if (!order?.lineItems) {
    throw new Error("Order not found or has no line items");
  }
  if (!lineItems?.length) {
    throw new Error("No items to fulfill");
  }
  const unfulfilledQuantities = {};
  order.lineItems.forEach((item) => {
    unfulfilledQuantities[item.id] = item.quantity;
  });
  order.fulfillments?.forEach((fulfillment2) => {
    if (fulfillment2.canceledAt) {
      return;
    }
    fulfillment2.fulfillmentItems?.forEach((item) => {
      unfulfilledQuantities[item.lineItem.id] -= item.quantity;
    });
  });
  for (const item of lineItems) {
    const availableQuantity = unfulfilledQuantities[item.lineItemId] || 0;
    if (availableQuantity <= 0) {
      throw new Error(`Line item ${item.lineItemId} has no unfulfilled quantity`);
    }
    if (item.quantity > availableQuantity) {
      throw new Error(`Cannot fulfill more than ${availableQuantity} items for line item ${item.lineItemId}`);
    }
  }
  const provider = await sudo.query.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
        id
        name
        createLabelFunction
        accessToken
        isActive
        fromAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          postalCode
          country {
            iso2
          }
          phone
        }
      `
  });
  if (!provider) {
    throw new Error(`Shipping provider not found: ${providerId}`);
  }
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  if (order.cart?.id) {
    await requireApprovedCarrierProvider(context, order.cart.id, orderId, provider.id, { rateId, packageDigest: evidenceDigest({ dimensions, lineItems }) });
  }
  const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "fulfillment.created",
    order.user?.id
  );
  const fulfillment = await createOrderFulfillment_default(
    null,
    {
      orderId,
      lineItems,
      noNotification: true,
      idempotencyKey,
      deferWebhookDelivery: true,
      suppressWebhookEnqueue: true,
      deferLifecycleProjection: true,
      approvedShippingProviderId: provider.id
    },
    context
  );
  const existingLabel = fulfillment.shippingLabels?.[0];
  if (existingLabel) return existingLabel;
  let labelData;
  try {
    labelData = await createLabel({
      provider,
      order,
      rateId,
      dimensions,
      lineItems,
      idempotencyKey
    });
  } catch (error) {
    await sudo.prisma.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        metadata: {
          source: "provider-command",
          labelStatus: "unknown",
          providerId,
          rateId,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
    throw new Error(
      `Label outcome is unknown; fulfillment ${fulfillment.id} remains reserved for reconciliation`
    );
  }
  const finalized = await sudo.prisma.$transaction(async (tx) => {
    const label = await tx.shippingLabel.create({
      data: {
        status: "purchased",
        providerId,
        fulfillmentId: fulfillment.id,
        orderId,
        labelUrl: labelData.labelUrl,
        carrier: labelData.carrier,
        service: labelData.service,
        trackingNumber: labelData.trackingNumber,
        trackingUrl: labelData.trackingUrl,
        rate: labelData.rate,
        data: labelData.data,
        metadata: { rateId, source: "provider-command" }
      }
    });
    await tx.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        metadata: {
          source: "provider-command",
          labelStatus: "purchased",
          providerId,
          rateId
        }
      }
    });
    if (labelData.trackingNumber) {
      await tx.orderEvent.create({
        data: {
          orderId,
          type: "TRACKING_NUMBER_ADDED",
          data: {
            shippingLabels: [{ number: labelData.trackingNumber, url: labelData.trackingUrl ?? null, carrier: labelData.carrier ?? null }],
            fulfillmentId: fulfillment.id
          },
          userId: context.session.itemId,
          createdById: context.session.itemId
        }
      });
    }
    await reconcileOrderFulfillmentStatus(tx, orderId, {
      reason: "provider_shipping_label_purchased",
      actorId: context.session.itemId
    });
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      fulfillmentWebhookEndpointIds,
      "fulfillment.created",
      "Fulfillment",
      fulfillment.id,
      {
        id: fulfillment.id,
        orderId,
        order: { id: orderId },
        lineItems: lineItems.map((item) => {
          const sourceLine = order.lineItems.find((line) => line.id === item.lineItemId);
          const cartItemId = String(sourceLine?.metadata?.openshipCartItemId || "").trim();
          return {
            lineItemId: item.lineItemId,
            quantity: item.quantity,
            ...cartItemId ? { cartItemId } : {}
          };
        }),
        trackingNumber: labelData.trackingNumber || null,
        trackingCompany: labelData.carrier || null
      }
    );
    return { label, webhookEventIds };
  });
  if (finalized.webhookEventIds.length) {
    await deliverWebhookEventsById(sudo, finalized.webhookEventIds);
  }
  return finalized.label;
}
var createProviderShippingLabel_default = createProviderShippingLabel;

// features/keystone/mutations/cancelOrderFulfillment.ts
init_access();
async function cancelOrderFulfillment(root, { fulfillmentId, reason }, context) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!reason?.trim()) throw new Error("Cancellation reason is required");
  const sudo = context.sudo();
  const endpointIds = await subscribedWebhookEndpointIds(sudo, "fulfillment.canceled");
  const result = await sudo.prisma.$transaction(async (tx) => {
    const current = await tx.fulfillment.findUnique({
      where: { id: fulfillmentId },
      select: {
        id: true,
        orderId: true,
        canceledAt: true,
        metadata: true,
        shippingLabels: { select: { id: true, metadata: true, providerId: true } }
      }
    });
    if (!current) throw new Error("Fulfillment not found");
    if (current.canceledAt) return current;
    if (current.shippingLabels.some(
      (label) => label.providerId && label.metadata?.cancellation?.status !== "confirmed"
    )) {
      throw new Error("Cancel the purchased shipping label before canceling fulfillment");
    }
    const canceled = await tx.fulfillment.update({
      where: { id: fulfillmentId },
      data: {
        canceledAt: /* @__PURE__ */ new Date(),
        metadata: {
          ...current.metadata || {},
          cancellationReason: reason.trim(),
          canceledById: context.session.itemId
        }
      }
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      "fulfillment.canceled",
      "Fulfillment",
      fulfillmentId,
      { id: fulfillmentId, orderId: current.orderId, reason: reason.trim() }
    );
    await tx.orderEvent.create({
      data: {
        orderId: current.orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: { fulfillmentId, action: "canceled", reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    await reconcileOrderFulfillmentStatus(tx, current.orderId, {
      reason: "fulfillment_canceled",
      actorId: context.session.itemId
    });
    return canceled;
  });
  return { id: result.id, canceledAt: result.canceledAt };
}
var cancelOrderFulfillment_default = cancelOrderFulfillment;

// features/keystone/mutations/transitionOrderStatus.ts
init_access();
async function transitionOrderStatus(root, { orderId, status, reason }, context) {
  if (!permissions.canManageOrders({ session: context.session })) throw new Error("Access denied");
  if (!reason?.trim()) throw new Error("Transition reason is required");
  if (!["canceled", "archived"].includes(status)) {
    throw new Error("Order status is controlled by payment and fulfillment commands");
  }
  const sudo = context.sudo();
  const endpointIds = await subscribedWebhookEndpointIds(sudo, `order.${status}`);
  await sudo.prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          select: { amount: true, amountRefunded: true, refunds: { select: { amount: true } } }
        },
        fulfillments: { where: { canceledAt: null }, select: { id: true } },
        accountLineItems: {
          select: {
            id: true,
            accountId: true,
            amount: true,
            paymentStatus: true,
            invoiceLineItems: { select: { id: true } }
          }
        },
        discounts: { select: { id: true } },
        lineItems: {
          select: {
            quantity: true,
            productVariant: {
              select: { id: true, manageInventory: true }
            }
          }
        }
      }
    });
    if (!order) throw new Error("Order not found");
    if (order.status === status) return;
    if (status === "archived") {
      if (order.status !== "completed") throw new Error("Only completed orders can be archived");
    } else {
      if (!["pending", "completed", "requires_action"].includes(order.status)) {
        throw new Error("Order cannot be canceled from its current state");
      }
      if (order.fulfillments.length) throw new Error("Cancel active fulfillments before canceling the order");
      if (order.payments.some(
        (payment) => payment.refunds.reduce((sum, refund) => sum + refund.amount, 0) < payment.amount
      )) {
        throw new Error("Captured payments must be fully refunded before cancellation");
      }
      for (const line of order.lineItems) {
        if (!line.productVariant?.manageInventory) continue;
        await tx.productVariant.update({
          where: { id: line.productVariant.id },
          data: { inventoryQuantity: { increment: line.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            type: "RECEIVE",
            quantity: line.quantity,
            reason: "order_cancellation",
            note: `order:${orderId}`,
            variantId: line.productVariant.id
          }
        });
      }
      if (order.accountLineItems.some(
        (item) => item.paymentStatus !== "unpaid" || item.invoiceLineItems.length
      )) {
        throw new Error("Invoiced account orders require an approved credit-note workflow");
      }
      for (const item of order.accountLineItems) {
        await tx.accountLineItem.update({
          where: { id: item.id },
          data: { paymentStatus: "canceled" }
        });
        if (item.accountId) {
          const adjustedAccount = await tx.account.updateMany({
            where: { id: item.accountId, totalAmount: { gte: item.amount } },
            data: { totalAmount: { decrement: item.amount } }
          });
          if (adjustedAccount.count !== 1) {
            throw new Error("Account balance is inconsistent; cancellation stopped");
          }
        }
      }
      for (const discount of order.discounts) {
        await tx.discount.updateMany({
          where: { id: discount.id, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } }
        });
      }
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...status === "canceled" ? { canceledAt: /* @__PURE__ */ new Date() } : {}
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: { previousStatus: order.status, newStatus: status, reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      `order.${status}`,
      "Order",
      orderId,
      { id: orderId, previousStatus: order.status, status, reason: reason.trim() }
    );
  }, { isolationLevel: "Serializable" });
  return sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id status canceledAt displayId"
  });
}
var transitionOrderStatus_default = transitionOrderStatus;

// features/keystone/mutations/regenerateCustomerToken.ts
init_token_crypto();
async function regenerateCustomerToken(root, _args, context) {
  const userId = context.session?.itemId;
  if (!userId) {
    throw new Error("Authentication required");
  }
  const sudoContext = context.sudo();
  try {
    const accounts = await sudoContext.query.Account.findMany({
      where: {
        user: { id: { equals: userId } },
        status: { equals: "active" },
        accountType: { equals: "business" }
      },
      query: "id"
    });
    const activeAccount = accounts[0];
    if (!activeAccount) {
      throw new Error("No active account found. Customer token can only be regenerated for users with active accounts.");
    }
    const newToken = generateOpaqueToken("ctok_");
    await sudoContext.query.User.updateOne({
      where: { id: userId },
      data: {
        customerToken: customerTokenDigest(newToken),
        tokenGeneratedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    return {
      success: true,
      token: newToken
    };
  } catch (error) {
    console.error("Error regenerating customer token:", error);
    throw error;
  }
}
var regenerateCustomerToken_default = regenerateCustomerToken;

// features/keystone/mutations/getCustomerAccount.ts
async function getCustomerAccount(root, { accountId }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      accountNumber
      title
      description
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedBalance
      formattedCreditLimit
      availableCredit
      formattedAvailableCredit
      balanceDue
      dueDate
      paidAt
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      user {
        id
        email
        name
      }
      orders {
        id
        displayId
        status
        total
        createdAt
        lineItems {
          id
          title
          quantity
          thumbnail
        }
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        orderDetails
      }
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.user?.id !== context.session.itemId) {
    throw new Error("Account not found");
  }
  return account;
}
var getCustomerAccount_default = getCustomerAccount;

// features/keystone/mutations/getCustomerAccounts.ts
async function getCustomerAccounts(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const accounts = await sudoContext.query.Account.findMany({
    where: {
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit ?? 10, 1), 100),
    skip: Math.max(offset ?? 0, 0),
    query: `
      id
      accountNumber
      title
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedCreditLimit
      availableCredit
      totalOwedInAccountCurrency
      formattedTotalOwedInAccountCurrency
      availableCreditInAccountCurrency
      formattedAvailableCreditInAccountCurrency
      balanceDue
      dueDate
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        order {
          id
        }
      }
      unpaidLineItemsByRegion
    `
  });
  return accounts;
}
var getCustomerAccounts_default = getCustomerAccounts;

// features/keystone/mutations/createInvoiceFromLineItems.ts
var import_node_crypto6 = __toESM(require("node:crypto"));
init_access();
async function createInvoiceFromLineItems(root, { accountId, regionId, lineItemIds, dueDate }, context) {
  if (!lineItemIds?.length || new Set(lineItemIds).size !== lineItemIds.length) {
    throw new Error("Unique line item IDs are required");
  }
  if (dueDate && !Number.isFinite(new Date(dueDate).getTime())) {
    throw new Error("Due date is invalid");
  }
  const sudoContext = context.sudo();
  if (!context.session?.itemId) {
    throw new Error("Authentication required");
  }
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      totalAmount
      paidAmount
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  const canManagePayments = permissions.canManagePayments({ session: context.session });
  if (!canManagePayments && account.user?.id !== context.session.itemId) {
    throw new Error("Account not found");
  }
  const region2 = await sudoContext.query.Region.findOne({
    where: { id: regionId },
    query: `
      id
      name
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
    `
  });
  if (!region2) {
    throw new Error("Region not found");
  }
  if (region2.currency.code !== account.currency.code) {
    throw new Error("Cross-currency invoicing is outside the supported launch boundary");
  }
  const lineItems = await sudoContext.query.AccountLineItem.findMany({
    where: {
      id: { in: lineItemIds },
      account: { id: { equals: accountId } },
      region: { id: { equals: regionId } },
      paymentStatus: { equals: "unpaid" }
    },
    query: `
      id
      amount
      description
      orderDisplayId
      itemCount
      paymentStatus
      createdAt
      region {
        id
        currency {
          code
        }
      }
    `
  });
  if (!lineItems.length) {
    throw new Error("No valid unpaid line items found");
  }
  if (lineItems.length !== lineItemIds.length) {
    throw new Error(`Some line items were not found, are already paid, or are not from ${region2.name} region`);
  }
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  if (totalAmount <= 0) {
    throw new Error("Invoice total must be greater than zero");
  }
  try {
    const result = await sudoContext.prisma.$transaction(async (tx) => {
      const currentItems = await tx.accountLineItem.findMany({
        where: {
          id: { in: lineItemIds },
          accountId,
          regionId,
          paymentStatus: "unpaid"
        },
        select: { id: true, amount: true }
      });
      if (currentItems.length !== lineItemIds.length) {
        throw new Error("Invoice line items changed; reload and retry");
      }
      const existingInvoiceLines = await tx.invoiceLineItem.findMany({
        where: { accountLineItemId: { in: lineItemIds } },
        select: { id: true, invoiceId: true, accountLineItemId: true }
      });
      if (existingInvoiceLines.length) {
        const invoiceIds = new Set(existingInvoiceLines.map((item) => item.invoiceId));
        const linkedItemIds = new Set(existingInvoiceLines.map((item) => item.accountLineItemId));
        if (existingInvoiceLines.length === lineItemIds.length && invoiceIds.size === 1 && lineItemIds.every((id2) => linkedItemIds.has(id2))) {
          const existingInvoice = await tx.invoice.findUnique({
            where: { id: [...invoiceIds][0] },
            include: { lineItems: true }
          });
          if (existingInvoice?.accountId === accountId && existingInvoice.totalAmount === totalAmount && existingInvoice.status === "sent") {
            return { invoice: existingInvoice, reused: true };
          }
        }
        throw new Error("One or more line items are already invoiced");
      }
      const transactionTotal = currentItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      if (transactionTotal !== totalAmount) throw new Error("Invoice amount changed; reload and retry");
      const invoice = await tx.invoice.create({
        data: {
          userId: account.user.id,
          accountId,
          invoiceNumber: `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${import_node_crypto6.default.randomBytes(4).toString("hex").toUpperCase()}`,
          currencyId: region2.currency.id,
          totalAmount,
          title: `${region2.name} Invoice for Account ${account.id}`,
          description: `Payment invoice for ${lineItems.length} ${region2.name} orders (${lineItems.map((item) => `#${item.orderDisplayId}`).join(", ")})`,
          status: "sent",
          paidAt: null,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          metadata: {
            regionId,
            regionName: region2.name,
            createdFromLineItems: lineItemIds,
            orderDisplayIds: lineItems.map((item) => item.orderDisplayId),
            itemCount: lineItems.reduce(
              (sum, item) => sum + (item.itemCount || 0),
              0
            )
          }
        }
      });
      const invoiceLineItems = [];
      for (const lineItem of lineItems) {
        invoiceLineItems.push(await tx.invoiceLineItem.create({
          data: { invoiceId: invoice.id, accountLineItemId: lineItem.id }
        }));
      }
      return { invoice: { ...invoice, lineItems: invoiceLineItems } };
    }, { isolationLevel: "Serializable" });
    return {
      success: true,
      invoiceId: result.invoice.id,
      message: `Invoice created with ${lineItems.length} orders`
    };
  } catch (error) {
    throw new Error(
      `Failed to create invoice: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
var createInvoiceFromLineItems_default = createInvoiceFromLineItems;

// features/keystone/security/invoice-access.ts
init_access();
async function assertInvoiceAccess(context, invoiceId) {
  if (!context.session?.itemId) throw new Error("Invoice not found");
  const invoice = await context.sudo().query.Invoice.findOne({
    where: { id: invoiceId },
    query: "id status account { user { id } } user { id }"
  });
  if (!invoice) throw new Error("Invoice not found");
  const canManage = permissions.canManagePayments({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  const ownerId = invoice.account?.user?.id || invoice.user?.id;
  if (!canManage && ownerId !== context.session.itemId) {
    throw new Error("Invoice not found");
  }
  return invoice;
}

// features/keystone/mutations/getInvoicePaymentSessions.ts
async function getInvoicePaymentSessions(root, { invoiceId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  try {
    const paymentCollection = await sudoContext.query.PaymentCollection.findOne({
      where: { invoice: { id: { equals: invoiceId } } },
      query: `
        id
        paymentSessions {
          id
          amount
          data
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
        }
      `
    });
    if (!paymentCollection) {
      return [];
    }
    return paymentCollection.paymentSessions || [];
  } catch (error) {
    console.error("Error getting invoice payment sessions:", error);
    return [];
  }
}
var getInvoicePaymentSessions_default = getInvoicePaymentSessions;

// features/keystone/mutations/getUnpaidLineItemsByRegion.ts
async function getUnpaidLineItemsByRegion(root, { accountId }, context) {
  const sudoContext = context.sudo();
  if (!context.session?.itemId) {
    throw new Error("Authentication required");
  }
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.user.id !== context.session.itemId) {
    throw new Error("Unauthorized access to account");
  }
  try {
    const unpaidLineItems = await sudoContext.query.AccountLineItem.findMany({
      where: {
        account: { id: { equals: accountId } },
        paymentStatus: { equals: "unpaid" }
      },
      query: `
        id
        amount
        description
        orderDisplayId
        itemCount
        createdAt
        order {
          id
        }
        region {
          id
          name
          currency {
            id
            code
            symbol
            noDivisionCurrency
          }
        }
      `,
      orderBy: { createdAt: "desc" }
    });
    const lineItemsByRegion = unpaidLineItems.reduce((acc, item) => {
      const regionId = item.region.id;
      const regionName = item.region.name;
      const currency = item.region.currency;
      if (!acc[regionId]) {
        acc[regionId] = {
          region: {
            id: regionId,
            name: regionName,
            currency
          },
          lineItems: [],
          totalAmount: 0,
          itemCount: 0
        };
      }
      acc[regionId].lineItems.push({
        id: item.id,
        amount: item.amount,
        description: item.description,
        orderDisplayId: item.orderDisplayId,
        itemCount: item.itemCount,
        createdAt: item.createdAt,
        formattedAmount: formatCurrencyAmount(item.amount, currency.code),
        order: item.order
      });
      acc[regionId].totalAmount += item.amount || 0;
      acc[regionId].itemCount += 1;
      return acc;
    }, {});
    const regionsWithLineItems = Object.values(lineItemsByRegion).map((regionData) => ({
      ...regionData,
      formattedTotalAmount: formatCurrencyAmount(
        regionData.totalAmount,
        regionData.region.currency.code
      )
    }));
    regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);
    return {
      success: true,
      regions: regionsWithLineItems,
      totalRegions: regionsWithLineItems.length,
      totalUnpaidItems: unpaidLineItems.length,
      message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
    };
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to get unpaid line items: ${error.message}` : "Failed to get unpaid line items");
  }
}
function formatCurrencyAmount(amount, currencyCode) {
  const currency = currencyCode.toUpperCase();
  const noDivisionCurrencies = ["JPY", "KRW", "VND"];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount / divisor);
}
var getUnpaidLineItemsByRegion_default = getUnpaidLineItemsByRegion;

// features/keystone/mutations/createInvoicePaymentSessions.ts
async function createInvoicePaymentSessions(root, { invoiceId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        id
        code
      }
      account {
        id
        user {
          id
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  const invoiceLineItems = await sudoContext.query.InvoiceLineItem.findMany({
    where: { invoice: { id: { equals: invoiceId } } },
    query: `
      accountLineItem {
        region {
          id
          paymentProviders {
            id
            code
            isInstalled
          }
        }
      }
    `
  });
  const invoiceLineItem = invoiceLineItems[0];
  const availableProviders = invoiceLineItem?.accountLineItem?.region?.paymentProviders?.filter(
    (provider) => provider.isInstalled && isPaymentProviderConfigured(provider.code || "")
  ) || [];
  if (availableProviders.length === 0) {
    throw new Error("No payment providers are available for this region");
  }
  let paymentCollection = invoice.paymentCollection;
  if (!paymentCollection) {
    paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        description: "default",
        amount: invoice.totalAmount || 0
      },
      query: "id"
    });
    await sudoContext.query.Invoice.updateOne({
      where: { id: invoiceId },
      data: { paymentCollection: { connect: { id: paymentCollection.id } } },
      query: "id"
    });
  }
  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    const existingSession = invoice.paymentCollection?.paymentSessions?.find(
      (s) => s.paymentProvider.id === provider.id
    );
    if (!existingSession) {
      const newSession = await sudoContext.query.PaymentSession.createOne({
        data: {
          paymentCollection: { connect: { id: paymentCollection.id } },
          paymentProvider: { connect: { id: provider.id } },
          amount: invoice.totalAmount || 0,
          data: {},
          // Initialize with empty data object
          isSelected: i === 0,
          // Only select the first provider by default
          isInitiated: false
        },
        query: "id"
      });
    }
  }
  return sudoContext.prisma.invoice.findUnique({ where: { id: invoiceId } });
}
var createInvoicePaymentSessions_default = createInvoicePaymentSessions;

// features/keystone/payments/invoice-payment-recovery.ts
var STALE_LOCK_MS = 5 * 60 * 1e3;
function invoicePaymentKey(paymentSessionId) {
  return `invoice-payment:${paymentSessionId}`;
}
async function getOrCreateInvoicePaymentAttempt(prisma, invoiceId, paymentSessionId) {
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: invoicePaymentKey(paymentSessionId),
    requestPath: "completeInvoicePayment",
    requestParams: { invoiceId, paymentSessionId }
  });
  if (!replay || attempt.recoveryPoint === "completed") return attempt;
  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - STALE_LOCK_MS) } }
      ]
    },
    data: { lockedAt: /* @__PURE__ */ new Date() }
  });
  if (acquired.count !== 1) {
    throw new Error("Invoice payment is already in progress");
  }
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}
async function claimInvoicePaymentCommit(tx, invoiceId, paidAt) {
  const claimed = await tx.invoice.updateMany({
    where: {
      id: invoiceId,
      status: { in: ["sent", "overdue"] }
    },
    data: { status: "paid", paidAt }
  });
  return claimed.count === 1;
}

// features/keystone/mutations/completeInvoicePayment.ts
var SUCCESS = /* @__PURE__ */ new Set(["succeeded", "captured", "completed", "paid"]);
var AUTHORIZED = /* @__PURE__ */ new Set(["authorized", "requires_capture", "approved"]);
function providerReference(data) {
  return data?.paymentIntentId || data?.payment_intent_id || data?.orderId || data?.id;
}
async function completeInvoicePayment(root, { paymentSessionId }, context) {
  const sudo = context.sudo();
  const session = await sudo.query.PaymentSession.findOne({
    where: { id: paymentSessionId },
    query: `
      id amount data
      paymentProvider { id code capturePaymentFunction getPaymentStatusFunction credentials }
      paymentCollection {
        id payments { id }
        invoice {
          id invoiceNumber totalAmount status
          currency { code }
          account { id paidAmount currency { code } user { id } }
          lineItems { accountLineItem { id paymentStatus } }
        }
      }
    `
  });
  const invoice = session?.paymentCollection?.invoice;
  if (!invoice) throw new Error("Invoice not found");
  await assertInvoiceAccess(context, invoice.id);
  if (invoice.status === "paid") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }
  if (!["sent", "overdue"].includes(invoice.status)) {
    throw new Error("Invoice is not payable");
  }
  if (session.amount !== invoice.totalAmount) throw new Error("Invoice payment amount mismatch");
  if (invoice.currency.code !== invoice.account.currency.code) {
    throw new Error("Cross-currency invoices require an approved accounting conversion workflow");
  }
  const provider = session.paymentProvider;
  if (!provider?.code || provider.code.includes("manual")) {
    throw new Error("Manual invoice tenders require operator verification");
  }
  const reference = providerReference(session.data);
  if (!reference) throw new Error("Provider payment reference is missing");
  const key = invoicePaymentKey(session.id);
  const attempt = await getOrCreateInvoicePaymentAttempt(
    sudo.prisma,
    invoice.id,
    paymentSessionId
  );
  if (attempt.recoveryPoint === "completed") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }
  let result = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_captured" || !result) {
    result = await getPaymentStatus({ provider, paymentId: reference });
    if (AUTHORIZED.has(String(result.status).toLowerCase())) {
      result = await capturePayment({
        provider,
        paymentId: reference,
        amount: invoice.totalAmount,
        currency: invoice.currency.code,
        idempotencyKey: key
      });
    }
    if (!SUCCESS.has(String(result.status).toLowerCase())) {
      throw new Error(`Provider payment is not complete: ${result.status}`);
    }
    if (Number(result.amount) !== invoice.totalAmount) throw new Error("Provider amount mismatch");
    if (String(result.currency).toUpperCase() !== invoice.currency.code.toUpperCase()) {
      throw new Error("Provider currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: { recoveryPoint: "provider_captured", responseBody: { providerResult: result } }
    });
  }
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "payment.captured"
  );
  await sudo.prisma.$transaction(async (tx) => {
    const paidAt = /* @__PURE__ */ new Date();
    const claimed = await claimInvoicePaymentCommit(tx, invoice.id, paidAt);
    if (!claimed) {
      const existingPayment = await tx.payment.findFirst({
        where: {
          paymentCollectionId: session.paymentCollection.id,
          metadata: { path: ["idempotencyKey"], equals: key }
        },
        select: { id: true }
      });
      if (!existingPayment) {
        throw new Error("Invoice is not payable or payment reconciliation is required");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: {
          recoveryPoint: "completed",
          responseCode: 200,
          responseBody: { providerResult: result, paymentId: existingPayment.id },
          lockedAt: null
        }
      });
      return { paymentId: existingPayment.id };
    }
    const payment = await tx.payment.create({
      data: {
        status: "captured",
        amount: invoice.totalAmount,
        currencyCode: invoice.currency.code,
        data: result,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        capturedAt: /* @__PURE__ */ new Date(),
        userId: invoice.account.user.id,
        paymentCollectionId: session.paymentCollection.id
      }
    });
    await tx.capture.create({
      data: {
        amount: invoice.totalAmount,
        paymentId: payment.id,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        createdBy: "invoice-checkout"
      }
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        metadata: { providerResult: result, paymentId: payment.id, paidAt: paidAt.toISOString() }
      }
    });
    const ids = invoice.lineItems.map((item) => item.accountLineItem?.id).filter(Boolean);
    await tx.accountLineItem.updateMany({ where: { id: { in: ids } }, data: { paymentStatus: "paid" } });
    await tx.account.update({
      where: { id: invoice.account.id },
      data: { paidAmount: { increment: invoice.totalAmount } }
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      "payment.captured",
      "Payment",
      payment.id,
      { id: payment.id, invoiceId: invoice.id, amount: invoice.totalAmount, currencyCode: invoice.currency.code }
    );
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerResult: result, paymentId: payment.id },
        lockedAt: null
      }
    });
    return { paymentId: payment.id };
  });
  return {
    id: invoice.id,
    status: "succeeded",
    success: true,
    message: `Invoice ${invoice.invoiceNumber} paid`
  };
}
var completeInvoicePayment_default = completeInvoicePayment;

// features/keystone/mutations/initiateInvoicePaymentSession.ts
async function initiateInvoicePaymentSession(root, { invoiceId, paymentProviderId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `
  });
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: `
      id 
      code 
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      credentials
    `
  });
  if (!provider || !provider.isInstalled || !isPaymentProviderConfigured(provider.code)) {
    throw new Error("Payment provider not found, installed, and configured");
  }
  if (!invoice.paymentCollection) {
    invoice.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        invoice: { connect: { id: invoice.id } },
        amount: invoice.totalAmount,
        description: "default"
      },
      query: "id"
    });
  }
  const existingSession = invoice.paymentCollection?.paymentSessions?.find(
    (s) => s.paymentProvider.code === paymentProviderId && !s.isInitiated
  );
  if (existingSession) {
    const needsInitialization = !existingSession.data || Object.keys(existingSession.data).length === 0;
    let sessionData = existingSession.data;
    if (needsInitialization) {
      try {
        sessionData = await createPayment({
          provider,
          cart: invoice,
          amount: invoice.totalAmount,
          currency: invoice.currency.code
        });
        await sudoContext.query.PaymentSession.updateOne({
          where: { id: existingSession.id },
          data: {
            data: sessionData,
            isInitiated: true
          }
        });
      } catch (error) {
        throw error;
      }
    }
    const otherSessions = invoice.paymentCollection.paymentSessions.filter(
      (s) => s.id !== existingSession.id && s.isSelected
    );
    for (const session of otherSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false }
      });
    }
    await sudoContext.query.PaymentSession.updateOne({
      where: { id: existingSession.id },
      data: { isSelected: true }
    });
    return {
      ...existingSession,
      data: sessionData
    };
  }
  try {
    const sessionData = await createPayment({
      provider,
      cart: invoice,
      // Pass invoice as cart parameter
      amount: invoice.totalAmount,
      currency: invoice.currency.code
    });
    const existingSelectedSessions = invoice.paymentCollection.paymentSessions?.filter(
      (s) => s.isSelected
    ) || [];
    for (const session of existingSelectedSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false }
      });
    }
    const newSession = await sudoContext.query.PaymentSession.createOne({
      data: {
        paymentCollection: { connect: { id: invoice.paymentCollection.id } },
        paymentProvider: { connect: { id: provider.id } },
        amount: invoice.totalAmount,
        isSelected: true,
        isInitiated: true,
        data: sessionData
      },
      query: `
        id
        data
        amount
        isInitiated
      `
    });
    return newSession;
  } catch (error) {
    throw error;
  }
}
var initiateInvoicePaymentSession_default = initiateInvoicePaymentSession;

// features/keystone/mutations/setInvoicePaymentSession.ts
async function setInvoicePaymentSession(root, { invoiceId, providerId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  if (!invoice.paymentCollection) {
    throw new Error("Invoice has no payment collection");
  }
  for (const session of invoice.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }
  const selectedSession = invoice.paymentCollection.paymentSessions?.find(
    (s) => s.paymentProvider.id === providerId
  );
  if (!selectedSession) {
    throw new Error("Payment session not found");
  }
  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });
  return await sudoContext.db.Invoice.findOne({
    where: { id: invoiceId }
  });
}
var setInvoicePaymentSession_default = setInvoicePaymentSession;

// features/keystone/mutations/activeInvoice.ts
async function activeInvoice(root, { invoiceId }, context) {
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      invoiceNumber
      status
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
        }
      }
      lineItems {
        id
        accountLineItem {
          id
          description
          orderDisplayId
          itemCount
          formattedAmount
          createdAt
          order {
            id
            displayId
            createdAt
            total
          }
          region {
            id
            name
            countries {
              id
              name
              iso2
              region {
                id
              }
            }
            currency {
              code
              noDivisionCurrency
            }
            taxRate
          }
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
    `
  });
  if (!invoice) {
    return null;
  }
  return invoice;
}
var activeInvoice_default = activeInvoice;

// features/keystone/mutations/getCustomerPaidInvoices.ts
async function getCustomerPaidInvoices(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const boundedOffset = Math.max(0, Number(offset) || 0);
  const sudoContext = context.sudo();
  const invoices = await sudoContext.query.Invoice.findMany({
    where: {
      account: {
        user: { id: { equals: context.session.itemId } }
      },
      status: { equals: "paid" }
    },
    orderBy: { paidAt: "desc" },
    take: boundedLimit,
    skip: boundedOffset,
    query: `
      id
      invoiceNumber
      totalAmount
      status
      paidAt
      dueDate
      createdAt
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      account {
        id
        accountNumber
        title
      }
      formattedTotal
      lineItems {
        id
        orderDisplayId
        formattedAmount
        orderDetails
        accountLineItem {
          id
          orderDisplayId
          itemCount
          paymentStatus
          description
          amount
          order {
            id
            displayId
          }
        }
      }
    `
  });
  return invoices;
}
var getCustomerPaidInvoices_default = getCustomerPaidInvoices;

// features/keystone/queries/getProductsSortedByPrice.ts
var import_client = require("@prisma/client");
async function getProductsSortedByPrice(_root, { countryCode, limit = 12, offset = 0, priceOrder, collectionId, categoryId }, context) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 1e5) {
    throw new Error("Pagination must use a limit of 1\u2013100 and an offset of 0\u2013100000");
  }
  if (typeof countryCode !== "string" || !/^[a-z]{2}$/i.test(countryCode)) {
    throw new Error("A two-letter country code is required");
  }
  if (!["asc", "desc"].includes(priceOrder)) throw new Error("Invalid price ordering");
  for (const id2 of [collectionId, categoryId]) {
    if (id2 !== void 0 && id2 !== null && (typeof id2 !== "string" || id2.length > 200)) {
      throw new Error("Invalid catalog filter");
    }
  }
  const prisma = context.prisma;
  const region2 = await prisma.region.findFirst({
    where: { countries: { some: { iso2: countryCode.toLowerCase() } } },
    select: { id: true }
  });
  if (!region2) return { products: [], count: 0 };
  const direction = priceOrder === "asc" ? import_client.Prisma.sql`ASC` : import_client.Prisma.sql`DESC`;
  const collection = collectionId ? import_client.Prisma.sql`AND EXISTS (
    SELECT 1 FROM "_Product_productCollections" relation
    WHERE relation."A" = p."id" AND relation."B" = ${collectionId}
  )` : import_client.Prisma.empty;
  const category = categoryId ? import_client.Prisma.sql`AND EXISTS (
    SELECT 1 FROM "_Product_productCategories" relation
    WHERE relation."A" = p."id" AND relation."B" = ${categoryId}
  )` : import_client.Prisma.empty;
  const from = import_client.Prisma.sql`
    FROM "Product" p
    JOIN "ProductVariant" pv ON pv."product" = p."id"
    JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = ${region2.id} AND p."status" = 'published'
    ${collection} ${category}`;
  const rows = await prisma.$queryRaw(import_client.Prisma.sql`
    SELECT p."id", MIN(ma."amount") AS min_price ${from}
    GROUP BY p."id" ORDER BY min_price ${direction}, p."id" ASC
    LIMIT ${limit} OFFSET ${offset}`);
  const counts = await prisma.$queryRaw(import_client.Prisma.sql`
    SELECT COUNT(DISTINCT p."id") AS count ${from}`);
  const products = rows.length ? await prisma.product.findMany({
    where: { id: { in: rows.map((row) => row.id) }, status: "published" }
  }) : [];
  const byId = new Map(products.map((product) => [product.id, product]));
  return { products: rows.map((row) => byId.get(row.id)).filter(Boolean), count: Number(counts[0]?.count ?? 0) };
}

// features/keystone/mutations/processReturnRefund.ts
init_access();
function providerPaymentReference(payment) {
  return payment.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || payment.data?.payment_intent_id || payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id;
}
async function processReturnRefund(root, { returnId, paymentId, idempotencyKey }, context) {
  if (!permissions.canManageReturns({ session: context.session }) || !permissions.canManagePayments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!idempotencyKey?.trim()) throw new Error("Idempotency key is required");
  const sudo = context.sudo();
  const businessKey = `refund:${idempotencyKey.trim()}`;
  const idempotencyRequest = {
    key: businessKey,
    requestPath: "processReturnRefund",
    requestParams: { returnId, paymentId }
  };
  const priorAttempt = await findIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (priorAttempt?.recoveryPoint === "completed" && priorAttempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: priorAttempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
    });
  }
  const returnRecord = await sudo.query.Return.findOne({
    where: { id: returnId },
    query: `id status refundAmount metadata order { id cart { id } payments { id } }`
  });
  if (!returnRecord?.order?.id || returnRecord.refundAmount <= 0) {
    throw new Error("Return is not refundable");
  }
  if (!returnRecord.order.payments?.some((payment2) => payment2.id === paymentId)) {
    throw new Error("Payment does not belong to return order");
  }
  const payment = await sudo.query.Payment.findOne({
    where: { id: paymentId },
    query: `
      id amount amountRefunded currencyCode data
      refunds { id amount idempotencyKey }
      paymentCollection {
        paymentSessions {
          isSelected
          paymentProvider {
            id code refundPaymentFunction credentials
          }
        }
      }
    `
  });
  if (!payment) throw new Error("Payment not found");
  const alreadyRefunded = payment.refunds?.reduce((sum, refund2) => sum + refund2.amount, 0) || 0;
  if (alreadyRefunded + returnRecord.refundAmount > payment.amount) {
    throw new Error("Refund exceeds captured payment amount");
  }
  const provider = payment.paymentCollection?.paymentSessions?.find((session) => session.isSelected)?.paymentProvider || payment.paymentCollection?.paymentSessions?.[0]?.paymentProvider;
  const providerReference2 = providerPaymentReference(payment);
  if (!provider || !providerReference2) throw new Error("Refund provider reference is missing");
  if (provider.code?.includes("manual")) {
    throw new Error("Manual tender refunds require operator verification");
  }
  const { attempt, replay } = priorAttempt ? { attempt: priorAttempt, replay: true } : await getOrCreateIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (attempt.recoveryPoint === "completed" && attempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: attempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
    });
  }
  if (replay) {
    const acquired = await sudo.prisma.idempotencyKey.updateMany({
      where: {
        id: attempt.id,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
        ]
      },
      data: { lockedAt: /* @__PURE__ */ new Date() }
    });
    if (acquired.count !== 1) throw new Error("Refund is already in progress");
  }
  if (attempt.recoveryPoint === "started") {
    await sudo.prisma.$transaction(async (tx) => {
      const reserved = await tx.payment.updateMany({
        where: {
          id: paymentId,
          amountRefunded: { lte: payment.amount - returnRecord.refundAmount }
        },
        data: { amountRefunded: { increment: returnRecord.refundAmount } }
      });
      if (reserved.count !== 1) {
        throw new Error("Concurrent refund exceeds captured payment amount");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: { recoveryPoint: "amount_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    });
    attempt.recoveryPoint = "amount_reserved";
  }
  let providerResult = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_refunded" || !providerResult) {
    providerResult = await refundPayment({
      provider,
      paymentId: providerReference2,
      amount: returnRecord.refundAmount,
      currency: payment.currencyCode,
      idempotencyKey: businessKey
    });
    const status = String(providerResult.status || "").toLowerCase();
    if (!["succeeded", "completed", "refunded"].includes(status)) {
      throw new Error(`Provider refund is not complete: ${providerResult.status}`);
    }
    if (Number(providerResult.amount) !== returnRecord.refundAmount) {
      throw new Error("Provider refund amount mismatch");
    }
    if (providerResult.currency && String(providerResult.currency).toUpperCase() !== String(payment.currencyCode).toUpperCase()) {
      throw new Error("Provider refund currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "provider_refunded",
        responseBody: { providerResult },
        lockedAt: /* @__PURE__ */ new Date()
      }
    });
  }
  const refundWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "refund.created"
  );
  const refund = await sudo.prisma.$transaction(async (tx) => {
    const duplicate = await tx.refund.findFirst({
      where: { idempotencyKey: businessKey }
    });
    if (duplicate) return duplicate;
    const created = await tx.refund.create({
      data: {
        amount: returnRecord.refundAmount,
        reason: "return",
        note: `Return ${returnId}`,
        idempotencyKey: businessKey,
        paymentId,
        metadata: { providerId: provider.id, providerResult }
      }
    });
    await tx.return.update({
      where: { id: returnId },
      data: {
        status: "received",
        receivedAt: /* @__PURE__ */ new Date(),
        metadata: {
          ...returnRecord.metadata || {},
          refundId: created.id,
          refundStatus: "completed"
        }
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId: returnRecord.order.id,
        type: "REFUND_PROCESSED",
        data: { returnId, refundId: created.id, amount: created.amount },
        time: /* @__PURE__ */ new Date(),
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    const regulatedDecision = returnRecord.order.cart?.id ? await tx.complianceDecision.findFirst({
      where: { cartId: returnRecord.order.cart.id, orderId: returnRecord.order.id },
      select: { id: true }
    }) : null;
    if (regulatedDecision) {
      const occurredAt = /* @__PURE__ */ new Date();
      await tx.complianceEvent.create({
        data: {
          decisionId: regulatedDecision.id,
          orderId: returnRecord.order.id,
          eventType: "regulated.return_refunded",
          resourceType: "Return",
          resourceId: returnId,
          actorId: context.session.itemId,
          reasonCode: "TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED",
          evidenceDigest: evidenceDigest({ returnId, refundId: created.id, amount: created.amount, occurredAt: occurredAt.toISOString() }),
          data: { refundId: created.id, amount: created.amount, taxReversalRecorded: false },
          occurredAt
        }
      });
    }
    await enqueueWebhookOutbox(
      tx,
      refundWebhookEndpointIds,
      "refund.created",
      "Refund",
      created.id,
      { id: created.id, returnId, paymentId, orderId: returnRecord.order.id, amount: created.amount }
    );
    return created;
  });
  await sudo.prisma.idempotencyKey.update({
    where: { id: attempt.id },
    data: {
      recoveryPoint: "completed",
      responseCode: 200,
      responseBody: { refundId: refund.id, providerResult },
      lockedAt: null
    }
  });
  return sudo.query.Refund.findOne({
    where: { id: refund.id },
    query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
  });
}
var processReturnRefund_default = processReturnRefund;

// features/keystone/mutations/retryWebhookDeliveries.ts
init_access();
async function retryWebhookDeliveries(root, { limit = 25 }, context) {
  if (!permissions.canManageWebhooks({ session: context.session })) {
    throw new Error("Access denied");
  }
  return retryPendingWebhookDeliveries(context, limit);
}
var retryWebhookDeliveries_default = retryWebhookDeliveries;

// features/keystone/mutations/registerWebhookEndpoint.ts
init_access();

// features/keystone/models/WebhookEndpoint.ts
var import_core = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");
var import_node_crypto8 = __toESM(require("node:crypto"));
init_access();

// features/keystone/models/trackingFields.ts
var import_fields3 = require("@keystone-6/core/fields");
function trackingFieldsFor() {
  return {
    createdAt: (0, import_fields3.timestamp)({
      access: { read: () => true, create: () => false, update: () => false },
      validation: { isRequired: true },
      defaultValue: { kind: "now" },
      ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } }
    }),
    updatedAt: (0, import_fields3.timestamp)({
      access: { read: () => true, create: () => false, update: () => false },
      db: { updatedAt: true },
      validation: { isRequired: true },
      defaultValue: { kind: "now" },
      ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } }
    })
  };
}
var trackingFields = trackingFieldsFor();

// features/webhooks/subscriptions.ts
var import_node_crypto7 = __toESM(require("node:crypto"));
function normalizeWebhookUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    throw new Error("Webhook URL must be an absolute URL");
  }
  const localDevelopment = process.env.NODE_ENV !== "production" && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1" || url.hostname.endsWith(".local"));
  if (url.protocol !== "https:" && !(localDevelopment && url.protocol === "http:")) {
    throw new Error("Webhook URL must use HTTPS");
  }
  if (url.username || url.password || url.hash) {
    throw new Error("Webhook URL cannot contain credentials or a fragment");
  }
  return url.toString();
}
function normalizeWebhookEvents(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("At least one webhook event is required");
  }
  const events = value.map((event) => String(event || "").trim()).filter(Boolean);
  if (events.length !== value.length) throw new Error("Webhook event names cannot be empty");
  return [...new Set(events)].sort();
}
function normalizeWebhookRegistrationKey(value) {
  const key = String(value || "").trim();
  if (!key || key.length > 255) {
    throw new Error("Webhook registration key must be between 1 and 255 characters");
  }
  return key;
}
function requireWebhookScope(actual, required) {
  if (required === void 0 || required === null || required === "") return;
  const expected = String(required).trim().toUpperCase();
  if (expected !== "STORE" && expected !== "USER") {
    throw new Error("Required webhook scope must be STORE or USER");
  }
  if (expected !== actual) {
    throw new Error(`Webhook registration requires ${expected} scope`);
  }
}
function webhookSubscriptionKey(scope, ownerId, registrationKey) {
  if (scope === "USER" && !ownerId) throw new Error("USER webhook subscriptions require an owner");
  const principal = scope === "USER" ? ownerId : "store";
  return import_node_crypto7.default.createHash("sha256").update(`webhook-subscription:v1\0${scope}\0${principal}\0${registrationKey}`).digest("hex");
}

// features/keystone/models/WebhookEndpoint.ts
var CUSTOMER_WEBHOOK_EVENTS = /* @__PURE__ */ new Set(["fulfillment.created"]);
function isCustomerTokenSession(session) {
  return Boolean(session?.customerToken && session?.itemId);
}
function customerEndpointFilter(session) {
  return {
    scope: { equals: "USER" },
    user: { id: { equals: session.itemId } }
  };
}
function canReadEndpoints({ session }) {
  return permissions.canReadWebhooks({ session }) || isCustomerTokenSession(session);
}
function canManageEndpoints({ session }) {
  return permissions.canManageWebhooks({ session }) || isCustomerTokenSession(session);
}
function readEndpointFilter({ session }) {
  if (permissions.canReadWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}
function manageEndpointFilter({ session }) {
  if (permissions.canManageWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}
function validateCustomerEndpoint(urlValue, eventsValue, addValidationError) {
  try {
    normalizeWebhookUrl(urlValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : "Invalid webhook URL");
  }
  let events = [];
  try {
    events = normalizeWebhookEvents(eventsValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : "Invalid webhook events");
  }
  if (events.some((event) => !CUSTOMER_WEBHOOK_EVENTS.has(event))) {
    addValidationError("Customer tokens may subscribe only to fulfillment.created");
  }
}
var WebhookEndpoint = (0, import_core.list)({
  access: {
    operation: {
      query: canReadEndpoints,
      create: canManageEndpoints,
      update: canManageEndpoints,
      delete: canManageEndpoints
    },
    filter: {
      query: readEndpointFilter,
      update: manageEndpointFilter,
      delete: manageEndpointFilter
    }
  },
  hooks: {
    resolveInput: {
      create: ({ context, resolvedData }) => {
        if (!context.session?.itemId) return resolvedData;
        const scope = isCustomerTokenSession(context.session) ? "USER" : "STORE";
        const registrationKey = normalizeWebhookRegistrationKey(
          resolvedData.registrationKey || `manual:${import_node_crypto8.default.randomUUID()}`
        );
        return {
          ...resolvedData,
          url: normalizeWebhookUrl(resolvedData.url),
          events: normalizeWebhookEvents(resolvedData.events),
          registrationKey,
          subscriptionKey: webhookSubscriptionKey(
            scope,
            scope === "USER" ? context.session.itemId : null,
            registrationKey
          ),
          scope,
          user: { connect: { id: context.session.itemId } }
        };
      },
      update: ({ context, resolvedData }) => ({
        ...resolvedData,
        ...resolvedData.url !== void 0 ? { url: normalizeWebhookUrl(resolvedData.url) } : {},
        ...resolvedData.events !== void 0 ? { events: normalizeWebhookEvents(resolvedData.events) } : {},
        ...isCustomerTokenSession(context.session) ? { scope: "USER", user: { connect: { id: context.session.itemId } } } : {}
      })
    },
    validateInput: async ({ context, resolvedData, item, addValidationError }) => {
      if (!isCustomerTokenSession(context.session)) return;
      validateCustomerEndpoint(
        resolvedData.url ?? item?.url,
        resolvedData.events ?? item?.events,
        addValidationError
      );
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManageWebhooks(args),
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ["url", "scope", "isActive", "events", "lastTriggered", "failureCount"]
    }
  },
  fields: {
    url: (0, import_fields4.text)({
      validation: { isRequired: true },
      ui: { description: "The URL where webhook events will be sent" }
    }),
    registrationKey: (0, import_fields4.text)({
      db: { isNullable: true },
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "hidden" }, listView: { fieldMode: "hidden" } }
    }),
    subscriptionKey: (0, import_fields4.text)({
      db: { isNullable: true },
      isIndexed: "unique",
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "hidden" }, listView: { fieldMode: "hidden" } }
    }),
    events: (0, import_fields4.json)({
      defaultValue: [],
      ui: {
        description: 'Events to subscribe to, e.g. ["order.created", "fulfillment.created"]'
      }
    }),
    scope: (0, import_fields4.select)({
      options: [
        { label: "Store", value: "STORE" },
        { label: "User", value: "USER" }
      ],
      defaultValue: "STORE",
      validation: { isRequired: true },
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "read" } }
    }),
    user: (0, import_fields4.relationship)({
      ref: "User.webhookEndpoints",
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "read" } }
    }),
    isActive: (0, import_fields4.checkbox)({
      defaultValue: true,
      ui: { description: "Whether this webhook endpoint is currently active" }
    }),
    secret: (0, import_fields4.text)({
      access: { read: () => false },
      ui: {
        itemView: { fieldMode: "hidden" },
        description: "Secret key for webhook signature verification (auto-generated)"
      },
      hooks: {
        resolveInput: ({ resolvedData, operation }) => {
          if (operation === "create" && !resolvedData.secret) {
            return import_node_crypto8.default.randomBytes(32).toString("hex");
          }
          return resolvedData.secret;
        }
      }
    }),
    lastTriggered: (0, import_fields4.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Last time this webhook was triggered"
      }
    }),
    failureCount: (0, import_fields4.integer)({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Number of consecutive delivery failures"
      }
    }),
    webhookEvents: (0, import_fields4.relationship)({
      ref: "WebhookEvent.endpoint",
      many: true,
      ui: {
        displayMode: "count",
        description: "Events sent to this endpoint"
      }
    }),
    ...trackingFields
  }
});

// features/keystone/mutations/registerWebhookEndpoint.ts
var CUSTOMER_WEBHOOK_EVENTS2 = /* @__PURE__ */ new Set(["fulfillment.created"]);
async function registerWebhookEndpoint(_root, {
  registrationKey: registrationKeyInput,
  url: urlInput,
  events: eventsInput,
  secret: secretInput,
  requiredScope: requiredScopeInput
}, context) {
  const session = context.session;
  const customerSession = isCustomerTokenSession(session);
  if (!session?.itemId || !customerSession && !permissions.canManageWebhooks({ session })) {
    throw new Error("Webhook management permission required");
  }
  const scope = customerSession ? "USER" : "STORE";
  requireWebhookScope(scope, requiredScopeInput);
  const ownerId = customerSession ? session.itemId : null;
  const registrationKey = normalizeWebhookRegistrationKey(registrationKeyInput);
  const subscriptionKey = webhookSubscriptionKey(scope, ownerId, registrationKey);
  const url = normalizeWebhookUrl(urlInput);
  const events = normalizeWebhookEvents(eventsInput);
  const secret = String(secretInput || "").trim();
  if (!secret) throw new Error("Webhook signing secret is required");
  if (customerSession && events.some((event) => !CUSTOMER_WEBHOOK_EVENTS2.has(event))) {
    throw new Error("Customer tokens may subscribe only to fulfillment.created");
  }
  const sudo = context.sudo();
  const endpoint2 = await sudo.prisma.$transaction(async (tx) => {
    const saved = await tx.webhookEndpoint.upsert({
      where: { subscriptionKey },
      create: {
        registrationKey,
        subscriptionKey,
        url,
        events,
        scope,
        userId: session.itemId,
        isActive: true,
        secret,
        failureCount: 0
      },
      update: {
        url,
        events,
        isActive: true,
        secret
      },
      select: { id: true }
    });
    await tx.webhookEndpoint.updateMany({
      where: {
        id: { not: saved.id },
        scope,
        url,
        registrationKey: { startsWith: "legacy:" },
        ...scope === "USER" ? { userId: session.itemId } : {}
      },
      data: { isActive: false }
    });
    return saved;
  });
  return context.db.WebhookEndpoint.findOne({ where: { id: endpoint2.id } });
}
var registerWebhookEndpoint_default = registerWebhookEndpoint;

// features/keystone/queries/getFinanceClose.ts
var import_node_crypto9 = __toESM(require("node:crypto"));
init_access();
var PAGE_SIZE = 100;
var NESTED_LIMIT = 100;
var MAX_PAYMENTS = 5e3;
async function getFinanceClose(root, { start, end }, context) {
  if (!context.session?.itemId || !permissions.canReadPayments({ session: context.session })) {
    throw new Error("Access denied");
  }
  const startAt = new Date(start);
  const endAt = new Date(end);
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || startAt >= endAt || endAt.getTime() - startAt.getTime() > 31 * 24 * 60 * 60 * 1e3) {
    throw new Error("Finance close range must be valid and no longer than 31 days");
  }
  const sudo = context.sudo();
  const where = { createdAt: { gte: startAt.toISOString(), lt: endAt.toISOString() } };
  const expectedCount = await sudo.query.Payment.count({ where });
  if (!Number.isSafeInteger(expectedCount) || expectedCount >= MAX_PAYMENTS) {
    throw new Error("Finance close exceeded the bounded export limit");
  }
  const payments = [];
  for (let skip = 0; skip < expectedCount; skip += PAGE_SIZE) {
    const page = await sudo.query.Payment.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: PAGE_SIZE,
      skip,
      query: `
        id status amount amountRefunded currencyCode capturedAt createdAt data
        capturesCount
        captures(take: ${NESTED_LIMIT}, orderBy: [{ createdAt: asc }, { id: asc }]) { id amount createdAt metadata }
        refundsCount
        refunds(take: ${NESTED_LIMIT}, orderBy: [{ createdAt: asc }, { id: asc }]) { id amount reason createdAt metadata }
        order { id displayId status metadata }
      `
    });
    payments.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  const finalCount = await sudo.query.Payment.count({ where });
  if (payments.length !== expectedCount || finalCount !== expectedCount || new Set(payments.map((payment) => payment.id)).size !== expectedCount) {
    throw new Error("Finance close is incomplete: payments changed during export; retry");
  }
  for (const payment of payments) {
    if (payment.capturesCount > NESTED_LIMIT || payment.refundsCount > NESTED_LIMIT) {
      throw new Error("Finance close exceeded the bounded capture/refund limit for a payment");
    }
    if ((payment.captures || []).length !== payment.capturesCount || (payment.refunds || []).length !== payment.refundsCount) {
      throw new Error("Finance close is incomplete: captures or refunds changed during export; retry");
    }
  }
  const rows = payments.map((payment) => {
    const captured = payment.captures?.reduce((sum, item) => sum + item.amount, 0) || (payment.status === "captured" ? payment.amount : 0);
    const refunded = payment.refunds?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const providerReference2 = payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id || null;
    return {
      paymentId: payment.id,
      orderId: payment.order?.id || null,
      orderDisplayId: payment.order?.displayId || null,
      currency: payment.currencyCode,
      status: payment.status,
      captured,
      refunded,
      netTender: captured - refunded,
      providerReference: providerReference2,
      capturedAt: payment.capturedAt,
      accountingPolicyVersion: payment.order?.metadata?.commercialSnapshot?.accountingPolicyVersion || null,
      exception: payment.status === "captured" && (!providerReference2 || captured !== payment.amount) ? "CAPTURE_EVIDENCE_MISMATCH" : null
    };
  });
  const byCurrency = Object.values(
    rows.reduce((result, row) => {
      const current = result[row.currency] || {
        currency: row.currency,
        captured: 0,
        refunded: 0,
        netTender: 0,
        count: 0
      };
      current.captured += row.captured;
      current.refunded += row.refunded;
      current.netTender += row.netTender;
      current.count += 1;
      result[row.currency] = current;
      return result;
    }, {})
  );
  const controlPayload = JSON.stringify({ start, end, byCurrency, rows });
  return {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    range: { start: startAt.toISOString(), end: endAt.toISOString() },
    legalEntityId: null,
    reportingCurrency: byCurrency.length === 1 ? byCurrency[0].currency : null,
    accountingPolicyVersion: null,
    providerSettlementStatus: "OWNER_DATA_REQUIRED",
    rows,
    byCurrency,
    exceptions: rows.filter((row) => row.exception),
    control: {
      rowCount: rows.length,
      sha256: import_node_crypto9.default.createHash("sha256").update(controlPayload).digest("hex")
    }
  };
}
var getFinanceClose_default = getFinanceClose;

// features/keystone/queries/regulatedCommerceReadiness.ts
init_access();
async function regulatedCommerceReadiness(_root, _args, context) {
  const canRead = permissions.canReadCompliance({ session: context.session }) || permissions.canManageCompliance({ session: context.session });
  const canStop = permissions.canOperateComplianceKillSwitch({ session: context.session });
  if (!canRead && !canStop) throw new Error("Access denied");
  const sudo = context.sudo();
  const gateBlockers = await releaseBlockers(context);
  const launchReady = gateBlockers.length === 0;
  const transactionMode = launchReady ? "enabled" : "disabled";
  if (!canRead) return {
    launchReady,
    canStop: true,
    canExport: false,
    blockers: gateBlockers,
    integrationStates: [],
    transactionMode,
    claimBoundary: "You can stop regulated sales. Managing compliance records needs compliance access.",
    profiles: await sudo.query.RegulatedMerchantProfile.findMany({ take: 10, query: "id legalName status killSwitch" }),
    activeRuleSets: [],
    approvedClassifications: [],
    activeProviderApprovals: [],
    reportRuns: []
  };
  const nowDate = /* @__PURE__ */ new Date();
  const now = nowDate.toISOString();
  const [profiles, activeRuleSets, approvedClassifications, activeProviderApprovals, reportRuns] = await Promise.all([
    sudo.query.RegulatedMerchantProfile.findMany({ take: 10, orderBy: [{ createdAt: "desc" }], query: "id legalName status pactRegistered killSwitch enabledCategories effectiveAt expiresAt originJurisdiction { code } launchJurisdictions { code }" }),
    sudo.query.RegulatedRuleSet.findMany({ where: { status: { equals: "active" }, effectiveAt: { lte: now }, expiresAt: { gt: now } }, take: 100, query: "id packName version policyHash jurisdiction { code name } approvedAt expiresAt" }),
    sudo.query.RegulatedProductClassification.findMany({ where: { status: { equals: "approved" } }, take: 100, query: "id category brand manufacturer status effectiveAt expiresAt marketingReviewStatus variant { id sku product { id title status } } authorizations { id authority authorizationType status effectiveAt expiresAt delistedAt jurisdiction { code } }" }),
    sudo.query.ProviderApproval.findMany({ where: { status: { equals: "active" }, effectiveAt: { lte: now }, expiresAt: { gt: now } }, take: 100, query: "id purpose providerCode coveredCategories coveredJurisdictionCodes capabilities expiresAt" }),
    sudo.query.ComplianceReportRun.findMany({ take: 25, orderBy: [{ generatedAt: "desc" }], query: "id reportType status periodStartsAt periodEndsAt contentDigest generatedAt jurisdiction { code }" })
  ]);
  const activeProfiles = profiles.filter(
    (profile) => isCurrentEvidence(profile, ["active"], nowDate) && !profile.killSwitch && profile.pactRegistered && profile.originJurisdiction?.code && profile.enabledCategories?.length && profile.launchJurisdictions?.length
  );
  const usableClassifications = approvedClassifications.filter(
    (classification) => isCurrentEvidence(classification, ["approved"], nowDate) && classification.marketingReviewStatus === "approved" && classification.authorizations?.some(
      (authorization) => ["federal_marketing_order", "preexisting_status"].includes(authorization.authorizationType) && !authorization.delistedAt && isCurrentEvidence(authorization, ["authorized"], nowDate)
    )
  );
  const requiredProviderPurposes = ["identity", "payment", "tax", "carrier", "registry"];
  const integrationStates = requiredProviderPurposes.map((purpose) => ({
    purpose,
    status: activeProviderApprovals.some((approval) => approval.purpose === purpose) ? "recorded_active" : "unconfigured"
  }));
  const blockers = [
    ...gateBlockers,
    ...activeProfiles.length === 1 ? [] : ["EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED"],
    ...activeRuleSets.length ? [] : ["ACTIVE_REVIEWED_POLICY_REQUIRED"],
    ...usableClassifications.length ? [] : ["CURRENT_PRODUCT_AND_FEDERAL_AUTHORITY_REQUIRED"],
    ...integrationStates.filter((integration) => integration.status !== "recorded_active").map((integration) => `${integration.purpose.toUpperCase()}_PROVIDER_AUTHORITY_REQUIRED`)
  ];
  return {
    launchReady,
    canStop: permissions.canOperateComplianceKillSwitch({ session: context.session }),
    canExport: permissions.canManageComplianceReports({ session: context.session }),
    blockers,
    integrationStates,
    transactionMode,
    claimBoundary: "Checkout opens when a merchant profile is active, its kill switch is off and it has a launch jurisdiction. Each order is still checked against the compliance rules for its cart.",
    profiles,
    activeRuleSets,
    approvedClassifications: usableClassifications,
    activeProviderApprovals,
    reportRuns
  };
}

// features/keystone/mutations/stopRegulatedCommerce.ts
init_access();

// features/keystone/regulated/emergency-stop-audit.ts
function buildEmergencyStopAuditRecord({
  profileId,
  actorId,
  occurredAt
}) {
  const reasonCode = "OPERATOR_STOP";
  const occurredAtIso = occurredAt.toISOString();
  return {
    eventType: "merchant.emergency_stop",
    resourceType: "RegulatedMerchantProfile",
    resourceId: profileId,
    actorId,
    reasonCode,
    evidenceDigest: evidenceDigest({ profileId, actorId, reasonCode, occurredAt: occurredAtIso }),
    data: { inFlightReviewRequired: true },
    occurredAt
  };
}

// features/keystone/mutations/stopRegulatedCommerce.ts
async function stopRegulatedCommerce(_root, { profileId, reason }, context) {
  if (!context.session?.itemId || !permissions.canOperateComplianceKillSwitch({ session: context.session })) throw new Error("Access denied");
  if (typeof reason !== "string" || reason.trim().length < 10 || reason.length > 500) throw new Error("Provide a reason of 10\u2013500 characters, without personal or identity data");
  if (typeof profileId !== "string" || !profileId || profileId.length > 200) throw new Error("Merchant profile is required");
  const now = /* @__PURE__ */ new Date();
  return context.prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "RegulatedMerchantProfile" WHERE id = ${profileId} FOR UPDATE`;
    const profile = await tx.regulatedMerchantProfile.findUnique({ where: { id: profileId }, select: { id: true, status: true } });
    if (!profile) throw new Error("Merchant profile not found");
    await tx.regulatedMerchantProfile.update({ where: { id: profileId }, data: { killSwitch: true, ...profile.status === "active" ? { status: "suspended" } : {} } });
    await tx.complianceDecision.updateMany({ where: { revokedAt: null }, data: { revokedAt: now } });
    await tx.carrierEligibilityDecision.updateMany({ where: { result: "allow", orderId: null }, data: { result: "revoked" } });
    await tx.complianceEvent.create({
      data: buildEmergencyStopAuditRecord({
        profileId,
        actorId: context.session.itemId,
        occurredAt: now
      })
    });
    return { profileId, killSwitch: true, stoppedAt: now.toISOString(), inFlightReviewRequired: true };
  });
}

// features/keystone/mutations/exportComplianceInventory.ts
init_access();
async function exportComplianceInventory(_root, { profileId }, context) {
  if (!context.session?.itemId || !permissions.canManageComplianceReports({ session: context.session })) throw new Error("Access denied");
  const sudo = context.sudo();
  const profile = await sudo.query.RegulatedMerchantProfile.findOne({
    where: { id: profileId },
    query: `id legalName status pactRegistered killSwitch effectiveAt expiresAt
      originJurisdiction { code } launchJurisdictions(take: 100) { code }
      licenses(take: 100) { id licenseType status effectiveAt expiresAt }
      providerApprovals(take: 100) { id purpose providerCode status effectiveAt expiresAt }`
  });
  if (!profile) throw new Error("Merchant profile not found");
  const now = /* @__PURE__ */ new Date();
  const content = {
    schemaVersion: "openfront-vape-evidence-inventory/v1",
    claimBoundary: "Recorded configuration only. Not a PACT filing, legal authority, provider acceptance or launch approval.",
    transactionEnabled: (await releaseBlockers(context)).length === 0,
    generatedAt: now.toISOString(),
    limits: { perRelation: 100 },
    profile
  };
  const contentDigest = evidenceDigest(content);
  const report = await sudo.prisma.$transaction(async (tx) => {
    const stored = await tx.complianceReportRun.create({ data: {
      merchantProfileId: profile.id,
      reportType: "evidence_inventory",
      status: "generated",
      periodStartsAt: now,
      periodEndsAt: now,
      content,
      contentDigest,
      artifactReference: `sha256:${contentDigest}`,
      generatedAt: now,
      generatedById: context.session.itemId
    } });
    await tx.complianceEvent.create({ data: {
      eventType: "evidence.inventory_exported",
      resourceType: "ComplianceReportRun",
      resourceId: stored.id,
      actorId: context.session.itemId,
      reasonCode: "OPERATOR_EXPORT",
      evidenceDigest: contentDigest,
      occurredAt: now,
      data: { profileId: profile.id, identityEvidenceIncluded: false }
    } });
    return stored;
  });
  return { id: report.id, contentDigest, content };
}

// features/keystone/queries/evaluateActiveCartCompliance.ts
init_cart_access();
var purposes = /* @__PURE__ */ new Set(["cart", "shipping", "payment", "checkout"]);
async function evaluateActiveCartCompliance(_root, { cartId, purpose = "cart", paymentProviderId }, context) {
  await assertCartAccess(context, cartId);
  if (!purposes.has(purpose)) throw new Error("Unsupported storefront compliance purpose");
  const result = await evaluateCartCompliance({
    context,
    cartId,
    purpose,
    paymentProviderId
  });
  if (!result.regulated) return { regulated: false, result: "not_applicable", reasonCodes: [] };
  return {
    regulated: true,
    result: result.decision?.result,
    reasonCodes: result.decision?.reasonCodes,
    policyVersion: result.decision?.policyVersion,
    evaluatedAt: result.decision?.evaluatedAt
  };
}

// features/keystone/mutations/complianceReports.ts
init_access();
function requireReportPermission(context) {
  if (!permissions.canManageComplianceReports({ session: context.session })) {
    throw new Error("Access denied");
  }
}
function boundedPeriod(startsAt, endsAt) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
    throw new Error("A valid half-open reporting period is required");
  }
  if (end.getTime() - start.getTime() > 93 * 24 * 60 * 60 * 1e3) {
    throw new Error("Report periods cannot exceed 93 days");
  }
  return { start, end };
}
async function generateComplianceReport(_root, args, context) {
  requireReportPermission(context);
  if (args.reportType !== "evidence_inventory") throw new Error("Only evidence_inventory exports are implemented; this is not a jurisdiction filing");
  const { start, end } = boundedPeriod(args.periodStartsAt, args.periodEndsAt);
  if (!args.reportType?.trim() || !args.jurisdictionId || !args.merchantProfileId) {
    throw new Error("Report type, jurisdiction, and merchant profile are required");
  }
  const sudo = context.sudo();
  const [jurisdiction, merchant] = await Promise.all([
    sudo.prisma.jurisdiction.findUnique({ where: { id: args.jurisdictionId }, select: { id: true, code: true } }),
    sudo.prisma.regulatedMerchantProfile.findUnique({ where: { id: args.merchantProfileId }, select: { id: true, legalName: true } })
  ]);
  if (!jurisdiction || !merchant) throw new Error("Reporting scope not found");
  const decisions = await sudo.prisma.complianceDecision.findMany({
    where: {
      merchantProfileId: merchant.id,
      jurisdictionId: jurisdiction.id,
      issuedAt: { gte: start, lt: end },
      orderId: { not: null }
    },
    orderBy: [{ issuedAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      orderId: true,
      purpose: true,
      result: true,
      reasonCodes: true,
      policyPack: true,
      policyVersion: true,
      policyHash: true,
      snapshotDigest: true,
      issuedAt: true
    }
  });
  const content = {
    schemaVersion: "openfront-vape-report/v1",
    reportType: args.reportType.trim(),
    jurisdictionCode: jurisdiction.code,
    merchantProfileId: merchant.id,
    period: { startsAt: start.toISOString(), endsAt: end.toISOString() },
    generatedFrom: "immutable_compliance_decisions",
    decisions
  };
  const digest = evidenceDigest(content);
  const policyVersions = [...new Set(decisions.map(
    (decision) => `${decision.policyPack}@${decision.policyVersion}:${decision.policyHash}`
  ))].sort();
  const generatedAt = /* @__PURE__ */ new Date();
  const report = await sudo.prisma.complianceReportRun.create({
    data: {
      reportType: args.reportType.trim(),
      jurisdictionId: jurisdiction.id,
      merchantProfileId: merchant.id,
      periodStartsAt: start,
      periodEndsAt: end,
      sourceTransactionIds: decisions.map((decision) => decision.orderId),
      policyVersions,
      contentDigest: digest,
      content,
      artifactReference: `database:ComplianceReportRun:${digest}`,
      status: "generated",
      generatedById: context.session.itemId,
      generatedAt
    }
  });
  await sudo.prisma.complianceEvent.create({
    data: {
      eventType: "report.generated",
      resourceType: "ComplianceReportRun",
      resourceId: report.id,
      actorId: context.session.itemId,
      reasonCode: "OPERATOR_GENERATED",
      evidenceDigest: digest,
      data: { reportType: args.reportType.trim(), jurisdictionCode: jurisdiction.code },
      occurredAt: generatedAt
    }
  });
  return sudo.query.ComplianceReportRun.findOne({
    where: { id: report.id },
    query: "id reportType status periodStartsAt periodEndsAt contentDigest artifactReference generatedAt"
  });
}
async function recordComplianceReportSubmission(_root, args, context) {
  requireReportPermission(context);
  await assertCommerceReleaseEnabled(context);
  const receipt = args.filingReceiptReference?.trim();
  const status = args.status ?? "submitted";
  if (!receipt || !["submitted", "accepted", "rejected"].includes(status)) {
    throw new Error("A filing receipt and valid external submission status are required");
  }
  const sudo = context.sudo();
  const at = /* @__PURE__ */ new Date();
  const result = await sudo.prisma.$transaction(async (tx) => {
    const report = await tx.complianceReportRun.findUnique({ where: { id: args.reportId } });
    if (!report || !["generated", "reviewed", "submitted"].includes(report.status)) throw new Error("Report is not eligible for submission recording");
    const updated = await tx.complianceReportRun.update({
      where: { id: report.id },
      data: { status, filingReceiptReference: receipt, submittedAt: at, submittedById: context.session.itemId }
    });
    await tx.complianceEvent.create({
      data: {
        eventType: "report.submission_recorded",
        resourceType: "ComplianceReportRun",
        resourceId: report.id,
        actorId: context.session.itemId,
        reasonCode: status.toUpperCase(),
        evidenceDigest: evidenceDigest({ reportId: report.id, receipt, status, at: at.toISOString() }),
        data: { status, receiptReferenceRecorded: true },
        occurredAt: at
      }
    });
    return updated;
  });
  return sudo.query.ComplianceReportRun.findOne({ where: { id: result.id }, query: "id reportType status submittedAt filingReceiptReference" });
}

// features/keystone/mutations/privacy.ts
var allowedActions = /* @__PURE__ */ new Set(["access", "correct", "delete", "restrict", "object"]);
function interactiveDataSubjectId(context) {
  const session = context.session;
  const userId = session?.itemId;
  if (!userId) throw new Error("Authentication required");
  if (["apiKeyScopes", "oauthScopes", "customerToken"].some((marker) => Object.prototype.hasOwnProperty.call(session, marker))) {
    throw new Error("Privacy actions require an interactive sign-in");
  }
  return userId;
}
async function updatePrivacyPreferences(root, { preferences }, context) {
  const userId = interactiveDataSubjectId(context);
  const analytics = preferences?.analytics;
  const marketingEmail = preferences?.marketingEmail;
  if (typeof analytics !== "boolean" || typeof marketingEmail !== "boolean") {
    throw new Error("Privacy preferences must contain boolean analytics and marketingEmail values");
  }
  const receipt = {
    analytics,
    marketingEmail,
    recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: "customer-account"
  };
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: "id userField { id preferences }"
  });
  if (!user) throw new Error("User not found");
  if (user.userField?.id) {
    await sudo.query.UserField.updateOne({
      where: { id: user.userField.id },
      data: {
        preferences: {
          ...user.userField.preferences || {},
          privacy: receipt
        }
      }
    });
  } else {
    await sudo.query.UserField.createOne({
      data: {
        user: { connect: { id: userId } },
        preferences: { privacy: receipt }
      }
    });
  }
  return receipt;
}
async function requestPrivacyAction(root, { action, details }, context) {
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
        details: typeof details === "string" ? details.slice(0, 2e3) : null,
        status: "pending_identity_verification",
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    },
    query: "id eventName createdAt data"
  });
  return request;
}
var PRIVACY_PAGE_SIZE = 100;
var PRIVACY_MAX_RECORDS = 1e4;
async function readCompleteOwnedList(sudo, listKey2, where, orderBy, query, label) {
  const expected = await sudo.query[listKey2].count({ where });
  if (!Number.isSafeInteger(expected) || expected > PRIVACY_MAX_RECORDS) {
    throw new Error(`Privacy export exceeds the supported ${label} limit (${PRIVACY_MAX_RECORDS}); contact privacy operations`);
  }
  const rows = [];
  for (let skip = 0; skip < expected; skip += PRIVACY_PAGE_SIZE) {
    const page = await sudo.query[listKey2].findMany({ where, orderBy, take: PRIVACY_PAGE_SIZE, skip, query });
    rows.push(...page);
    if (page.length < PRIVACY_PAGE_SIZE) break;
  }
  const finalCount = await sudo.query[listKey2].count({ where });
  if (rows.length !== expected || finalCount !== expected || new Set(rows.map((row) => row.id)).size !== expected) {
    throw new Error(`Privacy export is incomplete: ${label} changed during export; retry`);
  }
  return rows;
}
async function getMyPrivacyData(root, args, context) {
  const userId = interactiveDataSubjectId(context);
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: `
      id name email phone createdAt updatedAt onboardingStatus
      userField { preferences }
    `
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
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    user: { ...user, addresses, orders }
  };
}

// features/keystone/security/native-command-bridge.ts
init_commerce_fence();
function controlledNativeMutations(schema, commands) {
  const fields = schema.getMutationType()?.getFields();
  return Object.fromEntries(Object.entries(commands).map(([name, command]) => {
    const native = fields?.[name]?.resolve;
    if (!native) throw new Error(`Missing native mutation ${name}`);
    const resolver = (root, args, context, info) => insideCommerceFence(context) ? native(root, args, context, info) : command(root, args, context, info);
    return [name, resolver];
  }));
}

// features/keystone/security/business-request-command.ts
init_access();
init_commerce_fence();
async function updateRequests(context, entries2) {
  if (!entries2.length || entries2.length > 100 || entries2.some((entry) => !entry.where?.id) || sortedIds(entries2.map((entry) => entry.where.id)).length !== entries2.length) throw new Error("Request could not be updated");
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    if (!permissions.canManageOrders({ session: tx.session })) throw new Error("Request review permission required");
    for (const id2 of sortedIds(entries2.map((entry) => entry.where.id))) {
      await tx.prisma.$queryRaw`SELECT id FROM "BusinessAccountRequest" WHERE id = ${id2} FOR UPDATE`;
    }
    const results = [];
    for (const entry of entries2) results.push(await tx.db.BusinessAccountRequest.updateOne(entry));
    return results;
  });
}
var controlledBusinessRequestResolvers = {
  updateBusinessAccountRequest: async (_, entry, context) => (await updateRequests(context, [entry]))[0],
  updateBusinessAccountRequests: async (_, { data }, context) => updateRequests(context, data)
};

// features/keystone/security/cart-command.ts
init_access();
init_cart_access();
init_commerce_fence();
async function cartCommand(context, entries2) {
  const parsed = entries2.map((entry) => ({ ...entry, data: parseCartUpdate(entry.data) }));
  const addresses = parsed.flatMap((entry) => [entry.data.shippingAddress?.connect.id, entry.data.billingAddress?.connect.id]).filter((id2) => Boolean(id2));
  return withCartSetFence(context, entries2.map((entry) => entry.where?.id), "mutation", async (tx) => {
    const result = [];
    for (const entry of [...parsed].sort((a, b) => a.where.id.localeCompare(b.where.id))) {
      await updateActiveCart(null, { cartId: entry.where.id, data: entry.data }, tx);
      result.push(await tx.sudo().db.Cart.findOne({ where: entry.where }));
    }
    return entries2.map((entry) => result.find((cart) => cart?.id.toString() === entry.where.id));
  }, addresses);
}
async function createControlledCart(_root, { data }, context) {
  return withCommerceFence(context, async (original) => {
    const tx = await currentCommerceActor(original);
    if (!tx.session?.itemId || !tx.session.data?.role?.canManageOrders) throw new Error("Cart could not be created");
    const allowed = /* @__PURE__ */ new Set(["email", "region", "shippingAddress", "billingAddress", "lineItems", "user", "type"]);
    if (Object.keys(data).some((key) => !allowed.has(key))) throw new Error("Cart could not be created");
    const { user, type, ...values } = data;
    const parsed = parseCartUpdate(values);
    if (type !== void 0 && type !== "default") throw new Error("Cart could not be created");
    let ownerId = tx.session.itemId;
    if (user !== void 0) {
      const selected = user;
      if (!selected?.connect?.id || Object.keys(selected).join() !== "connect" || Object.keys(selected.connect).join() !== "id") throw new Error("Select one existing cart owner");
      ownerId = selected.connect.id;
      if (ownerId !== tx.session.itemId && !tx.session.data?.role?.canManageUsers) throw new Error("Cart could not be created");
      if (!await tx.query.User.findOne({ where: { id: ownerId }, query: "id" })) throw new Error("Cart owner not found");
    }
    for (const id2 of sortedIds([parsed.shippingAddress?.connect.id, parsed.billingAddress?.connect.id])) {
      await tx.prisma.$queryRaw`SELECT id FROM "Address" WHERE id = ${id2} FOR UPDATE`;
      await assertAddressAccess(tx, id2);
      const address = await tx.prisma.address.findUnique({ where: { id: id2 }, select: { userId: true } });
      if (address?.userId !== ownerId) throw new Error("Selected address does not belong to the exact cart customer");
    }
    return tx.sudo().db.Cart.createOne({ data: { ...parsed, type: "default", user: { connect: { id: ownerId } } } });
  });
}
var canManageCarts = (context) => permissions.canManageOrders({ session: context.session });
async function managedCartUpdate(context, entries2) {
  return withCommerceFence(context, async (tx) => {
    const result = [];
    for (const entry of entries2) result.push(await tx.db.Cart.updateOne(entry));
    return result;
  });
}
async function deleteCarts(context, where) {
  if (!canManageCarts(context)) throw new Error("Cart cannot be deleted");
  return withCommerceFence(context, async (tx) => {
    const result = [];
    for (const entry of where) result.push(await tx.db.Cart.deleteOne({ where: entry }));
    return result;
  });
}
var controlledCartResolvers = {
  createCart: createControlledCart,
  updateCart: async (_, entry, context) => (await (canManageCarts(context) ? managedCartUpdate(context, [entry]) : cartCommand(context, [entry])))[0],
  updateCarts: async (_, { data }, context) => canManageCarts(context) ? managedCartUpdate(context, data) : cartCommand(context, data),
  deleteCart: async (_, { where }, context) => (await deleteCarts(context, [where]))[0],
  deleteCarts: async (_, { where }, context) => deleteCarts(context, where)
};

// features/keystone/mutations/index.ts
var graphql = String.raw;
var releaseGuard = (resolver) => async (root, args, context, info) => {
  await assertCommerceReleaseEnabled(context);
  return resolver(root, args, context, info);
};
var extendGraphqlSchema = (schema) => (0, import_schema.mergeSchemas)({
  schemas: [schema],
  typeDefs: graphql`
      input CartCodeInput {
        code: String!
      }

      type Query {
        redirectToInit: Boolean
        activeCart(cartId: ID!): JSON
        activeCartShippingOptions(cartId: ID!): [ShippingOption!]
        activeCartPaymentProviders(regionId: ID!): [PaymentProvider!]
        activeCartRegion(countryCode: String!): Region
        getCustomerOrder(orderId: ID!, secretKey: String): JSON
        getCustomerOrders(limit: Int, offset: Int): JSON
        getCustomerAccount(accountId: ID!): JSON
        getCustomerAccounts(limit: Int, offset: Int): JSON
        getUnpaidLineItemsByRegion(accountId: ID!): UnpaidLineItemsByRegionResult!
        getInvoicePaymentSessions(invoiceId: ID!): [PaymentSession!]!
        getAnalytics(timeframe: String): JSON
        activeInvoice(invoiceId: ID!): JSON
        getCustomerPaidInvoices(limit: Int, offset: Int): JSON
        getFinanceClose(start: String!, end: String!): JSON!
        getMyPrivacyData: JSON!
        regulatedCommerceReadiness: JSON!
        evaluateActiveCartCompliance(cartId: ID!, purpose: String, paymentProviderId: ID): JSON!
        getProductsSortedByPrice(
          countryCode: String!
          limit: Int!
          offset: Int!
          priceOrder: String!
          collectionId: ID
          categoryId: ID
        ): ProductsSortedByPriceResult!
      }

      type ProductsSortedByPriceResult {
        products: [Product!]!
        count: Int!
      }

      type ShippingRate {
        id: ID!
        provider: String!
        service: String!
        carrier: String!
        price: String!
        estimatedDays: String!
      }

      type ProviderShippingLabel {
        id: ID!
        status: String!
        trackingNumber: String
        trackingUrl: String
        labelUrl: String
        data: JSON
      }

      type PackageDimensions {
        length: Float!
        width: Float!
        height: Float!
        weight: Float!
        unit: String!
        weightUnit: String!
      }

      input DimensionsInput {
        length: Float!
        width: Float!
        height: Float!
        weight: Float!
        unit: String!
        weightUnit: String!
      }

      input LineItemInput {
        lineItemId: ID!
        quantity: Int!
      }

      type AddressValidationResult {
        isValid: Boolean!
        normalizedAddress: JSON
        errors: [String!]
      }

      type TrackingEvent {
        status: String!
        location: String
        timestamp: String!
        message: String
      }

      type ShipmentTrackingResult {
        status: String!
        estimatedDeliveryDate: String
        trackingEvents: [TrackingEvent!]!
      }

      type LabelCancellationResult {
        success: Boolean!
        refundStatus: String
        error: String
      }

      input UserUpdateProfileInput {
        email: String
        name: String
        phone: String
        billingAddress: String
        password: String
        onboardingStatus: String
      }

      type WebhookResult {
        success: Boolean!
        message: String
        statusCode: Int
        error: String
      }


      type CustomerTokenResult {
        success: Boolean!
        token: String
      }

      input PaymentInput {
        paymentMethod: String!
        paymentMethodId: String
        orderId: String
        data: JSON
      }

      type PaymentResult {
        success: Boolean!
        invoice: Invoice
        payment: Payment
        message: String
        error: String
      }

      type InvoiceCreationResult {
        success: Boolean!
        invoiceId: ID
        message: String
        error: String
      }

      type RegionLineItems {
        region: JSON!
        lineItems: [JSON!]!
        totalAmount: Int!
        formattedTotalAmount: String!
        itemCount: Int!
      }

      type UnpaidLineItemsByRegionResult {
        success: Boolean!
        regions: [RegionLineItems!]!
        totalRegions: Int!
        totalUnpaidItems: Int!
        message: String
      }

      type InvoicePaymentResult {
        id: ID!
        status: String!
        success: Boolean!
        message: String!
        error: String
      }

      type Mutation {
        updateActiveUser(data: UserUpdateProfileInput!): User
        createActiveCart(regionId: ID!): JSON!
        updateActiveCart(cartId: ID!, data: CartUpdateInput, code: String): Cart
        updateActiveCartLineItem(cartId: ID!, lineId: ID!, quantity: Int!): Cart
        updateActiveUserPassword(
          oldPassword: String!
          newPassword: String!
          confirmPassword: String!
        ): User
        updateActiveUserAddress(where: AddressWhereUniqueInput!, data: AddressUpdateInput!): User
        createActiveUserAddress(data: AddressCreateInput!): User
        deleteActiveUserAddress(where: AddressWhereUniqueInput!): Address
        addDiscountToActiveCart(cartId: ID!, code: String!): Cart
        removeDiscountFromActiveCart(cartId: ID!, code: String!): Cart
        createActiveCartPaymentSessions(cartId: ID!): Cart
        setActiveCartPaymentSession(cartId: ID!, providerId: ID!): Cart
        completeActiveCart(cartId: ID!, paymentSessionId: ID): JSON
        addActiveCartShippingMethod(cartId: ID!, shippingMethodId: ID!): Cart
        initiatePaymentSession(
          cartId: ID!
          paymentProviderId: String!
        ): PaymentSession
        handlePaymentProviderWebhook(providerId: ID!, event: JSON!, headers: JSON!): WebhookResult!
        importInventory: Boolean
        adjustInventory(variantId: ID!, delta: Int!, reason: String!, note: String): ProductVariant
        getRatesForOrder(orderId: ID!, providerId: ID!, dimensions: DimensionsInput): [ShippingRate!]!
        validateShippingAddress(providerId: ID!, address: JSON!): AddressValidationResult!
        trackShipment(providerId: ID!, trackingNumber: String!): ShipmentTrackingResult!
        cancelShippingLabel(providerId: ID!, labelId: ID!): LabelCancellationResult!
        createProviderShippingLabel(
          orderId: ID!
          providerId: ID!
          rateId: String!
          dimensions: DimensionsInput
          lineItems: [LineItemInput!]
          idempotencyKey: String!
        ): ProviderShippingLabel
        createOrderFulfillment(
          orderId: ID!
          lineItems: [LineItemInput!]!
          trackingNumber: String
          carrier: String
          noNotification: Boolean
          idempotencyKey: String!
        ): Fulfillment!
        cancelOrderFulfillment(fulfillmentId: ID!, reason: String!): Fulfillment!
        transitionOrderStatus(orderId: ID!, status: String!, reason: String!): Order!
        regenerateCustomerToken: CustomerTokenResult!
        createInvoiceFromLineItems(accountId: ID!, regionId: ID!, lineItemIds: [ID!]!, dueDate: String): InvoiceCreationResult!
        createInvoicePaymentSessions(invoiceId: ID!): Invoice!
        initiateInvoicePaymentSession(invoiceId: ID!, paymentProviderId: String!): PaymentSession
        setInvoicePaymentSession(invoiceId: ID!, providerId: ID!): Invoice
        completeInvoicePayment(paymentSessionId: ID!): InvoicePaymentResult!
        processReturnRefund(returnId: ID!, paymentId: ID!, idempotencyKey: String!): Refund
        stopRegulatedCommerce(profileId: ID!, reason: String!): JSON!
        exportComplianceInventory(profileId: ID!): JSON!
        generateComplianceReport(reportType: String!, jurisdictionId: ID!, merchantProfileId: ID!, periodStartsAt: String!, periodEndsAt: String!): ComplianceReportRun
        recordComplianceReportSubmission(reportId: ID!, filingReceiptReference: String!, status: String): ComplianceReportRun
        retryWebhookDeliveries(limit: Int): Int!
        registerWebhookEndpoint(
          registrationKey: String!
          url: String!
          events: [String!]!
          secret: String!
          requiredScope: String
        ): WebhookEndpoint!
        updatePrivacyPreferences(preferences: JSON!): JSON!
        requestPrivacyAction(action: String!, details: String): Notification
      }
    `,
  resolvers: {
    Query: {
      redirectToInit: redirectToInit_default,
      activeCart: activeCart_default,
      activeCartShippingOptions: activeCartShippingOptions_default,
      activeCartPaymentProviders: activeCartPaymentProviders_default,
      activeCartRegion: activeCartRegion_default,
      getCustomerOrder: getCustomerOrder_default,
      getCustomerOrders: getCustomerOrders_default,
      getCustomerAccount: getCustomerAccount_default,
      getCustomerAccounts: getCustomerAccounts_default,
      getUnpaidLineItemsByRegion: getUnpaidLineItemsByRegion_default,
      getInvoicePaymentSessions: getInvoicePaymentSessions_default,
      getAnalytics: getAnalytics_default,
      activeInvoice: activeInvoice_default,
      getCustomerPaidInvoices: getCustomerPaidInvoices_default,
      getFinanceClose: getFinanceClose_default,
      getMyPrivacyData,
      regulatedCommerceReadiness,
      evaluateActiveCartCompliance,
      getProductsSortedByPrice
    },
    Mutation: {
      ...controlledNativeMutations(schema, controlledAddressResolvers),
      ...controlledNativeMutations(schema, controlledCartResolvers),
      ...controlledNativeMutations(schema, controlledBusinessRequestResolvers),
      updateActiveUserPassword,
      createActiveCart: createActiveCart_default,
      updateActiveCart,
      updateActiveCartLineItem,
      updateActiveUser,
      createActiveUserAddress,
      updateActiveUserAddress,
      deleteActiveUserAddress,
      addDiscountToActiveCart: addDiscountToActiveCart_default,
      removeDiscountFromActiveCart: removeDiscountFromActiveCart_default,
      createActiveCartPaymentSessions: releaseGuard(createActiveCartPaymentSessions_default),
      setActiveCartPaymentSession: releaseGuard(setActiveCartPaymentSession_default),
      completeActiveCart: completeActiveCart_default,
      addActiveCartShippingMethod: addActiveCartShippingMethod_default,
      initiatePaymentSession: releaseGuard(initiatePaymentSession_default),
      handlePaymentProviderWebhook: handlePaymentProviderWebhook_default,
      importInventory,
      adjustInventory: adjustInventory_default,
      getRatesForOrder: getRatesForOrder_default,
      validateShippingAddress: validateShippingAddress_default,
      trackShipment: trackShipment_default,
      cancelShippingLabel: cancelShippingLabel_default,
      createProviderShippingLabel: createProviderShippingLabel_default,
      createOrderFulfillment: createOrderFulfillment_default,
      cancelOrderFulfillment: cancelOrderFulfillment_default,
      transitionOrderStatus: transitionOrderStatus_default,
      regenerateCustomerToken: regenerateCustomerToken_default,
      createInvoiceFromLineItems: createInvoiceFromLineItems_default,
      createInvoicePaymentSessions: createInvoicePaymentSessions_default,
      initiateInvoicePaymentSession: initiateInvoicePaymentSession_default,
      setInvoicePaymentSession: setInvoicePaymentSession_default,
      completeInvoicePayment: completeInvoicePayment_default,
      processReturnRefund: processReturnRefund_default,
      stopRegulatedCommerce,
      exportComplianceInventory,
      generateComplianceReport,
      recordComplianceReportSubmission,
      retryWebhookDeliveries: retryWebhookDeliveries_default,
      registerWebhookEndpoint: registerWebhookEndpoint_default,
      updatePrivacyPreferences,
      requestPrivacyAction
    }
  }
});

// features/keystone/models/requiredRelationship.ts
function requireRelationship({ operation, fieldKey, resolvedData, inputData, addValidationError }) {
  if (operation === "update" && resolvedData[fieldKey] === void 0 && inputData?.[fieldKey] === void 0) return;
  const value = resolvedData[fieldKey];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const connection2 = value;
    const connected = connection2.connect;
    const created = connection2.create;
    const hasConnection = connected && typeof connected === "object" && !Array.isArray(connected) && Object.values(connected).some((selector) => typeof selector === "string" && selector.length > 0 || typeof selector === "number" && Number.isSafeInteger(selector));
    const hasNestedCreate = created && typeof created === "object" && !Array.isArray(created) && Object.keys(created).length > 0;
    if (!connection2.disconnect && (hasConnection || hasNestedCreate)) return;
  }
  addValidationError(`${fieldKey} is required`);
}

// features/keystone/models/Address.ts
var import_core2 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");
init_access();

// features/keystone/security/address-input.ts
var CUSTOMER_ADDRESS_FIELDS = /* @__PURE__ */ new Set([
  "company",
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "province",
  "postalCode",
  "phone",
  "isBilling",
  "metadata",
  "country"
]);
function resolveCustomerAddressData({
  inputData,
  resolvedData,
  userId
}) {
  const restrictedData = { ...resolvedData };
  for (const key of Object.keys(inputData ?? {})) {
    if (!CUSTOMER_ADDRESS_FIELDS.has(key)) delete restrictedData[key];
  }
  restrictedData.user = { connect: { id: userId } };
  return restrictedData;
}

// features/keystone/models/Address.ts
var import_access26 = require("@keystone-6/core/access");
var canManageAddresses = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};
var Address = (0, import_core2.list)({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: isSignedIn,
      delete: isSignedIn
    },
    filter: {
      query: canManageAddresses,
      update: canManageAddresses,
      delete: canManageAddresses
    }
  },
  hooks: {
    validateInput: async ({ operation, item, inputData, context, addValidationError }) => {
      if (operation !== "update" || !item?.id) return;
      try {
        await assertAddressUnreferenced(context, item.id);
      } catch {
        addValidationError("Address could not be updated");
      }
    },
    validateDelete: async ({ item, context, addValidationError }) => {
      try {
        await assertAddressUnreferenced(context, item.id);
      } catch {
        addValidationError("Address could not be deleted");
      }
    },
    resolveInput: ({ operation, inputData, resolvedData, context }) => {
      if (Object.keys(inputData || {}).some((key) => ["cart", "cartsUsingBilling", "cartsUsingShipping", "ordersUsingBilling", "ordersUsingShipping"].includes(key))) throw new Error("Address could not be updated");
      if ((operation === "create" || operation === "update") && !permissions.canManageUsers({ session: context.session })) {
        return resolveCustomerAddressData({
          inputData,
          resolvedData,
          userId: context.session.itemId
        });
      }
      return resolvedData;
    }
  },
  fields: {
    label: (0, import_fields5.virtual)({
      field: import_core2.graphql.field({
        type: import_core2.graphql.String,
        resolve(item) {
          const parts = [];
          if (item.company) {
            parts.push(item.company);
          }
          if (item.firstName || item.lastName) {
            parts.push(`${item.firstName || ""} ${item.lastName || ""}`.trim());
          }
          if (item.address1) {
            parts.push(item.address1);
          }
          if (item.address2) {
            parts.push(item.address2);
          }
          const cityProvince = [];
          if (item.city) cityProvince.push(item.city);
          if (item.province) cityProvince.push(item.province);
          if (cityProvince.length > 0) {
            parts.push(cityProvince.join(", ") + (item.postalCode ? ` ${item.postalCode}` : ""));
          } else if (item.postalCode) {
            parts.push(item.postalCode);
          }
          return parts.join(" \u2022 ");
        }
      })
    }),
    company: (0, import_fields5.text)(),
    firstName: (0, import_fields5.text)(),
    lastName: (0, import_fields5.text)(),
    address1: (0, import_fields5.text)(),
    address2: (0, import_fields5.text)(),
    city: (0, import_fields5.text)(),
    province: (0, import_fields5.text)(),
    postalCode: (0, import_fields5.text)(),
    phone: (0, import_fields5.text)(),
    isBilling: (0, import_fields5.checkbox)({ defaultValue: false }),
    metadata: (0, import_fields5.json)(),
    country: (0, import_fields5.relationship)({
      ref: "Country.addresses",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    user: (0, import_fields5.relationship)({
      ref: "User.addresses",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && context.session?.itemId && !permissions.canManageUsers({ session: context.session })) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    shippingProviders: (0, import_fields5.relationship)({
      ref: "ShippingProvider.fromAddress",
      many: true
    }),
    cart: (0, import_fields5.relationship)({
      ref: "Cart.addresses",
      access: { create: import_access26.denyAll, update: import_access26.denyAll },
      many: false
    }),
    claimOrders: (0, import_fields5.relationship)({
      ref: "ClaimOrder.address",
      many: true
    }),
    ordersUsingAsBillingAddress: (0, import_fields5.relationship)({
      ref: "Order.billingAddress",
      access: { create: import_access26.denyAll, update: import_access26.denyAll },
      many: true
    }),
    ordersUsingAsShippingAddress: (0, import_fields5.relationship)({
      ref: "Order.shippingAddress",
      access: { create: import_access26.denyAll, update: import_access26.denyAll },
      many: true
    }),
    cartsUsingAsBillingAddress: (0, import_fields5.relationship)({
      ref: "Cart.billingAddress",
      access: { create: import_access26.denyAll, update: import_access26.denyAll },
      many: true
    }),
    cartsUsingAsShippingAddress: (0, import_fields5.relationship)({
      ref: "Cart.shippingAddress",
      access: { create: import_access26.denyAll, update: import_access26.denyAll },
      many: true
    }),
    swaps: (0, import_fields5.relationship)({
      ref: "Swap.address",
      many: true
    }),
    ...trackingFieldsFor()
  },
  ui: {
    labelField: "label"
  }
});

// features/keystone/models/ApiKey.ts
var import_fields6 = require("@keystone-6/core/fields");
var import_core3 = require("@keystone-6/core");
init_access();
var ApiKey = (0, import_core3.list)({
  access: {
    operation: {
      query: isSignedIn,
      create: permissions.canManageKeys,
      update: permissions.canManageKeys,
      delete: permissions.canManageKeys
    },
    filter: {
      query: rules.canManageKeys,
      update: rules.canManageKeys,
      delete: rules.canManageKeys
    }
  },
  hooks: {
    validate: {
      create: async ({ resolvedData, addValidationError }) => {
        if (!resolvedData.scopes || resolvedData.scopes.length === 0) {
          addValidationError("At least one scope is required for API keys");
        }
      }
    },
    resolveInput: {
      create: async ({ resolvedData, context }) => {
        return {
          ...resolvedData,
          user: resolvedData.user || (context.session?.itemId ? { connect: { id: context.session.itemId } } : void 0)
        };
      }
    }
  },
  fields: {
    name: (0, import_fields6.text)({
      validation: { isRequired: true },
      ui: {
        description: "A descriptive name for this API key (e.g. 'Production Bot', 'Analytics Dashboard')"
      }
    }),
    tokenSecret: (0, import_fields6.password)({
      validation: { isRequired: true },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
        description: "Secure API key token (hashed and never displayed)"
      }
    }),
    tokenPreview: (0, import_fields6.text)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
        description: "Preview of the API key (actual key is hidden for security)"
      }
    }),
    scopes: (0, import_fields6.json)({
      defaultValue: [],
      ui: {
        description: "Array of scopes for this API key. Available scopes: orders:read, orders:write, shops:read, shops:write, channels:read, channels:write, etc."
      }
    }),
    status: (0, import_fields6.select)({
      type: "enum",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Revoked", value: "revoked" }
      ],
      defaultValue: "active",
      ui: {
        description: "Current status of this API key"
      }
    }),
    expiresAt: (0, import_fields6.timestamp)({
      ui: {
        description: "When this API key expires (optional - leave blank for no expiration)"
      }
    }),
    lastUsedAt: (0, import_fields6.timestamp)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Last time this API key was used"
      }
    }),
    usageCount: (0, import_fields6.json)({
      defaultValue: { total: 0, daily: {} },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Usage statistics for this API key"
      }
    }),
    restrictedToIPs: (0, import_fields6.json)({
      defaultValue: [],
      ui: {
        description: "Optional: Restrict this key to specific IP addresses (array of IPs)"
      }
    }),
    user: (0, import_fields6.relationship)({
      ref: "User.apiKeys",
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    }),
    ...trackingFields
  },
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "tokenPreview", "scopes", "status", "lastUsedAt", "expiresAt"]
    },
    description: "Secure API keys for programmatic access to Openfront"
  }
});

// features/keystone/models/BatchJob.ts
var import_core4 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
init_access();
var BatchJob = (0, import_core4.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields7.select)({
      type: "enum",
      options: [
        { label: "Product Import", value: "PRODUCT_IMPORT" },
        { label: "Order Export", value: "ORDER_EXPORT" },
        { label: "Inventory Update", value: "INVENTORY_UPDATE" },
        { label: "Price Update", value: "PRICE_UPDATE" }
      ],
      validation: { isRequired: true }
    }),
    status: (0, import_fields7.select)({
      type: "enum",
      options: [
        { label: "Created", value: "CREATED" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Failed", value: "FAILED" },
        { label: "Canceled", value: "CANCELED" }
      ],
      defaultValue: "CREATED",
      validation: { isRequired: true }
    }),
    context: (0, import_fields7.json)({
      defaultValue: {}
    }),
    result: (0, import_fields7.json)({
      defaultValue: {}
    }),
    error: (0, import_fields7.text)(),
    progress: (0, import_fields7.integer)({
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100
      }
    }),
    createdBy: (0, import_fields7.relationship)({
      ref: "User.batchJobs",
      many: false
    }),
    completedAt: (0, import_fields7.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Capture.ts
var import_core5 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
init_access();
var Capture = (0, import_core5.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields8.integer)({
      validation: {
        isRequired: true
      }
    }),
    payment: (0, import_fields8.relationship)({
      ref: "Payment.captures"
    }),
    metadata: (0, import_fields8.json)(),
    createdBy: (0, import_fields8.text)(),
    ...trackingFields
  }
});

// features/keystone/models/Cart.ts
var import_core6 = require("@keystone-6/core");
var import_access30 = require("@keystone-6/core/access");
var import_fields9 = require("@keystone-6/core/fields");
init_access();
init_commerce_fence();
var formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
async function calculateCartSubtotal(cart, context) {
  const sudoContext = context.sudo();
  if (!cart?.lineItems?.length) return 0;
  let subtotal = 0;
  for (const lineItem of cart.lineItems) {
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: lineItem.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region?.currency?.code } }
      },
      query: "calculatedPrice { calculatedAmount }"
    });
    const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
    subtotal += price * lineItem.quantity;
  }
  return subtotal;
}
async function calculateCartDiscount(cart, context) {
  const sudoContext = context.sudo();
  if (!cart?.discounts?.length) return 0;
  let totalDiscountAmount = 0;
  for (const discount of cart.discounts) {
    if (!discount.discountRule?.type) continue;
    const { type, value, allocation } = discount.discountRule;
    const conditions = discount.discountRule.discountConditions || [];
    const currencyMultiplier = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
    const eligibleLineItems = [];
    for (const lineItem of cart.lineItems || []) {
      if (lineItem.productVariant?.product?.discountable === false) {
        continue;
      }
      const product = lineItem.productVariant?.product;
      if (!product) continue;
      const isEligible = validateProductAgainstConditions(product, conditions);
      if (isEligible) {
        eligibleLineItems.push(lineItem);
      }
    }
    if (eligibleLineItems.length === 0 && type !== "free_shipping") {
      continue;
    }
    let eligibleSubtotal = 0;
    for (const lineItem of eligibleLineItems) {
      const prices = await sudoContext.query.MoneyAmount.findMany({
        where: {
          productVariant: { id: { equals: lineItem.productVariant.id } },
          region: { id: { equals: cart.region?.id } },
          currency: { code: { equals: cart.region?.currency?.code } }
        },
        query: "calculatedPrice { calculatedAmount }"
      });
      const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
      eligibleSubtotal += price * lineItem.quantity;
    }
    switch (type) {
      case "percentage":
        totalDiscountAmount += eligibleSubtotal * (value / 100);
        break;
      case "fixed":
        if (allocation === "item") {
          const eligibleQuantity = eligibleLineItems.reduce((sum, li) => sum + li.quantity, 0);
          totalDiscountAmount += value * currencyMultiplier * eligibleQuantity;
        } else {
          totalDiscountAmount += value * currencyMultiplier;
        }
        break;
      case "free_shipping":
        totalDiscountAmount += cart.shippingMethods?.reduce(
          (total, method) => total + (method.price || 0),
          0
        ) || 0;
        break;
    }
  }
  const subtotal = await calculateCartSubtotal(cart, context);
  return Math.min(totalDiscountAmount, subtotal);
}
function validateProductAgainstConditions(product, conditions) {
  const productConditions = conditions.filter(
    (c) => c.type === "products" || c.type === "product_types" || c.type === "product_collections" || c.type === "product_tags"
  );
  if (productConditions.length === 0) {
    return true;
  }
  for (const condition of productConditions) {
    const { type, operator } = condition;
    let conditionEntityIds = [];
    let productEntityIds = [];
    switch (type) {
      case "products":
        conditionEntityIds = condition.products?.map((p) => p.id) || [];
        productEntityIds = [product.id];
        break;
      case "product_types":
        conditionEntityIds = condition.productTypes?.map((t) => t.id) || [];
        productEntityIds = product.productType ? [product.productType.id] : [];
        break;
      case "product_collections":
        conditionEntityIds = condition.productCollections?.map((c) => c.id) || [];
        productEntityIds = product.productCollections?.map((c) => c.id) || [];
        break;
      case "product_tags":
        conditionEntityIds = condition.productTags?.map((t) => t.id) || [];
        productEntityIds = product.productTags?.map((t) => t.id) || [];
        break;
      default:
        continue;
    }
    if (conditionEntityIds.length === 0) {
      continue;
    }
    const hasMatch = productEntityIds.some((id2) => conditionEntityIds.includes(id2));
    if (operator === "in" && !hasMatch) {
      return false;
    }
    if (operator === "not_in" && hasMatch) {
      return false;
    }
  }
  return true;
}
async function calculateCartShipping(cart) {
  if (!cart?.shippingMethods?.length) return 0;
  return cart.shippingMethods.reduce(
    (total, method) => total + (method.price || 0),
    0
  );
}
async function calculateCartTax(cart, context) {
  const subtotal = await calculateCartSubtotal(cart, context);
  const discount = await calculateCartDiscount(cart, context);
  const taxableAmount = subtotal - discount;
  return taxableAmount * (cart.region?.taxRate || 0);
}
async function calculateCartTotal(cart, context) {
  const [subtotal, discount, shipping, tax] = await Promise.all([
    calculateCartSubtotal(cart, context),
    calculateCartDiscount(cart, context),
    calculateCartShipping(cart),
    calculateCartTax(cart, context)
  ]);
  return subtotal - discount + shipping + tax;
}
async function findCheapestShippingOption(regionId, context) {
  const sudoContext = context.sudo();
  const shippingOptions = (await sudoContext.query.ShippingOption.findMany({
    where: {
      AND: [
        { region: { id: { equals: regionId } } },
        { isReturn: { equals: false } },
        { adminOnly: { equals: false } }
      ]
    },
    query: `
      id
      amount
      name
      priceType
      shippingOptionRequirements { id }
    `
  })).map((row) => row);
  return shippingOptions.filter(
    (option) => option.shippingOptionRequirements?.length === 0 && shippingOptionCharge(option.priceType, option.amount) !== null
  ).sort(
    (left, right) => shippingOptionCharge(left.priceType, left.amount) - shippingOptionCharge(right.priceType, right.amount)
  )[0];
}
var Cart = (0, import_core6.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }) || Boolean(session?.customerToken),
      create: () => true,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    },
    filter: {
      query: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      },
      update: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      }
    }
  },
  hooks: {
    async beforeOperation({ operation, resolvedData, context, item }) {
      if ((operation === "update" || operation === "delete") && !insideCommerceFence(context) && !permissions.canManageOrders({ session: context.session })) throw new Error("Cart could not be updated");
      const sudoContext = context.sudo();
      if (operation === "create" && insideCommerceFence(context)) {
        const priorContext = resolvedData.context;
        resolvedData.context = { ...priorContext && typeof priorContext === "object" && !Array.isArray(priorContext) ? priorContext : {}, commerceCreation: { version: 1 } };
      }
      if (operation === "create" && !permissions.canManageOrders({ session: context.session })) {
        const allowedCreateFields = /* @__PURE__ */ new Set([
          "region",
          "type",
          "context",
          // Server-minted creation provenance, not a caller capability.
          ...context.session?.customerToken ? ["idempotencyKey"] : []
        ]);
        for (const key of Object.keys(resolvedData)) {
          if (!allowedCreateFields.has(key)) delete resolvedData[key];
        }
        resolvedData.type = "default";
      }
      if (operation === "create" && context.session?.itemId && (!permissions.canManageOrders({ session: context.session }) || !resolvedData.user)) {
        resolvedData.user = { connect: { id: context.session.itemId } };
      }
      if (operation === "create" && resolvedData.region || operation === "update" && resolvedData.region && item?.regionId !== resolvedData.region.connect?.id) {
        const regionId = resolvedData.region?.connect?.id;
        if (!regionId) throw new Error("Select an existing region");
        const cheapestOption = await findCheapestShippingOption(regionId, context);
        if (operation === "create") {
          if (cheapestOption) {
            resolvedData.shippingMethods = {
              create: [{
                shippingOption: { connect: { id: cheapestOption.id } },
                price: shippingOptionCharge(cheapestOption.priceType, cheapestOption.amount),
                data: { name: cheapestOption.name }
              }]
            };
          }
        } else {
          const previousMethods = await sudoContext.query.ShippingMethod.findMany({
            where: { cart: { id: { equals: item.id } } },
            query: "id"
          });
          if (previousMethods.length) {
            await Promise.all(
              previousMethods.map(
                (method) => sudoContext.db.ShippingMethod.deleteOne({
                  where: { id: method.id }
                })
              )
            );
          }
          if (cheapestOption) {
            await sudoContext.db.ShippingMethod.createOne({
              data: {
                cart: { connect: { id: item.id } },
                shippingOption: { connect: { id: cheapestOption.id } },
                price: shippingOptionCharge(cheapestOption.priceType, cheapestOption.amount),
                data: { name: cheapestOption.name }
              }
            });
          }
          resolvedData.paymentCollection = { disconnect: true };
        }
      }
    }
  },
  fields: {
    complianceRevision: (0, import_fields9.integer)({ defaultValue: 0, access: { create: import_access30.denyAll, update: import_access30.denyAll }, validation: { min: 0, isRequired: true } }),
    email: (0, import_fields9.text)(),
    type: (0, import_fields9.select)({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Swap", value: "swap" },
        { label: "Draft Order", value: "draft_order" },
        { label: "Payment Link", value: "payment_link" },
        { label: "Claim", value: "claim" }
      ],
      defaultValue: "default",
      validation: { isRequired: true }
    }),
    metadata: (0, import_fields9.json)(),
    idempotencyKey: (0, import_fields9.text)({
      isIndexed: "unique",
      db: { isNullable: true },
      ui: { itemView: { fieldMode: "read" } }
    }),
    context: (0, import_fields9.json)({ access: { create: import_access30.denyAll, update: import_access30.denyAll } }),
    paymentAuthorizedAt: (0, import_fields9.timestamp)(),
    abandonedEmailSent: (0, import_fields9.checkbox)({ defaultValue: false }),
    // Track if abandoned cart email was sent
    user: (0, import_fields9.relationship)({
      ref: "User.carts",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if (operation === "create" && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    // Regular fields
    region: (0, import_fields9.relationship)({
      ref: "Region.carts"
    }),
    addresses: (0, import_fields9.relationship)({
      ref: "Address.cart",
      access: { create: import_access30.denyAll, update: import_access30.denyAll },
      many: true
    }),
    discounts: (0, import_fields9.relationship)({
      ref: "Discount.carts",
      many: true
    }),
    giftCards: (0, import_fields9.relationship)({
      ref: "GiftCard.carts",
      many: true
    }),
    draftOrder: (0, import_fields9.relationship)({
      ref: "DraftOrder.cart"
    }),
    order: (0, import_fields9.relationship)({
      ref: "Order.cart"
    }),
    lineItems: (0, import_fields9.relationship)({
      ref: "LineItem.cart",
      many: true
    }),
    customShippingOptions: (0, import_fields9.relationship)({
      ref: "CustomShippingOption.cart",
      many: true
    }),
    swap: (0, import_fields9.relationship)({
      ref: "Swap.cart"
    }),
    shippingMethods: (0, import_fields9.relationship)({
      ref: "ShippingMethod.cart",
      many: true
    }),
    payment: (0, import_fields9.relationship)({
      ref: "Payment.cart"
    }),
    paymentCollection: (0, import_fields9.relationship)({
      ref: "PaymentCollection.cart"
    }),
    billingAddress: (0, import_fields9.relationship)({
      ref: "Address.cartsUsingAsBillingAddress",
      many: false
    }),
    shippingAddress: (0, import_fields9.relationship)({
      ref: "Address.cartsUsingAsShippingAddress",
      many: false
    }),
    ...(0, import_core6.group)({
      label: "Virtual Fields",
      description: "Calculated fields for cart display and totals",
      fields: {
        abandonedFor: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Int,
            resolve(item) {
              if (!item.updatedAt) return 0;
              const lastActivity = new Date(item.updatedAt).getTime();
              return Math.floor((Date.now() - lastActivity) / (1e3 * 60));
            }
          })
        }),
        status: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.enum({
              name: "CartStatus",
              values: import_core6.graphql.enumValues(["ACTIVE", "COMPLETED"])
            }),
            resolve(item) {
              return item.orderId ? "COMPLETED" : "ACTIVE";
            }
          })
        }),
        isActive: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Boolean,
            resolve(item) {
              return !item.orderId;
            }
          })
        }),
        subtotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!cart) return null;
              if (!cart) return null;
              const subtotal = await calculateCartSubtotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(subtotal / divisor, currencyCode);
            }
          })
        }),
        total: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              if (!cart) return null;
              const total = await calculateCartTotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(total / divisor, currencyCode);
            }
          })
        }),
        rawTotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              if (!cart) return null;
              if (!cart) return 0;
              return Math.round(await calculateCartTotal(cart, context));
            }
          })
        }),
        rawSubtotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!cart) return null;
              if (!cart?.lineItems?.length) return "No items in cart";
              let subtotal = 0;
              const breakdown = [];
              for (const lineItem of cart.lineItems) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: { id: { equals: lineItem.productVariant.id } },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } }
                  },
                  query: "id region { id } currency { code } calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                const itemTotal = price * lineItem.quantity;
                subtotal += itemTotal;
                const title = `${lineItem.productVariant.product?.title} - ${lineItem.productVariant.title}`;
                breakdown.push(`${title}: ${price} \xD7 ${lineItem.quantity} = ${itemTotal}`);
              }
              return `Total: ${subtotal}
Breakdown:
${breakdown.join("\n")}`;
            }
          })
        }),
        rawTotalBreakdown: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              if (!cart) return null;
              if (!cart) return "Cart not found";
              const subtotal = await calculateCartSubtotal(cart, context);
              const discount = await calculateCartDiscount(cart, context);
              const shipping = await calculateCartShipping(cart);
              const tax = await calculateCartTax(cart, context);
              const total = subtotal - discount + shipping + tax;
              return `subtotal(${subtotal}) - discount(${discount}) + shipping(${shipping}) + tax(${tax}) = ${total}`;
            }
          })
        }),
        discount: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `
              });
              if (!cart) return null;
              if (!cart?.discounts?.length) {
                return null;
              }
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id }
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } }
                  },
                  query: "calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of cart.discounts) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += cart.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              if (totalDiscountAmount === 0) return null;
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(
                totalDiscountAmount / divisor,
                currencyCode
              );
            }
          })
        }),
        giftCardTotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  giftCards {
                    id
                    balance
                    value
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!cart) return null;
              if (!cart?.giftCards?.length) {
                return null;
              }
              const total = cart.giftCards.reduce((sum, card) => {
                const usableAmount = Math.min(
                  card.balance,
                  card.value || card.balance
                );
                return sum + usableAmount;
              }, 0);
              if (total === 0) return null;
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(total / divisor, currencyCode);
            }
          })
        }),
        tax: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                `
              });
              if (!cart) return null;
              const tax = await calculateCartTax(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(tax / divisor, currencyCode);
            }
          })
        }),
        shipping: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!cart) return null;
              if (cart?.shippingMethods?.length > 0) {
                const shipping = await calculateCartShipping(cart);
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                return shipping > 0 ? formatCurrency(shipping / divisor, currencyCode) : null;
              }
              if (cart?.region?.id) {
                const shippingOptions = await sudoContext.query.ShippingOption.findMany({
                  where: {
                    region: { id: { equals: cart.region.id } },
                    isReturn: { equals: false }
                  },
                  query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                  orderBy: { amount: "asc" }
                });
                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }
              return null;
            }
          })
        }),
        cheapestShipping: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!cart) return null;
              if (cart?.shippingMethods?.length > 0) {
                const shippingAmount = cart.shippingMethods.reduce(
                  (total, method) => total + (method.price || 0),
                  0
                );
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                return formatCurrency(shippingAmount / divisor, currencyCode);
              }
              if (cart?.region?.id) {
                const shippingOptions = await sudoContext.query.ShippingOption.findMany({
                  where: {
                    region: { id: { equals: cart.region.id } },
                    isReturn: { equals: false }
                  },
                  query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                  orderBy: { amount: "asc" }
                });
                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }
              return null;
            }
          })
        }),
        discountsById: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `
              });
              if (!cart) return null;
              if (!cart?.discounts?.length) {
                return {};
              }
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id }
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: currencyCode } }
                  },
                  query: "calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }
              const discountAmounts = {};
              for (const discount of cart.discounts) {
                if (!discount.discountRule?.type) continue;
                let amount = 0;
                switch (discount.discountRule.type) {
                  case "percentage":
                    amount = subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    amount = discount.discountRule.value * (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    amount = cart.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
                if (amount > 0) {
                  discountAmounts[discount.id] = formatCurrency(
                    amount / divisor,
                    currencyCode
                  );
                }
              }
              return discountAmounts;
            }
          })
        }),
        checkoutStep: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  id
                  email
                  billingAddress { id }
                  shippingAddress { id }
                  shippingMethods {
                    id
                  }
                  paymentCollection {
                    id
                    paymentSessions {
                      id
                      isSelected
                    }
                  }
                  lineItems {
                    id
                  }
                `
              });
              if (!cart) return null;
              if (!cart || !cart.lineItems?.length) return "cart";
              if (!cart.billingAddress?.id || !cart.shippingAddress?.id)
                return "address";
              if (!cart.shippingMethods?.length) return "delivery";
              if (!cart.paymentCollection?.id || !cart.paymentCollection?.paymentSessions?.some(
                (s) => s.isSelected
              )) {
                return "payment";
              }
              return "review";
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/ClaimImage.ts
var import_core7 = require("@keystone-6/core");
var import_fields10 = require("@keystone-6/core/fields");
init_access();
var ClaimImage = (0, import_core7.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // image: cloudinaryImage({
    //   cloudinary,
    //   label: 'Source',
    // }),
    image: (0, import_fields10.image)({ storage: "my_images" }),
    url: (0, import_fields10.text)({
      label: "Image URL",
      ui: {
        description: "Direct URL to the image file"
      }
    }),
    altText: (0, import_fields10.text)(),
    claimItem: (0, import_fields10.relationship)({ ref: "ClaimItem.claimImages" }),
    metadata: (0, import_fields10.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "altText", "claimItem"]
    }
  }
});

// features/keystone/models/ClaimItem.ts
var import_core8 = require("@keystone-6/core");
var import_fields11 = require("@keystone-6/core/fields");
init_access();
var ClaimItem = (0, import_core8.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    reason: (0, import_fields11.select)({
      type: "enum",
      options: [
        {
          label: "Missing Item",
          value: "missing_item"
        },
        {
          label: "Wrong Item",
          value: "wrong_item"
        },
        {
          label: "Production Failure",
          value: "production_failure"
        },
        {
          label: "Other",
          value: "other"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    note: (0, import_fields11.text)(),
    quantity: (0, import_fields11.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields11.json)(),
    productVariant: (0, import_fields11.relationship)({
      ref: "ProductVariant.claimItems"
    }),
    lineItem: (0, import_fields11.relationship)({
      ref: "LineItem.claimItems"
    }),
    claimOrder: (0, import_fields11.relationship)({
      ref: "ClaimOrder.claimItems"
    }),
    claimImages: (0, import_fields11.relationship)({
      ref: "ClaimImage.claimItem",
      many: true
    }),
    claimTags: (0, import_fields11.relationship)({
      ref: "ClaimTag.claimItems",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimOrder.ts
var import_core9 = require("@keystone-6/core");
var import_fields12 = require("@keystone-6/core/fields");
init_access();
var ClaimOrder = (0, import_core9.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    paymentStatus: (0, import_fields12.select)({
      type: "enum",
      options: [
        {
          label: "Na",
          value: "na"
        },
        {
          label: "Not Refunded",
          value: "not_refunded"
        },
        {
          label: "Refunded",
          value: "refunded"
        }
      ],
      defaultValue: "na",
      validation: {
        isRequired: true
      }
    }),
    fulfillmentStatus: (0, import_fields12.select)({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled"
        },
        {
          label: "Partially Fulfilled",
          value: "partially_fulfilled"
        },
        {
          label: "Fulfilled",
          value: "fulfilled"
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped"
        },
        {
          label: "Shipped",
          value: "shipped"
        },
        {
          label: "Partially Returned",
          value: "partially_returned"
        },
        {
          label: "Returned",
          value: "returned"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      defaultValue: "not_fulfilled",
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields12.select)({
      type: "enum",
      options: [
        {
          label: "Refund",
          value: "refund"
        },
        {
          label: "Replace",
          value: "replace"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    refundAmount: (0, import_fields12.integer)(),
    canceledAt: (0, import_fields12.timestamp)(),
    metadata: (0, import_fields12.json)(),
    idempotencyKey: (0, import_fields12.text)(),
    noNotification: (0, import_fields12.checkbox)(),
    address: (0, import_fields12.relationship)({
      ref: "Address.claimOrders"
    }),
    order: (0, import_fields12.relationship)({
      ref: "Order.claimOrders"
    }),
    claimItems: (0, import_fields12.relationship)({
      ref: "ClaimItem.claimOrder",
      many: true
    }),
    fulfillments: (0, import_fields12.relationship)({
      ref: "Fulfillment.claimOrder",
      many: true
    }),
    lineItems: (0, import_fields12.relationship)({
      ref: "LineItem.claimOrder",
      many: true
    }),
    return: (0, import_fields12.relationship)({
      ref: "Return.claimOrder"
    }),
    shippingMethods: (0, import_fields12.relationship)({
      ref: "ShippingMethod.claimOrder",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimTag.ts
var import_core10 = require("@keystone-6/core");
var import_fields13 = require("@keystone-6/core/fields");
init_access();
var ClaimTag = (0, import_core10.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields13.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields13.text)(),
    metadata: (0, import_fields13.json)(),
    claimItems: (0, import_fields13.relationship)({
      ref: "ClaimItem.claimTags",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Country.ts
var import_core11 = require("@keystone-6/core");
var import_access36 = require("@keystone-6/core/access");
var import_fields14 = require("@keystone-6/core/fields");
init_access();
var Country = (0, import_core11.list)({
  access: {
    operation: {
      query: () => true,
      // query: ({ session }) =>
      //   permissions.canReadUsers({ session }) ||
      //   permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    iso2: (0, import_fields14.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    iso3: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    numCode: (0, import_fields14.integer)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    displayName: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    region: (0, import_fields14.relationship)({
      ref: "Region.countries"
    }),
    addresses: (0, import_fields14.relationship)({
      ref: "Address.country",
      access: { create: import_access36.denyAll, update: import_access36.denyAll },
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Currency.ts
var import_core12 = require("@keystone-6/core");
var import_fields15 = require("@keystone-6/core/fields");
init_access();
var NO_DIVISION_CURRENCIES3 = ["jpy", "krw", "vnd"];
var Currency = (0, import_core12.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields15.text)({
      isIndexed: "unique",
      validation: { isRequired: true }
    }),
    symbol: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    symbolNative: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    name: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    moneyAmounts: (0, import_fields15.relationship)({
      ref: "MoneyAmount.currency",
      many: true
    }),
    orders: (0, import_fields15.relationship)({
      ref: "Order.currency",
      many: true
    }),
    payments: (0, import_fields15.relationship)({
      ref: "Payment.currency",
      many: true
    }),
    regions: (0, import_fields15.relationship)({
      ref: "Region.currency",
      many: true
    }),
    stores: (0, import_fields15.relationship)({
      ref: "Store.currencies",
      many: true
    }),
    accounts: (0, import_fields15.relationship)({
      ref: "Account.currency",
      many: true
    }),
    invoices: (0, import_fields15.relationship)({
      ref: "Invoice.currency",
      many: true
    }),
    ...(0, import_core12.group)({
      label: "Virtual Fields",
      description: "Virtual fields for currency",
      fields: {
        noDivisionCurrency: (0, import_fields15.virtual)({
          field: import_core12.graphql.field({
            type: import_core12.graphql.Boolean,
            resolve(item) {
              return NO_DIVISION_CURRENCIES3.includes(item.code.toLowerCase());
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/CustomerGroup.ts
var import_core13 = require("@keystone-6/core");
var import_fields16 = require("@keystone-6/core/fields");
init_access();
var CustomerGroup = (0, import_core13.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    name: (0, import_fields16.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields16.json)(),
    users: (0, import_fields16.relationship)({
      ref: "User.customerGroups",
      many: true
    }),
    discountConditions: (0, import_fields16.relationship)({
      ref: "DiscountCondition.customerGroups",
      many: true
    }),
    priceLists: (0, import_fields16.relationship)({
      ref: "PriceList.customerGroups",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/CustomShippingOption.ts
var import_core14 = require("@keystone-6/core");
var import_fields17 = require("@keystone-6/core/fields");
init_access();
var CustomShippingOption = (0, import_core14.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    price: (0, import_fields17.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields17.json)(),
    shippingOption: (0, import_fields17.relationship)({
      ref: "ShippingOption.customShippingOptions"
    }),
    cart: (0, import_fields17.relationship)({
      ref: "Cart.customShippingOptions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Discount.ts
var import_core15 = require("@keystone-6/core");
var import_access41 = require("@keystone-6/core/access");
var import_fields18 = require("@keystone-6/core/fields");
init_access();
var Discount = (0, import_core15.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields18.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    isDynamic: (0, import_fields18.checkbox)(),
    isDisabled: (0, import_fields18.checkbox)(),
    stackable: (0, import_fields18.checkbox)({
      defaultValue: false
    }),
    startsAt: (0, import_fields18.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    endsAt: (0, import_fields18.timestamp)({
      validation: {
        isRequired: false
      }
    }),
    metadata: (0, import_fields18.json)(),
    usageLimit: (0, import_fields18.integer)(),
    usageCount: (0, import_fields18.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    validDuration: (0, import_fields18.text)(),
    discountRule: (0, import_fields18.relationship)({
      ref: "DiscountRule.discounts"
    }),
    carts: (0, import_fields18.relationship)({
      ref: "Cart.discounts",
      access: { create: import_access41.denyAll, update: import_access41.denyAll },
      many: true
    }),
    lineItemAdjustments: (0, import_fields18.relationship)({
      ref: "LineItemAdjustment.discount",
      many: true
    }),
    regions: (0, import_fields18.relationship)({
      ref: "Region.discounts",
      many: true
    }),
    orders: (0, import_fields18.relationship)({
      ref: "Order.discounts",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const discount = await sudoContext.query.Discount.findOne({
          where: { id: String(item.id) },
          query: "carts { id }"
        });
        if (discount?.carts?.length) {
          for (const cart of discount.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  }
});

// features/keystone/models/DiscountCondition.ts
var import_core16 = require("@keystone-6/core");
var import_fields19 = require("@keystone-6/core/fields");
init_access();
var DiscountCondition = (0, import_core16.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields19.select)({
      type: "enum",
      options: [
        {
          label: "Products",
          value: "products"
        },
        {
          label: "Product Types",
          value: "product_types"
        },
        {
          label: "Product Collections",
          value: "product_collections"
        },
        {
          label: "Product Tags",
          value: "product_tags"
        },
        {
          label: "Customer Groups",
          value: "customer_groups"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    operator: (0, import_fields19.select)({
      type: "enum",
      options: [
        {
          label: "In",
          value: "in"
        },
        {
          label: "Not In",
          value: "not_in"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields19.json)(),
    discountRule: (0, import_fields19.relationship)({
      ref: "DiscountRule.discountConditions"
    }),
    customerGroups: (0, import_fields19.relationship)({
      ref: "CustomerGroup.discountConditions",
      many: true
    }),
    products: (0, import_fields19.relationship)({
      ref: "Product.discountConditions",
      many: true
    }),
    productCollections: (0, import_fields19.relationship)({
      ref: "ProductCollection.discountConditions",
      many: true
    }),
    productCategories: (0, import_fields19.relationship)({
      ref: "ProductCategory.discountConditions",
      many: true
    }),
    productTags: (0, import_fields19.relationship)({
      ref: "ProductTag.discountConditions",
      many: true
    }),
    productTypes: (0, import_fields19.relationship)({
      ref: "ProductType.discountConditions",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DiscountRule.ts
var import_core17 = require("@keystone-6/core");
var import_fields20 = require("@keystone-6/core/fields");
init_access();
var DiscountRule = (0, import_core17.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields20.text)(),
    type: (0, import_fields20.select)({
      type: "enum",
      options: [
        {
          label: "Fixed",
          value: "fixed"
        },
        {
          label: "Percentage",
          value: "percentage"
        },
        {
          label: "Free Shipping",
          value: "free_shipping"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    value: (0, import_fields20.integer)({
      validation: {
        isRequired: true
      }
    }),
    allocation: (0, import_fields20.select)({
      type: "enum",
      options: [
        {
          label: "Total",
          value: "total"
        },
        {
          label: "Item",
          value: "item"
        }
      ]
    }),
    metadata: (0, import_fields20.json)(),
    discounts: (0, import_fields20.relationship)({
      ref: "Discount.discountRule",
      many: true
    }),
    discountConditions: (0, import_fields20.relationship)({
      ref: "DiscountCondition.discountRule",
      many: true
    }),
    products: (0, import_fields20.relationship)({
      ref: "Product.discountRules",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DraftOrder.ts
var import_core18 = require("@keystone-6/core");
var import_access45 = require("@keystone-6/core/access");
var import_fields21 = require("@keystone-6/core/fields");
init_access();
var DraftOrder = (0, import_core18.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    status: (0, import_fields21.select)({
      type: "enum",
      options: [
        {
          label: "Open",
          value: "open"
        },
        {
          label: "Completed",
          value: "completed"
        }
      ],
      defaultValue: "open",
      validation: {
        isRequired: true
      }
    }),
    displayId: (0, import_fields21.integer)({
      validation: {
        isRequired: true
      }
    }),
    canceledAt: (0, import_fields21.timestamp)(),
    completedAt: (0, import_fields21.timestamp)(),
    metadata: (0, import_fields21.json)(),
    idempotencyKey: (0, import_fields21.text)(),
    noNotificationOrder: (0, import_fields21.checkbox)(),
    cart: (0, import_fields21.relationship)({
      ref: "Cart.draftOrder",
      access: { create: import_access45.denyAll, update: import_access45.denyAll }
    }),
    order: (0, import_fields21.relationship)({
      ref: "Order.draftOrder"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Fulfillment.ts
var import_core19 = require("@keystone-6/core");
var import_fields22 = require("@keystone-6/core/fields");
init_access();
var Fulfillment = (0, import_core19.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Status fields
    shippedAt: (0, import_fields22.timestamp)(),
    canceledAt: (0, import_fields22.timestamp)(),
    // Data fields
    data: (0, import_fields22.json)(),
    metadata: (0, import_fields22.json)(),
    idempotencyKey: (0, import_fields22.text)(),
    noNotification: (0, import_fields22.checkbox)({
      defaultValue: false
    }),
    // Relationships
    order: (0, import_fields22.relationship)({
      ref: "Order.fulfillments",
      many: false,
      hooks: {
        validateInput: async ({ context, operation, resolvedData, addValidationError }) => {
          requireRelationship({ operation, fieldKey: "order", resolvedData, addValidationError });
          if (operation === "create") {
            const fulfillmentItems = resolvedData.fulfillmentItems?.create || resolvedData.fulfillmentItems?.connect;
            if (!fulfillmentItems?.length) {
              addValidationError("No items to fulfill");
              return;
            }
            const order = await context.query.Order.findOne({
              where: { id: resolvedData.order.connect.id },
              query: `
                lineItems {
                  id
                  quantity
                }
                fulfillments {
                  canceledAt
                  fulfillmentItems {
                    quantity
                    lineItem {
                      id
                    }
                  }
                }
              `
            });
            if (!order?.lineItems) {
              addValidationError("Order not found or has no line items");
              return;
            }
            const unfulfilledQuantities = {};
            order.lineItems.forEach((item) => {
              unfulfilledQuantities[item.id] = item.quantity;
            });
            order.fulfillments?.forEach((fulfillment) => {
              if (!fulfillment.canceledAt) {
                fulfillment.fulfillmentItems?.forEach((item) => {
                  unfulfilledQuantities[item.lineItem.id] -= item.quantity;
                });
              }
            });
            let itemsToValidate = fulfillmentItems;
            if (resolvedData.fulfillmentItems?.connect) {
              const connectedItems = await context.query.FulfillmentItem.findMany({
                where: { id: { in: fulfillmentItems.map((item) => item.id) } },
                query: "quantity lineItem { id }"
              });
              itemsToValidate = connectedItems;
            }
            for (const item of itemsToValidate) {
              const lineItemId = resolvedData.fulfillmentItems?.create ? item.lineItem.connect.id : item.lineItem.id;
              const quantity = resolvedData.fulfillmentItems?.create ? item.quantity : item.quantity;
              const availableQuantity = unfulfilledQuantities[lineItemId] || 0;
              if (availableQuantity <= 0) {
                addValidationError(`Line item ${lineItemId} has no unfulfilled quantity`);
                return;
              }
              if (quantity > availableQuantity) {
                addValidationError(`Cannot fulfill more than ${availableQuantity} items for ${lineItemId}`);
                return;
              }
            }
          }
        }
      }
    }),
    claimOrder: (0, import_fields22.relationship)({
      ref: "ClaimOrder.fulfillments",
      many: false
    }),
    swap: (0, import_fields22.relationship)({
      ref: "Swap.fulfillments",
      many: false
    }),
    fulfillmentProvider: (0, import_fields22.relationship)({
      ref: "FulfillmentProvider.fulfillments",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    fulfillmentItems: (0, import_fields22.relationship)({
      ref: "FulfillmentItem.fulfillment",
      many: true
    }),
    shippingLabels: (0, import_fields22.relationship)({
      ref: "ShippingLabel.fulfillment",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentItem.ts
var import_core20 = require("@keystone-6/core");
var import_fields23 = require("@keystone-6/core/fields");
init_access();
var FulfillmentItem = (0, import_core20.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    quantity: (0, import_fields23.integer)({
      validation: {
        isRequired: true
      }
    }),
    fulfillment: (0, import_fields23.relationship)({
      ref: "Fulfillment.fulfillmentItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    lineItem: (0, import_fields23.relationship)({
      ref: "OrderLineItem.fulfillmentItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentProvider.ts
var import_core21 = require("@keystone-6/core");
var import_fields24 = require("@keystone-6/core/fields");
init_access();
var FulfillmentProvider = (0, import_core21.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  fields: {
    name: (0, import_fields24.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields24.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^fp_[a-zA-Z0-9-_]+$/,
          explanation: 'Code must start with "fp_" followed by letters, numbers, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields24.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields24.json)({
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    metadata: (0, import_fields24.json)(),
    // Relationships
    fulfillments: (0, import_fields24.relationship)({
      ref: "Fulfillment.fulfillmentProvider",
      many: true
    }),
    regions: (0, import_fields24.relationship)({
      ref: "Region.fulfillmentProviders",
      many: true
    }),
    shippingOptions: (0, import_fields24.relationship)({
      ref: "ShippingOption.fulfillmentProvider",
      many: true
    }),
    shippingProviders: (0, import_fields24.relationship)({
      ref: "ShippingProvider.fulfillmentProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCard.ts
var import_core22 = require("@keystone-6/core");
var import_access50 = require("@keystone-6/core/access");
var import_fields25 = require("@keystone-6/core/fields");
init_access();
var GiftCard = (0, import_core22.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadGiftCards({ session }) || permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const giftCard = await sudoContext.query.GiftCard.findOne({
          where: { id: String(item.id) },
          query: "carts { id }"
        });
        if (giftCard?.carts?.length) {
          for (const cart of giftCard.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  },
  fields: {
    code: (0, import_fields25.text)({
      validation: {
        isRequired: true
      },
      isIndexed: "unique"
    }),
    value: (0, import_fields25.integer)({
      validation: {
        isRequired: true
      }
    }),
    balance: (0, import_fields25.integer)({
      validation: {
        isRequired: true
      }
    }),
    isDisabled: (0, import_fields25.checkbox)(),
    endsAt: (0, import_fields25.timestamp)(),
    metadata: (0, import_fields25.json)(),
    order: (0, import_fields25.relationship)({
      ref: "Order.giftCards"
    }),
    carts: (0, import_fields25.relationship)({
      ref: "Cart.giftCards",
      access: { create: import_access50.denyAll, update: import_access50.denyAll },
      many: true
    }),
    giftCardTransactions: (0, import_fields25.relationship)({
      ref: "GiftCardTransaction.giftCard",
      many: true
    }),
    region: (0, import_fields25.relationship)({
      ref: "Region.giftCards"
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCardTransaction.ts
var import_core23 = require("@keystone-6/core");
var import_fields26 = require("@keystone-6/core/fields");
init_access();
var GiftCardTransaction = (0, import_core23.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadGiftCards({ session }) || permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards
    }
  },
  fields: {
    amount: (0, import_fields26.integer)({
      validation: {
        isRequired: true
      }
    }),
    isTaxable: (0, import_fields26.checkbox)(),
    taxRate: (0, import_fields26.float)(),
    giftCard: (0, import_fields26.relationship)({
      ref: "GiftCard.giftCardTransactions"
    }),
    order: (0, import_fields26.relationship)({
      ref: "Order.giftCardTransactions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/IdempotencyKey.ts
var import_core24 = require("@keystone-6/core");
var import_fields27 = require("@keystone-6/core/fields");
init_access();
var IdempotencyKey = (0, import_core24.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadIdempotencyKeys({ session }) || permissions.canManageIdempotencyKeys({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    idempotencyKey: (0, import_fields27.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    requestMethod: (0, import_fields27.text)(),
    requestParams: (0, import_fields27.json)(),
    requestPath: (0, import_fields27.text)(),
    responseCode: (0, import_fields27.integer)(),
    responseBody: (0, import_fields27.json)(),
    recoveryPoint: (0, import_fields27.text)({
      defaultValue: "started",
      validation: {
        isRequired: true
      }
    }),
    lockedAt: (0, import_fields27.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Invite.ts
var import_core25 = require("@keystone-6/core");
var import_fields28 = require("@keystone-6/core/fields");
init_access();
var Invite = (0, import_core25.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    userEmail: (0, import_fields28.text)({
      validation: {
        isRequired: true
      }
    }),
    role: (0, import_fields28.select)({
      type: "enum",
      options: [
        {
          label: "Admin",
          value: "admin"
        },
        {
          label: "Member",
          value: "member"
        },
        {
          label: "Developer",
          value: "developer"
        }
      ],
      defaultValue: "member"
    }),
    accepted: (0, import_fields28.checkbox)(),
    metadata: (0, import_fields28.json)(),
    token: (0, import_fields28.text)({
      validation: {
        isRequired: true
      }
    }),
    expiresAt: (0, import_fields28.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/Account.ts
var import_core26 = require("@keystone-6/core");
var import_fields29 = require("@keystone-6/core/fields");
init_access();
var Account = (0, import_core26.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // Core account data
    user: (0, import_fields29.relationship)({
      ref: "User.accounts",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    accountNumber: (0, import_fields29.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields29.text)({
      validation: { isRequired: true },
      defaultValue: "Business Account"
    }),
    description: (0, import_fields29.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Running business account for automated orders placed through API integration"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields29.integer)({
      defaultValue: 0
    }),
    paidAmount: (0, import_fields29.integer)({
      defaultValue: 0
    }),
    creditLimit: (0, import_fields29.integer)({
      validation: { isRequired: true },
      defaultValue: 1e5
      // $1000 default
    }),
    currency: (0, import_fields29.relationship)({
      ref: "Currency.accounts",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    // Status and dates
    status: (0, import_fields29.select)({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Not Approved", value: "not_approved" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" }
      ],
      defaultValue: "active",
      validation: { isRequired: true }
    }),
    dueDate: (0, import_fields29.timestamp)(),
    paidAt: (0, import_fields29.timestamp)(),
    suspendedAt: (0, import_fields29.timestamp)(),
    notApprovedAt: (0, import_fields29.timestamp)(),
    // Account type
    accountType: (0, import_fields29.select)({
      options: [
        { label: "Business", value: "business" },
        { label: "Personal", value: "personal" }
      ],
      defaultValue: "business",
      validation: { isRequired: true }
    }),
    // Metadata for additional context
    metadata: (0, import_fields29.json)({
      defaultValue: {}
    }),
    // Relationships
    orders: (0, import_fields29.relationship)({
      ref: "Order.account",
      many: true
    }),
    lineItems: (0, import_fields29.relationship)({
      ref: "AccountLineItem.account",
      many: true
    }),
    invoices: (0, import_fields29.relationship)({
      ref: "Invoice.account",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core26.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for account display",
      fields: {
        balanceDue: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            resolve(item) {
              return (item.totalAmount || 0) - (item.paidAmount || 0);
            }
          })
        }),
        formattedTotal: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (account.totalAmount || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(amount);
            }
          })
        }),
        formattedCreditLimit: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const limit = (account.creditLimit || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(limit);
            }
          })
        }),
        availableCredit: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            resolve(item) {
              const used = (item.totalAmount || 0) - (item.paidAmount || 0);
              return Math.max(0, (item.creditLimit || 0) - used);
            }
          })
        }),
        // New currency-aware fields for multi-region support
        totalOwedInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency2 = (await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports))).default;
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                `
              });
              if (!account?.currency?.code) return 0;
              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              let totalInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency2(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalInAccountCurrency += converted;
                }
              }
              return totalInAccountCurrency;
            }
          })
        }),
        availableCreditInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency2 = (await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports))).default;
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency { code }
                `
              });
              if (!account?.currency?.code) return 0;
              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              let totalOwedInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency2(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalOwedInAccountCurrency += converted;
                }
              }
              const creditLimit = account.creditLimit || 0;
              return Math.max(0, creditLimit - totalOwedInAccountCurrency);
            }
          })
        }),
        formattedTotalOwedInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount: formatCurrencyAmount3 } = await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports));
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  totalOwedInAccountCurrency
                `
              });
              if (!account?.currency?.code) return "$0.00";
              return formatCurrencyAmount3(
                account.totalOwedInAccountCurrency || 0,
                account.currency.code
              );
            }
          })
        }),
        formattedAvailableCreditInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount: formatCurrencyAmount3 } = await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports));
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  availableCreditInAccountCurrency
                `
              });
              if (!account?.currency?.code) return "$0.00";
              return formatCurrencyAmount3(
                account.availableCreditInAccountCurrency || 0,
                account.currency.code
              );
            }
          })
        }),
        // Proper current balance calculated from unpaid line items (same logic as unpaidLineItemsByRegion)
        formattedCurrentBalance: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (unpaidLineItems.length === 0) {
                return "$0.00";
              }
              let totalUnpaidAmount = 0;
              for (const lineItem of unpaidLineItems) {
                totalUnpaidAmount += lineItem.amount || 0;
              }
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const balance = totalUnpaidAmount / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(balance);
            }
          })
        }),
        unpaidLineItemsByRegion: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.JSON,
            async resolve(item, args, context) {
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  id
                  amount
                  description
                  orderDisplayId
                  itemCount
                  createdAt
                  formattedAmount
                  region {
                    id
                    name
                    currency {
                      id
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `,
                orderBy: { createdAt: "desc" }
              });
              if (unpaidLineItems.length === 0) {
                return {
                  success: true,
                  regions: [],
                  totalRegions: 0,
                  totalUnpaidItems: 0,
                  message: "No unpaid items found"
                };
              }
              const lineItemsByRegion = unpaidLineItems.reduce((acc, item2) => {
                const regionId = item2.region.id;
                const regionName = item2.region.name;
                const currency = item2.region.currency;
                if (!acc[regionId]) {
                  acc[regionId] = {
                    region: {
                      id: regionId,
                      name: regionName,
                      currency
                    },
                    lineItems: [],
                    totalAmount: 0,
                    itemCount: 0
                    // This will count unique orders
                  };
                }
                acc[regionId].lineItems.push({
                  id: item2.id,
                  amount: item2.amount,
                  description: item2.description,
                  orderDisplayId: item2.orderDisplayId,
                  itemCount: item2.itemCount,
                  createdAt: item2.createdAt,
                  formattedAmount: item2.formattedAmount
                });
                acc[regionId].totalAmount += item2.amount || 0;
                acc[regionId].itemCount += 1;
                return acc;
              }, {});
              const regionsWithLineItems = Object.values(lineItemsByRegion).map((regionData) => {
                const divisor = regionData.region.currency.noDivisionCurrency ? 1 : 100;
                const formattedTotal = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: regionData.region.currency.code
                }).format(regionData.totalAmount / divisor);
                return {
                  ...regionData,
                  formattedTotalAmount: formattedTotal
                };
              });
              regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);
              return {
                success: true,
                regions: regionsWithLineItems,
                totalRegions: regionsWithLineItems.length,
                totalUnpaidItems: unpaidLineItems.length,
                message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
              };
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === "create" && !resolvedData.accountNumber) {
        const timestamp33 = Date.now();
        resolvedData.accountNumber = `ACC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp33).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/AccountLineItem.ts
var import_core27 = require("@keystone-6/core");
var import_fields30 = require("@keystone-6/core/fields");
init_access();
var AccountLineItem = (0, import_core27.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Core relationships
    account: (0, import_fields30.relationship)({
      ref: "Account.lineItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    order: (0, import_fields30.relationship)({
      ref: "Order.accountLineItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    orderKey: (0, import_fields30.text)({
      isIndexed: "unique",
      db: { isNullable: true },
      ui: { itemView: { fieldMode: "read" }, createView: { fieldMode: "hidden" } }
    }),
    region: (0, import_fields30.relationship)({
      ref: "Region.accountLineItems",
      many: false
    }),
    // Line item details
    description: (0, import_fields30.text)({
      validation: { isRequired: true },
      defaultValue: "Order line item"
    }),
    amount: (0, import_fields30.integer)({
      validation: { isRequired: true },
      label: "Amount (in cents)"
    }),
    orderDisplayId: (0, import_fields30.text)({
      validation: { isRequired: true },
      isIndexed: true
    }),
    itemCount: (0, import_fields30.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    paymentStatus: (0, import_fields30.select)({
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Paid", value: "paid" },
        { label: "Canceled", value: "canceled" }
      ],
      defaultValue: "unpaid",
      validation: { isRequired: true }
    }),
    // Junction relationship to track which invoices paid this item
    invoiceLineItems: (0, import_fields30.relationship)({
      ref: "InvoiceLineItem.accountLineItem",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core27.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for line item display",
      fields: {
        formattedAmount: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.String,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  amount
                  account {
                    currency {
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!lineItem?.account?.currency) return "$0.00";
              const divisor = lineItem.account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (lineItem.amount || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: lineItem.account.currency.code
              }).format(amount);
            }
          })
        }),
        orderDetails: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.JSON,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  order {
                    id
                    displayId
                    status
                    email
                    createdAt
                    total
                    subtotal
                    shipping
                    tax
                    lineItems {
                      id
                      title
                      quantity
                      sku
                      variantTitle
                      formattedUnitPrice
                      formattedTotal
                      thumbnail
                    }
                  }
                `
              });
              return lineItem?.order || null;
            }
          })
        }),
        paidAt: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.String,
            async resolve(item, args, context) {
              try {
                const lineItem = await context.sudo().query.AccountLineItem.findOne({
                  where: { id: item.id },
                  query: `
                    paymentStatus
                    invoiceLineItems {
                      invoice {
                        paidAt
                        status
                      }
                    }
                  `
                });
                if (lineItem?.paymentStatus !== "paid") {
                  return null;
                }
                const invoiceLinks = lineItem?.invoiceLineItems || [];
                const paidInvoices = invoiceLinks.map((link) => link.invoice).filter((invoice) => invoice?.status === "paid" && typeof invoice.paidAt === "string");
                if (paidInvoices && paidInvoices.length > 0) {
                  const mostRecentPaidAt = paidInvoices.map((inv) => new Date(inv.paidAt)).sort((a, b) => b.getTime() - a.getTime())[0];
                  return mostRecentPaidAt.toISOString();
                }
                return null;
              } catch (error) {
                console.error("Error resolving AccountLineItem paidAt:", error);
                return null;
              }
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation === "create") {
        if (resolvedData.order?.connect?.id && (!resolvedData.description || !resolvedData.amount)) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: resolvedData.order.connect.id },
            query: `
              displayId
              rawTotal
              lineItems {
                id
              }
            `
          });
          if (order) {
            return {
              ...resolvedData,
              description: resolvedData.description || `Order #${order.displayId} - ${order.lineItems?.length || 0} items`,
              amount: resolvedData.amount || order.rawTotal || 0,
              orderDisplayId: resolvedData.orderDisplayId || order.displayId,
              itemCount: resolvedData.itemCount || order.lineItems?.length || 0
            };
          }
        }
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/Invoice.ts
var import_core28 = require("@keystone-6/core");
var import_fields31 = require("@keystone-6/core/fields");
init_access();
var Invoice = (0, import_core28.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Core invoice data
    user: (0, import_fields31.relationship)({
      ref: "User.invoices",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    invoiceNumber: (0, import_fields31.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields31.text)({
      validation: { isRequired: true },
      defaultValue: "Payment Invoice"
    }),
    description: (0, import_fields31.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Invoice for selected orders payment"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields31.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    currency: (0, import_fields31.relationship)({
      ref: "Currency.invoices",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    // Status and dates
    status: (0, import_fields31.select)({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" },
        { label: "Cancelled", value: "cancelled" }
      ],
      defaultValue: "paid",
      // Most invoices will be immediately paid
      validation: { isRequired: true }
    }),
    dueDate: (0, import_fields31.timestamp)(),
    paidAt: (0, import_fields31.timestamp)({
      defaultValue: { kind: "now" }
      // Default to now since most are paid immediately
    }),
    // Metadata for payment details
    metadata: (0, import_fields31.json)({
      defaultValue: {}
    }),
    // Relationships
    account: (0, import_fields31.relationship)({
      ref: "Account.invoices",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    lineItems: (0, import_fields31.relationship)({
      ref: "InvoiceLineItem.invoice",
      many: true
    }),
    paymentCollection: (0, import_fields31.relationship)({
      ref: "PaymentCollection.invoice",
      db: { foreignKey: true }
    }),
    // Virtual computed fields
    ...(0, import_core28.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for invoice display",
      fields: {
        formattedTotal: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.String,
            async resolve(item, args, context) {
              try {
                let currency = null;
                if (!currency && item.currencyId) {
                  const invoice = await context.sudo().query.Invoice.findOne({
                    where: { id: item.id },
                    query: `
                      currency {
                        id
                        code
                        symbol
                        noDivisionCurrency
                      }
                    `
                  });
                  currency = invoice?.currency;
                }
                if (!currency || !item.totalAmount) {
                  return "$0.00";
                }
                const divisor = currency.noDivisionCurrency ? 1 : 100;
                const amount = (item.totalAmount || 0) / divisor;
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency.code
                }).format(amount);
              } catch (error) {
                return "$0.00";
              }
            }
          })
        }),
        itemCount: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.Int,
            async resolve(item, args, context) {
              try {
                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    lineItems {
                      id
                    }
                  `
                });
                return invoice?.lineItems?.length || 0;
              } catch (error) {
                return 0;
              }
            }
          })
        }),
        paymentSessions: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.list(import_core28.graphql.nonNull(import_core28.graphql.JSON)),
            async resolve(item, args, context) {
              try {
                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    paymentCollection {
                      id
                      paymentSessions {
                        id
                        paymentProvider {
                          id
                          code
                        }
                        data
                        isSelected
                        isInitiated
                        amount
                      }
                    }
                  `
                });
                return invoice?.paymentCollection?.paymentSessions || [];
              } catch (error) {
                return [];
              }
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === "create" && !resolvedData.invoiceNumber) {
        const timestamp33 = Date.now();
        resolvedData.invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp33).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/InvoiceLineItem.ts
var import_core29 = require("@keystone-6/core");
var import_fields32 = require("@keystone-6/core/fields");
init_access();
var InvoiceLineItem = (0, import_core29.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Junction table relationships
    invoice: (0, import_fields32.relationship)({
      ref: "Invoice.lineItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    accountLineItem: (0, import_fields32.relationship)({
      ref: "AccountLineItem.invoiceLineItems",
      many: false,
      hooks: { validateInput: requireRelationship }
    }),
    // Virtual computed fields
    ...(0, import_core29.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields from related account line item",
      fields: {
        orderDisplayId: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDisplayId
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.orderDisplayId || "";
            }
          })
        }),
        formattedAmount: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    formattedAmount
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.formattedAmount || "$0.00";
            }
          })
        }),
        orderDetails: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.JSON,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDetails
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.orderDetails || null;
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/BusinessAccountRequest.ts
var import_core30 = require("@keystone-6/core");
var import_fields33 = require("@keystone-6/core/fields");
init_access();
var import_access60 = require("@keystone-6/core/access");
var reviewAccess = { create: permissions.canManageOrders, update: permissions.canManageOrders };
var BusinessAccountRequest = (0, import_core30.list)({
  access: {
    operation: {
      query: ({ session }) => {
        if (permissions.canManageOrders({ session })) return true;
        return isSignedIn({ session });
      },
      create: isInteractiveUser,
      // Interactive customers submit requests, never approval evidence
      update: permissions.canManageOrders,
      // Only admins can update/approve
      delete: permissions.canManageOrders
      // Only admins can delete
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session?.itemId } } };
      }
    }
  },
  fields: {
    // Core relationship
    user: (0, import_fields33.relationship)({
      ref: "User.businessAccountRequest",
      many: false,
      access: { update: import_access60.denyAll },
      hooks: {
        resolveInput: ({ operation, resolvedData, context }) => operation === "create" && !permissions.canManageOrders({ session: context.session }) ? { connect: { id: context.session.itemId } } : resolvedData.user
      }
    }),
    // Request details
    businessName: (0, import_fields33.text)({
      validation: { isRequired: true }
    }),
    businessType: (0, import_fields33.select)({
      options: [
        { label: "Wholesale Partner", value: "wholesale" },
        { label: "Distribution Channel", value: "distribution" },
        { label: "Authorized Reseller", value: "reseller" },
        { label: "B2B Platform", value: "b2b_platform" },
        { label: "Other", value: "other" }
      ],
      validation: { isRequired: true }
    }),
    monthlyOrderVolume: (0, import_fields33.select)({
      options: [
        { label: "1-50 orders/month", value: "low" },
        { label: "51-200 orders/month", value: "medium" },
        { label: "201-1000 orders/month", value: "high" },
        { label: "1000+ orders/month", value: "enterprise" }
      ],
      validation: { isRequired: true }
    }),
    requestedCreditLimit: (0, import_fields33.integer)({
      validation: { isRequired: true },
      label: "Requested Credit Limit (in cents)"
    }),
    businessDescription: (0, import_fields33.text)({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true }
    }),
    // Status tracking
    status: (0, import_fields33.select)({
      access: reviewAccess,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Not Approved", value: "not_approved" },
        { label: "Requires Info", value: "requires_info" }
      ],
      defaultValue: "pending",
      validation: { isRequired: true }
    }),
    // Admin fields
    reviewedBy: (0, import_fields33.relationship)({
      access: reviewAccess,
      ref: "User",
      many: false,
      label: "Reviewed By Admin"
    }),
    reviewNotes: (0, import_fields33.text)({
      access: reviewAccess,
      ui: { displayMode: "textarea" },
      label: "Admin Review Notes"
    }),
    approvedCreditLimit: (0, import_fields33.integer)({
      access: reviewAccess,
      label: "Approved Credit Limit (in cents)"
    }),
    // Timestamps
    submittedAt: (0, import_fields33.timestamp)({
      access: reviewAccess,
      defaultValue: { kind: "now" },
      validation: { isRequired: true }
    }),
    reviewedAt: (0, import_fields33.timestamp)({ access: reviewAccess }),
    // Generated account (once approved)
    generatedAccount: (0, import_fields33.relationship)({
      access: { create: import_access60.denyAll, update: import_access60.denyAll },
      ref: "Account",
      many: false,
      label: "Generated Account"
    }),
    // Virtual computed fields
    ...(0, import_core30.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for request display",
      fields: {
        formattedRequestedCredit: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              const amount = Number(item.requestedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        formattedApprovedCredit: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              if (!item.approvedCreditLimit) return null;
              const amount = Number(item.approvedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        businessTypeLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              const typeMap = {
                wholesale: "Wholesale Partner",
                distribution: "Distribution Channel",
                reseller: "Authorized Reseller",
                b2b_platform: "B2B Platform",
                other: "Other"
              };
              return typeMap[item.businessType] || item.businessType;
            }
          })
        }),
        volumeLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              const volumeMap = {
                low: "1-50 orders/month",
                medium: "51-200 orders/month",
                high: "201-1000 orders/month",
                enterprise: "1000+ orders/month"
              };
              return volumeMap[item.monthlyOrderVolume] || item.monthlyOrderVolume;
            }
          })
        }),
        statusLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              const statusMap = {
                pending: "Pending Review",
                approved: "Approved",
                not_approved: "Not Approved",
                requires_info: "Requires Additional Information"
              };
              return statusMap[item.status] || item.status;
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, addValidationError }) => {
      if (operation === "create" && !resolvedData.user) {
        addValidationError("A user is required");
      }
      if (operation === "create" && resolvedData.status !== "pending") addValidationError("Create a pending request before review");
      const requested = resolvedData.requestedCreditLimit ?? item?.requestedCreditLimit;
      if (!Number.isSafeInteger(requested) || Number(requested) <= 0) addValidationError("A positive requested credit limit is required");
      const approved = resolvedData.approvedCreditLimit ?? item?.approvedCreditLimit;
      if ((resolvedData.status ?? item?.status) === "approved" && (!Number.isSafeInteger(approved) || Number(approved) <= 0)) {
        addValidationError("A positive approved credit limit is required");
      }
      if (item?.generatedAccountId && ["status", "approvedCreditLimit", "user"].some((key) => key in resolvedData)) {
        addValidationError("An approved request is retained; manage its account through the account workflow");
      }
    },
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === "update" && item?.status === "approved" && originalItem?.status !== "approved" && !item.generatedAccountId) {
        const accountId = await createAccountFromApprovedRequest(item, context);
        if (accountId) {
          await context.sudo().query.BusinessAccountRequest.updateOne({
            where: { id: String(item.id) },
            data: { generatedAccount: { connect: { id: accountId } } }
          });
        }
      }
    }
  }
});
async function createAccountFromApprovedRequest(request, context) {
  try {
    const fullRequest = await context.sudo().query.BusinessAccountRequest.findOne({
      where: { id: request.id },
      query: `
        id
        businessName
        businessType
        approvedCreditLimit
        user {
          id
          email
          name
        }
      `
    });
    if (!fullRequest?.user?.id) throw new Error("Request customer unavailable");
    const currencies = await context.sudo().query.Currency.findMany({
      where: { code: { equals: "USD", mode: "insensitive" } },
      take: 2,
      query: "id code"
    });
    if (currencies.length !== 1) throw new Error("Account currency unavailable or ambiguous");
    const defaultCurrency = currencies[0];
    const account = await context.sudo().query.Account.createOne({
      data: {
        user: { connect: { id: fullRequest.user.id } },
        title: fullRequest.businessName,
        description: fullRequest.businessName,
        currency: { connect: { id: defaultCurrency.id } },
        status: "active",
        creditLimit: fullRequest.approvedCreditLimit,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
        // 30 days from now
        accountType: "business",
        metadata: {
          createdFromRequest: fullRequest.id,
          businessType: fullRequest.businessType,
          businessName: fullRequest.businessName,
          approvedCreditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit
        }
      }
    });
    return account.id;
  } catch {
    throw new Error("Business account approval could not be completed");
  }
}

// features/keystone/models/LineItem.ts
var import_core31 = require("@keystone-6/core");
var import_fields34 = require("@keystone-6/core/fields");
var import_access61 = require("@keystone-6/core/access");
init_access();
var formatCurrency2 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
var LineItem = (0, import_core31.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const lineItem = await sudoContext.query.LineItem.findOne({
          where: { id: item.id },
          query: "cart { id }"
        });
        if (lineItem?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: lineItem.cart.id },
            data: {
              paymentCollection: {
                disconnect: true
              }
            }
          });
        }
      }
    }
  },
  fields: {
    // Core fields
    quantity: (0, import_fields34.integer)({
      validation: { isRequired: true }
    }),
    metadata: (0, import_fields34.json)(),
    isReturn: (0, import_fields34.checkbox)(),
    isGiftcard: (0, import_fields34.checkbox)(),
    shouldMerge: (0, import_fields34.checkbox)({
      defaultValue: true
    }),
    allowDiscounts: (0, import_fields34.checkbox)({
      defaultValue: true
    }),
    hasShipping: (0, import_fields34.checkbox)(),
    // Relationships
    claimOrder: (0, import_fields34.relationship)({
      ref: "ClaimOrder.lineItems"
    }),
    cart: (0, import_fields34.relationship)({
      ref: "Cart.lineItems",
      access: { create: import_access61.denyAll, update: import_access61.denyAll }
    }),
    swap: (0, import_fields34.relationship)({
      ref: "Swap.lineItems"
    }),
    productVariant: (0, import_fields34.relationship)({
      ref: "ProductVariant.lineItems"
    }),
    claimItems: (0, import_fields34.relationship)({
      ref: "ClaimItem.lineItem",
      many: true
    }),
    lineItemAdjustments: (0, import_fields34.relationship)({
      ref: "LineItemAdjustment.lineItem",
      many: true
    }),
    lineItemTaxLines: (0, import_fields34.relationship)({
      ref: "LineItemTaxLine.lineItem",
      many: true
    }),
    returnItems: (0, import_fields34.relationship)({
      ref: "ReturnItem.lineItem",
      many: true
    }),
    ...(0, import_core31.group)({
      label: "Virtual Fields",
      description: "Virtual fields for line item",
      fields: {
        title: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { title } }"
              });
              if (!lineItem?.productVariant?.product) {
                return "Product not found";
              }
              return lineItem.productVariant.product.title;
            }
          })
        }),
        thumbnail: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  productVariant {
                    primaryImage {
                      image { url }
                      imagePath
                    }
                    product { thumbnail }
                  }
                `
              });
              if (!lineItem?.productVariant) {
                return null;
              }
              const primaryImage = lineItem.productVariant.primaryImage;
              if (primaryImage) {
                return primaryImage.image?.url || primaryImage.imagePath || null;
              }
              return lineItem.productVariant.product?.thumbnail || null;
            }
          })
        }),
        description: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { description { document } } }"
              });
              if (!lineItem?.productVariant?.product) {
                return null;
              }
              return lineItem.productVariant.product.description.document;
            }
          })
        }),
        originalPrice: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `cart { region { id taxRate currency { code noDivisionCurrency } } }`
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    originalAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.originalAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        unitPrice: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        total: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart, quantity } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  quantity
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount * quantity) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        availableInRegion: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart { 
                    region { 
                      id 
                    }
                  }
                `
              });
              if (!cart) {
                return "no_cart";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: "id"
              });
              return prices.length > 0 ? "available" : "unavailable";
            }
          })
        }),
        percentageOff: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart, quantity } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `cart { region { id } } quantity`
              });
              if (!cart) {
                return 0;
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  id
                  amount
                  calculatedPrice {
                    calculatedAmount
                    originalAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              if (!price) return 0;
              const originalAmount = price.originalAmount * quantity;
              const calculatedAmount = price.calculatedAmount * quantity;
              if (!originalAmount || originalAmount <= calculatedAmount)
                return 0;
              const diff = originalAmount - calculatedAmount;
              return Math.round(diff / originalAmount * 100);
            }
          })
        })
      }
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/LineItemAdjustment.ts
var import_core32 = require("@keystone-6/core");
var import_fields35 = require("@keystone-6/core/fields");
init_access();
var LineItemAdjustment = (0, import_core32.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields35.text)({
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields35.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields35.json)(),
    discount: (0, import_fields35.relationship)({
      ref: "Discount.lineItemAdjustments"
    }),
    lineItem: (0, import_fields35.relationship)({
      ref: "LineItem.lineItemAdjustments"
    }),
    ...trackingFields
  }
});

// features/keystone/models/LineItemTaxLine.ts
var import_core33 = require("@keystone-6/core");
var import_fields36 = require("@keystone-6/core/fields");
init_access();
var LineItemTaxLine = (0, import_core33.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields36.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields36.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields36.text)(),
    metadata: (0, import_fields36.json)(),
    lineItem: (0, import_fields36.relationship)({
      ref: "LineItem.lineItemTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Location.ts
var import_core34 = require("@keystone-6/core");
var import_fields37 = require("@keystone-6/core/fields");
init_access();
var Location = (0, import_core34.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields37.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields37.text)(),
    address: (0, import_fields37.text)(),
    variants: (0, import_fields37.relationship)({
      ref: "ProductVariant.location",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      const { name } = resolvedData;
      if (name && name.length < 2) {
        addValidationError("Location name must be at least 2 characters long");
      }
    }
  }
});

// features/keystone/models/Measurement.ts
var import_core35 = require("@keystone-6/core");
var import_fields38 = require("@keystone-6/core/fields");
init_access();
var UNITS = {
  weight: ["g", "kg", "oz", "lb"],
  dimensions: ["cm", "m", "in", "ft"]
};
var Measurement = (0, import_core35.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields38.float)({
      validation: {
        isRequired: true,
        min: 0
      }
    }),
    unit: (0, import_fields38.select)({
      type: "string",
      validation: {
        isRequired: true
      },
      options: [...UNITS.weight, ...UNITS.dimensions].map((unit) => ({
        label: unit.toUpperCase(),
        value: unit
      })),
      defaultValue: "g",
      ui: {
        displayMode: "select"
      }
    }),
    type: (0, import_fields38.select)({
      type: "string",
      validation: {
        isRequired: true
      },
      options: [
        { label: "Weight", value: "weight" },
        { label: "Length", value: "length" },
        { label: "Width", value: "width" },
        { label: "Height", value: "height" }
      ],
      defaultValue: "weight",
      ui: {
        displayMode: "select"
      }
    }),
    productVariant: (0, import_fields38.relationship)({
      ref: "ProductVariant.measurements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/MoneyAmount.ts
var import_core36 = require("@keystone-6/core");
var import_fields39 = require("@keystone-6/core/fields");
init_access();
var MoneyAmount = (0, import_core36.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: { query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }) ? true : { productVariant: { product: { status: { equals: "published" } } } } }
  },
  fields: {
    amount: (0, import_fields39.integer)({
      validation: {
        min: 0,
        isRequired: true
      }
    }),
    compareAmount: (0, import_fields39.integer)(),
    minQuantity: (0, import_fields39.integer)(),
    maxQuantity: (0, import_fields39.integer)(),
    productVariant: (0, import_fields39.relationship)({
      ref: "ProductVariant.prices"
    }),
    region: (0, import_fields39.relationship)({
      ref: "Region.moneyAmounts"
    }),
    currency: (0, import_fields39.relationship)({
      ref: "Currency.moneyAmounts"
    }),
    priceList: (0, import_fields39.relationship)({
      ref: "PriceList.moneyAmounts"
    }),
    priceSet: (0, import_fields39.relationship)({
      ref: "PriceSet.prices"
    }),
    priceRules: (0, import_fields39.relationship)({
      ref: "PriceRule.moneyAmounts",
      many: true
    }),
    ...(0, import_core36.group)({
      label: "Virtual Fields",
      description: "Virtual fields for money amount",
      fields: {
        displayPrice: (0, import_fields39.virtual)({
          field: import_core36.graphql.field({
            type: import_core36.graphql.String,
            resolve: async (item, args, context) => {
              const { currency, amount } = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: "currency { symbol } amount"
              });
              return `${currency.symbol}${(amount / 100).toFixed(2)}`;
            }
          })
        }),
        calculatedPrice: (0, import_fields39.virtual)({
          field: import_core36.graphql.field({
            type: import_core36.graphql.object()({
              name: "CalculatedPrice",
              fields: {
                calculatedAmount: import_core36.graphql.field({ type: import_core36.graphql.Int }),
                originalAmount: import_core36.graphql.field({ type: import_core36.graphql.Int }),
                currencyCode: import_core36.graphql.field({ type: import_core36.graphql.String }),
                moneyAmountId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                variantId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                priceListId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                priceListType: import_core36.graphql.field({ type: import_core36.graphql.String })
              }
            }),
            resolve: async (item, args, context) => {
              const moneyAmount = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: `
                  id
                  amount
                  currency { code }
                  productVariant { id }
                  priceList { 
                    id 
                    type 
                    status
                    startsAt 
                    endsAt 
                  }
                  priceSet { 
                    id 
                    prices { 
                      id 
                      amount 
                      currency { code }
                      minQuantity
                      maxQuantity
                      priceList { 
                        id 
                        type 
                        status
                        startsAt 
                        endsAt 
                      }
                    }
                    priceRules {
                      id
                      type
                      value
                      priority
                      ruleAttribute
                      ruleValue
                    }
                  }
                `
              });
              if (!moneyAmount) return null;
              const now = /* @__PURE__ */ new Date();
              const currencyCode = moneyAmount.currency.code;
              let calculatedAmount = moneyAmount.amount;
              let originalAmount = moneyAmount.amount;
              let appliedPriceList = null;
              if (moneyAmount.priceList) {
                const startDate = moneyAmount.priceList.startsAt ? new Date(moneyAmount.priceList.startsAt) : null;
                const endDate = moneyAmount.priceList.endsAt ? new Date(moneyAmount.priceList.endsAt) : null;
                if (moneyAmount.priceList.status === "active" && (!startDate || startDate <= now) && (!endDate || endDate >= now)) {
                  appliedPriceList = moneyAmount.priceList;
                }
              }
              if (moneyAmount.priceSet) {
                const validPrices = moneyAmount.priceSet.prices.filter(
                  (price) => {
                    if (price.currency.code !== currencyCode) return false;
                    if (price.priceList) {
                      const startDate = price.priceList.startsAt ? new Date(price.priceList.startsAt) : null;
                      const endDate = price.priceList.endsAt ? new Date(price.priceList.endsAt) : null;
                      return price.priceList.status === "active" && (!startDate || startDate <= now) && (!endDate || endDate >= now);
                    }
                    return true;
                  }
                );
                if (validPrices.length > 0) {
                  validPrices.sort((a, b) => a.amount - b.amount);
                  calculatedAmount = validPrices[0].amount;
                  appliedPriceList = validPrices[0].priceList || null;
                }
                if (moneyAmount.priceSet.priceRules && moneyAmount.priceSet.priceRules.length > 0) {
                  const sortedRules = moneyAmount.priceSet.priceRules.sort(
                    (a, b) => b.priority - a.priority
                  );
                  for (const rule of sortedRules) {
                    if (rule.type === "fixed") {
                      calculatedAmount = Math.min(calculatedAmount, rule.value);
                    } else if (rule.type === "percentage") {
                      const discountAmount = Math.round(
                        calculatedAmount * (rule.value / 100)
                      );
                      calculatedAmount -= discountAmount;
                    }
                  }
                }
              }
              return {
                calculatedAmount,
                originalAmount,
                currencyCode,
                moneyAmountId: moneyAmount.id,
                variantId: moneyAmount.productVariant?.id || null,
                priceListId: appliedPriceList?.id || null,
                priceListType: appliedPriceList?.type || null
              };
            }
          }),
          ui: {
            query: "{ calculatedAmount originalAmount currencyCode moneyAmountId variantId priceListId priceListType }"
          }
        })
      }
    }),
    ...trackingFieldsFor()
  },
  ui: {
    labelField: "displayPrice"
  }
});

// features/keystone/models/Note.ts
var import_core37 = require("@keystone-6/core");
var import_fields40 = require("@keystone-6/core/fields");
init_access();
var Note = (0, import_core37.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceType: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceId: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    authorId: (0, import_fields40.text)(),
    metadata: (0, import_fields40.json)(),
    ...trackingFields
  }
});

// features/keystone/models/Notification.ts
var import_core38 = require("@keystone-6/core");
var import_fields41 = require("@keystone-6/core/fields");
init_access();
var Notification = (0, import_core38.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    eventName: (0, import_fields41.text)(),
    resourceType: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceId: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    to: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields41.json)(),
    parentId: (0, import_fields41.text)(),
    notificationProvider: (0, import_fields41.relationship)({
      ref: "NotificationProvider.notifications"
    }),
    user: (0, import_fields41.relationship)({
      ref: "User.notifications"
    }),
    otherNotifications: (0, import_fields41.relationship)({
      ref: "Notification",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/NotificationProvider.ts
var import_core39 = require("@keystone-6/core");
var import_fields42 = require("@keystone-6/core/fields");
init_access();
var NotificationProvider = (0, import_core39.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    isInstalled: (0, import_fields42.checkbox)({
      defaultValue: true
    }),
    notifications: (0, import_fields42.relationship)({
      ref: "Notification.notificationProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OAuthApp.ts
var import_core40 = require("@keystone-6/core");
var import_fields43 = require("@keystone-6/core/fields");
init_access();
init_scopes();
init_token_crypto();
var OAuthApp = (0, import_core40.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    name: (0, import_fields43.text)({
      validation: {
        isRequired: true
      }
    }),
    clientId: (0, import_fields43.text)({
      isIndexed: "unique",
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientId) {
            return generateOpaqueToken("of_");
          }
          return resolvedData.clientId;
        }
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Auto-generated unique identifier for your application."
      }
    }),
    clientSecret: (0, import_fields43.text)({
      access: {
        read: () => false
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientSecret) {
            throw new Error("OAuth apps must be created through the show-once credential command");
          }
          if (resolvedData.clientSecret) {
            return oauthClientSecretDigest(resolvedData.clientSecret);
          }
          return void 0;
        }
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        // displayMode: "textarea",
        description: "Auto-generated secret key. Keep this secure - it's used to authenticate your application."
      }
    }),
    redirectUris: (0, import_fields43.json)({
      defaultValue: [],
      ui: {
        description: "Array of allowed redirect URIs for OAuth callbacks"
      }
    }),
    scopes: (0, import_fields43.json)({
      defaultValue: DEFAULT_SCOPES,
      ui: {
        description: "Array of allowed OAuth scopes that map to permissions"
      }
    }),
    webhookUrl: (0, import_fields43.text)({
      ui: {
        description: "URL to receive webhook notifications"
      }
    }),
    status: (0, import_fields43.select)({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Pending", value: "pending" }
      ],
      defaultValue: "active"
    }),
    installUrl: (0, import_fields43.text)({
      ui: {
        description: "URL where users can install this app"
      }
    }),
    uninstallUrl: (0, import_fields43.text)({
      ui: {
        description: "URL to handle app uninstallation"
      }
    }),
    description: (0, import_fields43.text)({
      ui: {
        displayMode: "textarea"
      }
    }),
    metadata: (0, import_fields43.json)({
      defaultValue: {},
      ui: {
        description: "Additional app-specific configuration and settings"
      }
    }),
    developerEmail: (0, import_fields43.text)(),
    privacyPolicyUrl: (0, import_fields43.text)(),
    termsOfServiceUrl: (0, import_fields43.text)(),
    supportUrl: (0, import_fields43.text)(),
    ...trackingFields
  },
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "clientId", "status", "createdAt"]
    }
  }
});

// features/keystone/models/OAuthToken.ts
var import_core41 = require("@keystone-6/core");
var import_fields44 = require("@keystone-6/core/fields");
init_access();

// features/keystone/security/oauth-credentials.ts
init_token_crypto();
function storedOAuthToken(rawToken) {
  return oauthTokenDigest(rawToken);
}
async function findOAuthToken(context, rawToken, query) {
  if (!rawToken) return null;
  let token = await context.sudo().query.OAuthToken.findOne({
    where: { token: storedOAuthToken(rawToken) },
    query
  });
  if (!token && process.env.NODE_ENV !== "production") {
    token = await context.sudo().query.OAuthToken.findOne({
      where: { token: rawToken },
      query
    });
  }
  return token;
}

// features/keystone/models/OAuthToken.ts
var digestTokenInput = {
  resolveInput: ({ resolvedData, fieldKey }) => resolvedData[fieldKey] ? storedOAuthToken(resolvedData[fieldKey]) : resolvedData[fieldKey]
};
var OAuthToken = (0, import_core41.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    tokenType: (0, import_fields44.select)({
      options: [
        { label: "Authorization Code", value: "authorization_code" },
        { label: "Access Token", value: "access_token" },
        { label: "Refresh Token", value: "refresh_token" }
      ],
      validation: {
        isRequired: true
      }
    }),
    token: (0, import_fields44.text)({
      access: { read: () => false },
      validation: {
        isRequired: true
      },
      isIndexed: "unique",
      hooks: digestTokenInput
    }),
    clientId: (0, import_fields44.text)({
      validation: {
        isRequired: true
      },
      isIndexed: true
    }),
    user: (0, import_fields44.relationship)({
      ref: "User",
      ui: {
        description: "The user who authorized this token"
      }
    }),
    scopes: (0, import_fields44.json)({
      defaultValue: [],
      ui: {
        description: "Array of granted scopes"
      }
    }),
    redirectUri: (0, import_fields44.text)({
      ui: {
        description: "The redirect URI used during authorization"
      }
    }),
    expiresAt: (0, import_fields44.timestamp)({
      ui: {
        description: "When this token expires"
      }
    }),
    isRevoked: (0, import_fields44.select)({
      options: [
        { label: "Active", value: "false" },
        { label: "Revoked", value: "true" }
      ],
      defaultValue: "false"
    }),
    authorizationCode: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "The authorization code that was exchanged for this token (for access tokens)"
      }
    }),
    refreshToken: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "Associated refresh token (for access tokens)"
      }
    }),
    accessToken: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "Associated access token (for refresh tokens)"
      }
    }),
    state: (0, import_fields44.text)({
      ui: {
        description: "OAuth state parameter for CSRF protection"
      }
    }),
    codeChallenge: (0, import_fields44.text)({
      ui: {
        description: "PKCE code challenge"
      }
    }),
    codeChallengeMethod: (0, import_fields44.select)({
      options: [
        { label: "Plain", value: "plain" },
        { label: "SHA256", value: "S256" }
      ],
      ui: {
        description: "PKCE code challenge method"
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput({ operation, resolvedData, context }) {
      if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
        return {
          ...resolvedData,
          user: { connect: { id: context.session.itemId } }
        };
      }
      return resolvedData;
    }
  },
  ui: {
    labelField: "token",
    listView: {
      initialColumns: ["tokenType", "clientId", "scopes", "expiresAt", "isRevoked"]
    }
  }
});

// features/keystone/utils/json-value.ts
function toJsonValue(value) {
  return JSON.parse(JSON.stringify(value));
}

// features/keystone/models/Order.ts
var import_core42 = require("@keystone-6/core");
var import_fields45 = require("@keystone-6/core/fields");
init_access();
var formatCurrency3 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
async function regulatedOrderTax(context, orderId) {
  const quotes = await context.sudo().query.RegulatedTaxQuote.findMany({
    where: { order: { id: { equals: orderId } }, status: { in: ["committed", "reversed"] } },
    take: 2,
    query: "salesTaxAmount exciseTaxAmount localFeeAmount"
  });
  if (quotes.length > 1) throw new Error("Order has ambiguous regulated tax evidence");
  const quote = quotes[0];
  return quote ? quote.salesTaxAmount + quote.exciseTaxAmount + quote.localFeeAmount : 0;
}
var Order = (0, import_core42.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }) || Boolean(session?.customerToken),
      create: () => false,
      update: () => false,
      delete: () => false
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canReadOrders({ session }) || permissions.canManageOrders({ session })) return true;
        if (session?.customerToken && session?.itemId) {
          return { user: { id: { equals: session.itemId } } };
        }
        return false;
      }
    }
  },
  fields: {
    status: (0, import_fields45.select)({
      type: "enum",
      options: [
        {
          label: "Pending",
          value: "pending"
        },
        {
          label: "Completed",
          value: "completed"
        },
        {
          label: "Archived",
          value: "archived"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      defaultValue: "pending",
      validation: {
        isRequired: true
      },
      access: {
        update: () => false
      }
    }),
    displayId: (0, import_fields45.integer)({
      validation: {
        isRequired: true
      }
    }),
    email: (0, import_fields45.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields45.float)(),
    canceledAt: (0, import_fields45.timestamp)(),
    metadata: (0, import_fields45.json)(),
    idempotencyKey: (0, import_fields45.text)(),
    noNotification: (0, import_fields45.checkbox)(),
    externalId: (0, import_fields45.text)(),
    shippingAddress: (0, import_fields45.relationship)({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false
    }),
    billingAddress: (0, import_fields45.relationship)({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false
    }),
    currency: (0, import_fields45.relationship)({
      ref: "Currency.orders"
    }),
    draftOrder: (0, import_fields45.relationship)({
      ref: "DraftOrder.order"
    }),
    cart: (0, import_fields45.relationship)({
      ref: "Cart.order"
    }),
    user: (0, import_fields45.relationship)({
      ref: "User.orders"
    }),
    region: (0, import_fields45.relationship)({
      ref: "Region.orders"
    }),
    claimOrders: (0, import_fields45.relationship)({
      ref: "ClaimOrder.order",
      many: true
    }),
    fulfillments: (0, import_fields45.relationship)({
      ref: "Fulfillment.order",
      many: true
      // Lifecycle commands append transactional OrderEvent records.
    }),
    giftCards: (0, import_fields45.relationship)({
      ref: "GiftCard.order",
      many: true
    }),
    giftCardTransactions: (0, import_fields45.relationship)({
      ref: "GiftCardTransaction.order",
      many: true
    }),
    lineItems: (0, import_fields45.relationship)({
      ref: "OrderLineItem.order",
      many: true
    }),
    discounts: (0, import_fields45.relationship)({
      ref: "Discount.orders",
      many: true
    }),
    payments: (0, import_fields45.relationship)({
      ref: "Payment.order",
      many: true
      // Lifecycle commands append transactional OrderEvent records.
    }),
    returns: (0, import_fields45.relationship)({
      ref: "Return.order",
      many: true
      // Lifecycle commands append transactional OrderEvent records.
    }),
    shippingMethods: (0, import_fields45.relationship)({
      ref: "ShippingMethod.order",
      many: true
    }),
    swaps: (0, import_fields45.relationship)({
      ref: "Swap.order",
      many: true
    }),
    // Account relationship for Openship integration
    account: (0, import_fields45.relationship)({
      ref: "Account.orders",
      many: false
    }),
    accountLineItems: (0, import_fields45.relationship)({
      ref: "AccountLineItem.order",
      many: true
    }),
    secretKey: (0, import_fields45.text)({
      hooks: {
        resolveInput: ({ operation }) => {
          if (operation === "create") {
            const randomBytes = require("crypto").randomBytes(32);
            return randomBytes.toString("hex");
          }
          return void 0;
        }
      }
    }),
    ...(0, import_core42.group)({
      label: "Virtual Fields",
      description: "Calculated fields for order display and totals",
      fields: {
        subtotal: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!order) return null;
              if (!order?.lineItems?.length) return "0";
              let subtotal = 0;
              for (const lineItem of order.lineItems) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(subtotal / divisor, currencyCode);
            }
          })
        }),
        shipping: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order) return null;
              if (!order?.shippingMethods?.length) return "0";
              const total = order.shippingMethods.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              );
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(total / divisor, currencyCode);
            }
          })
        }),
        discount: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order) return null;
              if (!order?.discounts?.length) return null;
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              if (totalDiscountAmount === 0) return null;
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(totalDiscountAmount / divisor, currencyCode);
            }
          })
        }),
        tax: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order) return null;
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                }
              }
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0) + await regulatedOrderTax(context, item.id);
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(tax / divisor, currencyCode);
            }
          })
        }),
        total: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order) return null;
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total2, method) => total2 + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);
              const total = subtotal - totalDiscountAmount + shipping + tax + await regulatedOrderTax(context, item.id);
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(total / divisor, currencyCode);
            }
          })
        }),
        rawTotal: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order) return null;
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);
              return Math.round(subtotal - totalDiscountAmount + shipping + tax + await regulatedOrderTax(context, item.id));
            }
          })
        }),
        fulfillmentDetails: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  fulfillments {
                    id
                    createdAt
                    canceledAt
                    shippingLabels {
                      id
                      trackingNumber
                      trackingUrl
                      carrier
                      labelUrl
                    }
                    fulfillmentItems {
                      id
                      quantity
                      lineItem {
                        id
                        title
                        thumbnail
                        quantity
                        formattedUnitPrice
                        formattedTotal
                        sku
                        variantTitle
                        productData
                        variantData
                      }
                    }
                  }
                `
              });
              if (!order) return null;
              return toJsonValue(order.fulfillments?.map((fulfillment) => ({
                id: fulfillment.id,
                createdAt: fulfillment.createdAt,
                canceledAt: fulfillment.canceledAt,
                shippingLabels: fulfillment.shippingLabels?.map((label) => ({
                  id: label.id,
                  trackingNumber: label.trackingNumber,
                  url: label.trackingUrl,
                  carrier: label.carrier,
                  labelUrl: label.labelUrl
                })) || [],
                items: fulfillment.fulfillmentItems?.map((fi) => ({
                  id: fi.id,
                  quantity: fi.quantity,
                  lineItem: {
                    id: fi.lineItem.id,
                    title: fi.lineItem.title,
                    thumbnail: fi.lineItem.thumbnail,
                    sku: fi.lineItem.sku,
                    variantTitle: fi.lineItem.variantTitle,
                    formattedUnitPrice: fi.lineItem.formattedUnitPrice,
                    formattedTotal: fi.lineItem.formattedTotal,
                    productData: fi.lineItem.productData,
                    variantData: fi.lineItem.variantData
                  }
                })) || []
              })) || []);
            }
          })
        }),
        unfulfilled: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    title
                    thumbnail
                    quantity
                    formattedUnitPrice
                    formattedTotal
                    sku
                    variantTitle
                    productData
                    variantData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  fulfillments {
                    canceledAt
                    fulfillmentItems {
                      quantity
                      lineItem {
                        id
                      }
                    }
                  }
                `
              });
              if (!order) return null;
              const fulfilledQuantities = {};
              order.fulfillments?.filter((f) => !f.canceledAt)?.forEach((fulfillment) => {
                fulfillment.fulfillmentItems?.forEach((fi) => {
                  const lineItemId = fi.lineItem.id;
                  fulfilledQuantities[lineItemId] = (fulfilledQuantities[lineItemId] || 0) + fi.quantity;
                });
              });
              const result = order.lineItems?.map((lineItem) => {
                const fulfilledQuantity = fulfilledQuantities[lineItem.id] || 0;
                const remainingQuantity = lineItem.quantity - fulfilledQuantity;
                return {
                  id: lineItem.id,
                  title: lineItem.title,
                  thumbnail: lineItem.thumbnail,
                  sku: lineItem.sku,
                  quantity: remainingQuantity,
                  totalQuantity: lineItem.quantity,
                  fulfilledQuantity,
                  formattedUnitPrice: lineItem.formattedUnitPrice,
                  formattedTotal: lineItem.formattedTotal,
                  variantTitle: lineItem.variantTitle,
                  productData: lineItem.productData,
                  variantData: lineItem.variantData,
                  moneyAmount: lineItem.moneyAmount
                };
              }).filter((item2) => item2.quantity > 0) || [];
              return toJsonValue(result);
            }
          })
        }),
        fulfillmentStatus: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    quantity
                  }
                  fulfillments {
                    canceledAt
                    shippingLabels {
                      id
                    }
                    fulfillmentItems {
                      quantity
                    }
                  }
                `
              });
              if (!order) return null;
              const totalQuantity = order.lineItems.reduce((sum, item2) => sum + item2.quantity, 0);
              const activeFulfillments = order.fulfillments.filter((f) => !f.canceledAt);
              const fulfilledQuantity = activeFulfillments.reduce(
                (sum, f) => sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0),
                0
              );
              const shippedQuantity = activeFulfillments.filter((f) => f.shippingLabels?.length > 0).reduce(
                (sum, f) => sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0),
                0
              );
              return {
                totalQuantity,
                fulfilledQuantity,
                shippedQuantity,
                remainingQuantity: totalQuantity - fulfilledQuantity,
                status: fulfilledQuantity === 0 ? "not_fulfilled" : fulfilledQuantity === totalQuantity ? "fulfilled" : "partially_fulfilled",
                shippingStatus: shippedQuantity === 0 ? "not_shipped" : shippedQuantity === totalQuantity ? "shipped" : "partially_shipped"
              };
            }
          })
        }),
        paymentDetails: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    id
                    amount
                    status
                    data
                    createdAt
                    paymentCollection {
                      paymentSessions {
                        id
                        amount
                        isSelected
                        paymentProvider {
                          name
                        }
                      }
                    }
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
              if (!order) return null;
              if (!order?.payments?.length) return null;
              return toJsonValue(order.payments.map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                formattedAmount: order.currency ? `${order.currency.symbol}${(payment.amount / 100).toFixed(2)}` : `${(payment.amount / 100).toFixed(2)}`,
                status: payment.status,
                createdAt: payment.createdAt,
                provider: payment.data?.provider,
                cardLast4: payment.data?.cardLast4,
                paymentSession: payment.paymentCollection?.paymentSessions?.find((s) => s.isSelected)
              })));
            }
          })
        }),
        totalPaid: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.Int,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                `
              });
              if (!order) return null;
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                const hasPaidLineItems = order.accountLineItems.some(
                  (lineItem) => lineItem.paymentStatus === "paid"
                );
                if (hasPaidLineItems) {
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === "paid") {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }
              return totalPaid;
            }
          })
        }),
        formattedTotalPaid: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
              if (!order) return null;
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                const hasPaidLineItems = order.accountLineItems.some(
                  (lineItem) => lineItem.paymentStatus === "paid"
                );
                if (hasPaidLineItems) {
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === "paid") {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }
              if (!order.currency) return `${(totalPaid / 100).toFixed(2)}`;
              return `${order.currency.symbol}${(totalPaid / 100).toFixed(2)}`;
            }
          })
        })
      }
    }),
    events: (0, import_fields45.relationship)({
      ref: "OrderEvent.order",
      many: true
    }),
    note: (0, import_fields45.text)({
      label: "Note"
    }),
    shippingLabels: (0, import_fields45.relationship)({
      ref: "ShippingLabel.order",
      many: true
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/OrderEvent.ts
var import_core43 = require("@keystone-6/core");
var import_fields46 = require("@keystone-6/core/fields");
init_access();
var OrderEvent = (0, import_core43.list)({
  fields: {
    order: (0, import_fields46.relationship)({
      ref: "Order.events",
      many: false
    }),
    user: (0, import_fields46.relationship)({
      ref: "User.orderEvents",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    type: (0, import_fields46.select)({
      type: "enum",
      options: [
        { label: "Order Placed", value: "ORDER_PLACED" },
        { label: "Status Change", value: "STATUS_CHANGE" },
        { label: "Payment Status Change", value: "PAYMENT_STATUS_CHANGE" },
        { label: "Payment Captured", value: "PAYMENT_CAPTURED" },
        { label: "Fulfillment Status Change", value: "FULFILLMENT_STATUS_CHANGE" },
        { label: "Note Added", value: "NOTE_ADDED" },
        { label: "Email Sent", value: "EMAIL_SENT" },
        { label: "Tracking Number Added", value: "TRACKING_NUMBER_ADDED" },
        { label: "Return Requested", value: "RETURN_REQUESTED" },
        { label: "Refund Processed", value: "REFUND_PROCESSED" }
      ],
      validation: { isRequired: true },
      defaultValue: "STATUS_CHANGE"
    }),
    data: (0, import_fields46.json)({
      defaultValue: {}
    }),
    time: (0, import_fields46.timestamp)({
      defaultValue: { kind: "now" }
    }),
    createdBy: (0, import_fields46.relationship)({
      ref: "User",
      many: false,
      ui: {
        displayMode: "select",
        labelField: "email"
      },
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.createdBy && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.createdBy;
        }
      }
    }),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["order", "type", "time", "createdBy"],
      initialSort: { field: "time", direction: "DESC" }
    }
  },
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: () => false,
      delete: () => false
    }
  }
});

// features/keystone/models/OrderLineItem.ts
var import_core44 = require("@keystone-6/core");
var import_fields47 = require("@keystone-6/core/fields");
init_access();

// features/keystone/orders/snapshot-thumbnail.ts
function orderSnapshotThumbnail(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return null;
  const value = snapshot.thumbnail;
  if (typeof value !== "string" || !value.trim()) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

// features/keystone/models/OrderLineItem.ts
var isS3SignedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.has("X-Amz-Date") && parsedUrl.searchParams.has("X-Amz-Expires");
  } catch (e) {
    return false;
  }
};
var isS3UrlExpired = (url) => {
  try {
    const parsedUrl = new URL(url);
    const dateStr = parsedUrl.searchParams.get("X-Amz-Date") || "";
    const expiresSeconds = parseInt(parsedUrl.searchParams.get("X-Amz-Expires") || "", 10);
    const date = /* @__PURE__ */ new Date(
      dateStr.slice(0, 4) + "-" + dateStr.slice(4, 6) + "-" + dateStr.slice(6, 8) + "T" + dateStr.slice(9, 11) + ":" + dateStr.slice(11, 13) + ":" + dateStr.slice(13, 15) + "Z"
    );
    const expirationTime = new Date(date.getTime() + expiresSeconds * 1e3);
    return expirationTime < /* @__PURE__ */ new Date();
  } catch (e) {
    return true;
  }
};
var checkUrlIsAccessible = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (e) {
    return false;
  }
};
var OrderLineItem = (0, import_core44.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    quantity: (0, import_fields47.integer)({ validation: { isRequired: true } }),
    title: (0, import_fields47.text)({ validation: { isRequired: true } }),
    sku: (0, import_fields47.text)(),
    thumbnail: (0, import_fields47.virtual)({
      field: import_core44.graphql.field({
        type: import_core44.graphql.String,
        async resolve(item, args, context) {
          const thumbnail = orderSnapshotThumbnail(item.productData);
          if (thumbnail) {
            if (thumbnail.startsWith("/")) return thumbnail;
            if (isS3SignedUrl(thumbnail)) {
              if (!isS3UrlExpired(thumbnail) && await checkUrlIsAccessible(thumbnail)) return thumbnail;
            } else if (await checkUrlIsAccessible(thumbnail)) {
              return thumbnail;
            }
          }
          const orderLineItem = await context.sudo().query.OrderLineItem.findOne({
            where: { id: item.id },
            query: `
              productVariant {
                id
                primaryImage {
                  image { url }
                  imagePath
                }
                product {
                  thumbnail
                }
              }
            `
          });
          const primaryImage = orderLineItem?.productVariant?.primaryImage;
          if (primaryImage) {
            return primaryImage.image?.url || primaryImage.imagePath || null;
          }
          return orderLineItem?.productVariant?.product?.thumbnail || null;
        }
      })
    }),
    metadata: (0, import_fields47.json)(),
    productData: (0, import_fields47.json)({ ui: { description: "Snapshot of product data at time of order" } }),
    variantData: (0, import_fields47.json)({ ui: { description: "Snapshot of variant data at time of order" } }),
    variantTitle: (0, import_fields47.text)(),
    formattedUnitPrice: (0, import_fields47.text)(),
    formattedTotal: (0, import_fields47.text)(),
    order: (0, import_fields47.relationship)({ ref: "Order.lineItems" }),
    productVariant: (0, import_fields47.relationship)({ ref: "ProductVariant", ui: { description: "Optional historical product reference" } }),
    moneyAmount: (0, import_fields47.relationship)({ ref: "OrderMoneyAmount.orderLineItem" }),
    originalLineItem: (0, import_fields47.relationship)({ ref: "LineItem", ui: { description: "Original cart line item reference" } }),
    fulfillmentItems: (0, import_fields47.relationship)({ ref: "FulfillmentItem.lineItem", many: true }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/OrderMoneyAmount.ts
var import_core45 = require("@keystone-6/core");
var import_fields48 = require("@keystone-6/core/fields");
init_access();
var OrderMoneyAmount = (0, import_core45.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields48.integer)({
      validation: { isRequired: true }
    }),
    originalAmount: (0, import_fields48.integer)({
      validation: { isRequired: true }
    }),
    priceData: (0, import_fields48.json)({
      ui: { description: "Snapshot of complete price data including rules, lists, etc." }
    }),
    metadata: (0, import_fields48.json)(),
    orderLineItem: (0, import_fields48.relationship)({
      ref: "OrderLineItem.moneyAmount"
    }),
    currency: (0, import_fields48.relationship)({
      ref: "Currency"
    }),
    region: (0, import_fields48.relationship)({
      ref: "Region"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Payment.ts
var import_core46 = require("@keystone-6/core");
var import_fields49 = require("@keystone-6/core/fields");
init_access();
var import_core47 = require("@keystone-6/core");
var Payment = (0, import_core46.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    status: (0, import_fields49.select)({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Authorized", value: "authorized" },
        { label: "Captured", value: "captured" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" }
      ],
      defaultValue: "pending",
      validation: { isRequired: true }
    }),
    amount: (0, import_fields49.integer)({
      validation: {
        isRequired: true
      }
    }),
    currencyCode: (0, import_fields49.text)({
      validation: {
        isRequired: true
      }
    }),
    amountRefunded: (0, import_fields49.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields49.json)(),
    capturedAt: (0, import_fields49.timestamp)(),
    canceledAt: (0, import_fields49.timestamp)(),
    metadata: (0, import_fields49.json)(),
    idempotencyKey: (0, import_fields49.text)(),
    cart: (0, import_fields49.relationship)({
      ref: "Cart.payment"
    }),
    paymentCollection: (0, import_fields49.relationship)({
      ref: "PaymentCollection.payments"
    }),
    swap: (0, import_fields49.relationship)({
      ref: "Swap.payment"
    }),
    currency: (0, import_fields49.relationship)({
      ref: "Currency.payments"
    }),
    order: (0, import_fields49.relationship)({
      ref: "Order.payments"
    }),
    captures: (0, import_fields49.relationship)({
      ref: "Capture.payment",
      many: true
    }),
    refunds: (0, import_fields49.relationship)({
      ref: "Refund.payment",
      many: true
    }),
    user: (0, import_fields49.relationship)({
      ref: "User.payments"
    }),
    paymentLink: (0, import_fields49.virtual)({
      field: import_core47.graphql.field({
        type: import_core47.graphql.String,
        resolve(item) {
          if (!item.data) return null;
          const data = item.data;
          if (data.provider_id?.startsWith("pp_stripe_")) {
            const paymentIntentId = data.payment_intent_id;
            if (paymentIntentId) {
              return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
            }
          }
          if (data.provider_id?.startsWith("pp_paypal_")) {
            const paypalOrderId = data.id;
            if (paypalOrderId) {
              return `https://www.paypal.com/activity/payment/${paypalOrderId}`;
            }
          }
          return null;
        }
      })
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/PaymentCollection.ts
var import_core48 = require("@keystone-6/core");
var import_access78 = require("@keystone-6/core/access");
var import_fields50 = require("@keystone-6/core/fields");
init_access();
var PaymentCollection = (0, import_core48.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    description: (0, import_fields50.select)({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Refund", value: "refund" }
      ],
      defaultValue: "default"
    }),
    amount: (0, import_fields50.integer)({
      validation: { isRequired: true }
    }),
    authorizedAmount: (0, import_fields50.integer)({
      defaultValue: 0
    }),
    refundedAmount: (0, import_fields50.integer)({
      defaultValue: 0
    }),
    metadata: (0, import_fields50.json)(),
    paymentSessions: (0, import_fields50.relationship)({
      ref: "PaymentSession.paymentCollection",
      access: { create: import_access78.denyAll, update: import_access78.denyAll },
      many: true
    }),
    payments: (0, import_fields50.relationship)({
      ref: "Payment.paymentCollection",
      many: true
    }),
    cart: (0, import_fields50.relationship)({
      ref: "Cart.paymentCollection",
      access: { create: import_access78.denyAll, update: import_access78.denyAll }
    }),
    invoice: (0, import_fields50.relationship)({
      ref: "Invoice.paymentCollection"
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentProvider.ts
var import_core49 = require("@keystone-6/core");
var import_access80 = require("@keystone-6/core/access");
var import_fields51 = require("@keystone-6/core/fields");
init_access();
var PaymentProvider = (0, import_core49.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    name: (0, import_fields51.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields51.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^pp_[a-zA-Z0-9-_]+$/,
          explanation: 'Payment provider code must start with "pp_" followed by alphanumeric characters, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields51.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields51.json)({
      access: { read: import_access80.denyAll },
      defaultValue: {},
      ui: { description: "Legacy server-only secret material. Prefer a deployment secret reference." }
    }),
    credentialReference: (0, import_fields51.text)({
      ui: { description: "Opaque secret-manager reference; never a secret value." }
    }),
    metadata: (0, import_fields51.json)({
      defaultValue: {}
    }),
    // Adapter function fields
    createPaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to create payments"
      }
    }),
    capturePaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to capture payments"
      }
    }),
    refundPaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to refund payments"
      }
    }),
    getPaymentStatusFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to check payment status"
      }
    }),
    generatePaymentLinkFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to generate payment dashboard links"
      }
    }),
    handleWebhookFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to handle provider webhooks"
      }
    }),
    regions: (0, import_fields51.relationship)({
      ref: "Region.paymentProviders",
      many: true
    }),
    sessions: (0, import_fields51.relationship)({
      ref: "PaymentSession.paymentProvider",
      access: { create: import_access80.denyAll, update: import_access80.denyAll },
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentSession.ts
var import_core50 = require("@keystone-6/core");
var import_access82 = require("@keystone-6/core/access");
var import_fields52 = require("@keystone-6/core/fields");
init_access();
var import_core51 = require("@keystone-6/core");
var PaymentSession = (0, import_core50.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    isSelected: (0, import_fields52.checkbox)({
      defaultValue: false
    }),
    isInitiated: (0, import_fields52.checkbox)({
      defaultValue: false
    }),
    amount: (0, import_fields52.integer)({
      validation: { isRequired: true }
    }),
    formattedAmount: (0, import_fields52.virtual)({
      field: import_core51.graphql.field({
        type: import_core51.graphql.String,
        async resolve(item, args, context) {
          const { paymentCollection } = await context.query.PaymentSession.findOne({
            where: { id: item.id },
            query: `
              paymentCollection {
                cart {
                  order {
                    currency {
                      code
                      symbol
                    }
                  }
                }
              }
            `
          });
          if (!paymentCollection?.cart?.order?.currency) {
            return `${item.amount / 100}`;
          }
          const { symbol } = paymentCollection.cart.order.currency;
          const amount = item.amount / 100;
          return `${symbol}${amount.toFixed(2)}`;
        }
      })
    }),
    data: (0, import_fields52.json)({
      defaultValue: {}
    }),
    idempotencyKey: (0, import_fields52.text)({
      isIndexed: true
    }),
    paymentCollection: (0, import_fields52.relationship)({
      ref: "PaymentCollection.paymentSessions",
      access: { create: import_access82.denyAll, update: import_access82.denyAll }
    }),
    paymentProvider: (0, import_fields52.relationship)({
      ref: "PaymentProvider.sessions",
      access: { create: import_access82.denyAll, update: import_access82.denyAll },
      many: false
    }),
    paymentAuthorizedAt: (0, import_fields52.timestamp)(),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/PriceList.ts
var import_core52 = require("@keystone-6/core");
var import_fields53 = require("@keystone-6/core/fields");
init_access();
var PriceList = (0, import_core52.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    name: (0, import_fields53.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields53.text)({
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields53.select)({
      type: "enum",
      options: [
        {
          label: "Sale",
          value: "sale"
        },
        {
          label: "Override",
          value: "override"
        }
      ],
      defaultValue: "sale",
      validation: {
        isRequired: true
      }
    }),
    status: (0, import_fields53.select)({
      type: "enum",
      options: [
        {
          label: "Active",
          value: "active"
        },
        {
          label: "Draft",
          value: "draft"
        }
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true
      }
    }),
    startsAt: (0, import_fields53.timestamp)(),
    endsAt: (0, import_fields53.timestamp)(),
    moneyAmounts: (0, import_fields53.relationship)({
      ref: "MoneyAmount.priceList",
      many: true
    }),
    customerGroups: (0, import_fields53.relationship)({
      ref: "CustomerGroup.priceLists",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PriceRule.ts
var import_core53 = require("@keystone-6/core");
var import_fields54 = require("@keystone-6/core/fields");
init_access();
var PriceRule = (0, import_core53.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields54.select)({
      type: "enum",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Percentage", value: "percentage" }
      ],
      validation: { isRequired: true }
    }),
    value: (0, import_fields54.float)({ validation: { isRequired: true } }),
    priority: (0, import_fields54.integer)({ defaultValue: 0 }),
    ruleAttribute: (0, import_fields54.text)({ validation: { isRequired: true } }),
    ruleValue: (0, import_fields54.text)({ validation: { isRequired: true } }),
    moneyAmounts: (0, import_fields54.relationship)({ ref: "MoneyAmount.priceRules", many: true }),
    priceSet: (0, import_fields54.relationship)({ ref: "PriceSet.priceRules" }),
    ...trackingFields
  }
});

// features/keystone/models/PriceSet.ts
var import_core54 = require("@keystone-6/core");
var import_fields55 = require("@keystone-6/core/fields");
init_access();
var PriceSet = (0, import_core54.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    prices: (0, import_fields55.relationship)({ ref: "MoneyAmount.priceSet", many: true }),
    priceRules: (0, import_fields55.relationship)({ ref: "PriceRule.priceSet", many: true }),
    ruleTypes: (0, import_fields55.relationship)({ ref: "RuleType.priceSets", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/Product.ts
var import_core55 = require("@keystone-6/core");
var import_access87 = require("@keystone-6/core/access");
var import_fields56 = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
init_access();
var Product = (0, import_core55.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canReadProducts({ session }) || permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          status: {
            equals: "published"
          }
        };
      }
    }
  },
  fields: {
    title: (0, import_fields56.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields_document.document)({
      formatting: true,
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1]
      ]
    }),
    handle: (0, import_fields56.text)({
      isIndexed: "unique"
    }),
    subtitle: (0, import_fields56.text)(),
    isGiftcard: (0, import_fields56.checkbox)(),
    thumbnail: (0, import_fields56.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.String,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: "productImages(take: 1) { image { url } imagePath }"
          });
          return product.productImages[0]?.image?.url || product.productImages[0]?.imagePath || null;
        }
      })
    }),
    dimensionsRange: (0, import_fields56.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants {
                measurements {
                  value
                  unit
                  type
                }
              }
            `
          });
          if (!product?.productVariants?.length) return null;
          const dimensions = {
            weight: { min: null, max: null },
            length: { min: null, max: null },
            height: { min: null, max: null },
            width: { min: null, max: null }
          };
          product.productVariants.forEach((variant) => {
            variant.measurements?.forEach((measurement) => {
              const dim = measurement.type;
              if (dimensions[dim] && measurement.value !== null && measurement.value !== void 0) {
                if (dimensions[dim].min === null || measurement.value < dimensions[dim].min) {
                  dimensions[dim].min = measurement.value;
                }
                if (dimensions[dim].max === null || measurement.value > dimensions[dim].max) {
                  dimensions[dim].max = measurement.value;
                }
              }
            });
          });
          return dimensions;
        }
      })
    }),
    defaultDimensions: (0, import_fields56.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants(take: 1) {
                measurements {
                  value
                  unit
                  type
                }
              }
            `
          });
          if (!product?.productVariants?.[0]?.measurements) return null;
          const dimensions = {};
          product.productVariants[0].measurements.forEach((measurement) => {
            dimensions[measurement.type] = {
              value: measurement.value,
              unit: measurement.unit
            };
          });
          return dimensions;
        }
      })
    }),
    metadata: (0, import_fields56.json)(),
    discountable: (0, import_fields56.checkbox)({
      defaultValue: true
    }),
    regulatedCommerceRequired: (0, import_fields56.checkbox)({
      defaultValue: true,
      access: {
        create: permissions.canManageCompliance,
        update: permissions.canManageCompliance
      },
      ui: {
        description: "On by default. Turn off only after a compliance reviewer documents that the product is outside regulated scope."
      }
    }),
    regulatedExemptionReference: (0, import_fields56.text)({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance },
      ui: { description: "Required when a compliance reviewer records that this product is outside regulated scope." }
    }),
    regulatedExemptionDigest: (0, import_fields56.text)({
      access: { read: import_access87.denyAll, create: permissions.canManageCompliance, update: permissions.canManageCompliance }
    }),
    regulatedExemptionReviewedAt: (0, import_fields56.timestamp)({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance }
    }),
    regulatedExemptionExpiresAt: (0, import_fields56.timestamp)({
      access: { read: permissions.canReadCompliance, create: permissions.canManageCompliance, update: permissions.canManageCompliance }
    }),
    status: (0, import_fields56.select)({
      type: "enum",
      options: [
        {
          label: "Draft",
          value: "draft"
        },
        {
          label: "Proposed",
          value: "proposed"
        },
        {
          label: "Published",
          value: "published"
        },
        {
          label: "Rejected",
          value: "rejected"
        }
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true
      }
    }),
    externalId: (0, import_fields56.text)(),
    productCollections: (0, import_fields56.relationship)({
      ref: "ProductCollection.products",
      many: true
    }),
    productCategories: (0, import_fields56.relationship)({
      ref: "ProductCategory.products",
      many: true
    }),
    shippingProfile: (0, import_fields56.relationship)({
      ref: "ShippingProfile.products"
    }),
    productType: (0, import_fields56.relationship)({
      ref: "ProductType.products"
    }),
    discountConditions: (0, import_fields56.relationship)({
      ref: "DiscountCondition.products",
      many: true
    }),
    discountRules: (0, import_fields56.relationship)({
      ref: "DiscountRule.products",
      many: true
    }),
    productImages: (0, import_fields56.relationship)({
      ref: "ProductImage.products",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["image", "altText", "imagePath"],
        inlineCreate: { fields: ["image", "altText", "imagePath"] },
        inlineEdit: { fields: ["image", "altText", "imagePath"] },
        inlineConnect: true,
        removeMode: "disconnect",
        linkToItem: false
      }
    }),
    productOptions: (0, import_fields56.relationship)({
      ref: "ProductOption.product",
      many: true
    }),
    productTags: (0, import_fields56.relationship)({
      ref: "ProductTag.products",
      many: true
    }),
    taxRates: (0, import_fields56.relationship)({
      ref: "TaxRate.products",
      many: true
    }),
    productVariants: (0, import_fields56.relationship)({
      ref: "ProductVariant.product",
      many: true
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, context, addValidationError }) => {
      const nextStatus = resolvedData.status ?? item?.status;
      const regulated = resolvedData.regulatedCommerceRequired ?? item?.regulatedCommerceRequired ?? true;
      const marketingChanged = ["title", "subtitle", "description", "metadata"].some((key) => resolvedData[key] !== void 0);
      if (!regulated) {
        const reference = resolvedData.regulatedExemptionReference ?? item?.regulatedExemptionReference;
        const digest = resolvedData.regulatedExemptionDigest ?? item?.regulatedExemptionDigest;
        const reviewedAt = resolvedData.regulatedExemptionReviewedAt ?? item?.regulatedExemptionReviewedAt;
        const expiresAt = resolvedData.regulatedExemptionExpiresAt ?? item?.regulatedExemptionExpiresAt;
        if (!reference || !/^[a-f0-9]{64}$/i.test(digest || "") || !reviewedAt || !expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
          addValidationError("A reviewed exemption reference and evidence digest are required to disable regulated controls");
          return;
        }
      }
      if (operation === "update" && nextStatus === "published" && regulated && marketingChanged) {
        addValidationError("Unpublish regulated products before changing customer-facing claims");
        return;
      }
      if (nextStatus !== "published" || !regulated) return;
      if (operation === "create" || !item?.id) {
        addValidationError("Create regulated products as draft, add reviewed variant evidence, then publish");
        return;
      }
      try {
        await assertProductPublicationEvidence(context, item.id);
      } catch (error) {
        addValidationError(error instanceof Error ? error.message : "Regulated publication evidence is required");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation !== "update") return;
      const marketingChanged = ["title", "subtitle", "description", "metadata"].some((key) => resolvedData[key] !== void 0);
      if (!marketingChanged || item?.status === "published" || item?.regulatedCommerceRequired === false) return;
      const product = await context.sudo().query.Product.findOne({
        where: { id: item.id },
        query: "productVariants { regulatedClassification { id } }"
      });
      const ids = product?.productVariants?.map((variant) => variant.regulatedClassification?.id).filter(Boolean) ?? [];
      if (ids.length) {
        await context.sudo().prisma.regulatedProductClassification.updateMany({
          where: { id: { in: ids } },
          data: { status: "review", marketingReviewStatus: "revoked", marketingReviewedAt: null }
        });
      }
    }
  },
  ui: {
    labelField: "title"
  }
});

// features/keystone/models/ProductCategory.ts
var import_core56 = require("@keystone-6/core");
var import_fields57 = require("@keystone-6/core/fields");
init_access();
var ProductCategory = (0, import_core56.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          isActive: {
            equals: true
          }
        };
      }
    }
  },
  fields: {
    title: (0, import_fields57.text)({
      validation: {
        isRequired: true
      }
    }),
    handle: (0, import_fields57.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields57.json)(),
    isInternal: (0, import_fields57.checkbox)({
      defaultValue: false
    }),
    isActive: (0, import_fields57.checkbox)({
      defaultValue: true
    }),
    discountConditions: (0, import_fields57.relationship)({
      ref: "DiscountCondition.productCategories",
      many: true
    }),
    products: (0, import_fields57.relationship)({
      ref: "Product.productCategories",
      many: true
    }),
    parentCategory: (0, import_fields57.relationship)({
      ref: "ProductCategory.categoryChildren",
      many: false
    }),
    categoryChildren: (0, import_fields57.relationship)({
      ref: "ProductCategory.parentCategory",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = resolvedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.ProductCategory.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ProductCollection.ts
var import_core57 = require("@keystone-6/core");
var import_fields58 = require("@keystone-6/core/fields");
init_access();
var ProductCollection = (0, import_core57.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    title: (0, import_fields58.text)({
      validation: {
        isRequired: true
      }
    }),
    handle: (0, import_fields58.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields58.json)(),
    discountConditions: (0, import_fields58.relationship)({
      ref: "DiscountCondition.productCollections",
      many: true
    }),
    products: (0, import_fields58.relationship)({
      ref: "Product.productCollections",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = resolvedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.ProductCollection.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ProductImage.ts
var import_core58 = require("@keystone-6/core");
var import_fields59 = require("@keystone-6/core/fields");
init_access();
var ProductImage = (0, import_core58.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: { query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }) ? true : { OR: [{ products: { some: { status: { equals: "published" } } } }, { productVariants: { some: { product: { status: { equals: "published" } } } } }] } }
  },
  hooks: {
    afterOperation: async ({ operation, item, inputData, context }) => {
      if (operation !== "update" || inputData?.image === void 0 && inputData?.imagePath === void 0) return;
      const sudo = context.sudo();
      const image4 = await sudo.query.ProductImage.findOne({ where: { id: item.id }, query: "products { id } productVariants { id product { id } }" });
      const ids = [...new Set([...(image4?.products || []).map((p) => p.id), ...(image4?.productVariants || []).map((v) => v.product?.id)].filter(Boolean))];
      if (!ids.length) return;
      const products = await sudo.query.Product.findMany({ where: { id: { in: ids }, regulatedCommerceRequired: { equals: true } }, query: "id" });
      if (products.length) {
        await sudo.db.Product.updateMany({ data: products.map((product) => ({ where: { id: product.id }, data: { status: "draft" } })) });
      }
      const classifications = await sudo.query.RegulatedProductClassification.findMany({ where: { variant: { product: { id: { in: ids } } } }, query: "id status" });
      if (classifications.length) {
        await sudo.db.RegulatedProductClassification.updateMany({
          data: classifications.map((classification) => ({
            where: { id: classification.id },
            data: classification.status === "approved" ? { status: "revoked" } : { marketingReviewStatus: "revoked", marketingReviewedAt: null }
          }))
        });
      }
    }
  },
  fields: {
    image: (0, import_fields59.image)({ storage: "my_images" }),
    imagePath: (0, import_fields59.text)(),
    altText: (0, import_fields59.text)(),
    order: (0, import_fields59.integer)({
      defaultValue: 0
    }),
    products: (0, import_fields59.relationship)({ ref: "Product.productImages", many: true }),
    productVariants: (0, import_fields59.relationship)({ ref: "ProductVariant.primaryImage", many: true }),
    metadata: (0, import_fields59.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "imagePath", "altText", "products"]
    }
  }
});

// features/keystone/models/ProductOption.ts
var import_core59 = require("@keystone-6/core");
var import_fields60 = require("@keystone-6/core/fields");
init_access();
var ProductOption = (0, import_core59.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    title: (0, import_fields60.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields60.json)(),
    product: (0, import_fields60.relationship)({
      ref: "Product.productOptions"
    }),
    productOptionValues: (0, import_fields60.relationship)({
      ref: "ProductOptionValue.productOption",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductOptionValue.ts
var import_core60 = require("@keystone-6/core");
var import_fields61 = require("@keystone-6/core/fields");
init_access();
var ProductOptionValue = (0, import_core60.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields61.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields61.json)(),
    productVariants: (0, import_fields61.relationship)({
      ref: "ProductVariant.productOptionValues",
      many: true
    }),
    productOption: (0, import_fields61.relationship)({
      ref: "ProductOption.productOptionValues"
    }),
    ...trackingFields
  },
  ui: {
    labelField: "value"
  }
});

// features/keystone/models/ProductTag.ts
var import_core61 = require("@keystone-6/core");
var import_fields62 = require("@keystone-6/core/fields");
init_access();
var ProductTag = (0, import_core61.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields62.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields62.json)(),
    discountConditions: (0, import_fields62.relationship)({
      ref: "DiscountCondition.productTags",
      many: true
    }),
    products: (0, import_fields62.relationship)({ ref: "Product.productTags", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/ProductType.ts
var import_core62 = require("@keystone-6/core");
var import_fields63 = require("@keystone-6/core/fields");
init_access();
var ProductType = (0, import_core62.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields63.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields63.json)(),
    discountConditions: (0, import_fields63.relationship)({
      ref: "DiscountCondition.productTypes",
      many: true
    }),
    products: (0, import_fields63.relationship)({
      ref: "Product.productType",
      many: true
    }),
    taxRates: (0, import_fields63.relationship)({
      ref: "TaxRate.productTypes",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductVariant.ts
var import_core63 = require("@keystone-6/core");
var import_fields64 = require("@keystone-6/core/fields");
init_access();

// features/keystone/regulated/variant-review.ts
var REGULATED_VARIANT_REVIEW_FIELDS = [
  "title",
  "sku",
  "barcode",
  "ean",
  "upc",
  "hsCode",
  "originCountry",
  "midCode",
  "material",
  "metadata",
  "product",
  "regulatedClassification",
  "primaryImage",
  "productOptionValues"
];
function hasRegulatedVariantReviewChange(inputData) {
  if (!inputData || typeof inputData !== "object" || Array.isArray(inputData)) return false;
  const fields = inputData;
  return REGULATED_VARIANT_REVIEW_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(fields, field));
}
function shouldBlockVariantEvidenceMutation(operation, inputData, productStatus, hasCurrentExemption) {
  const changesReviewedEvidence = operation !== "update" || hasRegulatedVariantReviewChange(inputData);
  return changesReviewedEvidence && (productStatus === "published" || hasCurrentExemption);
}

// features/keystone/models/ProductVariant.ts
var ProductVariant = (0, import_core63.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: { query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }) ? true : { product: { status: { equals: "published" } } } }
  },
  fields: {
    fullTitle: (0, import_fields64.virtual)({
      field: import_core63.graphql.field({
        type: import_core63.graphql.String,
        resolve: async (item, args, context) => {
          const { product } = await context.query.ProductVariant.findOne({
            where: { id: item.id.toString() },
            query: "product { title }"
          });
          return `${product?.title ? `${product.title} - ` : ""}${item.title}`;
        }
      })
    }),
    title: (0, import_fields64.text)({
      validation: {
        isRequired: true
      }
    }),
    sku: (0, import_fields64.text)(),
    barcode: (0, import_fields64.text)(),
    ean: (0, import_fields64.text)(),
    upc: (0, import_fields64.text)(),
    inventoryQuantity: (0, import_fields64.integer)({
      validation: {
        isRequired: true
      }
    }),
    allowBackorder: (0, import_fields64.checkbox)(),
    manageInventory: (0, import_fields64.checkbox)({
      defaultValue: true
    }),
    hsCode: (0, import_fields64.text)(),
    originCountry: (0, import_fields64.text)(),
    midCode: (0, import_fields64.text)(),
    material: (0, import_fields64.text)(),
    metadata: (0, import_fields64.json)(),
    variantRank: (0, import_fields64.integer)({
      defaultValue: 0
    }),
    product: (0, import_fields64.relationship)({
      ref: "Product.productVariants"
    }),
    claimItems: (0, import_fields64.relationship)({
      ref: "ClaimItem.productVariant",
      many: true
    }),
    lineItems: (0, import_fields64.relationship)({
      ref: "LineItem.productVariant",
      many: true
    }),
    prices: (0, import_fields64.relationship)({
      ref: "MoneyAmount.productVariant",
      many: true
    }),
    productOptionValues: (0, import_fields64.relationship)({
      ref: "ProductOptionValue.productVariants",
      many: true
    }),
    location: (0, import_fields64.relationship)({
      ref: "Location.variants"
    }),
    stockMovements: (0, import_fields64.relationship)({
      ref: "StockMovement.variant",
      many: true
    }),
    measurements: (0, import_fields64.relationship)({
      ref: "Measurement.productVariant",
      many: true
    }),
    primaryImage: (0, import_fields64.relationship)({
      ref: "ProductImage.productVariants",
      many: false
    }),
    regulatedClassification: (0, import_fields64.relationship)({
      ref: "RegulatedProductClassification.variant",
      many: false,
      ui: { description: "Reviewed ENDS classification required for publication and sale" }
    }),
    ...trackingFieldsFor()
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, context, addValidationError }) => {
      const currentProductId = typeof item?.product === "string" ? item.product : item?.product?.id || item?.productId;
      const nextProductId = resolvedData?.product?.connect?.id || resolvedData?.product?.set?.id;
      const productIds = [...new Set([currentProductId, nextProductId].filter((id2) => typeof id2 === "string" && id2.length > 0))];
      if (!productIds.length || operation === "update" && !hasRegulatedVariantReviewChange(resolvedData)) return;
      const products = await Promise.all(productIds.map((id2) => context.sudo().query.Product.findOne({
        where: { id: id2 },
        query: "id status regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt"
      })));
      const currentExemption = products.some((product) => product?.regulatedCommerceRequired === false && product.regulatedExemptionReference && /^[a-f0-9]{64}$/i.test(product.regulatedExemptionDigest || "") && product.regulatedExemptionReviewedAt && new Date(product.regulatedExemptionExpiresAt || 0).getTime() > Date.now());
      const publishedProduct = products.some((product) => product?.status === "published");
      const productStatus = publishedProduct ? "published" : products.find(Boolean)?.status;
      if (!shouldBlockVariantEvidenceMutation(operation, resolvedData, productStatus, currentExemption)) return;
      addValidationError(publishedProduct ? "Unpublish products before changing reviewed variant identity or media" : "Clear the reviewed exemption and reclassify the product before changing variant identity or media");
    },
    afterOperation: async ({ operation, inputData, item, context }) => {
      if (operation !== "update") return;
      const changed = hasRegulatedVariantReviewChange(inputData);
      if (!changed) return;
      await context.sudo().prisma.regulatedProductClassification.updateMany({
        where: { variant: { id: item.id } },
        data: { status: "review", marketingReviewStatus: "revoked", marketingReviewedAt: null }
      });
    }
  },
  ui: {
    labelField: "fullTitle"
  }
});

// features/keystone/models/Refund.ts
var import_core64 = require("@keystone-6/core");
var import_fields65 = require("@keystone-6/core/fields");
init_access();
var Refund = (0, import_core64.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields65.integer)({
      validation: {
        isRequired: true
      }
    }),
    note: (0, import_fields65.text)(),
    reason: (0, import_fields65.select)({
      type: "enum",
      options: [
        {
          label: "Discount",
          value: "discount"
        },
        {
          label: "Return",
          value: "return"
        },
        {
          label: "Swap",
          value: "swap"
        },
        {
          label: "Claim",
          value: "claim"
        },
        {
          label: "Other",
          value: "other"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields65.json)(),
    idempotencyKey: (0, import_fields65.text)(),
    payment: (0, import_fields65.relationship)({
      ref: "Payment.refunds"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Region.ts
var import_core65 = require("@keystone-6/core");
var import_access98 = require("@keystone-6/core/access");
var import_fields66 = require("@keystone-6/core/fields");
init_access();
var Region = (0, import_core65.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    code: (0, import_fields66.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields66.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields66.float)({
      validation: {
        isRequired: true
      }
    }),
    taxCode: (0, import_fields66.text)(),
    metadata: (0, import_fields66.json)(),
    giftCardsTaxable: (0, import_fields66.checkbox)({
      defaultValue: true
    }),
    automaticTaxes: (0, import_fields66.checkbox)({
      defaultValue: true
    }),
    currency: (0, import_fields66.relationship)({
      ref: "Currency.regions"
    }),
    carts: (0, import_fields66.relationship)({
      ref: "Cart.region",
      access: { create: import_access98.denyAll, update: import_access98.denyAll },
      many: true
    }),
    countries: (0, import_fields66.relationship)({
      ref: "Country.region",
      many: true
    }),
    discounts: (0, import_fields66.relationship)({
      ref: "Discount.regions",
      many: true
    }),
    giftCards: (0, import_fields66.relationship)({
      ref: "GiftCard.region",
      many: true
    }),
    moneyAmounts: (0, import_fields66.relationship)({
      ref: "MoneyAmount.region",
      many: true
    }),
    orders: (0, import_fields66.relationship)({
      ref: "Order.region",
      many: true
    }),
    taxProvider: (0, import_fields66.relationship)({
      ref: "TaxProvider.regions"
    }),
    fulfillmentProviders: (0, import_fields66.relationship)({
      ref: "FulfillmentProvider.regions",
      many: true
    }),
    paymentProviders: (0, import_fields66.relationship)({
      ref: "PaymentProvider.regions",
      many: true
    }),
    shippingOptions: (0, import_fields66.relationship)({
      ref: "ShippingOption.region",
      many: true
    }),
    taxRates: (0, import_fields66.relationship)({
      ref: "TaxRate.region",
      many: true
    }),
    shippingProviders: (0, import_fields66.relationship)({
      ref: "ShippingProvider.regions",
      many: true
    }),
    accountLineItems: (0, import_fields66.relationship)({
      ref: "AccountLineItem.region",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Return.ts
var import_core66 = require("@keystone-6/core");
var import_fields67 = require("@keystone-6/core/fields");
init_access();
var Return = (0, import_core66.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    status: (0, import_fields67.select)({
      type: "enum",
      options: [
        {
          label: "Requested",
          value: "requested"
        },
        {
          label: "Received",
          value: "received"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        },
        {
          label: "Canceled",
          value: "canceled"
        }
      ],
      defaultValue: "requested",
      db: {
        isNullable: false
      },
      validation: {
        isRequired: true
      }
    }),
    shippingData: (0, import_fields67.json)(),
    refundAmount: (0, import_fields67.integer)({
      validation: {
        isRequired: true
      }
    }),
    receivedAt: (0, import_fields67.timestamp)(),
    metadata: (0, import_fields67.json)(),
    idempotencyKey: (0, import_fields67.text)(),
    noNotification: (0, import_fields67.checkbox)(),
    claimOrder: (0, import_fields67.relationship)({
      ref: "ClaimOrder.return"
    }),
    swap: (0, import_fields67.relationship)({
      ref: "Swap.return"
    }),
    order: (0, import_fields67.relationship)({
      ref: "Order.returns"
    }),
    returnItems: (0, import_fields67.relationship)({
      ref: "ReturnItem.return",
      many: true
    }),
    shippingMethod: (0, import_fields67.relationship)({
      ref: "ShippingMethod.return"
    }),
    ...trackingFields
  },
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (operation !== "create" || !item?.orderId) return;
      await context.sudo().db.OrderEvent.createOne({
        data: {
          order: { connect: { id: item.orderId } },
          type: "RETURN_REQUESTED",
          data: { returnId: item.id }
        }
      });
    }
  }
});

// features/keystone/models/ReturnItem.ts
var import_core67 = require("@keystone-6/core");
var import_fields68 = require("@keystone-6/core/fields");
init_access();
var ReturnItem = (0, import_core67.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    quantity: (0, import_fields68.integer)({
      validation: {
        isRequired: true
      }
    }),
    isRequested: (0, import_fields68.checkbox)({
      defaultValue: true
    }),
    requestedQuantity: (0, import_fields68.integer)(),
    receivedQuantity: (0, import_fields68.integer)(),
    metadata: (0, import_fields68.json)(),
    note: (0, import_fields68.text)(),
    return: (0, import_fields68.relationship)({
      ref: "Return.returnItems"
    }),
    lineItem: (0, import_fields68.relationship)({
      ref: "LineItem.returnItems"
    }),
    returnReason: (0, import_fields68.relationship)({
      ref: "ReturnReason.returnItems"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ReturnReason.ts
var import_core68 = require("@keystone-6/core");
var import_fields69 = require("@keystone-6/core/fields");
init_access();
var ReturnReason = (0, import_core68.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    value: (0, import_fields69.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    label: (0, import_fields69.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields69.text)(),
    metadata: (0, import_fields69.json)(),
    parentReturnReason: (0, import_fields69.relationship)({
      ref: "ReturnReason"
    }),
    returnItems: (0, import_fields69.relationship)({
      ref: "ReturnItem.returnReason",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Role.ts
var import_fields70 = require("@keystone-6/core/fields");
var import_core69 = require("@keystone-6/core");
init_access();
init_fields();
var Role = (0, import_core69.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadRoles({ session }) || permissions.canManageRoles({ session }),
      create: permissions.canManageRoles,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManageRoles(args),
    hideDelete: (args) => !permissions.canManageRoles(args),
    isHidden: (args) => !permissions.canManageRoles(args)
  },
  fields: {
    name: (0, import_fields70.text)({ validation: { isRequired: true } }),
    ...permissionFields,
    assignedTo: (0, import_fields70.relationship)({
      ref: "User.role",
      // TODO: Add this to the User
      many: true
      // ui: {
      //   itemView: { fieldMode: 'read' },
      // },
    }),
    ...trackingFields
  }
});

// features/keystone/models/RuleType.ts
var import_core70 = require("@keystone-6/core");
var import_fields72 = require("@keystone-6/core/fields");
init_access();
var RuleType = (0, import_core70.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields72.text)({ validation: { isRequired: true } }),
    ruleAttribute: (0, import_fields72.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
    priceSets: (0, import_fields72.relationship)({ ref: "PriceSet.ruleTypes", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/SalesChannel.ts
var import_core71 = require("@keystone-6/core");
var import_fields73 = require("@keystone-6/core/fields");
init_access();
var SalesChannel = (0, import_core71.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadSalesChannels({ session }) || permissions.canManageSalesChannels({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    name: (0, import_fields73.text)(),
    description: (0, import_fields73.text)(),
    isDisabled: (0, import_fields73.checkbox)(),
    ...trackingFields
  }
});

// features/keystone/models/ShippingLabel.ts
var import_core72 = require("@keystone-6/core");
var import_fields74 = require("@keystone-6/core/fields");
init_access();
var ShippingLabel = (0, import_core72.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: permissions.canManageFulfillments,
      delete: () => false
    }
  },
  fields: {
    status: (0, import_fields74.select)({
      type: "enum",
      options: [
        { label: "Created", value: "created" },
        { label: "Purchased", value: "purchased" },
        { label: "Failed", value: "failed" }
      ],
      validation: { isRequired: true },
      defaultValue: "created"
    }),
    // Label information
    labelUrl: (0, import_fields74.text)(),
    carrier: (0, import_fields74.text)(),
    service: (0, import_fields74.text)(),
    rate: (0, import_fields74.json)(),
    // Tracking information
    trackingNumber: (0, import_fields74.text)(),
    trackingUrl: (0, import_fields74.text)(),
    // Relationships
    order: (0, import_fields74.relationship)({
      ref: "Order.shippingLabels",
      many: false
    }),
    provider: (0, import_fields74.relationship)({
      ref: "ShippingProvider.labels",
      many: false
    }),
    fulfillment: (0, import_fields74.relationship)({
      ref: "Fulfillment.shippingLabels",
      many: false
    }),
    // Additional data
    data: (0, import_fields74.json)(),
    metadata: (0, import_fields74.json)(),
    ...trackingFields
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      if (resolvedData.carrier && resolvedData.trackingNumber && !resolvedData.trackingUrl) {
        const carrier = resolvedData.carrier.toLowerCase();
        resolvedData.trackingUrl = carrier === "ups" ? `https://www.ups.com/track?tracknum=${resolvedData.trackingNumber}` : carrier === "usps" ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${resolvedData.trackingNumber}` : carrier === "fedex" ? `https://www.fedex.com/fedextrack/?trknbr=${resolvedData.trackingNumber}` : carrier === "dhl" ? `https://www.dhl.com/en/express/tracking.html?AWB=${resolvedData.trackingNumber}` : void 0;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ShippingMethod.ts
var import_core73 = require("@keystone-6/core");
var import_access107 = require("@keystone-6/core/access");
var import_fields75 = require("@keystone-6/core/fields");
init_access();
var ShippingMethod = (0, import_core73.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const shippingMethod = await sudoContext.query.ShippingMethod.findOne({
          where: { id: String(item.id) },
          query: "cart { id }"
        });
        if (shippingMethod?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: shippingMethod.cart.id },
            data: {
              paymentCollection: {
                disconnect: true
              }
            }
          });
        }
      }
    }
  },
  fields: {
    price: (0, import_fields75.integer)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields75.json)(),
    return: (0, import_fields75.relationship)({
      ref: "Return.shippingMethod"
    }),
    order: (0, import_fields75.relationship)({
      ref: "Order.shippingMethods"
    }),
    claimOrder: (0, import_fields75.relationship)({
      ref: "ClaimOrder.shippingMethods"
    }),
    cart: (0, import_fields75.relationship)({
      ref: "Cart.shippingMethods",
      access: { create: import_access107.denyAll, update: import_access107.denyAll }
    }),
    swap: (0, import_fields75.relationship)({
      ref: "Swap.shippingMethods"
    }),
    shippingOption: (0, import_fields75.relationship)({
      ref: "ShippingOption.shippingMethods"
    }),
    shippingMethodTaxLines: (0, import_fields75.relationship)({
      ref: "ShippingMethodTaxLine.shippingMethod",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingMethodTaxLine.ts
var import_core74 = require("@keystone-6/core");
var import_fields76 = require("@keystone-6/core/fields");
init_access();
var ShippingMethodTaxLine = (0, import_core74.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields76.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields76.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields76.text)(),
    metadata: (0, import_fields76.json)(),
    shippingMethod: (0, import_fields76.relationship)({
      ref: "ShippingMethod.shippingMethodTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingOption.ts
var import_core75 = require("@keystone-6/core");
var import_fields77 = require("@keystone-6/core/fields");
init_access();
var import_core76 = require("@keystone-6/core");
function formatCurrency4(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}
var ShippingOption = (0, import_core75.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields77.text)({
      validation: {
        isRequired: true
      }
    }),
    uniqueKey: (0, import_fields77.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    priceType: (0, import_fields77.select)({
      type: "enum",
      options: [
        {
          label: "Flat Rate",
          value: "flat_rate"
        },
        {
          label: "Calculated",
          value: "calculated"
        },
        {
          label: "Free",
          value: "free"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields77.integer)({
      validation: {
        isRequired: false
      }
    }),
    isReturn: (0, import_fields77.checkbox)(),
    data: (0, import_fields77.json)(),
    metadata: (0, import_fields77.json)(),
    adminOnly: (0, import_fields77.checkbox)(),
    region: (0, import_fields77.relationship)({
      ref: "Region.shippingOptions"
    }),
    fulfillmentProvider: (0, import_fields77.relationship)({
      ref: "FulfillmentProvider.shippingOptions"
    }),
    shippingProfile: (0, import_fields77.relationship)({
      ref: "ShippingProfile.shippingOptions"
    }),
    customShippingOptions: (0, import_fields77.relationship)({
      ref: "CustomShippingOption.shippingOption",
      many: true
    }),
    shippingMethods: (0, import_fields77.relationship)({
      ref: "ShippingMethod.shippingOption",
      many: true
    }),
    shippingOptionRequirements: (0, import_fields77.relationship)({
      ref: "ShippingOptionRequirement.shippingOption",
      many: true
    }),
    taxRates: (0, import_fields77.relationship)({
      ref: "TaxRate.shippingOptions",
      many: true
    }),
    calculatedAmount: (0, import_fields77.virtual)({
      field: import_core76.graphql.field({
        type: import_core76.graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          const shippingOption = await sudoContext.query.ShippingOption.findOne({
            where: { id: item.id },
            query: `
              region {
                currency {
                  code
                  noDivisionCurrency
                }
              }
              amount
              taxRates {
                rate
              }
            `
          });
          if (!shippingOption?.amount) return null;
          const currencyCode = shippingOption.region?.currency?.code || "USD";
          const divisor = shippingOption.region?.currency?.noDivisionCurrency ? 1 : 100;
          const taxRate = shippingOption.taxRates?.[0]?.rate || 0;
          const amount = shippingOption.amount * (1 + taxRate);
          return formatCurrency4(amount / divisor, currencyCode);
        }
      })
    }),
    isTaxInclusive: (0, import_fields77.virtual)({
      field: import_core76.graphql.field({
        type: import_core76.graphql.Boolean,
        resolve() {
          return true;
        }
      })
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/ShippingOptionRequirement.ts
var import_core77 = require("@keystone-6/core");
var import_fields78 = require("@keystone-6/core/fields");
init_access();
var ShippingOptionRequirement = (0, import_core77.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields78.select)({
      type: "enum",
      options: [
        {
          label: "Min Subtotal",
          value: "min_subtotal"
        },
        {
          label: "Max Subtotal",
          value: "max_subtotal"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields78.integer)({
      validation: {
        isRequired: true
      }
    }),
    shippingOption: (0, import_fields78.relationship)({
      ref: "ShippingOption.shippingOptionRequirements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProfile.ts
var import_core78 = require("@keystone-6/core");
var import_fields79 = require("@keystone-6/core/fields");
init_access();
var ShippingProfile = (0, import_core78.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields79.text)({
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields79.select)({
      type: "enum",
      options: [
        {
          label: "Default",
          value: "default"
        },
        {
          label: "Gift Card",
          value: "gift_card"
        },
        {
          label: "Custom",
          value: "custom"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields79.json)(),
    products: (0, import_fields79.relationship)({
      ref: "Product.shippingProfile",
      many: true
    }),
    shippingOptions: (0, import_fields79.relationship)({
      ref: "ShippingOption.shippingProfile",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProvider.ts
var import_core79 = require("@keystone-6/core");
var import_access113 = require("@keystone-6/core/access");
var import_fields80 = require("@keystone-6/core/fields");
init_access();
var ShippingProvider = (0, import_core79.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields80.text)({
      validation: { isRequired: true }
    }),
    isActive: (0, import_fields80.checkbox)({
      defaultValue: false
    }),
    accessToken: (0, import_fields80.text)({
      access: { read: import_access113.denyAll },
      validation: { isRequired: true },
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    credentialReference: (0, import_fields80.text)({
      ui: { description: "Opaque secret-manager reference; never a secret value." }
    }),
    // Adapter function fields
    createLabelFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    getRatesFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    validateAddressFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the address data"
      }
    }),
    trackShipmentFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the tracking number"
      }
    }),
    cancelLabelFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the label ID"
      }
    }),
    metadata: (0, import_fields80.json)(),
    // Relationships
    regions: (0, import_fields80.relationship)({
      ref: "Region.shippingProviders",
      many: true
    }),
    labels: (0, import_fields80.relationship)({
      ref: "ShippingLabel.provider",
      many: true
    }),
    fulfillmentProvider: (0, import_fields80.relationship)({
      ref: "FulfillmentProvider.shippingProviders",
      many: false
    }),
    fromAddress: (0, import_fields80.relationship)({
      ref: "Address.shippingProviders",
      many: false
      // ui: {
      //   displayMode: 'cards',
      //   cardFields: ['company', 'address1', 'city', 'province', 'country'],
      //   inlineCreate: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineEdit: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineConnect: true,
      // },
    }),
    ...trackingFields
  }
});

// features/keystone/models/StockMovement.ts
var import_core80 = require("@keystone-6/core");
var import_fields81 = require("@keystone-6/core/fields");
init_access();
var StockMovement = (0, import_core80.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    type: (0, import_fields81.select)({
      type: "enum",
      options: [
        { label: "Receive", value: "RECEIVE" },
        { label: "Remove", value: "REMOVE" }
      ],
      validation: { isRequired: true }
    }),
    quantity: (0, import_fields81.integer)({
      validation: { isRequired: true }
    }),
    reason: (0, import_fields81.text)(),
    note: (0, import_fields81.text)(),
    variant: (0, import_fields81.relationship)({
      ref: "ProductVariant.stockMovements",
      many: false
    }),
    ...trackingFields
  }
});

// features/keystone/models/Store.ts
var import_core81 = require("@keystone-6/core");
var import_fields82 = require("@keystone-6/core/fields");
init_access();
var import_core82 = require("@keystone-6/core");

// features/platform/store-settings/lib/store-logo.ts
var DEFAULT_STORE_LOGO_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" height="100%" width="100%" viewBox="0 0 42 48"><path fill="#155eef" fill-rule="evenodd" d="m22.102 20.86 9.9-9.9L29.88 8.84l-7.339 7.339V3h-3v13.178l-7.339-7.34-2.121 2.122 9.9 9.9 1.06 1.06zm2.12 2.121 9.9-9.9 2.121 2.122-7.339 7.339H42v3H28.904l7.34 7.339L34.121 35l-9.9-9.899-1.06-1.06zM7.96 35.001l9.9-9.899 1.06-1.06-1.06-1.061-9.9-9.9-2.121 2.122 7.339 7.339H.002v3h13.176l-7.34 7.339zm12.02-7.777-9.9 9.9 2.122 2.12 7.339-7.338V45h3V31.906l7.339 7.338L32 37.124l-9.9-9.9-1.06-1.061z" clip-rule="evenodd"/></svg>';
var DEFAULT_STORE_LOGO_COLOR = "0";
function normalizeStoreLogoColor(value) {
  const numeric = Number.parseFloat(String(value ?? DEFAULT_STORE_LOGO_COLOR));
  if (!Number.isFinite(numeric)) return DEFAULT_STORE_LOGO_COLOR;
  return String((numeric % 360 + 360) % 360);
}

// features/keystone/utils/storeLogo.ts
var ALLOWED_ELEMENTS = /* @__PURE__ */ new Set([
  "svg",
  "g",
  "path",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "clippath",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "title",
  "desc"
]);
var ALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
  "xmlns",
  "fill",
  "fill-rule",
  "clip-rule",
  "height",
  "width",
  "viewbox",
  "d",
  "clip-path",
  "id",
  "x1",
  "x2",
  "y1",
  "y2",
  "gradientunits",
  "gradienttransform",
  "offset",
  "stop-color",
  "stop-opacity",
  "opacity",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "transform",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "points",
  "role",
  "aria-hidden",
  "aria-label",
  "preserveaspectratio"
]);
var ATTRIBUTE_PATTERN = /\s+([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g;
var TAG_PATTERN = /<\/?\s*([A-Za-z][\w:-]*)([^<>]*)>/g;
function sanitizeStoreLogoSvg(svg) {
  const source = svg.trim();
  if (!source.startsWith("<svg") || !source.endsWith("</svg>") || source.length > 1e5) {
    return "";
  }
  if (/<!|<\?|\b(?:javascript|data|vbscript):|\bon[a-z]+\s*=|\b(?:href|src|style)\s*=/i.test(source)) {
    return "";
  }
  let tagCount = 0;
  let match;
  TAG_PATTERN.lastIndex = 0;
  while (match = TAG_PATTERN.exec(source)) {
    tagCount += 1;
    const element = match[1].toLowerCase();
    if (!ALLOWED_ELEMENTS.has(element)) return "";
    if (match[0].startsWith("</")) continue;
    const attributes = match[2];
    let consumed = "";
    ATTRIBUTE_PATTERN.lastIndex = 0;
    let attributeMatch;
    while (attributeMatch = ATTRIBUTE_PATTERN.exec(attributes)) {
      consumed += attributeMatch[0];
      const attribute = attributeMatch[1].toLowerCase();
      const value = attributeMatch[2].slice(1, -1);
      if (!ALLOWED_ATTRIBUTES.has(attribute)) return "";
      if (attribute === "id" && !/^[A-Za-z_][\w:.-]*$/.test(value)) return "";
      if (/url\(/i.test(value) && !/^url\(#[A-Za-z_][\w:.-]*\)$/.test(value)) return "";
    }
    const remainder = attributes.replace(consumed, "").replace(/\//g, "").trim();
    if (remainder) return "";
  }
  TAG_PATTERN.lastIndex = 0;
  if (tagCount === 0 || source.replace(TAG_PATTERN, "").trim()) return "";
  return source;
}

// features/keystone/models/Store.ts
var Store = (0, import_core81.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    name: (0, import_fields82.text)({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true
      }
    }),
    defaultCurrencyCode: (0, import_fields82.text)({
      defaultValue: "usd",
      validation: {
        isRequired: true
      }
    }),
    homepageTitle: (0, import_fields82.text)({
      defaultValue: "Openfront Next.js Starter"
    }),
    homepageDescription: (0, import_fields82.text)({
      defaultValue: "A performant frontend e-commerce starter template with Next.js 15 and Openfront."
    }),
    logoIcon: (0, import_fields82.text)({
      defaultValue: DEFAULT_STORE_LOGO_ICON,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          if (value === void 0 || value === null || value === "") return value;
          return typeof value === "string" ? sanitizeStoreLogoSvg(value) : "";
        },
        validate: ({ inputData, resolvedData, fieldKey, addValidationError }) => {
          const submitted = inputData?.[fieldKey];
          if (typeof submitted === "string" && submitted.trim() && !resolvedData?.[fieldKey]) {
            addValidationError("Logo must be a valid, safe SVG document");
          }
        }
      }
    }),
    logoColor: (0, import_fields82.text)({
      defaultValue: DEFAULT_STORE_LOGO_COLOR,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          return value === void 0 ? value : normalizeStoreLogoColor(value);
        }
      }
    }),
    metadata: (0, import_fields82.json)(),
    swapLinkTemplate: (0, import_fields82.text)(),
    paymentLinkTemplate: (0, import_fields82.text)(),
    inviteLinkTemplate: (0, import_fields82.text)(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: (0, import_fields82.relationship)({
      ref: "Currency.stores",
      many: true
    }),
    paymentProviders: (0, import_fields82.virtual)({
      field: import_core82.graphql.field({
        type: import_core82.graphql.list(
          import_core82.graphql.object()({
            name: "PaymentProviderConfig",
            fields: {
              provider: import_core82.graphql.field({ type: import_core82.graphql.String }),
              publishableKey: import_core82.graphql.field({ type: import_core82.graphql.String })
            }
          })
        ),
        resolve: async (_item, _args, context) => {
          const installedProviders = await context.sudo().query.PaymentProvider.findMany({
            where: { isInstalled: { equals: true } },
            query: "code"
          });
          return installedProviders.map((provider) => getPublicPaymentProviderConfig(provider.code || "")).filter((provider) => Boolean(provider));
        }
      }),
      ui: { query: "{ provider publishableKey }" }
    }),
    ...trackingFields
  }
});

// features/keystone/models/Swap.ts
var import_core83 = require("@keystone-6/core");
var import_fields83 = require("@keystone-6/core/fields");
init_access();
var Swap = (0, import_core83.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    fulfillmentStatus: (0, import_fields83.select)({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled"
        },
        {
          label: "Fulfilled",
          value: "fulfilled"
        },
        {
          label: "Shipped",
          value: "shipped"
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    paymentStatus: (0, import_fields83.select)({
      type: "enum",
      options: [
        {
          label: "Not Paid",
          value: "not_paid"
        },
        {
          label: "Awaiting",
          value: "awaiting"
        },
        {
          label: "Captured",
          value: "captured"
        },
        {
          label: "Confirmed",
          value: "confirmed"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Difference Refunded",
          value: "difference_refunded"
        },
        {
          label: "Partially Refunded",
          value: "partially_refunded"
        },
        {
          label: "Refunded",
          value: "refunded"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    differenceDue: (0, import_fields83.integer)(),
    confirmedAt: (0, import_fields83.timestamp)(),
    metadata: (0, import_fields83.json)(),
    idempotencyKey: (0, import_fields83.text)(),
    noNotification: (0, import_fields83.checkbox)(),
    canceledAt: (0, import_fields83.timestamp)(),
    allowBackorder: (0, import_fields83.checkbox)(),
    cart: (0, import_fields83.relationship)({
      ref: "Cart.swap"
    }),
    order: (0, import_fields83.relationship)({
      ref: "Order.swaps"
    }),
    address: (0, import_fields83.relationship)({
      ref: "Address.swaps"
    }),
    lineItems: (0, import_fields83.relationship)({
      ref: "LineItem.swap",
      many: true
    }),
    fulfillments: (0, import_fields83.relationship)({
      ref: "Fulfillment.swap",
      many: true
    }),
    payment: (0, import_fields83.relationship)({
      ref: "Payment.swap"
    }),
    return: (0, import_fields83.relationship)({
      ref: "Return.swap"
    }),
    shippingMethods: (0, import_fields83.relationship)({
      ref: "ShippingMethod.swap",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/TaxProvider.ts
var import_core84 = require("@keystone-6/core");
var import_fields84 = require("@keystone-6/core/fields");
init_access();
var TaxProvider = (0, import_core84.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    ...trackingFieldsFor(),
    isInstalled: (0, import_fields84.checkbox)({
      defaultValue: true
    }),
    regions: (0, import_fields84.relationship)({
      ref: "Region.taxProvider",
      many: true
    })
  }
});

// features/keystone/models/TaxRate.ts
var import_core85 = require("@keystone-6/core");
var import_fields85 = require("@keystone-6/core/fields");
init_access();
var TaxRate = (0, import_core85.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    rate: (0, import_fields85.float)(),
    code: (0, import_fields85.text)(),
    name: (0, import_fields85.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields85.json)(),
    products: (0, import_fields85.relationship)({
      ref: "Product.taxRates",
      many: true
    }),
    productTypes: (0, import_fields85.relationship)({
      ref: "ProductType.taxRates",
      many: true
    }),
    region: (0, import_fields85.relationship)({
      ref: "Region.taxRates"
    }),
    shippingOptions: (0, import_fields85.relationship)({
      ref: "ShippingOption.taxRates",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Team.ts
var import_core86 = require("@keystone-6/core");
var import_fields86 = require("@keystone-6/core/fields");
init_access();
var canManageTeams = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};
var Team = (0, import_core86.list)({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    },
    filter: {
      query: canManageTeams,
      update: canManageTeams
    }
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args)
  },
  fields: {
    name: (0, import_fields86.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields86.text)(),
    members: (0, import_fields86.relationship)({
      ref: "User.team",
      many: true
    }),
    leader: (0, import_fields86.relationship)({
      ref: "User.teamLead",
      many: false
    }),
    ...trackingFields
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, context }) => {
      const { name, leader, members } = resolvedData;
      if (name && name.length < 2) {
        addValidationError("Team name must be at least 2 characters long");
      }
      if (leader && members) {
        const leaderInMembers = members.connect?.some(
          (member) => member.id === leader.connect?.id
        );
        if (!leaderInMembers) {
          addValidationError("Team leader must be a member of the team");
        }
      }
    },
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation === "delete") {
        const teamWithMembers = await context.query.Team.findOne({
          where: { id: String(item.id) },
          query: "members { id }"
        });
        if (teamWithMembers?.members?.length > 0) {
          throw new Error("Cannot delete team with active members");
        }
      }
    }
  }
});

// features/keystone/models/User.ts
var import_core87 = require("@keystone-6/core");
var import_access122 = require("@keystone-6/core/access");
var import_fields87 = require("@keystone-6/core/fields");
init_access();

// features/keystone/security/user-create.ts
init_access();
var canCreateUserRole = permissions.canManageUsers;
var PUBLIC_USER_CREATE_FIELDS = /* @__PURE__ */ new Set([
  "name",
  "email",
  "password",
  "phone",
  // createAuth merges initFirstItem.itemData into the DB API input before list
  // hooks run. Public callers cannot supply role because User.role field access
  // is enforced before resolveInput; allowing it here preserves the first admin.
  "role",
  // Guest checkout sends this explicitly. It is always forced to false below.
  "hasAccount"
]);
function resolvePublicUserCreateData({
  inputData,
  resolvedData
}) {
  const restrictedData = { ...resolvedData };
  for (const key of Object.keys(inputData ?? {})) {
    if (!PUBLIC_USER_CREATE_FIELDS.has(key)) {
      delete restrictedData[key];
    }
  }
  restrictedData.hasAccount = false;
  return restrictedData;
}

// features/keystone/models/User.ts
var canManageUsers = ({ session }) => {
  if (!session?.itemId) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session.itemId } };
};
var User = (0, import_core87.list)({
  access: {
    operation: {
      create: () => true,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    },
    filter: {
      query: canManageUsers,
      update: canManageUsers
    }
  },
  hooks: {
    resolveInput: ({ operation, inputData, resolvedData, context }) => {
      if (operation === "create" && !permissions.canManageUsers({ session: context.session })) {
        return resolvePublicUserCreateData({ inputData, resolvedData });
      }
      return resolvedData;
    }
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args)
  },
  fields: {
    name: (0, import_fields87.text)({
      validation: { isRequired: true }
    }),
    email: (0, import_fields87.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    password: (0, import_fields87.password)({
      validation: {
        length: { min: 10, max: 1e3 },
        isRequired: true,
        rejectCommon: true
      }
    }),
    role: (0, import_fields87.relationship)({
      ref: "Role.assignedTo",
      access: {
        create: canCreateUserRole,
        update: permissions.canManageUsers
      },
      ui: {
        itemView: {
          fieldMode: (args) => permissions.canManageUsers(args) ? "edit" : "read"
        }
      }
    }),
    apiKeys: (0, import_fields87.relationship)({ ref: "ApiKey.user", many: true }),
    phone: (0, import_fields87.text)(),
    hasAccount: (0, import_fields87.checkbox)(),
    addresses: (0, import_fields87.relationship)({
      ref: "Address.user",
      access: { create: import_access122.denyAll, update: import_access122.denyAll },
      many: true
    }),
    orders: (0, import_fields87.relationship)({
      ref: "Order.user",
      many: true
    }),
    orderEvents: (0, import_fields87.relationship)({
      ref: "OrderEvent.user",
      many: true
    }),
    carts: (0, import_fields87.relationship)({
      ref: "Cart.user",
      access: { create: import_access122.denyAll, update: import_access122.denyAll },
      many: true
    }),
    customerGroups: (0, import_fields87.relationship)({
      ref: "CustomerGroup.users",
      many: true
    }),
    notifications: (0, import_fields87.relationship)({
      ref: "Notification.user",
      many: true
    }),
    payments: (0, import_fields87.relationship)({
      ref: "Payment.user",
      many: true
    }),
    batchJobs: (0, import_fields87.relationship)({
      ref: "BatchJob.createdBy",
      many: true
    }),
    team: (0, import_fields87.relationship)({
      ref: "Team.members",
      many: false
    }),
    teamLead: (0, import_fields87.relationship)({
      ref: "Team.leader",
      many: true
    }),
    userField: (0, import_fields87.relationship)({
      ref: "UserField.user",
      many: false
    }),
    onboardingStatus: (0, import_fields87.select)({
      options: [
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Dismissed", value: "dismissed" }
      ],
      defaultValue: "not_started"
    }),
    // Account system fields
    accounts: (0, import_fields87.relationship)({
      ref: "Account.user",
      many: true
    }),
    webhookEndpoints: (0, import_fields87.relationship)({
      ref: "WebhookEndpoint.user",
      many: true,
      ui: { displayMode: "count" }
    }),
    invoices: (0, import_fields87.relationship)({
      ref: "Invoice.user",
      many: true
    }),
    businessAccountRequest: (0, import_fields87.relationship)({
      ref: "BusinessAccountRequest.user",
      many: false
    }),
    customerToken: (0, import_fields87.text)({
      access: {
        read: () => false,
        create: () => false,
        update: () => false
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" }
      },
      db: {
        isNullable: true
      }
    }),
    tokenGeneratedAt: (0, import_fields87.timestamp)(),
    ...(0, import_core87.group)({
      label: "Virtual Fields",
      description: "Calculated fields for user display and cart status",
      fields: {
        firstName: (0, import_fields87.virtual)({
          field: import_core87.graphql.field({
            type: import_core87.graphql.String,
            resolve(item) {
              if (!item.name) return "";
              const parts = item.name.trim().split(/\s+/);
              return parts[0] || "";
            }
          })
        }),
        lastName: (0, import_fields87.virtual)({
          field: import_core87.graphql.field({
            type: import_core87.graphql.String,
            resolve(item) {
              if (!item.name) return "";
              return item.name.trim().split(/\s+/).slice(1).join(" ");
            }
          })
        }),
        activeCartId: (0, import_fields87.virtual)({
          field: import_core87.graphql.field({
            type: import_core87.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const activeCarts = await sudoContext.query.Cart.findMany({
                where: {
                  user: { id: { equals: item.id } },
                  order: null,
                  type: { equals: "default" }
                },
                orderBy: { updatedAt: "desc" },
                take: 1,
                query: `
                  id
                  lineItems {
                    id
                  }
                `
              });
              const cart = activeCarts[0];
              if (cart && cart.lineItems?.length > 0) {
                return cart.id;
              }
              return null;
            }
          })
        }),
        billingAddress: (0, import_fields87.virtual)({
          field: (lists) => import_core87.graphql.field({
            type: lists.Address.types.output,
            async resolve(item, args, context) {
              const address = await context.db.Address.findMany({
                where: {
                  user: { id: { equals: item.id } },
                  isBilling: { equals: true }
                },
                take: 1
              });
              if (!address.length) return null;
              return address[0];
            }
          }),
          ui: {
            query: `{
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                country {
                  id
                  iso2
                }
                phone
            }`
          }
        })
      }
    }),
    ...trackingFieldsFor()
  }
});

// features/keystone/models/UserField.ts
var import_core88 = require("@keystone-6/core");
var import_fields88 = require("@keystone-6/core/fields");
init_access();
var UserField = (0, import_core88.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    user: (0, import_fields88.relationship)({
      ref: "User.userField",
      many: false
    }),
    lastLoginIp: (0, import_fields88.text)(),
    lastLoginUserAgent: (0, import_fields88.text)(),
    loginHistory: (0, import_fields88.json)({
      defaultValue: []
    }),
    preferences: (0, import_fields88.json)({
      defaultValue: {
        theme: "light",
        notifications: true,
        emailNotifications: true
      }
    }),
    notes: (0, import_fields88.text)(),
    lastPasswordChange: (0, import_fields88.timestamp)(),
    failedLoginAttempts: (0, import_fields88.json)({
      defaultValue: {
        count: 0,
        lastAttempt: null,
        lockedUntil: null
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      if (resolvedData.lastLoginIp || resolvedData.lastLoginUserAgent) {
        const history = resolvedData.loginHistory || [];
        history.push({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ip: resolvedData.lastLoginIp,
          userAgent: resolvedData.lastLoginUserAgent
        });
        if (history.length > 10) {
          history.shift();
        }
        resolvedData.loginHistory = history;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/WebhookEvent.ts
var import_core89 = require("@keystone-6/core");
var import_fields89 = require("@keystone-6/core/fields");
init_access();
var WebhookEvent = (0, import_core89.list)({
  access: {
    operation: {
      query: permissions.canReadWebhooks,
      create: permissions.canManageWebhooks,
      // Only system should create events
      update: permissions.canManageWebhooks,
      // Only system should update events
      delete: permissions.canManageWebhooks
    }
  },
  ui: {
    hideCreate: () => true,
    // Events should only be created by the system
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ["eventType", "resourceType", "delivered", "deliveryAttempts", "createdAt"]
    }
  },
  fields: {
    eventType: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: 'The type of event (e.g., "order.created")' }
    }),
    resourceId: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: "ID of the resource that triggered the event" }
    }),
    resourceType: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: 'Type of resource (e.g., "Order", "Product")' }
    }),
    payload: (0, import_fields89.json)({
      ui: {
        description: "The event payload sent to the webhook",
        itemView: { fieldMode: "read" }
      }
    }),
    deliveryAttempts: (0, import_fields89.integer)({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Number of delivery attempts"
      }
    }),
    delivered: (0, import_fields89.checkbox)({
      defaultValue: false,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Whether the webhook was successfully delivered"
      }
    }),
    lastAttempt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Timestamp of the last delivery attempt"
      }
    }),
    nextAttempt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Timestamp for the next retry attempt"
      }
    }),
    deadLetteredAt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Set when the delivery exhausted its retry budget"
      }
    }),
    responseStatus: (0, import_fields89.integer)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "HTTP status code from the last delivery attempt"
      }
    }),
    responseBody: (0, import_fields89.text)({
      ui: {
        itemView: { fieldMode: "read" },
        displayMode: "textarea",
        description: "Response body from the last delivery attempt"
      }
    }),
    endpoint: (0, import_fields89.relationship)({
      ref: "WebhookEndpoint.webhookEvents",
      ui: { description: "The webhook endpoint this event was sent to" }
    }),
    ...trackingFields
  },
  db: {
    extendPrismaSchema: (schema) => schema.replace(
      /(model [^}]+)}/g,
      '$1@@index([delivered, deadLetteredAt, nextAttempt], map: "WebhookEvent_retry_queue_idx")\n}'
    )
  }
});

// features/keystone/models/RegulatedAuthority.ts
var import_core90 = require("@keystone-6/core");
var import_access128 = require("@keystone-6/core/access");
var import_fields90 = require("@keystone-6/core/fields");

// features/keystone/models/regulatedAccess.ts
var import_access126 = require("@keystone-6/core/access");
init_access();
var complianceRead = ({ session }) => permissions.canReadCompliance({ session }) || permissions.canManageCompliance({ session });
var complianceManage = ({ session }) => permissions.canManageCompliance({ session });
var complianceReportManage = ({ session }) => permissions.canManageComplianceReports({ session });
var identityEvidenceRead = ({ session }) => permissions.canAccessIdentityEvidence({ session });
var managedComplianceAccess = {
  operation: {
    query: complianceRead,
    create: complianceManage,
    update: complianceManage,
    delete: import_access126.denyAll
  }
};
var immutableComplianceAccess = {
  operation: {
    query: complianceRead,
    create: import_access126.denyAll,
    update: import_access126.denyAll,
    delete: import_access126.denyAll
  }
};

// features/keystone/models/RegulatedAuthority.ts
init_access();

// features/keystone/regulated/authority-revision.ts
var effectiveValue = (resolved, item, field) => resolved[field] !== void 0 ? resolved[field] : item?.[field];
function validateAuthorityRevision({ item, resolvedData, inputData, addValidationError }, usable, fields) {
  const nextStatus = effectiveValue(resolvedData, item, "status");
  if (item && usable.includes(item.status)) {
    if (fields.some((field) => Object.prototype.hasOwnProperty.call(inputData || {}, field))) {
      addValidationError("Accepted evidence is immutable. Record a new revision; suspend or revoke the previous one without editing its content.");
    }
    if (!usable.includes(nextStatus) && !["suspended", "revoked", "expired", "retired", "emergency_disabled", "delisted"].includes(nextStatus)) {
      addValidationError("Accepted evidence cannot return to draft or review");
    }
  }
  if (!usable.includes(nextStatus)) return;
  const effective = new Date(effectiveValue(resolvedData, item, "effectiveAt") || NaN).getTime();
  const expiry = new Date(effectiveValue(resolvedData, item, "expiresAt") || NaN).getTime();
  if (!Number.isFinite(effective) || !Number.isFinite(expiry) || expiry <= effective) {
    addValidationError("Accepted evidence requires a valid bounded effective interval");
  }
}

// features/keystone/models/RegulatedAuthority.ts
var state = (values, defaultValue) => (0, import_fields90.select)({
  type: "enum",
  options: values.map((value) => ({ label: value.replaceAll("_", " "), value })),
  defaultValue,
  validation: { isRequired: true }
});
var SHA2563 = /^[a-f0-9]{64}$/i;
var next = effectiveValue;
var linked = (value) => Boolean(value && value.disconnect !== true && (typeof value === "string" || value.connect?.id || value.id));
var Jurisdiction = (0, import_core90.list)({
  access: managedComplianceAccess,
  fields: {
    code: (0, import_fields90.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    name: (0, import_fields90.text)({ validation: { isRequired: true } }),
    level: state(["country", "state", "county", "municipality", "postal"], "state"),
    parent: (0, import_fields90.relationship)({ ref: "Jurisdiction.children" }),
    children: (0, import_fields90.relationship)({ ref: "Jurisdiction.parent", many: true }),
    postalScope: (0, import_fields90.json)({ defaultValue: [] }),
    authoritySources: (0, import_fields90.json)({ defaultValue: [] }),
    status: state(["draft", "active", "retired"], "draft"),
    ...trackingFields
  },
  hooks: {
    validateInput: ({ resolvedData, item, addValidationError }) => {
      if (next(resolvedData, item, "status") === "active" && !(next(resolvedData, item, "authoritySources") || []).length) {
        addValidationError("Active jurisdictions require recorded authority sources");
      }
    }
  }
});
var RegulatedMerchantProfile = (0, import_core90.list)({
  access: managedComplianceAccess,
  fields: {
    store: (0, import_fields90.relationship)({ ref: "Store" }),
    legalName: (0, import_fields90.text)({ validation: { isRequired: true } }),
    enabledCategories: (0, import_fields90.json)({ defaultValue: [] }),
    launchJurisdictions: (0, import_fields90.relationship)({ ref: "Jurisdiction", many: true }),
    originJurisdiction: (0, import_fields90.relationship)({ ref: "Jurisdiction" }),
    complianceOwner: (0, import_fields90.text)({ validation: { isRequired: true } }),
    escalationContacts: (0, import_fields90.json)({ defaultValue: [] }),
    counselApprovalReference: (0, import_fields90.text)(),
    insuranceReference: (0, import_fields90.text)(),
    pactRegistered: (0, import_fields90.checkbox)({ defaultValue: false }),
    pactRegistrationReference: (0, import_fields90.text)(),
    pactEvidenceDigest: (0, import_fields90.text)({ access: { read: import_access128.denyAll } }),
    status: state(["draft", "review", "active", "suspended", "revoked"], "draft"),
    effectiveAt: (0, import_fields90.timestamp)(),
    expiresAt: (0, import_fields90.timestamp)(),
    killSwitch: (0, import_fields90.checkbox)({
      defaultValue: true,
      access: {
        create: permissions.canManageCompliance,
        update: permissions.canOperateComplianceKillSwitch
      }
    }),
    licenses: (0, import_fields90.relationship)({ ref: "MerchantLicense.profile", many: true }),
    providerApprovals: (0, import_fields90.relationship)({ ref: "ProviderApproval.profile", many: true }),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active"], ["store", "legalName", "enabledCategories", "launchJurisdictions", "originJurisdiction", "pactRegistered", "pactRegistrationReference", "pactEvidenceDigest", "effectiveAt", "expiresAt"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const origin = resolvedData.originJurisdiction !== void 0 ? resolvedData.originJurisdiction : item?.originJurisdiction;
      if (!next(resolvedData, item, "pactRegistered") || !next(resolvedData, item, "pactRegistrationReference") || !SHA2563.test(next(resolvedData, item, "pactEvidenceDigest") || "") || !linked(origin) || !next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "expiresAt")) {
        addValidationError("Active merchant profiles require origin, current PACT evidence and bounded dates. The kill switch may always stop an active profile");
      }
    }
  }
});
var MerchantLicense = (0, import_core90.list)({
  access: managedComplianceAccess,
  fields: {
    profile: (0, import_fields90.relationship)({ ref: "RegulatedMerchantProfile.licenses" }),
    jurisdiction: (0, import_fields90.relationship)({ ref: "Jurisdiction" }),
    licenseType: (0, import_fields90.text)({ validation: { isRequired: true } }),
    licenseNumber: (0, import_fields90.text)({ validation: { isRequired: true } }),
    issuingAuthority: (0, import_fields90.text)({ validation: { isRequired: true } }),
    authorityReference: (0, import_fields90.text)({ validation: { isRequired: true } }),
    evidenceDigest: (0, import_fields90.text)({ access: { read: import_access128.denyAll }, validation: { isRequired: true } }),
    verificationSource: (0, import_fields90.text)({ validation: { isRequired: true } }),
    status: state(["draft", "active", "conditioned", "suspended", "expired", "revoked"], "draft"),
    effectiveAt: (0, import_fields90.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields90.timestamp)({ validation: { isRequired: true } }),
    verifiedAt: (0, import_fields90.timestamp)(),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active", "conditioned"], ["profile", "jurisdiction", "licenseType", "licenseNumber", "issuingAuthority", "authorityReference", "evidenceDigest", "verificationSource", "effectiveAt", "expiresAt", "verifiedAt"]);
      if (["active", "conditioned"].includes(next(resolvedData, item, "status")) && (!next(resolvedData, item, "verifiedAt") || !SHA2563.test(next(resolvedData, item, "evidenceDigest") || ""))) {
        addValidationError("Usable licenses require verification evidence");
      }
    }
  }
});
var ProviderApproval = (0, import_core90.list)({
  access: managedComplianceAccess,
  fields: {
    profile: (0, import_fields90.relationship)({ ref: "RegulatedMerchantProfile.providerApprovals" }),
    purpose: state(["identity", "payment", "tax", "registry", "carrier"], "identity"),
    providerCode: (0, import_fields90.text)({ validation: { isRequired: true } }),
    paymentProvider: (0, import_fields90.relationship)({ ref: "PaymentProvider" }),
    shippingProvider: (0, import_fields90.relationship)({ ref: "ShippingProvider" }),
    coveredCategories: (0, import_fields90.json)({ defaultValue: [] }),
    coveredJurisdictionCodes: (0, import_fields90.json)({ defaultValue: [] }),
    capabilities: (0, import_fields90.json)({ defaultValue: [] }),
    approvalReference: (0, import_fields90.text)({ validation: { isRequired: true } }),
    evidenceDigest: (0, import_fields90.text)({ access: { read: import_access128.denyAll }, validation: { isRequired: true } }),
    status: state(["unconfigured", "review", "active", "suspended", "expired", "revoked"], "unconfigured"),
    effectiveAt: (0, import_fields90.timestamp)(),
    expiresAt: (0, import_fields90.timestamp)(),
    validatedAt: (0, import_fields90.timestamp)(),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active"], ["profile", "purpose", "providerCode", "paymentProvider", "shippingProvider", "coveredCategories", "coveredJurisdictionCodes", "capabilities", "approvalReference", "evidenceDigest", "effectiveAt", "expiresAt", "validatedAt"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const profile = resolvedData.profile !== void 0 ? resolvedData.profile : item?.profile;
      const purpose = next(resolvedData, item, "purpose");
      const paymentProvider = resolvedData.paymentProvider !== void 0 ? resolvedData.paymentProvider : item?.paymentProvider;
      const shippingProvider = resolvedData.shippingProvider !== void 0 ? resolvedData.shippingProvider : item?.shippingProvider;
      if (!linked(profile) || !next(resolvedData, item, "effectiveAt") || !next(resolvedData, item, "expiresAt") || !next(resolvedData, item, "validatedAt") || !SHA2563.test(next(resolvedData, item, "evidenceDigest") || "") || !(next(resolvedData, item, "coveredCategories") || []).length || !(next(resolvedData, item, "coveredJurisdictionCodes") || []).length || !(next(resolvedData, item, "capabilities") || []).length || purpose === "payment" && !linked(paymentProvider) || purpose === "carrier" && !linked(shippingProvider)) {
        addValidationError("Active provider approvals require merchant scope, bounded validated evidence, category/jurisdiction capabilities, and bound commerce providers where applicable");
      }
    }
  }
});
var RegulatedRuleSet = (0, import_core90.list)({
  access: managedComplianceAccess,
  fields: {
    jurisdiction: (0, import_fields90.relationship)({ ref: "Jurisdiction" }),
    packName: (0, import_fields90.text)({ validation: { isRequired: true } }),
    version: (0, import_fields90.text)({ validation: { isRequired: true } }),
    policyHash: (0, import_fields90.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    authorityCitations: (0, import_fields90.json)({ defaultValue: [] }),
    rules: (0, import_fields90.json)({ defaultValue: [] }),
    status: state(["draft", "approved", "active", "retired", "emergency_disabled"], "draft"),
    effectiveAt: (0, import_fields90.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields90.timestamp)({ validation: { isRequired: true } }),
    reviewedBy: (0, import_fields90.relationship)({ ref: "User" }),
    approvedAt: (0, import_fields90.timestamp)(),
    signatureDigest: (0, import_fields90.text)({ access: { read: import_access128.denyAll } }),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["active", "approved"], ["jurisdiction", "packName", "version", "policyHash", "authorityCitations", "rules", "effectiveAt", "expiresAt", "reviewedBy", "approvedAt", "signatureDigest"]);
      if (next(resolvedData, item, "status") !== "active") return;
      const reviewer = resolvedData.reviewedBy !== void 0 ? resolvedData.reviewedBy : item?.reviewedBy;
      const validation = validateRules(next(resolvedData, item, "rules"));
      if (!next(resolvedData, item, "approvedAt") || !SHA2563.test(next(resolvedData, item, "signatureDigest") || "") || !linked(reviewer) || !(next(resolvedData, item, "authorityCitations") || []).length || !validation.valid) {
        addValidationError(`Active rule sets require reviewer approval, signed policy evidence, citations, and valid rules${validation.errors.length ? `: ${validation.errors.join("; ")}` : ""}`);
      }
    }
  }
});

// features/keystone/models/RegulatedProduct.ts
var import_core91 = require("@keystone-6/core");
var import_access130 = require("@keystone-6/core/access");
var import_fields91 = require("@keystone-6/core/fields");
var state2 = (values, defaultValue) => (0, import_fields91.select)({
  type: "enum",
  options: values.map((value) => ({ label: value.replaceAll("_", " "), value })),
  defaultValue,
  validation: { isRequired: true }
});
var SHA2564 = /^[a-f0-9]{64}$/i;
var next2 = (resolvedData, item, key) => resolvedData[key] !== void 0 ? resolvedData[key] : item?.[key];
var linked2 = (value) => Boolean(value && value.disconnect !== true && (typeof value === "string" || value.connect?.id || value.id));
async function draftLinkedProduct(context, classificationId) {
  if (!classificationId) return;
  const classification = await context.sudo().query.RegulatedProductClassification.findOne({
    where: { id: classificationId },
    query: "variant { product { id status regulatedCommerceRequired } }"
  });
  const product = classification?.variant?.product;
  if (product?.status === "published" && product.regulatedCommerceRequired !== false) {
    await context.sudo().prisma.product.update({ where: { id: product.id }, data: { status: "draft" } });
  }
}
var RegulatedProductClassification = (0, import_core91.list)({
  access: managedComplianceAccess,
  fields: {
    variant: (0, import_fields91.relationship)({ ref: "ProductVariant.regulatedClassification" }),
    category: state2([
      "ends_device",
      "e_liquid",
      "component",
      "accessory",
      "tobacco_derived_nicotine",
      "synthetic_nicotine"
    ], "ends_device"),
    nicotineSource: state2(["none", "tobacco", "synthetic", "other", "unknown"], "unknown"),
    nicotineConcentrationMgMl: (0, import_fields91.decimal)({ scale: 3 }),
    flavor: (0, import_fields91.text)(),
    packageUnits: (0, import_fields91.integer)({ defaultValue: 1, validation: { min: 1, isRequired: true } }),
    liquidVolumeMl: (0, import_fields91.decimal)({ scale: 3, validation: { min: "0" } }),
    manufacturer: (0, import_fields91.text)({ validation: { isRequired: true } }),
    brand: (0, import_fields91.text)({ validation: { isRequired: true } }),
    sourceReference: (0, import_fields91.text)({ validation: { isRequired: true } }),
    evidenceDigest: (0, import_fields91.text)({ access: { read: import_access130.denyAll }, validation: { isRequired: true } }),
    marketingReviewStatus: state2(["pending", "approved", "rejected", "revoked"], "pending"),
    marketingEvidenceDigest: (0, import_fields91.text)({ access: { read: import_access130.denyAll } }),
    marketingReviewedAt: (0, import_fields91.timestamp)(),
    reviewedBy: (0, import_fields91.relationship)({ ref: "User" }),
    status: state2(["draft", "review", "approved", "rejected", "revoked"], "draft"),
    effectiveAt: (0, import_fields91.timestamp)(),
    expiresAt: (0, import_fields91.timestamp)(),
    authorizations: (0, import_fields91.relationship)({ ref: "ProductAuthorization.classification", many: true }),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["approved"], ["variant", "category", "nicotineSource", "nicotineConcentrationMgMl", "flavor", "packageUnits", "liquidVolumeMl", "manufacturer", "brand", "sourceReference", "evidenceDigest", "marketingReviewStatus", "marketingEvidenceDigest", "marketingReviewedAt", "reviewedBy", "effectiveAt", "expiresAt"]);
      if (next2(resolvedData, item, "status") !== "approved") return;
      const reviewer = resolvedData.reviewedBy !== void 0 ? resolvedData.reviewedBy : item?.reviewedBy;
      if (!linked2(reviewer) || !next2(resolvedData, item, "effectiveAt") || !next2(resolvedData, item, "expiresAt") || !SHA2564.test(next2(resolvedData, item, "evidenceDigest") || "") || next2(resolvedData, item, "marketingReviewStatus") !== "approved" || !SHA2564.test(next2(resolvedData, item, "marketingEvidenceDigest") || "") || !next2(resolvedData, item, "marketingReviewedAt")) {
        addValidationError("Approved classifications require a reviewer, bounded product evidence, and recorded marketing review");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation === "update" && (next2(resolvedData, item, "status") !== "approved" || next2(resolvedData, item, "marketingReviewStatus") !== "approved")) {
        await draftLinkedProduct(context, item.id);
      }
    }
  }
});
var ProductAuthorization = (0, import_core91.list)({
  access: managedComplianceAccess,
  fields: {
    classification: (0, import_fields91.relationship)({ ref: "RegulatedProductClassification.authorizations" }),
    jurisdiction: (0, import_fields91.relationship)({ ref: "Jurisdiction" }),
    authority: (0, import_fields91.text)({ validation: { isRequired: true } }),
    authorizationType: state2(["federal_marketing_order", "preexisting_status", "state_directory", "local_directory"], "federal_marketing_order"),
    authorizationIdentifier: (0, import_fields91.text)({ validation: { isRequired: true } }),
    evidenceUrl: (0, import_fields91.text)({ validation: { isRequired: true } }),
    evidenceDigest: (0, import_fields91.text)({ access: { read: import_access130.denyAll }, validation: { isRequired: true } }),
    claimRestrictions: (0, import_fields91.text)({ ui: { displayMode: "textarea" } }),
    status: state2(["pending", "authorized", "suspended", "delisted", "denied", "expired"], "pending"),
    effectiveAt: (0, import_fields91.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields91.timestamp)(),
    delistedAt: (0, import_fields91.timestamp)(),
    sellThroughEndsAt: (0, import_fields91.timestamp)(),
    lastVerifiedAt: (0, import_fields91.timestamp)(),
    ...trackingFields
  },
  hooks: {
    validateInput: (args) => {
      const { resolvedData, item, addValidationError } = args;
      validateAuthorityRevision(args, ["authorized"], ["classification", "jurisdiction", "authority", "authorizationType", "authorizationIdentifier", "evidenceUrl", "evidenceDigest", "claimRestrictions", "effectiveAt", "expiresAt", "delistedAt", "sellThroughEndsAt", "lastVerifiedAt"]);
      if (next2(resolvedData, item, "status") === "authorized" && (!next2(resolvedData, item, "effectiveAt") || !next2(resolvedData, item, "lastVerifiedAt") || !SHA2564.test(next2(resolvedData, item, "evidenceDigest") || ""))) {
        addValidationError("Authorized products require current authority evidence and verification time");
      }
    },
    afterOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation !== "update" || next2(resolvedData, item, "status") === "authorized") return;
      const classificationId = resolvedData.classification?.connect?.id || item?.classification;
      await draftLinkedProduct(context, classificationId);
    }
  }
});

// features/keystone/models/RegulatedTransaction.ts
var import_core92 = require("@keystone-6/core");
var import_access131 = require("@keystone-6/core/access");
var import_fields92 = require("@keystone-6/core/fields");
var state3 = (values, defaultValue) => (0, import_fields92.select)({
  type: "enum",
  options: values.map((value) => ({ label: value.replaceAll("_", " "), value })),
  defaultValue,
  validation: { isRequired: true }
});
var AgeVerificationAttempt = (0, import_core92.list)({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: (0, import_fields92.relationship)({ ref: "Cart" }),
    order: (0, import_fields92.relationship)({ ref: "Order" }),
    cartFingerprint: (0, import_fields92.text)({ defaultValue: "", access: { read: identityEvidenceRead } }),
    subjectDigest: (0, import_fields92.text)({ access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    purpose: state3(["checkout", "delivery"], "checkout"),
    thresholdAge: (0, import_fields92.integer)({ validation: { min: 0, max: 120, isRequired: true } }),
    verifiedAge: (0, import_fields92.integer)({ validation: { min: 0, max: 120, isRequired: true } }),
    providerCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    providerTransactionId: (0, import_fields92.text)({ isIndexed: "unique", access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    result: state3(["pending", "passed", "failed", "manual_review", "expired", "revoked"], "pending"),
    addressMatch: state3(["not_checked", "matched", "mismatched", "indeterminate"], "not_checked"),
    reasonCode: (0, import_fields92.text)(),
    evidenceDigest: (0, import_fields92.text)({ access: { read: identityEvidenceRead }, validation: { isRequired: true } }),
    consentPolicyVersion: (0, import_fields92.text)({ validation: { isRequired: true } }),
    issuedAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    deleteAfter: (0, import_fields92.timestamp)(),
    ...trackingFields
  }
});
var RegulatedTaxQuote = (0, import_core92.list)({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: (0, import_fields92.relationship)({ ref: "Cart" }),
    order: (0, import_fields92.relationship)({ ref: "Order" }),
    jurisdiction: (0, import_fields92.relationship)({ ref: "Jurisdiction" }),
    providerCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    cartFingerprint: (0, import_fields92.text)({ defaultValue: "", access: { read: import_access131.denyAll } }),
    providerReference: (0, import_fields92.text)({ access: { read: import_access131.denyAll }, validation: { isRequired: true } }),
    idempotencyKey: (0, import_fields92.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    status: state3(["quoted", "committed", "voided", "reversed", "failed", "expired"], "quoted"),
    salesTaxAmount: (0, import_fields92.integer)({ validation: { min: 0, isRequired: true } }),
    exciseTaxAmount: (0, import_fields92.integer)({ validation: { min: 0, isRequired: true } }),
    localFeeAmount: (0, import_fields92.integer)({ validation: { min: 0, isRequired: true } }),
    currencyCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    breakdown: (0, import_fields92.json)({ defaultValue: [] }),
    stampRequirements: (0, import_fields92.json)({ defaultValue: [] }),
    sourceVersion: (0, import_fields92.text)({ validation: { isRequired: true } }),
    evidenceDigest: (0, import_fields92.text)({ validation: { isRequired: true } }),
    issuedAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    committedAt: (0, import_fields92.timestamp)(),
    reversalReference: (0, import_fields92.text)({ access: { read: import_access131.denyAll } }),
    ...trackingFields
  }
});
var CarrierEligibilityDecision = (0, import_core92.list)({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: (0, import_fields92.relationship)({ ref: "Cart" }),
    order: (0, import_fields92.relationship)({ ref: "Order" }),
    providerApproval: (0, import_fields92.relationship)({ ref: "ProviderApproval" }),
    shippingOption: (0, import_fields92.relationship)({ ref: "ShippingOption" }),
    cartFingerprint: (0, import_fields92.text)({ defaultValue: "", access: { read: import_access131.denyAll } }),
    rateId: (0, import_fields92.text)(),
    packageDigest: (0, import_fields92.text)(),
    carrierCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    serviceCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    originJurisdictionCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    destinationJurisdictionCode: (0, import_fields92.text)({ validation: { isRequired: true } }),
    regulatedCategories: (0, import_fields92.json)({ defaultValue: [] }),
    quantities: (0, import_fields92.json)({ defaultValue: [] }),
    adultSignature: (0, import_fields92.checkbox)({ defaultValue: false }),
    packageMarkings: (0, import_fields92.json)({ defaultValue: [] }),
    result: state3(["allow", "deny", "manual_review", "expired", "revoked"], "deny"),
    evidenceDigest: (0, import_fields92.text)({ validation: { isRequired: true } }),
    issuedAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    idempotencyKey: (0, import_fields92.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    ...trackingFields
  }
});
var ComplianceDecision = (0, import_core92.list)({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    cart: (0, import_fields92.relationship)({ ref: "Cart" }),
    order: (0, import_fields92.relationship)({ ref: "Order" }),
    merchantProfile: (0, import_fields92.relationship)({ ref: "RegulatedMerchantProfile" }),
    jurisdiction: (0, import_fields92.relationship)({ ref: "Jurisdiction" }),
    purpose: state3(["catalog_publication", "cart", "shipping", "payment", "checkout", "fulfillment"], "cart"),
    result: state3(["allow", "deny", "manual_review"], "deny"),
    policyPack: (0, import_fields92.text)({ validation: { isRequired: true } }),
    policyVersion: (0, import_fields92.text)({ validation: { isRequired: true } }),
    policyHash: (0, import_fields92.text)({ validation: { isRequired: true } }),
    ruleIds: (0, import_fields92.json)({ defaultValue: [] }),
    reasonCodes: (0, import_fields92.json)({ defaultValue: [] }),
    evidenceReferences: (0, import_fields92.json)({ defaultValue: [] }),
    snapshot: (0, import_fields92.json)({ defaultValue: {} }),
    cartFingerprint: (0, import_fields92.text)({ defaultValue: "", access: { read: import_access131.denyAll } }),
    snapshotDigest: (0, import_fields92.text)({ validation: { isRequired: true } }),
    diagnosticData: (0, import_fields92.json)({ access: { read: import_access131.denyAll }, defaultValue: {} }),
    issuedAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    expiresAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    idempotencyKey: (0, import_fields92.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    revokedAt: (0, import_fields92.timestamp)(),
    supersededBy: (0, import_fields92.relationship)({ ref: "ComplianceDecision" }),
    events: (0, import_fields92.relationship)({ ref: "ComplianceEvent.decision", many: true }),
    ...trackingFields
  }
});
var ComplianceEvent = (0, import_core92.list)({
  access: immutableComplianceAccess,
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    decision: (0, import_fields92.relationship)({ ref: "ComplianceDecision.events" }),
    order: (0, import_fields92.relationship)({ ref: "Order" }),
    eventType: (0, import_fields92.text)({ validation: { isRequired: true } }),
    resourceType: (0, import_fields92.text)({ validation: { isRequired: true } }),
    resourceId: (0, import_fields92.text)({ validation: { isRequired: true } }),
    actorId: (0, import_fields92.text)(),
    reasonCode: (0, import_fields92.text)(),
    evidenceDigest: (0, import_fields92.text)({ validation: { isRequired: true } }),
    data: (0, import_fields92.json)({ defaultValue: {} }),
    occurredAt: (0, import_fields92.timestamp)({ validation: { isRequired: true } }),
    ...trackingFields
  }
});

// features/keystone/models/RegulatedReporting.ts
var import_core93 = require("@keystone-6/core");
var import_access132 = require("@keystone-6/core/access");
var import_fields93 = require("@keystone-6/core/fields");
var ComplianceReportRun = (0, import_core93.list)({
  access: {
    operation: {
      query: ({ session }) => complianceRead({ session }) || complianceReportManage({ session }),
      create: import_access132.denyAll,
      update: import_access132.denyAll,
      delete: import_access132.denyAll
    }
  },
  graphql: { omit: { create: true, update: true, delete: true } },
  fields: {
    reportType: (0, import_fields93.text)({ validation: { isRequired: true } }),
    jurisdiction: (0, import_fields93.relationship)({ ref: "Jurisdiction" }),
    merchantProfile: (0, import_fields93.relationship)({ ref: "RegulatedMerchantProfile" }),
    periodStartsAt: (0, import_fields93.timestamp)({ validation: { isRequired: true } }),
    periodEndsAt: (0, import_fields93.timestamp)({ validation: { isRequired: true } }),
    sourceTransactionIds: (0, import_fields93.json)({ defaultValue: [] }),
    policyVersions: (0, import_fields93.json)({ defaultValue: [] }),
    contentDigest: (0, import_fields93.text)({ validation: { isRequired: true } }),
    content: (0, import_fields93.json)({ access: { read: complianceReportManage }, defaultValue: {} }),
    artifactReference: (0, import_fields93.text)({ access: { read: complianceReportManage }, validation: { isRequired: true } }),
    status: (0, import_fields93.select)({
      type: "enum",
      options: ["generated", "reviewed", "submitted", "accepted", "rejected", "corrected"].map((value) => ({ label: value, value })),
      defaultValue: "generated",
      validation: { isRequired: true }
    }),
    generatedBy: (0, import_fields93.relationship)({ ref: "User" }),
    submittedBy: (0, import_fields93.relationship)({ ref: "User" }),
    generatedAt: (0, import_fields93.timestamp)({ validation: { isRequired: true } }),
    submittedAt: (0, import_fields93.timestamp)(),
    filingReceiptReference: (0, import_fields93.text)({ access: { read: complianceReportManage } }),
    supersedes: (0, import_fields93.relationship)({ ref: "ComplianceReportRun" }),
    ...trackingFields
  }
});

// features/keystone/models/index.ts
function readOnlyNative(definition) {
  return {
    ...definition,
    ui: {
      ...definition.ui,
      hideCreate: true,
      hideDelete: true,
      itemView: { ...definition.ui?.itemView, defaultFieldMode: "read" }
    }
  };
}
var models = {
  Account,
  AccountLineItem: readOnlyNative(AccountLineItem),
  Address,
  ApiKey,
  BatchJob,
  Capture: readOnlyNative(Capture),
  Cart,
  ClaimImage,
  ClaimItem,
  ClaimOrder,
  ClaimTag,
  Country,
  Currency,
  CustomShippingOption,
  CustomerGroup,
  Discount,
  DiscountCondition,
  DiscountRule,
  DraftOrder,
  Fulfillment: readOnlyNative(Fulfillment),
  FulfillmentItem: readOnlyNative(FulfillmentItem),
  FulfillmentProvider,
  GiftCard,
  GiftCardTransaction,
  IdempotencyKey: readOnlyNative(IdempotencyKey),
  Invite,
  Invoice: readOnlyNative(Invoice),
  InvoiceLineItem: readOnlyNative(InvoiceLineItem),
  BusinessAccountRequest,
  LineItem,
  LineItemAdjustment,
  LineItemTaxLine,
  Location,
  Measurement,
  MoneyAmount,
  Note,
  Notification,
  NotificationProvider,
  OAuthApp,
  OAuthToken,
  Order: readOnlyNative(Order),
  OrderEvent,
  OrderLineItem: readOnlyNative(OrderLineItem),
  OrderMoneyAmount: readOnlyNative(OrderMoneyAmount),
  Payment: readOnlyNative(Payment),
  PaymentCollection,
  PaymentProvider,
  PaymentSession,
  PriceList,
  PriceRule,
  PriceSet,
  Product,
  ProductCategory,
  ProductCollection,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductTag,
  ProductType,
  ProductVariant,
  Refund: readOnlyNative(Refund),
  Region,
  Return,
  ReturnItem,
  ReturnReason,
  Role,
  RuleType,
  SalesChannel,
  ShippingLabel,
  ShippingMethod,
  ShippingMethodTaxLine,
  ShippingOption,
  ShippingOptionRequirement,
  ShippingProfile,
  ShippingProvider,
  StockMovement: readOnlyNative(StockMovement),
  Store,
  Swap,
  TaxProvider,
  TaxRate,
  Team,
  User,
  UserField,
  WebhookEndpoint,
  WebhookEvent,
  Jurisdiction,
  MerchantLicense,
  ProviderApproval,
  RegulatedMerchantProfile,
  RegulatedRuleSet,
  ProductAuthorization,
  RegulatedProductClassification,
  AgeVerificationAttempt,
  CarrierEligibilityDecision,
  ComplianceDecision,
  ComplianceEvent,
  RegulatedTaxQuote,
  ComplianceReportRun
};

// features/keystone/lib/mail.ts
var import_nodemailer = require("nodemailer");
function getBaseUrlForEmails() {
  if (process.env.SMTP_STORE_LINK) {
    return process.env.SMTP_STORE_LINK;
  }
  console.warn("SMTP_STORE_LINK not set. Please add SMTP_STORE_LINK to your environment variables for email links to work properly.");
  return "";
}
var transport = (0, import_nodemailer.createTransport)({
  // @ts-ignore
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
function passwordResetEmail({ url }) {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Please click below to reset your password
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Reset Password</a></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            If you did not request this email you can safely ignore it.
          </td>
        </tr>
      </table>
    </body>
  `;
}
async function sendPasswordResetEmail(resetToken, to, baseUrl) {
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const info = await transport.sendMail({
    to,
    from: process.env.SMTP_FROM,
    subject: "Your password reset token!",
    html: passwordResetEmail({
      url: `${frontendUrl}${basePath && basePath}/reset?token=${resetToken}`
    })
  });
  if (process.env.MAIL_USER?.includes("ethereal.email")) {
    console.log(`\u{1F4E7} Message Sent!  Preview it at ${(0, import_nodemailer.getTestMessageUrl)(info)}`);
  }
}

// features/keystone/index.ts
var import_iron = __toESM(require("@hapi/iron"));
var cookie = __toESM(require("cookie"));
init_access();
var import_bcryptjs = __toESM(require("bcryptjs"));
init_token_crypto();
function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
function productionEnv(name, developmentFallback) {
  if (process.env[name]) return process.env[name];
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production`);
  }
  return developmentFallback;
}
var databaseURL = requiredEnv("DATABASE_URL");
var sessionSecret = requiredEnv("SESSION_SECRET");
if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}
var listKey = "User";
var trustedProxyIps = new Set(
  (process.env.TRUSTED_PROXY_IPS || "").split(",").map((value) => value.trim()).filter(Boolean)
);
function requestClientIp(req) {
  const remote = String(
    req.socket?.remoteAddress || req.connection?.remoteAddress || ""
  ).replace(/^::ffff:/, "");
  if (trustedProxyIps.has(remote)) {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof first === "string" && first.trim()) {
      return first.split(",")[0].trim().replace(/^::ffff:/, "");
    }
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  }
  return remote;
}
var basePath = "/dashboard";
var sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret
};
var bucketName = productionEnv("S3_BUCKET_NAME", "keystone-test");
var region = productionEnv("S3_REGION", "ap-southeast-2");
var accessKeyId = productionEnv("S3_ACCESS_KEY_ID", "keystone");
var secretAccessKey = productionEnv("S3_SECRET_ACCESS_KEY", "keystone");
var endpoint = productionEnv("S3_ENDPOINT", "https://sfo3.digitaloceanspaces.com");
function statelessSessions({
  secret,
  maxAge = 60 * 60 * 24 * 360,
  path = "/",
  secure = process.env.NODE_ENV === "production",
  ironOptions = import_iron.default.defaults,
  domain,
  sameSite = "lax",
  cookieName = "keystonejs-session"
}) {
  if (!secret) {
    throw new Error("You must specify a session secret to use sessions");
  }
  if (secret.length < 32) {
    throw new Error("The session secret must be at least 32 characters long");
  }
  return {
    async get({ context }) {
      if (!context?.req) return;
      const authHeader = context.req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const accessToken = authHeader.replace("Bearer ", "");
        if (accessToken.startsWith("of_")) {
          try {
            const actualClientIP = requestClientIp(context.req);
            if (!/^of_[A-Za-z0-9_-]{9,253}$/.test(accessToken)) return;
            const apiKeys = await context.sudo().query.ApiKey.findMany({
              where: {
                status: { equals: "active" },
                tokenPreview: { equals: `${accessToken.slice(0, 12)}...` }
              },
              take: 10,
              query: `
                id
                name
                scopes
                status
                expiresAt
                usageCount
                restrictedToIPs
                tokenSecret { isSet }
                user { id }
              `
            });
            let matchingApiKey = null;
            for (const apiKey of apiKeys) {
              try {
                if (!apiKey.tokenSecret?.isSet) continue;
                const fullApiKey = await context.sudo().db.ApiKey.findOne({
                  where: { id: apiKey.id }
                });
                if (!fullApiKey || typeof fullApiKey.tokenSecret !== "string") {
                  continue;
                }
                const isValid = await import_bcryptjs.default.compare(accessToken, fullApiKey.tokenSecret);
                if (isValid) {
                  matchingApiKey = apiKey;
                  break;
                }
              } catch (error) {
                continue;
              }
            }
            if (!matchingApiKey) {
              return;
            }
            if (matchingApiKey.restrictedToIPs && Array.isArray(matchingApiKey.restrictedToIPs) && matchingApiKey.restrictedToIPs.length > 0) {
              const allowedIPs = matchingApiKey.restrictedToIPs;
              const isAllowedIP = allowedIPs.includes(actualClientIP);
              if (!isAllowedIP) {
                return;
              }
            }
            if (matchingApiKey.status !== "active") {
              return;
            }
            if (matchingApiKey.expiresAt && /* @__PURE__ */ new Date() > new Date(matchingApiKey.expiresAt)) {
              await context.sudo().query.ApiKey.updateOne({
                where: { id: matchingApiKey.id },
                data: { status: "revoked" }
              });
              return;
            }
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            const usage = matchingApiKey.usageCount || { total: 0, daily: {} };
            usage.total = (usage.total || 0) + 1;
            usage.daily[today] = (usage.daily[today] || 0) + 1;
            context.sudo().query.ApiKey.updateOne({
              where: { id: matchingApiKey.id },
              data: {
                lastUsedAt: /* @__PURE__ */ new Date(),
                usageCount: usage
              }
            }).catch(console.error);
            if (matchingApiKey.user?.id) {
              const session = {
                itemId: matchingApiKey.user.id,
                listKey,
                apiKeyScopes: matchingApiKey.scopes || []
                // Attach scopes for permission checking
              };
              return session;
            }
          } catch (err) {
            return;
          }
        }
        try {
          const oauthToken = await findOAuthToken(
            context,
            accessToken,
            `id clientId scopes expiresAt tokenType isRevoked user { id }`
          );
          if (oauthToken) {
            if (oauthToken.tokenType !== "access_token") {
              return;
            }
            if (oauthToken.isRevoked === "true") {
              return;
            }
            if (/* @__PURE__ */ new Date() > new Date(oauthToken.expiresAt)) {
              return;
            }
            const oauthApp = await context.sudo().query.OAuthApp.findOne({
              where: { clientId: oauthToken.clientId },
              query: `id status`
            });
            if (!oauthApp || oauthApp.status !== "active") {
              return;
            }
            if (oauthToken.user?.id) {
              return {
                itemId: oauthToken.user.id,
                listKey,
                oauthScopes: oauthToken.scopes
                // Attach scopes for permission checking
              };
            }
          }
        } catch (err) {
        }
        if (accessToken.startsWith("ctok_")) {
          try {
            const digest = customerTokenDigest(accessToken);
            let users = await context.sudo().query.User.findMany({
              where: { customerToken: { equals: digest } },
              take: 1,
              query: `
                id
                tokenGeneratedAt
                accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) {
                  id
                  status
                }
              `
            });
            if (!users[0] && process.env.NODE_ENV !== "production") {
              users = await context.sudo().query.User.findMany({
                where: { customerToken: { equals: accessToken } },
                take: 1,
                query: `id tokenGeneratedAt accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) { id status }`
              });
            }
            const user = users[0];
            const activeAccount = user?.accounts?.[0];
            if (!user || !activeAccount || !user.tokenGeneratedAt) return;
            const maxAgeDays = Number(process.env.CUSTOMER_TOKEN_MAX_AGE_DAYS || 90);
            const expiresAt = new Date(user.tokenGeneratedAt).getTime() + maxAgeDays * 24 * 60 * 60 * 1e3;
            if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return;
            return {
              itemId: user.id,
              listKey,
              customerToken: true,
              activeAccountId: activeAccount.id
            };
          } catch (err) {
            return;
          }
        }
        try {
          return await import_iron.default.unseal(accessToken, secret, ironOptions);
        } catch (err) {
        }
      }
      const cookies = cookie.parse(context.req.headers.cookie || "");
      const token = cookies[cookieName];
      if (!token) return;
      try {
        return await import_iron.default.unseal(token, secret, ironOptions);
      } catch (err) {
      }
    },
    async end({ context }) {
      if (!context?.res) return;
      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, "", {
          maxAge: 0,
          expires: /* @__PURE__ */ new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain
        })
      );
    },
    async start({ context, data }) {
      if (!context?.res) return;
      const sealedData = await import_iron.default.seal(data, secret, {
        ...ironOptions,
        ttl: maxAge * 1e3
      });
      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, sealedData, {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1e3),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain
        })
      );
      return sealedData;
    }
  };
}
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
    itemData: {
      /*
        This creates a related role with full permissions, so that when the first user signs in
        they have complete access to the system (without this, you couldn't do anything)
      */
      role: {
        create: {
          name: "Admin",
          canAccessDashboard: true,
          canReadOrders: true,
          canManageOrders: true,
          canReadProducts: true,
          canManageProducts: true,
          canReadFulfillments: true,
          canManageFulfillments: true,
          canReadUsers: true,
          canManageUsers: true,
          canReadRoles: true,
          canManageRoles: true,
          canReadCheckouts: true,
          canManageCheckouts: true,
          canReadDiscounts: true,
          canManageDiscounts: true,
          canReadGiftCards: true,
          canManageGiftCards: true,
          canReadReturns: true,
          canManageReturns: true,
          canReadSalesChannels: true,
          canManageSalesChannels: true,
          canReadPayments: true,
          canManagePayments: true,
          canReadIdempotencyKeys: true,
          canManageIdempotencyKeys: true,
          canReadApps: true,
          canManageApps: true,
          canManageKeys: true,
          canManageOnboarding: true,
          canReadWebhooks: true,
          canManageWebhooks: true,
          canReadCompliance: true,
          canManageCompliance: true,
          canReviewComplianceDecisions: true,
          canAccessIdentityEvidence: true,
          canManageComplianceReports: true,
          canOperateComplianceKillSwitch: true
        }
      }
    }
    // TODO: Add in inital roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    }
  },
  sessionData: `id name email role { ${permissionsList.join(" ")} }`
});
var keystone_default = withAuth(
  withWebhooks(
    (0, import_core94.config)({
      db: {
        provider: "postgresql",
        url: databaseURL
      },
      lists: models,
      storage: {
        my_images: {
          kind: "s3",
          type: "image",
          bucketName,
          region,
          accessKeyId,
          secretAccessKey,
          endpoint,
          signed: { expiry: 5e3 },
          forcePathStyle: true
        }
      },
      graphql: {
        // apolloConfig: {
        //   ...armor.protect()
        // },
        // extendGraphqlSchema: (schema) => {
        //   const extendedSchema = extendGraphqlSchema(schema);
        //   return applyMiddleware(extendedSchema,
        //     applyRateLimiting
        //   );
        // }
        extendGraphqlSchema
      },
      ui: {
        // Show the UI only for users who have canAccessDashboard permission
        // (min access scope needed to access Admin UI)
        isAccessAllowed: ({ session }) => permissions.canAccessDashboard({ session }),
        basePath
      },
      session: statelessSessions(sessionConfig)
    })
  )
);

// keystone.ts
var keystone_default2 = keystone_default;
//# sourceMappingURL=config.js.map
