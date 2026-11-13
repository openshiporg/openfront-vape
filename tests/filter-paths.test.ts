// Relation/scalar filter paths must not leak what read access hides.
// Needs DATABASE_URL (scratch DB with migrations applied) and SESSION_SECRET; skipped otherwise.
import assert from "node:assert/strict";
import test from "node:test";
import { getContext } from "@keystone-6/core/context";
import * as PrismaModule from "@prisma/client";

const run = process.env.DATABASE_URL && process.env.SESSION_SECRET ? test : test.skip;

const role = (perms: Record<string, boolean>) => ({ id: "r", ...perms });
const sessions: Record<string, any> = {
  anonymous: undefined,
  customer: { itemId: "u-customer", listKey: "User", data: { role: null } },
  salesAssociate: { itemId: "u-sales", listKey: "User", data: { role: role({ canAccessDashboard: true, canReadProducts: true, canReadOrders: true }) } },
  fulfillmentClerk: { itemId: "u-clerk", listKey: "User", data: { role: role({ canAccessDashboard: true, canReadFulfillments: true, canManageFulfillments: true }) } },
};

// Each probe is a where-path into a private value that exists ("seed") and one that does not ("zzz").
// A limited session must get the same count for both, or an access error.
const probes: Array<{ list: string; path: (v: string) => string }> = [
  { list: "products", path: (v) => `productVariants: { some: { lineItems: { some: { cart: { user: { email: { startsWith: "${v}" } } } } } } }` },
  { list: "productVariants", path: (v) => `lineItems: { some: { cart: { user: { email: { startsWith: "${v}" } } } } }` },
  { list: "products", path: (v) => `regulatedExemptionReference: { startsWith: "${v}" }` },
  { list: "productVariants", path: (v) => `product: { regulatedExemptionReference: { startsWith: "${v}" } }` },
  { list: "regions", path: (v) => `carts: { some: { email: { startsWith: "${v}" } } }` },
  { list: "regions", path: (v) => `orders: { some: { email: { startsWith: "${v}" } } }` },
  { list: "currencies", path: (v) => `orders: { some: { email: { startsWith: "${v}" } } }` },
  { list: "countries", path: (v) => `addresses: { some: { address1: { startsWith: "${v}" } } }` },
  { list: "roles", path: (v) => `assignedTo: { some: { email: { startsWith: "${v}" } } }` },
  { list: "users", path: (v) => `orders: { some: { email: { startsWith: "${v}" } } }` },
  { list: "orders", path: (v) => `user: { email: { startsWith: "${v}" } }` },
  { list: "orders", path: (v) => `payments: { some: { currencyCode: { startsWith: "${v}" } } }` },
  { list: "paymentProviders", path: (v) => `credentialReference: { startsWith: "${v}" }` },
  { list: "oAuthApps", path: (v) => `clientSecret: { startsWith: "${v}" }` },
];

run("filter paths", async () => {
  const { default: config } = await import("../features/keystone");
  const ctx = getContext(config, PrismaModule);
  const sudo = ctx.sudo();
  const tag = `a${Date.now()}`;
  const seed = `${tag}@example.com`;
  const user = await sudo.query.User.createOne({ data: { name: "Seed Filter", email: seed, password: "correct-horse-battery-1" }, query: "id" });
  const prisma = ctx.prisma as any;
  const cart = await prisma.cart.create({ data: { email: seed, userId: user.id } });
  const product = await prisma.product.create({ data: { title: tag, handle: tag, status: "published", regulatedExemptionReference: tag } });
  const variant = await prisma.productVariant.create({ data: { title: tag, productId: product.id, inventoryQuantity: 1 } });
  const lineItem = await prisma.lineItem.create({ data: { quantity: 1, cartId: cart.id, productVariantId: variant.id } });
  const sent: Array<{ who: string; list: string; seedCount: unknown; missCount: unknown }> = [];
  const count = async (who: string, list: string, where: string) => {
    const field = `${list}Count`;
    const r: any = await ctx.withSession(sessions[who]).graphql.raw({ query: `{ ${field}(where: { ${where} }) }` });
    if (r.errors?.length) { const m = String(r.errors[0].message); assert.ok(!/Cannot query field|Unknown argument|not defined by type|Field .* is not defined/.test(m), `bad probe ${list}: ${m}`); return "error"; }
    return r.data?.[field];
  };
  try {
    for (const who of Object.keys(sessions)) {
      for (const p of probes) {
        const hit = await count(who, p.list, p.path(tag));
        const miss = await count(who, p.list, p.path("zzzzzz-nomatch"));
        sent.push({ who, list: p.list, seedCount: hit, missCount: miss });
        assert.ok(hit === "error" || hit === miss, `${who} ${p.list} ${p.path(tag)}: ${hit} vs ${miss}`);
      }
    }
    // Legitimate storefront filters still work for signed-out visitors and customers.
    for (const who of ["anonymous", "customer"]) {
      for (const [list, where] of [
        ["products", `productVariants: { some: { prices: { some: { region: { countries: { some: { iso2: { equals: "us" } } } } } } } }`],
        ["products", `productCategories: { some: { title: { contains: "a" } } }`],
        ["regions", `countries: { some: { iso2: { equals: "us" } } }`],
      ]) {
        const r: any = await ctx.withSession(sessions[who]).graphql.raw({ query: `{ ${list}Count(where: { ${where} }) }` });
        assert.ok(!r.errors?.length, `${who} ${list} storefront filter: ${r.errors?.[0]?.message}`);
      }
    }
    // Admin keeps real filters.
    const admin = { itemId: "u-admin", listKey: "User", data: { role: role({ canAccessDashboard: true, canReadOrders: true, canManageOrders: true, canReadProducts: true, canManageProducts: true, canManageUsers: true, canReadRoles: true, canManageRoles: true }) } };
    const r: any = await ctx.withSession(admin).graphql.raw({ query: `{ carts: cartsCount(where: { user: { email: { startsWith: "${tag}" } } }) }` });
    assert.equal(r.data?.carts, 1, JSON.stringify(r.errors));
  } finally {
    await prisma.lineItem.delete({ where: { id: lineItem.id } });
    await prisma.productVariant.delete({ where: { id: variant.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
    await sudo.query.User.deleteOne({ where: { id: user.id } });
  }
  console.log(JSON.stringify(sent));
});
