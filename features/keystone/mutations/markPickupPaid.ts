import { permissions } from "../access";

/**
 * The merchant took payment at the counter: capture the pending pay-at-pickup
 * payment. Only a pending payment on an open order can be marked paid, and only
 * by staff who manage orders.
 */
export default async function markPickupPaid(_root: unknown, { orderId }: { orderId: string }, context: any) {
  if (!permissions.canManageOrders({ session: context.session })) throw new Error("Access denied");
  const sudo = context.sudo();
  await sudo.prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: { select: { id: true, status: true, amount: true, currencyCode: true, metadata: true } } },
    });
    if (!order) throw new Error("Order not found");
    if (!["pending", "requires_action"].includes(order.status)) throw new Error("Only open orders can be marked paid");
    const payment = order.payments.find((entry: any) => entry.status === "pending" && entry.metadata?.payAtPickup === true);
    if (!payment) throw new Error("This order has no unpaid pickup payment");
    await tx.payment.update({ where: { id: payment.id }, data: { status: "captured", capturedAt: new Date() } });
    await tx.capture.create({
      data: { amount: payment.amount, paymentId: payment.id, metadata: { method: "pay_at_pickup" }, createdBy: context.session.itemId },
    });
    await tx.orderEvent.create({
      data: {
        orderId, type: "PAYMENT_CAPTURED", userId: context.session.itemId, createdById: context.session.itemId,
        data: { paymentId: payment.id, amount: payment.amount, currencyCode: payment.currencyCode, source: "pay_at_pickup" },
      },
    });
  });
  return sudo.query.Order.findOne({ where: { id: orderId }, query: "id status displayId" });
}
