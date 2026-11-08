import { getPaymentStatus } from "../utils/paymentProviderAdapter";
import { GIFT_CARD_TENDER } from "./gift-card-tender";

/** The processor reference a card payment was taken under (PayPal capture, Stripe intent, Authorize.net transaction). */
export function providerPaymentReference(payment: any): string | undefined {
  return (
    payment.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
    payment.data?.payment_intent_id ||
    payment.data?.paymentIntentId ||
    payment.data?.orderId ||
    payment.data?.id
  );
}

export function paymentProviderFor(payment: any) {
  return (
    payment.paymentCollection?.paymentSessions?.find((session: any) => session.isSelected)?.paymentProvider ||
    payment.paymentCollection?.paymentSessions?.[0]?.paymentProvider
  );
}

type StuckAttempt = { id: string; idempotencyKey: string; amount: number };

/**
 * What to record locally for money the processor already gave back. Each stuck refund attempt (amount reserved,
 * processor call never confirmed) is matched first, oldest first, while it fits; anything left becomes one
 * reconciliation refund. Pure, so the arithmetic is tested on its own.
 */
export function planProviderRefundReconcile(input: { amount: number; amountRefunded: number; recorded: number; providerRefunded: number; stuck: StuckAttempt[] }) {
  const providerRefunded = Math.min(Math.max(0, Math.trunc(input.providerRefunded || 0)), input.amount);
  let remaining = providerRefunded - input.recorded;
  if (remaining <= 0) return { attempts: [] as StuckAttempt[], extra: 0, reserveExtra: 0 };
  const attempts: StuckAttempt[] = [];
  for (const attempt of input.stuck) {
    if (attempt.amount > 0 && attempt.amount <= remaining) {
      attempts.push(attempt);
      remaining -= attempt.amount;
    }
  }
  // Stuck attempts already reserved their amount on the payment; the extra row still needs reserving.
  const reservedByOthers = input.amountRefunded - input.recorded - attempts.reduce((sum, a) => sum + a.amount, 0);
  const reserveExtra = Math.max(0, remaining - Math.max(0, reservedByOthers));
  return { attempts, extra: remaining, reserveExtra };
}

/**
 * Reconcile one card payment against its processor: refunds the processor already made but this store never
 * recorded (an automatic refund, a dashboard refund, a refund call that timed out) become Refund rows, so the
 * order can be refunded or canceled instead of failing on "already refunded". Returns the refunds it recorded.
 */
export async function reconcileProviderRefunds(context: any, paymentId: string, deps = { getPaymentStatus }) {
  const sudo = context.sudo();
  const payment = await sudo.query.Payment.findOne({
    where: { id: paymentId },
    query: `id status amount amountRefunded currencyCode data order { id }
      paymentCollection { paymentSessions { isSelected paymentProvider { id code getPaymentStatusFunction credentials } } }`,
  });
  if (!payment || payment.status !== "captured" || payment.data?.tender === GIFT_CARD_TENDER) return [];
  const provider = paymentProviderFor(payment);
  const reference = providerPaymentReference(payment);
  if (!provider || !reference || String(provider.code || "").includes("manual") || provider.code === "pp_system_default") return [];

  const status = await deps.getPaymentStatus({ provider, paymentId: reference });
  const providerRefunded = Number(status?.amountRefunded || 0);
  if (!(providerRefunded > 0)) return [];

  return sudo.prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${paymentId} FOR UPDATE`;
    const current = await tx.payment.findUnique({ where: { id: paymentId }, select: { amount: true, amountRefunded: true, orderId: true, refunds: { select: { amount: true } } } });
    const recorded = current.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0);
    const stuckRows = await tx.idempotencyKey.findMany({
      where: { requestPath: "refundOrderPayment", recoveryPoint: { in: ["amount_reserved", "provider_refunded"] }, requestParams: { path: ["paymentId"], equals: paymentId } },
      orderBy: { createdAt: "asc" },
    });
    const stuck = stuckRows.map((row: any) => ({ id: row.id, idempotencyKey: row.idempotencyKey, amount: Number(row.requestParams?.amount) }));
    const plan = planProviderRefundReconcile({ amount: current.amount, amountRefunded: current.amountRefunded, recorded, providerRefunded, stuck });
    if (!plan.attempts.length && !plan.extra) return [];
    if (current.amountRefunded + plan.reserveExtra > current.amount) {
      throw new Error("Recorded refunds disagree with the processor; review this payment");
    }
    const metadata = { providerId: provider.id, reconciled: true, providerRefunded, providerRefunds: status?.refunds ?? [] };
    const created: any[] = [];
    for (const attempt of plan.attempts) {
      const refund = await tx.refund.create({ data: { amount: attempt.amount, reason: "other", note: "Refunded at the processor; recorded on reconcile", idempotencyKey: attempt.idempotencyKey, paymentId, metadata } });
      await tx.idempotencyKey.update({ where: { id: attempt.id }, data: { recoveryPoint: "completed", responseCode: 200, responseBody: { refundId: refund.id, providerResult: { status: "succeeded", amount: attempt.amount, reconciled: true } }, lockedAt: null } });
      created.push(refund);
    }
    if (plan.extra > 0) {
      created.push(await tx.refund.create({ data: { amount: plan.extra, reason: "other", note: "Refunded at the processor; recorded on reconcile", idempotencyKey: `reconcile:${paymentId}:${providerRefunded}`, paymentId, metadata } }));
      if (plan.reserveExtra > 0) await tx.payment.update({ where: { id: paymentId }, data: { amountRefunded: { increment: plan.reserveExtra } } });
    }
    for (const refund of created) {
      await tx.orderEvent.create({
        data: { orderId: current.orderId, type: "REFUND_PROCESSED", data: { refundId: refund.id, amount: refund.amount, reconciled: true }, time: new Date(), userId: context.session?.itemId, createdById: context.session?.itemId },
      });
    }
    return created;
  });
}
