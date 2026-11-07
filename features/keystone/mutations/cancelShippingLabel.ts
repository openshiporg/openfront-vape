"use server";

import { cancelLabel } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function cancelShippingLabel(
  root: any,
  { providerId, labelId }: { providerId: string; labelId: string },
  context: any
) {
  // Check access permissions first
  const hasAccess = permissions.canManageFulfillments({ session: context.session });

  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to cancel shipping labels"
    );
  }

  const sudo = context.sudo();
  const localLabel = await sudo.query.ShippingLabel.findOne({
    where: { id: labelId },
    query: "id status data metadata provider { id }",
  });
  if (!localLabel || localLabel.provider?.id !== providerId) {
    throw new Error("Shipping label not found");
  }
  // The "cancelled" state lives in metadata.cancellation (status stays purchased), so guard on it here.
  if (localLabel.status !== "purchased") throw new Error("Only purchased labels can be cancelled");
  const priorCancellation = (localLabel.metadata as any)?.cancellation?.status;
  if (priorCancellation === "confirmed" || priorCancellation === "pending") {
    throw new Error("This label is already cancelled; the refund is being processed by the carrier");
  }

  const provider = await sudo.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      cancelLabelFunction
      isActive
    `,
  });
  if (!provider) throw new Error('Provider not found');

  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }

  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }

  const labelData = localLabel.data as Record<string, any> | null;
  const providerLabelId =
    labelData?.label_id ||
    labelData?.object_id ||
    labelData?.id;
  if (!providerLabelId) throw new Error("Provider label reference is missing");

  const result: any = await cancelLabel({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    }, 
    labelId: providerLabelId
  });
  await sudo.query.ShippingLabel.updateOne({
    where: { id: labelId },
    data: {
      metadata: {
        ...(localLabel.metadata || {}),
        cancellation: {
          status:
            result?.success && (!result?.refundStatus || result.refundStatus === "SUCCESS")
              ? "confirmed"
              : result?.success
                ? "pending"
                : "unknown",
          refundStatus: result?.refundStatus || null,
          canceledById: context.session.itemId,
          recordedAt: new Date().toISOString(),
        },
      },
    },
  });
  return result;
}

export default cancelShippingLabel; 