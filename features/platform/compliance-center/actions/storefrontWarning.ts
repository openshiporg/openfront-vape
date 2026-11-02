'use server';
import { revalidatePath } from 'next/cache';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';

export async function getStorefrontWarning() {
  const result = await keystoneClient<{ stores: Array<{ id: string; nicotineWarningRequired: boolean | null }> }>(
    `query StorefrontWarning { stores(take: 1) { id nicotineWarningRequired } }`
  );
  if (!result.success) return null;
  const store = result.data.stores[0];
  return store ? { storeId: store.id, on: store.nicotineWarningRequired !== false } : null;
}

// Field access on Store.nicotineWarningRequired limits this to compliance managers.
export async function setStorefrontWarning(storeId: string, on: boolean) {
  const result = await keystoneClient(
    `mutation SetStorefrontWarning($id: ID!, $on: Boolean!) { updateStore(where: { id: $id }, data: { nicotineWarningRequired: $on }) { id nicotineWarningRequired } }`,
    { id: storeId, on }
  );
  if (!result.success) return { success: false as const, message: 'Not saved. Compliance-management permission is required.' };
  revalidatePath('/dashboard/platform/compliance');
  revalidatePath('/', 'layout');
  return { success: true as const, message: on ? 'Warning is on.' : 'Warning is off.' };
}
