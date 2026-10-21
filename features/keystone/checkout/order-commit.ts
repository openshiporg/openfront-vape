import crypto from "node:crypto";
import { insideCommerceFence, withCartFence } from "../security/commerce-fence";
import { assertCommerceReleaseEnabled } from "../../regulated-commerce/core/release-gate";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { deliverWebhookEventsById } from "../../webhooks/webhook-plugin";
import { cartEvidenceFingerprint } from "../regulated/cart-fingerprint";
import { evaluateCartCompliance } from "../regulated/enforcement";
import {
  acceptedCheckoutEvidenceWhere,
  matchesCurrentAcceptedCheckoutSnapshot,
} from "./accepted-compliance-snapshot";

// Checkout writes the order through Prisma, so Keystone hooks (and the Order webhook
// enricher) never run for it: order.created is built here and must carry everything
// receivers such as Openship read, including the full shipping address.
const WEBHOOK_ADDRESS_SELECT = {
  id: true, firstName: true, lastName: true, company: true, address1: true, address2: true,
  city: true, province: true, postalCode: true, phone: true,
  country: { select: { id: true, iso2: true } },
};

export async function createOrderFromCartAtomically(cart: any, sudo: any): Promise<{ id: string; [key: string]: unknown }> {
  await assertCommerceReleaseEnabled(sudo);
  // Persisted outbox delivery is post-commit work; never send inside the fence.
  const deliverAfterCommit = !insideCommerceFence(sudo);
  const commit = deliverAfterCommit
    ? await withCartFence(sudo, cart.id, "checkout", locked => commitOrderFromCart(cart, locked.sudo()))
    : await commitOrderFromCart(cart, sudo);

  if (deliverAfterCommit && commit.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, commit.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate order webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  const order = await sudo.query.Order.findOne({
    where: { id: commit.orderId },
    query: `
      id status displayId secretKey subtotal total shipping discount tax paymentDetails
      shippingAddress { id firstName lastName company address1 address2 city province postalCode country { id iso2 } phone }
    `,
  });
  if (!order || typeof order.id !== "string") throw new Error("Order could not be loaded");
  return order;
}

async function commitOrderFromCart(cart: any, sudo: any): Promise<{ orderId: string; webhookEventIds: string[] }> {
  const prepared: Array<{ line: any; price: any; thumbnail: any }> = [];
  for (const line of cart.lineItems) {
    const prices = await sudo.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: line.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } },
      },
      take: 1,
      query: "id calculatedPrice { calculatedAmount originalAmount currencyCode }",
    });
    const price = prices[0]?.calculatedPrice;
    if (!price) throw new Error(`No valid price for variant ${line.productVariant.id}`);
    const thumbnail = line.productVariant.primaryImage
      ? line.productVariant.primaryImage.image?.url || line.productVariant.primaryImage.imagePath
      : line.productVariant.product.thumbnail;
    prepared.push({ line, price, thumbnail });
  }

  // Regulation derives from the product/exemption contract, never from whether
  // an optional classification row happens to exist. Re-evaluation must itself
  // still allow; an older persisted allow cannot override newly invalid evidence.
  const currentCompliance = await evaluateCartCompliance({ context: sudo, cartId: cart.id, purpose: "checkout" });
  const regulated = currentCompliance.regulated;
  const acceptanceReferences = currentCompliance.regulated ? currentCompliance.acceptanceReferences : null;
  if (regulated && currentCompliance.decision?.result !== "allow") {
    throw new Error("A current allowed checkout compliance snapshot is required");
  }
  const cartFingerprint = await cartEvidenceFingerprint(sudo, cart.id);
  if (!cart.acceptedCheckoutFingerprint || cart.acceptedCheckoutFingerprint !== cartFingerprint) throw new Error("Your cart changed during checkout. Review it and try again.");
  const now = new Date();
  const complianceDecision = regulated ? await sudo.prisma.complianceDecision.findFirst({
    where: {
      cartId: cart.id,
      cartFingerprint,
      purpose: "checkout",
      result: "allow",
      revokedAt: null,
      orderId: null,
      expiresAt: { gt: now },
    },
    orderBy: { issuedAt: "desc" },
  }) : null;
  if (regulated && (!complianceDecision || !acceptanceReferences || !matchesCurrentAcceptedCheckoutSnapshot(complianceDecision, {
    cartId: cart.id,
    cartFingerprint,
    current: acceptanceReferences,
    now,
  }))) {
    throw new Error("A current allowed checkout compliance snapshot is required");
  }

  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const orderWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    'order.created',
    userId
  );
  const secretKey = userId ? "" : crypto.randomBytes(32).toString("hex");
  const commercialSnapshot = {
    currency: cart.region.currency.code,
    cartFingerprint,
    acceptedTotal: cart.rawTotal,
    tax: {
      rate: cart.region.taxRate || 0,
      regionId: cart.region.id,
      destinationCountry: cart.shippingAddress?.country?.iso2 || null,
    },
    acceptedAt: now.toISOString(),
    compliance: complianceDecision ? {
      decisionId: complianceDecision.id,
      snapshotDigest: complianceDecision.snapshotDigest,
      policyPack: complianceDecision.policyPack,
      policyVersion: complianceDecision.policyVersion,
      policyHash: complianceDecision.policyHash,
      result: complianceDecision.result,
    } : null,
  };

  // Formatted totals as the Order shows them; never worth failing checkout over.
  const webhookTotals = orderWebhookEndpointIds.length
    ? await sudo.query.Cart.findOne({ where: { id: cart.id }, query: "subtotal shipping discount tax total" }).catch(() => null)
    : null;

  // This callback already owns the native Context transaction and reciprocal fence.
  const commit = await (async (tx: any) => {
    const existing = await tx.order.findFirst({ where: { cart: { id: cart.id } }, select: { id: true } });
    if (existing) return { orderId: existing.id, webhookEventIds: [] as string[] };

    const lineItemIds = [];
    const webhookLineItems: any[] = [];
    for (const { line, price, thumbnail } of prepared) {
      const money = await tx.orderMoneyAmount.create({
        data: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
          currencyId: cart.region.currency.id,
          regionId: cart.region.id,
          priceData: {
            prices: line.productVariant.prices,
            currencyCode: cart.region.currency.code,
            regionId: cart.region.id,
            taxRate: cart.region.taxRate,
          },
          metadata: line.metadata,
        },
      });
      const item = await tx.orderLineItem.create({
        data: {
          quantity: line.quantity,
          title: line.productVariant.product.title,
          sku: line.productVariant.sku,
          metadata: line.metadata,
          productData: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
            description: line.productVariant.product.description,
            metadata: line.productVariant.product.metadata,
          },
          variantData: {
            id: line.productVariant.id,
            sku: line.productVariant.sku,
            title: line.productVariant.title,
            measurements: line.productVariant.measurements || [],
          },
          variantTitle: line.productVariant.title,
          formattedUnitPrice: line.unitPrice,
          formattedTotal: line.total,
          productVariantId: line.productVariant.id,
          originalLineItemId: line.id,
          moneyAmountId: money.id,
        },
      });
      lineItemIds.push(item.id);
      webhookLineItems.push({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        thumbnail,
        moneyAmount: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
        },
        productVariant: {
          id: line.productVariant.id,
          title: line.productVariant.title,
          sku: line.productVariant.sku,
          product: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
          },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        cart: { connect: { id: cart.id } },
        email: cart.email,
        userId,
        regionId: cart.region.id,
        currencyId: cart.region.currency.id,
        billingAddressId: cart.billingAddress.id,
        shippingAddressId: cart.shippingAddress.id,
        discounts: { connect: (cart.discounts || []).map((item: any) => ({ id: item.id })) },
        shippingMethods: { connect: (cart.shippingMethods || []).map((item: any) => ({ id: item.id })) },
        lineItems: { connect: lineItemIds.map((id) => ({ id })) },
        status: "pending",
        displayId: Math.floor(Date.now() / 1000),
        taxRate: cart.region.taxRate || 0,
        metadata: { ...(cart.metadata || {}), commercialSnapshot },
        secretKey,
        events: {
          create: {
            type: "ORDER_PLACED",
            data: { cartId: cart.id, isGuestOrder: !userId },
          },
        },
      },
    });
    await tx.cart.update({ where: { id: cart.id }, data: { orderId: order.id } });
    if (complianceDecision) {
      const bindingTime = new Date();
      const accepted = complianceDecision.snapshot as any;
      const evidenceWhere = acceptedCheckoutEvidenceWhere(accepted, cart.id, cartFingerprint, bindingTime);
      if (!evidenceWhere) throw new Error("Accepted evidence references are incomplete");
      const linkedDecision = await tx.complianceDecision.updateMany({
        where: {
          id: complianceDecision.id,
          cartId: cart.id,
          cartFingerprint,
          merchantProfileId: complianceDecision.merchantProfileId,
          jurisdictionId: complianceDecision.jurisdictionId,
          purpose: "checkout",
          result: "allow",
          policyPack: complianceDecision.policyPack,
          policyVersion: complianceDecision.policyVersion,
          policyHash: complianceDecision.policyHash,
          snapshotDigest: complianceDecision.snapshotDigest,
          revokedAt: null,
          orderId: null,
          expiresAt: { gt: bindingTime },
        },
        data: { orderId: order.id },
      });
      if (linkedDecision.count !== 1) throw new Error("Accepted compliance snapshot expired, changed, or was already consumed");
      for (const [model, where] of [
        [tx.ageVerificationAttempt, evidenceWhere.age],
        [tx.regulatedTaxQuote, evidenceWhere.tax],
        [tx.carrierEligibilityDecision, evidenceWhere.carrier],
      ]) {
        const linked = await model.updateMany({ where, data: { orderId: order.id } });
        if (linked.count !== 1) throw new Error("Accepted evidence was expired, changed, or already consumed");
      }
      await tx.complianceEvent.create({
        data: {
          decisionId: complianceDecision.id,
          orderId: order.id,
          eventType: "checkout.compliance_committed",
          resourceType: "Order",
          resourceId: order.id,
          evidenceDigest: complianceDecision.snapshotDigest,
          data: { cartId: cart.id, policyVersion: complianceDecision.policyVersion },
          occurredAt: bindingTime,
        },
      });
    }
    const webhookAddress = (id: string) => orderWebhookEndpointIds.length ? tx.address.findUnique({ where: { id }, select: WEBHOOK_ADDRESS_SELECT }) : null;
    const shippingAddress = await webhookAddress(cart.shippingAddress.id);
    const billingAddress = await webhookAddress(cart.billingAddress.id);
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      orderWebhookEndpointIds,
      "order.created",
      "Order",
      order.id,
      {
        id: order.id,
        cartId: cart.id,
        displayId: order.displayId,
        email: order.email,
        status: order.status,
        rawTotal: cart.rawTotal,
        subtotal: webhookTotals?.subtotal ?? null,
        shipping: webhookTotals?.shipping ?? null,
        discount: webhookTotals?.discount ?? null,
        tax: webhookTotals?.tax ?? null,
        total: webhookTotals?.total ?? null,
        currency: { id: cart.region.currency.id, code: cart.region.currency.code },
        shippingAddress,
        billingAddress,
        lineItems: webhookLineItems,
      }
    );
    if (cart.email) {
      await tx.notification.create({
        data: {
          eventName: "ORDER_CONFIRMATION",
          resourceType: "Order",
          resourceId: order.id,
          to: cart.email,
          userId: userId || null,
          data: { orderId: order.id, status: "pending_delivery" },
        },
      });
    }
    return { orderId: order.id, webhookEventIds };
  })(sudo.prisma);
  return commit;
}
