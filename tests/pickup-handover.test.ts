import assert from "node:assert/strict";
import test from "node:test";
import Module from "node:module";

// Stub the access module so the mutation can load outside Keystone.
const originalResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, ...rest: any[]) {
  if (request === "../access") return require.resolve("./fixtures/access-stub.cjs");
  return originalResolve.call(this, request, ...rest);
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const completePickupHandover = require("../features/keystone/mutations/completePickupHandover").default;

const pickupMethod = { shippingOption: { data: { pickup: true } } };

function harness({ status = "pending", payments = [{ status: "captured" }], methods = [pickupMethod], fulfilled = [] as any[] } = {}) {
  const state = { fulfillments: [] as any[], events: [] as any[], compliance: [] as any[], order: { status } };
  const tx: any = {
    fulfillment: {
      async findFirst({ where }: any) { return state.fulfillments.find((f) => f.idempotencyKey === where.idempotencyKey) || null; },
      async create({ data }: any) { const row = { id: `f${state.fulfillments.length + 1}`, ...data }; state.fulfillments.push(row); return { id: row.id }; },
    },
    order: {
      async findUnique({ select }: any) {
        if (select.lineItems && select.fulfillments) {
          const done = state.fulfillments.length > 0;
          return { status: state.order.status, lineItems: [{ id: "l1", quantity: 2 }], fulfillments: done ? [{ fulfillmentItems: [{ lineItemId: "l1", quantity: 2 }] }] : [] };
        }
        return { id: "o1", status: state.order.status, cart: { id: "c1" }, shippingMethods: methods, payments, lineItems: [{ id: "l1", quantity: 2 }] };
      },
      async update({ data }: any) { state.order.status = data.status; return {}; },
    },
    fulfillmentItem: { async groupBy() { return fulfilled; } },
    fulfillmentProvider: { async findUnique() { return { id: "fp" }; } },
    orderEvent: { async create({ data }: any) { state.events.push(data); return {}; } },
    complianceDecision: { async findFirst() { return { id: "d1" }; } },
    complianceEvent: { async create({ data }: any) { state.compliance.push(data); return {}; } },
  };
  const sudo = {
    prisma: { async $transaction(fn: any) { return fn(tx); } },
    query: { Order: { async findOne() { return { id: "o1", status: state.order.status }; } } },
  };
  const context = { session: { itemId: "u1", data: { role: { canManageOrders: true, canManageFulfillments: true } } }, sudo: () => sudo };
  return { state, context };
}

test("handover after ID check fulfills every line, completes the order and records the ID check", async () => {
  const h = harness();
  const result = await completePickupHandover(null, { orderId: "o1", idChecked: true, idType: "passport" }, h.context);
  assert.equal(result.status, "completed");
  assert.equal(h.state.fulfillments.length, 1);
  assert.equal(h.state.fulfillments[0].fulfillmentItems.create[0].quantity, 2);
  assert.equal(h.state.compliance[0].eventType, "regulated.pickup_id_checked");
  assert.equal(h.state.compliance[0].data.idType, "passport");
  assert.equal(h.state.compliance[0].decisionId, "d1");
  // A repeat is a no-op.
  await completePickupHandover(null, { orderId: "o1", idChecked: true }, h.context);
  assert.equal(h.state.fulfillments.length, 1);
});

test("refuses without an ID check, unpaid, delivery orders and closed orders", async () => {
  await assert.rejects(completePickupHandover(null, { orderId: "o1", idChecked: false }, harness().context), /photo ID/);
  await assert.rejects(completePickupHandover(null, { orderId: "o1", idChecked: true }, harness({ payments: [{ status: "pending" }] }).context), /Take payment/);
  await assert.rejects(completePickupHandover(null, { orderId: "o1", idChecked: true }, harness({ methods: [{ shippingOption: { data: null } }] as any }).context), /store pickup/);
  await assert.rejects(completePickupHandover(null, { orderId: "o1", idChecked: true }, harness({ status: "canceled" }).context), /open pickup/);
});
