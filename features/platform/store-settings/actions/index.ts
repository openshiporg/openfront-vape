'use server';

import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { revalidatePath } from 'next/cache';
import { normalizeStoreLogoColor } from '../lib/store-logo';
import { sanitizeStoreLogoSvg } from '@/features/keystone/utils/storeLogo';
import { mergeStoreInfo, type StoreBusiness, type StorePolicies } from '../lib/store-info';

export async function getStoreSettings() {
  const query = `
    query GetStore {
      stores(take: 1) {
        id
        name
        logoIcon
        logoColor
        homepageTitle
        homepageDescription
        metadata
      }
    }
  `;

  const response = await keystoneClient(query);

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true, data: response.data?.stores?.[0] || null };
}

export async function updateStoreSettings(storeId: string, data: {
  name?: string;
  logoIcon?: string;
  logoColor?: string;
  homepageTitle?: string;
  homepageDescription?: string;
  business?: StoreBusiness;
  policies?: StorePolicies;
}) {
  const { business, policies, ...fields } = data;
  // Sanitize SVG before saving to prevent XSS attacks
  const sanitizedData: Record<string, unknown> = {
    ...fields,
    logoIcon: data.logoIcon ? sanitizeStoreLogoSvg(data.logoIcon) : undefined,
    logoColor:
      data.logoColor === undefined ? undefined : normalizeStoreLogoColor(data.logoColor),
  };

  // If SVG sanitization failed (returned empty string), reject the update
  if (data.logoIcon && !sanitizedData.logoIcon) {
    return { success: false, error: 'Invalid SVG format' };
  }

  if (business && policies) {
    // Read the current metadata so keys owned elsewhere survive the save.
    const current = await keystoneClient(
      `query StoreMetadata($id: ID!) { store(where: { id: $id }) { id metadata } }`,
      { id: storeId }
    );
    if (!current.success) {
      return { success: false, error: current.error };
    }
    sanitizedData.metadata = mergeStoreInfo(current.data?.store?.metadata, business, policies);
  }

  const mutation = `
    mutation UpdateStore($id: ID!, $data: StoreUpdateInput!) {
      updateStore(where: { id: $id }, data: $data) {
        id
        name
        logoIcon
        logoColor
        homepageTitle
        homepageDescription
        metadata
      }
    }
  `;

  const response = await keystoneClient(mutation, { id: storeId, data: sanitizedData });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  revalidatePath('/dashboard');
  // Footer and policy pages read the same record.
  revalidatePath('/', 'layout');

  return { success: true, data: response.data?.updateStore };
}
