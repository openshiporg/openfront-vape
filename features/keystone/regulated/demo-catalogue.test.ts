import { test } from "node:test";
import { GraphQLError, buildSchema } from "graphql";
import { createYoga } from "graphql-yoga";

function displayOnlyError(error: unknown): boolean {
  assert.ok(error instanceof GraphQLError);
  assert.equal(error.message, "This item is display only.");
  assert.equal(error.extensions.code, DEMO_ITEM_NOT_FOR_SALE);
  return true;
}
import assert from "node:assert/strict";
import {
  DEMO_ITEM_NOT_FOR_SALE,
  assertCartLinesForSale,
  assertProductForSale,
  assertVariantForSale,
  publicStatusesFor,
} from "./demo-catalogue";
import { requireAllowedCartCompliance } from "./enforcement";
import { releaseBlockers } from "../../regulated-commerce/core/release-gate";

// Minimal Keystone-shaped context: sudo().query.<List>.findOne / findMany.
function fakeContext(data: { variant?: any; cart?: any; profiles?: any[]; store?: any }) {
  const query = {
    ProductVariant: { findOne: async () => data.variant ?? null },
    Cart: { findOne: async () => data.cart ?? null },
    RegulatedMerchantProfile: { findMany: async () => data.profiles ?? [] },
    Store: { findMany: async () => [data.store ?? {}] },
  };
  const context: any = { query, sudo: () => context };
  return context;
}

const draftCart = { id: "c1", lineItems: [{ id: "l1", productVariant: { id: "v1", product: { status: "draft" } } }] };

test("public may read drafts only while the demo catalogue is on", () => {
  assert.deepEqual(publicStatusesFor(false), ["published"]);
  assert.deepEqual(publicStatusesFor(true), ["published", "draft"]);
});

test("only published products are for sale", () => {
  assert.doesNotThrow(() => assertProductForSale("published"));
  for (const status of ["draft", "proposed", "rejected", null, undefined]) {
    assert.throws(() => assertProductForSale(status), displayOnlyError);
  }
});

test("adding a draft variant to a cart is refused on the server", async () => {
  await assert.rejects(
    assertVariantForSale(fakeContext({ variant: { id: "v1", product: { status: "draft" } } }), "v1"),
    displayOnlyError,
  );
  await assert.doesNotReject(assertVariantForSale(fakeContext({ variant: { id: "v1", product: { status: "published" } } }), "v1"));
});

test("a cart holding a draft can't reach payment or checkout", async () => {
  await assert.rejects(assertCartLinesForSale(fakeContext({ cart: draftCart }), "c1"), displayOnlyError);
  // The shared payment/checkout/fulfilment gate refuses before any compliance evaluation.
  await assert.rejects(
    requireAllowedCartCompliance({ context: fakeContext({ cart: draftCart }), cartId: "c1", purpose: "fulfillment" }),
    displayOnlyError,
  );
});

test("release gate stays closed while the demo catalogue is on", async () => {
  const live = [{ id: "p1", killSwitch: false, launchJurisdictionsCount: 1 }];
  const on = await releaseBlockers(fakeContext({ profiles: live, store: { demoCatalogue: true, metadata: {} } }));
  assert.ok(on.includes("DEMO_CATALOGUE_ACTIVE"));
  const off = await releaseBlockers(fakeContext({ profiles: live, store: { demoCatalogue: false, metadata: {} } }));
  assert.ok(!off.includes("DEMO_CATALOGUE_ACTIVE"));
});

 test("display-only errors survive production masking; internal errors stay private", async () => {
  const schema = buildSchema('type Query { addDraft: String internal: String }');
  const fields = schema.getQueryType()!.getFields();
  fields.addDraft.resolve = () => { assertProductForSale("draft"); return null; };
  fields.internal.resolve = () => { throw new Error("private diagnostic"); };
  const yoga = createYoga({ schema, maskedErrors: { isDev: false }, logging: false });
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ addDraft internal }' }),
  });
  const json = await response.json();
  assert.equal(json.errors[0].message, "This item is display only.");
  assert.equal(json.errors[0].extensions.code, DEMO_ITEM_NOT_FOR_SALE);
  assert.equal(json.errors[1].message, "Unexpected error.");
  assert.ok(!JSON.stringify(json).includes("private diagnostic"));
});
