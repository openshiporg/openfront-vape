'use server';

import { revalidatePath } from 'next/cache';

import {
  BUILTIN_SHIPPING_PROVIDER_NAME,
  planBuiltInApprovals,
  setupBlockers,
} from '@/features/keystone/regulated/builtin-provider-setup';
import { sessionContext, type SaveResult } from '@/features/platform/lib/session-context';

/**
 * Approve the store's built-in age check, tax, carrier and registry methods, plus
 * every installed payment provider, for the merchant profile's own product types
 * and launch jurisdictions. Records are created through the signed-in admin's
 * access, so they are attributed to them and checked by the same validation as a
 * hand-entered approval. Safe to run again: it only adds what is missing.
 */
export async function approveBuiltInProviders(profileId: string): Promise<SaveResult<{ created: string[] }>> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to save.' };
  try {
    const profile = await context.query.RegulatedMerchantProfile.findOne({
      where: { id: profileId },
      query: 'id status enabledCategories launchJurisdictions { code }',
    });
    if (!profile) return { success: false, error: 'Merchant profile not found.' };
    const input = {
      id: profile.id,
      enabledCategories: Array.isArray(profile.enabledCategories) ? profile.enabledCategories : [],
      launchJurisdictionCodes: (profile.launchJurisdictions || []).map((entry: any) => entry.code),
    };
    const blockers = setupBlockers(input);
    if (blockers.length) return { success: false, error: blockers.join('. ') };

    let shipping = (await context.query.ShippingProvider.findMany({
      where: { name: { equals: BUILTIN_SHIPPING_PROVIDER_NAME } }, take: 1, query: 'id',
    }))[0];
    if (!shipping) {
      shipping = await context.query.ShippingProvider.createOne({
        data: {
          name: BUILTIN_SHIPPING_PROVIDER_NAME,
          isActive: true,
          accessToken: 'not-applicable',
          createLabelFunction: 'manual',
          getRatesFunction: 'manual',
          validateAddressFunction: 'manual',
          trackShipmentFunction: 'manual',
          cancelLabelFunction: 'manual',
          metadata: { note: 'Store-arranged carrier; adult signature collected at delivery.' },
        },
        query: 'id',
      });
    }

    const [paymentProviders, existing] = await Promise.all([
      context.query.PaymentProvider.findMany({ where: { isInstalled: { equals: true } }, take: 50, query: 'id code name' }),
      context.query.ProviderApproval.findMany({
        where: { status: { equals: 'active' }, profile: { id: { equals: profile.id } } },
        take: 100, query: 'purpose providerCode paymentProvider { id }',
      }),
    ]);

    const planned = planBuiltInApprovals({
      profile: input,
      paymentProviders: (paymentProviders as any[]).filter(provider => provider.code !== 'pp_system_default') as Array<{ id: string; code: string; name: string }>,
      shippingProviderId: shipping.id,
      existing: existing.map((entry: any) => ({ purpose: entry.purpose, providerCode: entry.providerCode, paymentProviderId: entry.paymentProvider?.id })),
    });

    const created: string[] = [];
    for (const approval of planned) {
      const { paymentProviderId, shippingProviderId, ...fields } = approval;
      await context.query.ProviderApproval.createOne({
        data: {
          ...fields,
          status: 'active',
          profile: { connect: { id: profile.id } },
          ...(paymentProviderId ? { paymentProvider: { connect: { id: paymentProviderId } } } : {}),
          ...(shippingProviderId ? { shippingProvider: { connect: { id: shippingProviderId } } } : {}),
        },
        query: 'id',
      });
      created.push(`${approval.purpose}:${approval.providerCode}`);
    }
    revalidatePath('/dashboard/platform/compliance-center');
    revalidatePath('/dashboard/platform/provider-approvals');
    return { success: true, data: { created } };
  } catch (error: any) {
    const message = String(error?.message || '').split('\n').map((line: string) => line.trim()).filter((line: string) => line.startsWith('- '))[0];
    return { success: false, error: message ? message.slice(2).replace(/^[A-Za-z]+(\.[A-Za-z]+)?: /, '') : 'Unable to record the approvals.' };
  }
}
