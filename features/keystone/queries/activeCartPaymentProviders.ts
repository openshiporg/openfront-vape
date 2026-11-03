import type { KeystoneContext } from '@keystone-6/core/types';
import { releaseBlockers } from '../../regulated-commerce/core/release-gate';
import type { GraphQLResolveInfo } from 'graphql';
import { assertCartAccess } from '../security/cart-access';
import { cartIsPickup } from '../regulated/pickup';
import { isPaymentProviderConfigured } from '../utils/paymentProviderConfig';
import { shopperError } from "../lib/shopperError";

// Define args structure if simple
interface ActiveCartPaymentProvidersArgs {
    regionId: string;
    cartId?: string | null;
}

async function activeCartPaymentProviders(
    root: any,
    { regionId, cartId }: ActiveCartPaymentProvidersArgs, // Typed args
    context: KeystoneContext, // Typed context
    info?: GraphQLResolveInfo // Optional info
): Promise<readonly any[]> { // Basic Promise<readonly any[]> return type
  if (!regionId) {
    throw shopperError("Region ID is required", "REGION_REQUIRED");
  }

  if ((await releaseBlockers(context)).length) return [];
  const providers = await context.sudo().query.PaymentProvider.findMany({
    where: {
      isInstalled: { equals: true },
      regions: { some: { id: { equals: regionId } } }
    },
    query: `
      id
      name
      code
      isInstalled
    `
  });

  // Pay-at-pickup: a pickup cart pays at the counter with the manual provider
  // and is offered nothing else. Delivery carts never see manual tender.
  let pickup = false;
  if (cartId) {
    await assertCartAccess(context, cartId);
    const cart = await context.sudo().query.Cart.findOne({
      where: { id: cartId },
      query: 'shippingMethods { shippingOption { data } }',
    });
    pickup = cartIsPickup(cart);
  }
  return providers.filter((provider: any) =>
    pickup
      ? provider.code === 'pp_system_default'
      : provider.code !== 'pp_system_default' && isPaymentProviderConfigured(provider.code || '')
  );
}

export default activeCartPaymentProviders; 