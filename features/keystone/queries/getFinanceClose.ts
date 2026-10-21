import crypto from "node:crypto";
import { permissions } from "../access";

const PAGE_SIZE = 100;
const NESTED_LIMIT = 100;
// Existing export budget: 5,000 or more payments in one range is refused.
const MAX_PAYMENTS = 5000;

async function getFinanceClose(
  root: any,
  { start, end }: { start: string; end: string },
  context: any
) {
  if (
    !context.session?.itemId ||
    !permissions.canReadPayments({ session: context.session })
  ) {
    throw new Error("Access denied");
  }
  const startAt = new Date(start);
  const endAt = new Date(end);
  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime()) ||
    startAt >= endAt ||
    endAt.getTime() - startAt.getTime() > 31 * 24 * 60 * 60 * 1000
  ) {
    throw new Error("Finance close range must be valid and no longer than 31 days");
  }

  // Keystone lists cap every read at maxTake 100 (features/keystone/index.ts), and
  // nested relationship reads without `take` default to that cap. A finance close
  // must never total a truncated set: count first, read stable pages, verify the
  // complete set (including nested captures/refunds), and fail instead of emitting
  // partial totals.
  const sudo = context.sudo();
  const where = { createdAt: { gte: startAt.toISOString(), lt: endAt.toISOString() } };
  const expectedCount = await sudo.query.Payment.count({ where });
  if (!Number.isSafeInteger(expectedCount) || expectedCount >= MAX_PAYMENTS) {
    throw new Error("Finance close exceeded the bounded export limit");
  }

  const payments: any[] = [];
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
      `,
    });
    payments.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  const finalCount = await sudo.query.Payment.count({ where });
  if (
    payments.length !== expectedCount ||
    finalCount !== expectedCount ||
    new Set(payments.map((payment: any) => payment.id)).size !== expectedCount
  ) {
    throw new Error("Finance close is incomplete: payments changed during export; retry");
  }
  for (const payment of payments) {
    if (payment.capturesCount > NESTED_LIMIT || payment.refundsCount > NESTED_LIMIT) {
      throw new Error("Finance close exceeded the bounded capture/refund limit for a payment");
    }
    if (
      (payment.captures || []).length !== payment.capturesCount ||
      (payment.refunds || []).length !== payment.refundsCount
    ) {
      throw new Error("Finance close is incomplete: captures or refunds changed during export; retry");
    }
  }

  const rows = payments.map((payment: any) => {
    const captured = payment.captures?.reduce((sum: number, item: any) => sum + item.amount, 0) ||
      (payment.status === "captured" ? payment.amount : 0);
    const refunded = payment.refunds?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;
    const providerReference =
      payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id || null;
    return {
      paymentId: payment.id,
      orderId: payment.order?.id || null,
      orderDisplayId: payment.order?.displayId || null,
      currency: payment.currencyCode,
      status: payment.status,
      captured,
      refunded,
      netTender: captured - refunded,
      providerReference,
      capturedAt: payment.capturedAt,
      accountingPolicyVersion:
        payment.order?.metadata?.commercialSnapshot?.accountingPolicyVersion || null,
      exception:
        payment.status === "captured" && (!providerReference || captured !== payment.amount)
          ? "CAPTURE_EVIDENCE_MISMATCH"
          : null,
    };
  });

  const byCurrency = Object.values(
    rows.reduce((result: Record<string, any>, row: any) => {
      const current = result[row.currency] || {
        currency: row.currency,
        captured: 0,
        refunded: 0,
        netTender: 0,
        count: 0,
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
    generatedAt: new Date().toISOString(),
    range: { start: startAt.toISOString(), end: endAt.toISOString() },
    legalEntityId: null,
    reportingCurrency: byCurrency.length === 1 ? (byCurrency[0] as any).currency : null,
    accountingPolicyVersion: null,
    providerSettlementStatus: "OWNER_DATA_REQUIRED",
    rows,
    byCurrency,
    exceptions: rows.filter((row: any) => row.exception),
    control: {
      rowCount: rows.length,
      sha256: crypto.createHash("sha256").update(controlPayload).digest("hex"),
    },
  };
}

export default getFinanceClose;
