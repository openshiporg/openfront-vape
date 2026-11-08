import { permissions } from "../access";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { reverseTaxForCanceledOrder } from "../regulated/order-tax-reversal";
import { reconcileProviderRefunds } from "../checkout/provider-refund-reconcile";
import { GraphQLError } from "graphql";

/** Correct refusals the owner should read, not "Unexpected error.". */
function orderRuleError(message: string, code: string) {
  return new GraphQLError(message, { extensions: { code } });
}

async function transitionOrderStatus(
  root: any,
  { orderId, status, reason }: { orderId: string; status: string; reason: string },
  context: any
) {
  if (!permissions.canManageOrders({ session: context.session })) throw new Error("Access denied");
  if (!reason?.trim()) throw new Error("Transition reason is required");
  if (!["canceled", "archived"].includes(status)) {
    throw new Error("Order status is controlled by payment and fulfillment commands");
  }
  const sudo = context.sudo();
  if (status === "canceled") {
    // A charge the processor already refunded counts as refunded: record it first, then the cancel can stand.
    const payments = await sudo.prisma.payment.findMany({ where: { orderId, status: "captured" }, select: { id: true, amount: true, refunds: { select: { amount: true } } } });
    for (const payment of payments) {
      if (payment.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0) >= payment.amount) continue;
      await reconcileProviderRefunds(context, payment.id).catch((error: unknown) =>
        console.error("Provider refund reconcile before cancel failed", payment.id, error instanceof Error ? error.message : error));
    }
  }
  const endpointIds = await subscribedWebhookEndpointIds(sudo, `order.${status}`);
  await sudo.prisma.$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          select: { id: true, status: true, amount: true, amountRefunded: true, refunds: { select: { amount: true } } },
        },
        fulfillments: { where: { canceledAt: null }, select: { id: true } },
        accountLineItems: {
          select: {
            id: true,
            accountId: true,
            amount: true,
            paymentStatus: true,
            invoiceLineItems: { select: { id: true } },
          },
        },
        discounts: { select: { id: true } },
        lineItems: {
          select: {
            quantity: true,
            productVariant: {
              select: { id: true, manageInventory: true },
            },
          },
        },
      },
    });
    if (!order) throw new Error("Order not found");
    if (order.status === status) return;

    if (status === "archived") {
      if (order.status !== "completed") throw orderRuleError("Only completed orders can be archived.", "ORDER_NOT_ARCHIVABLE");
    } else {
      if (!["pending", "completed", "requires_action"].includes(order.status)) {
        throw orderRuleError(`A ${order.status.replace(/_/g, " ")} order can't be canceled.`, "ORDER_NOT_CANCELABLE");
      }
      if (order.fulfillments.length) throw orderRuleError("Cancel the order's shipments before canceling the order.", "ORDER_HAS_FULFILLMENTS");
      if (
        order.payments.some(
          (payment: any) =>
            // A pay-at-pickup payment that was never taken has nothing to refund.
            payment.status !== "pending" &&
            payment.refunds.reduce((sum: number, refund: any) => sum + refund.amount, 0) < payment.amount
        )
      ) {
        throw orderRuleError("Refund this order's payments in full before canceling it.", "ORDER_HAS_CAPTURED_PAYMENT");
      }
      for (const payment of order.payments) {
        if (payment.status === "pending") {
          await tx.payment.update({ where: { id: payment.id }, data: { status: "canceled" } });
        }
      }
      for (const line of order.lineItems) {
        if (!line.productVariant?.manageInventory) continue;
        await tx.productVariant.update({
          where: { id: line.productVariant.id },
          data: { inventoryQuantity: { increment: line.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            type: "RECEIVE",
            quantity: line.quantity,
            reason: "order_cancellation",
            note: `order:${orderId}`,
            variantId: line.productVariant.id,
          },
        });
      }
      if (
        order.accountLineItems.some(
          (item: any) => item.paymentStatus !== "unpaid" || item.invoiceLineItems.length
        )
      ) {
        throw orderRuleError("This order is on an invoice. Issue a credit note instead of canceling it.", "ORDER_INVOICED");
      }
      for (const item of order.accountLineItems) {
        await tx.accountLineItem.update({
          where: { id: item.id },
          data: { paymentStatus: "canceled" },
        });
        if (item.accountId) {
          const adjustedAccount = await tx.account.updateMany({
            where: { id: item.accountId, totalAmount: { gte: item.amount } },
            data: { totalAmount: { decrement: item.amount } },
          });
          if (adjustedAccount.count !== 1) {
            throw new Error("Account balance is inconsistent; cancellation stopped");
          }
        }
      }
      for (const discount of order.discounts) {
        await tx.discount.updateMany({
          where: { id: discount.id, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "canceled" ? { canceledAt: new Date() } : {}),
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: { previousStatus: order.status, newStatus: status, reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId,
      },
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

  // Cancel requires every captured payment to be refunded, so the order's regulated tax is reversed too.
  // Append-only: the committed quote is never rewritten. The cancel is already final; a failure here is logged.
  if (status === "canceled") {
    await reverseTaxForCanceledOrder(context, orderId).catch((error: unknown) =>
      console.error("tax reversal after cancel failed", orderId, error));
  }

  return sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id status canceledAt displayId",
  });
}

export default transitionOrderStatus;
