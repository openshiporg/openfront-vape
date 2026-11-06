import { permissions } from "../access";
import { isPickupOption } from "../regulated/pickup";
import { reconcileOrderFulfillmentStatus } from "../orders/order-lifecycle";
import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";

/**
 * Counter handover for a reserve-online pickup order, the way vape/liquor POS handovers work
 * (Lightspeed, KORONA): the clerk checks a government photo ID shows 21+, confirms the name
 * matches the order, and hands the bag over. That one action fulfills every remaining line
 * through the manual provider, completes the order, and records the ID check as compliance
 * evidence on the order. It refuses unpaid orders, delivery orders and an unconfirmed ID check.
 * A repeat on an already-handed-over order is a no-op.
 */
export const PICKUP_HANDOVER_KEY = (orderId: string) => `pickup-handover:${orderId}`;
const SETTLED = ["captured"];

export default async function completePickupHandover(
  _root: unknown,
  { orderId, idChecked, idType }: { orderId: string; idChecked: boolean; idType?: string | null },
  context: any
) {
  if (!permissions.canManageOrders({ session: context.session }) || !permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (idChecked !== true) throw new Error("Check the customer's government photo ID shows 21 or older before handing over");
  const documentType = ["drivers_license", "state_id", "passport", "military_id"].includes(String(idType || "")) ? String(idType) : "drivers_license";
  const actorId = context.session.itemId;
  const sudo = context.sudo();

  await sudo.prisma.$transaction(async (tx: any) => {
    const key = PICKUP_HANDOVER_KEY(orderId);
    const existing = await tx.fulfillment.findFirst({ where: { idempotencyKey: key, canceledAt: null }, select: { id: true } });
    if (existing) return;
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true, status: true, cart: { select: { id: true } },
        shippingMethods: { select: { shippingOption: { select: { data: true } } } },
        payments: { select: { status: true } },
        lineItems: { select: { id: true, quantity: true } },
      },
    });
    if (!order) throw new Error("Order not found");
    const pickup = order.shippingMethods.length > 0 && order.shippingMethods.every((method: any) => isPickupOption(method.shippingOption));
    if (!pickup) throw new Error("Only store pickup orders are handed over at the counter");
    if (order.status !== "pending") throw new Error("Only open pickup orders can be handed over");
    if (!order.payments.some((payment: any) => SETTLED.includes(payment.status))) throw new Error("Take payment before handing the order over");

    const fulfilled = await tx.fulfillmentItem.groupBy({
      by: ["lineItemId"],
      where: { lineItem: { orderId }, fulfillment: { canceledAt: null } },
      _sum: { quantity: true },
    });
    const done = new Map<string, number>(fulfilled.map((row: any) => [row.lineItemId, row._sum.quantity || 0] as [string, number]));
    const remaining = order.lineItems
      .map((line: any) => ({ lineItemId: line.id, quantity: line.quantity - (done.get(line.id) || 0) }))
      .filter((line: any) => line.quantity > 0);
    if (!remaining.length) throw new Error("Every item on this order is already handed over");

    const provider = await tx.fulfillmentProvider.findUnique({ where: { code: "fp_manual" }, select: { id: true } });
    if (!provider) throw new Error("Manual fulfillment provider is not configured");
    const occurredAt = new Date();
    const fulfillment = await tx.fulfillment.create({
      data: {
        orderId,
        fulfillmentProviderId: provider.id,
        idempotencyKey: key,
        noNotification: true,
        metadata: { source: "pickup-handover", createdById: actorId, idChecked: true, idType: documentType },
        fulfillmentItems: { create: remaining.map((line: any) => ({ quantity: line.quantity, lineItem: { connect: { id: line.lineItemId } } })) },
      },
      select: { id: true },
    });
    await tx.orderEvent.create({
      data: {
        orderId, type: "FULFILLMENT_STATUS_CHANGE", userId: actorId, createdById: actorId,
        data: { fulfillmentId: fulfillment.id, action: "picked_up", lineItems: remaining, idChecked: true, idType: documentType },
      },
    });
    const decision = order.cart?.id ? await tx.complianceDecision.findFirst({ where: { cartId: order.cart.id, orderId }, select: { id: true } }) : null;
    await tx.complianceEvent.create({
      data: {
        ...(decision ? { decisionId: decision.id } : {}),
        orderId,
        eventType: "regulated.pickup_id_checked",
        resourceType: "Order",
        resourceId: orderId,
        actorId,
        reasonCode: "COUNTER_ID_21_PLUS_VERIFIED",
        evidenceDigest: evidenceDigest({ orderId, fulfillmentId: fulfillment.id, actorId, idType: documentType, occurredAt: occurredAt.toISOString() }),
        data: { fulfillmentId: fulfillment.id, idType: documentType, minimumAge: 21 },
        occurredAt,
      },
    });
    await reconcileOrderFulfillmentStatus(tx, orderId, { reason: "pickup_handover", actorId });
  }, { isolationLevel: "Serializable" });

  return sudo.query.Order.findOne({ where: { id: orderId }, query: "id status displayId" });
}
