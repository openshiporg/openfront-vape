'use server';
import { revalidatePath } from 'next/cache';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';

export async function getStorefrontWarning() {
  const result = await keystoneClient<{ stores: Array<{ id: string; nicotineWarningRequired: boolean | null; demoCatalogue: boolean | null; demoCatalogueChangedAt: string | null }> }>(
    `query StorefrontWarning { stores(take: 1) { id nicotineWarningRequired demoCatalogue demoCatalogueChangedAt } }`
  );
  if (!result.success) return null;
  const store = result.data.stores[0];
  return store ? {
    storeId: store.id,
    on: store.nicotineWarningRequired !== false,
    demoCatalogue: store.demoCatalogue === true,
    demoCatalogueChangedAt: store.demoCatalogueChangedAt,
  } : null;
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

// Field access and the Store validateInput hook enforce who may do this and when.
export async function setDemoCatalogue(storeId: string, on: boolean) {
  const result = await keystoneClient(
    `mutation SetDemoCatalogue($id: ID!, $on: Boolean!) { updateStore(where: { id: $id }, data: { demoCatalogue: $on }) { id demoCatalogue } }`,
    { id: storeId, on }
  );
  if (!result.success) {
    const reason = /active merchant profile/i.test(result.error || '') ? 'An active merchant profile is selling; turn on its kill switch first.' : 'Compliance-management permission is required.';
    return { success: false as const, message: `Not saved. ${reason}` };
  }
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/', 'layout');
  return { success: true as const, message: on ? 'Demo catalogue is on.' : 'Demo catalogue is off.' };
}
