import assert from "node:assert/strict";
import test from "node:test";
import { allocateGiftCards, commitGiftCardHold, holdGiftCards, refundGiftCardTender, releaseGiftCardHold } from "./gift-card-tender";

// Minimal in-memory Prisma: just the calls the tender makes, with the same DB bounds as the CHECKs.
function fakePrisma(cards: Record<string, { balance: number; value: number }>) {
  const keys = new Map<string, any>();
  const payments = new Map<string, any>();
  const ledger: any[] = [];
  const refunds: any[] = [];
  let n = 0;
  const tx: any = {
    idempotencyKey: {
      findUnique: async ({ where }: any) => [...keys.values()].find((k) => (where.idempotencyKey ? k.idempotencyKey === where.idempotencyKey : k.id === where.id)) ?? null,
      create: async ({ data }: any) => { const row = { id: `k${++n}`, ...data }; keys.set(row.id, row); return row; },
      update: async ({ where, data }: any) => Object.assign(keys.get(where.id), data),
      updateMany: async ({ where, data }: any) => { const row = keys.get(where.id); if (!row || (where.recoveryPoint && row.recoveryPoint !== where.recoveryPoint)) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    },
    giftCard: {
      updateMany: async ({ where, data }: any) => {
        const card = cards[where.id];
        if (!card || card.balance < where.balance.gte) return { count: 0 };
        card.balance -= data.balance.decrement; return { count: 1 };
      },
      update: async ({ where, data }: any) => {
        const card = cards[where.id];
        const next = card.balance + data.balance.increment;
        if (next < 0 || next > card.value) throw new Error("GiftCard_balance_within_value_check");
        card.balance = next; return card;
      },
    },
    payment: {
      create: async ({ data }: any) => { const row = { id: `p${++n}`, amountRefunded: 0, ...data }; payments.set(row.id, row); return row; },
      findUnique: async ({ where }: any) => payments.get(where.id) ?? null,
      updateMany: async ({ where, data }: any) => { const p = payments.get(where.id); if (!p || p.amountRefunded > where.amountRefunded.lte) return { count: 0 }; p.amountRefunded += data.amountRefunded.increment; return { count: 1 }; },
    },
    giftCardTransaction: {
      create: async ({ data }: any) => { assert.notEqual(data.amount, 0); ledger.push(data); return data; },
      findMany: async ({ where }: any) => ledger.filter((r) => r.orderId === where.orderId && r.amount > 0),
    },
    orderEvent: { create: async () => ({}) },
    refund: {
      findFirst: async ({ where }: any) => refunds.find((r) => r.idempotencyKey === where.idempotencyKey) ?? null,
      create: async ({ data }: any) => { const row = { id: `r${++n}`, ...data }; refunds.push(row); return row; },
    },
  };
  return { $transaction: async (fn: any) => fn(tx), cards, ledger, payments, refunds, keys };
}

const sum = (rows: any[], id: string) => rows.filter((r) => r.giftCardId === id).reduce((s, r) => s + r.amount, 0);

test("apply: a card covers up to its balance and the cart owes the rest", () => {
  const card = { id: "c1", code: "AB12-CD34", balance: 2500, isDisabled: false };
  assert.deepEqual(allocateGiftCards([card], 4000).due, 1500);
  assert.deepEqual(allocateGiftCards([card], 4000).applied, [{ id: "c1", code: "AB12-CD34", amount: 2500 }]);
});

test("full cover: the card pays only what is owed and nothing is due", () => {
  const a = allocateGiftCards([{ id: "c1", balance: 9000 }], 4000);
  assert.equal(a.due, 0);
  assert.equal(a.applied[0].amount, 4000);
});

test("disabled, expired and other-region cards pay nothing", () => {
  const past = new Date(Date.now() - 1000).toISOString();
  const a = allocateGiftCards([
    { id: "d", balance: 5000, isDisabled: true },
    { id: "e", balance: 5000, endsAt: past },
    { id: "r", balance: 5000, region: { id: "other" } },
  ], 4000, "mine");
  assert.equal(a.applied.length, 0);
  assert.equal(a.due, 4000);
});

test("partial cover: hold debits the card, commit writes a captured payment and a negative ledger row", async () => {
  const db = fakePrisma({ c1: { balance: 2500, value: 5000 } });
  const allocation = allocateGiftCards([{ id: "c1", code: "JORDAN-ELLIS-25", balance: 2500 }], 4000);
  await holdGiftCards(db, "cart1", allocation);
  assert.equal(db.cards.c1.balance, 0);
  await holdGiftCards(db, "cart1", allocation); // replay never debits twice
  assert.equal(db.cards.c1.balance, 0);
  await commitGiftCardHold(db, "cart1", { id: "o1" }, "USD", null);
  const payment = [...db.payments.values()][0];
  assert.equal(payment.amount, 2500);
  assert.equal(payment.status, "captured");
  assert.equal(payment.data.tender, "gift_card");
  assert.equal(sum(db.ledger, "c1"), -2500);
  await commitGiftCardHold(db, "cart1", { id: "o1" }, "USD", null); // replay writes nothing more
  assert.equal(db.payments.size, 1);
  assert.equal(db.ledger.length, 1);
});

test("over-balance refused: a balance that moved since pricing fails the checkout and debits nothing", async () => {
  const db = fakePrisma({ c1: { balance: 1000, value: 5000 } });
  const allocation = { gross: 4000, due: 1500, applied: [{ id: "c1", amount: 2500 }] };
  await assert.rejects(() => holdGiftCards(db, "cart1", allocation), /balance changed/);
  assert.equal(db.cards.c1.balance, 1000);
});

test("a failed checkout releases the hold and restores the balance, once", async () => {
  const db = fakePrisma({ c1: { balance: 2500, value: 5000 } });
  await holdGiftCards(db, "cart1", { gross: 2500, due: 0, applied: [{ id: "c1", amount: 2500 }] });
  assert.equal(db.cards.c1.balance, 0);
  await releaseGiftCardHold(db, "cart1", "Payment failed");
  await releaseGiftCardHold(db, "cart1", "Payment failed");
  assert.equal(db.cards.c1.balance, 2500);
});

test("refund restores the balance through the ledger, last card first, and cannot exceed the payment", async () => {
  const db = fakePrisma({ c1: { balance: 3000, value: 3000 }, c2: { balance: 3000, value: 3000 } });
  const allocation = { gross: 5000, due: 0, applied: [{ id: "c1", amount: 3000 }, { id: "c2", amount: 2000 }] };
  await holdGiftCards(db, "cart1", allocation);
  await commitGiftCardHold(db, "cart1", { id: "o1" }, "USD", null);
  const paymentId = [...db.payments.keys()][0];
  const base = { orderId: "o1", paymentId, reason: "Customer changed their mind", userId: "u1" };

  await refundGiftCardTender(db, { ...base, amount: 2500, businessKey: "refund:a" });
  assert.equal(db.cards.c2.balance, 3000);
  assert.equal(db.cards.c1.balance, 500);
  const again = await refundGiftCardTender(db, { ...base, amount: 2500, businessKey: "refund:a" });
  assert.equal(again.amount, 2500);
  assert.equal(db.cards.c1.balance, 500);

  await assert.rejects(() => refundGiftCardTender(db, { ...base, amount: 3000, businessKey: "refund:b" }), /exceeds/);
  await refundGiftCardTender(db, { ...base, amount: 2500, businessKey: "refund:c" });
  assert.equal(db.cards.c1.balance, 3000);
  // balance equals value plus the signed ledger for each card
  assert.equal(3000 + sum(db.ledger, "c1"), db.cards.c1.balance);
  assert.equal(3000 + sum(db.ledger, "c2"), db.cards.c2.balance);
});
