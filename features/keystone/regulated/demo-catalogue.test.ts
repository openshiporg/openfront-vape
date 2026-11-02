import { test } from "node:test";
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
    assert.throws(() => assertProductForSale(status), new RegExp(DEMO_ITEM_NOT_FOR_SALE));
  }
});

test("adding a draft variant to a cart is refused on the server", async () => {
  await assert.rejects(
    assertVariantForSale(fakeContext({ variant: { id: "v1", product: { status: "draft" } } }), "v1"),
    new RegExp(DEMO_ITEM_NOT_FOR_SALE),
  );
  await assert.doesNotReject(assertVariantForSale(fakeContext({ variant: { id: "v1", product: { status: "published" } } }), "v1"));
});

test("a cart holding a draft can't reach payment or checkout", async () => {
  await assert.rejects(assertCartLinesForSale(fakeContext({ cart: draftCart }), "c1"), new RegExp(DEMO_ITEM_NOT_FOR_SALE));
  // The shared payment/checkout/fulfilment gate refuses before any compliance evaluation.
  await assert.rejects(
    requireAllowedCartCompliance({ context: fakeContext({ cart: draftCart }), cartId: "c1", purpose: "fulfillment" }),
    new RegExp(DEMO_ITEM_NOT_FOR_SALE),
  );
});

test("release gate stays closed while the demo catalogue is on", async () => {
  const live = [{ id: "p1", killSwitch: false, launchJurisdictionsCount: 1 }];
  const on = await releaseBlockers(fakeContext({ profiles: live, store: { demoCatalogue: true, metadata: {} } }));
  assert.ok(on.includes("DEMO_CATALOGUE_ACTIVE"));
  const off = await releaseBlockers(fakeContext({ profiles: live, store: { demoCatalogue: false, metadata: {} } }));
  assert.ok(!off.includes("DEMO_CATALOGUE_ACTIVE"));
});
