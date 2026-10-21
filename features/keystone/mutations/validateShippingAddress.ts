"use server";
import type { KeystoneContext } from "@keystone-6/core/types";

import { validateAddress } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function validateShippingAddress(root: unknown, { providerId, address }: { providerId: string; address: unknown }, context: KeystoneContext<any>) {
  // Check access permissions first
  const hasAccess =
    permissions.canReadOrders({ session: context.session }) ||
    permissions.canManageOrders({ session: context.session });

  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to validate shipping addresses"
    );
  }

  if (!address || typeof address !== 'object' || Array.isArray(address)) throw new Error('Address is required');
  const provider = await context.query.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      validateAddressFunction
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

  return validateAddress({ 
    provider: {
      ...provider,
      accessToken: provider.accessToken
    }, 
    address: address as Record<string, unknown>
  });
}

export default validateShippingAddress; 