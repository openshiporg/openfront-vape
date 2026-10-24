'use server';

import { runCommand } from '@/features/platform/lib/run-command';

interface CreateFulfillmentInput {
  orderId: string;
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
  trackingNumber?: string;
  carrier?: string;
  noNotification?: boolean;
}

interface CreateLabelInput {
  orderId: string;
  providerId: string;
  rateId: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'in' | 'cm';
    weightUnit: 'oz' | 'lb' | 'kg';
  };
  lineItems: {
    lineItemId: string;
    quantity: number;
  }[];
}

// Helper function to generate tracking URLs
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  switch (carrier?.toLowerCase()) {
    case 'ups':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    case 'dhl':
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    default:
      return '';
  }
}

export async function createManualFulfillment({
  orderId,
  lineItems,
  trackingNumber,
  carrier,
  noNotification,
  idempotencyKey,
}: {
  orderId: string;
  lineItems: { lineItemId: string; quantity: number }[];
  trackingNumber?: string;
  carrier?: string;
  noNotification?: boolean;
  idempotencyKey: string;
}) {
  const mutation = `
    mutation CreateOrderFulfillment(
      $orderId: ID!
      $lineItems: [LineItemInput!]!
      $trackingNumber: String
      $carrier: String
      $noNotification: Boolean
      $idempotencyKey: String!
    ) {
      createOrderFulfillment(
        orderId: $orderId
        lineItems: $lineItems
        trackingNumber: $trackingNumber
        carrier: $carrier
        noNotification: $noNotification
        idempotencyKey: $idempotencyKey
      ) {
        id
        fulfillmentItems { id quantity lineItem { id } }
        shippingLabels { id status trackingNumber trackingUrl carrier }
      }
    }
  `;

  // Errors come back as the fulfilment rules wrote them; the client refreshes.
  return runCommand(
    mutation,
    { orderId, lineItems, trackingNumber, carrier, noNotification: noNotification || false, idempotencyKey },
    data => data.createOrderFulfillment
  );
}

export async function createProviderShippingLabel({
  orderId,
  providerId,
  rateId,
  dimensions,
  lineItems,
  idempotencyKey,
}: {
  orderId: string;
  providerId: string;
  rateId: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'in' | 'cm';
    weightUnit: 'oz' | 'lb' | 'kg';
  };
  lineItems: { lineItemId: string; quantity: number }[];
  idempotencyKey: string;
}) {
  const mutation = `
    mutation CreateProviderShippingLabel(
      $orderId: ID!
      $providerId: ID!
      $rateId: String!
      $dimensions: DimensionsInput
      $lineItems: [LineItemInput!]
      $idempotencyKey: String!
    ) {
      createProviderShippingLabel(
        orderId: $orderId
        providerId: $providerId
        rateId: $rateId
        dimensions: $dimensions
        lineItems: $lineItems
        idempotencyKey: $idempotencyKey
      ) {
        id
        status
        trackingNumber
        trackingUrl
        labelUrl
        data
      }
    }
  `;

  // A refused label returns the carrier-evidence or compliance reason; the client refreshes.
  return runCommand(
    mutation,
    { orderId, providerId, rateId, dimensions, lineItems, idempotencyKey },
    data => data.createProviderShippingLabel
  );
}

/**
 * Cancel a fulfillment
 */
export async function cancelFulfillment(
  fulfillmentId: string,
  reason = 'operator_cancelled'
) {
  const mutation = `
    mutation CancelOrderFulfillment($fulfillmentId: ID!, $reason: String!) {
      cancelOrderFulfillment(fulfillmentId: $fulfillmentId, reason: $reason) {
        id
        canceledAt
      }
    }
  `;

  return runCommand(mutation, { fulfillmentId, reason }, data => data.cancelOrderFulfillment);
}