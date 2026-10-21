'use server';
import { revalidatePath } from 'next/cache';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';

export async function stopCommerce(profileId: string, reason: string) {
  const result = await keystoneClient(`mutation EmergencyStop($profileId: ID!, $reason: String!) { stopRegulatedCommerce(profileId: $profileId, reason: $reason) }`, { profileId, reason });
  if (!result.success) return { success: false as const, message: 'Unable to record the stop. Check your permission and enter a reason of 10–500 characters.' };
  revalidatePath('/dashboard/platform/compliance');
  return { success: true as const, message: 'Kill switch enabled.' };
}
export async function exportInventory(profileId: string) {
  const result = await keystoneClient<{ exportComplianceInventory: { id: string; contentDigest: string; content: unknown } }>(`mutation ExportInventory($profileId: ID!) { exportComplianceInventory(profileId: $profileId) }`, { profileId });
  if (!result.success) return { success: false as const, message: 'Unable to export evidence inventory. Report-management permission is required.' };
  revalidatePath('/dashboard/platform/compliance');
  return { success: true as const, report: result.data.exportComplianceInventory };
}
