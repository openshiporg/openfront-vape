import type { KeystoneContext } from '@keystone-6/core/types';
import { releaseBlockers } from '../../regulated-commerce/core/release-gate';
import type { GraphQLResolveInfo } from 'graphql';
import { isPaymentProviderConfigured } from '../utils/paymentProviderConfig';

// Define args structure if simple
interface ActiveCartPaymentProvidersArgs {
    regionId: string;
}

async function activeCartPaymentProviders(
    root: any,
    { regionId }: ActiveCartPaymentProvidersArgs, // Typed args
    context: KeystoneContext, // Typed context
    info?: GraphQLResolveInfo // Optional info
): Promise<readonly any[]> { // Basic Promise<readonly any[]> return type
  if (!regionId) {
    throw new Error('Region ID is required');
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

  return providers.filter((provider: any) =>
    isPaymentProviderConfigured(provider.code || '')
  );
}

export default activeCartPaymentProviders; 