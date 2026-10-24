'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'dismissed';

export async function updateOnboardingStatus(status: OnboardingStatus) {
  try {
    const query = `
      mutation UpdateOnboardingStatus($data: UserUpdateProfileInput!) {
        updateActiveUser(data: $data) {
          id
          onboardingStatus
        }
      }
    `;

    const response = await keystoneClient(query, {
      data: { onboardingStatus: status }
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    // Revalidate dashboard pages to reflect the change
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/(admin)');

    return { success: true, data: response.data?.updateActiveUser };
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function dismissOnboarding() {
  return updateOnboardingStatus('dismissed');
}

export async function startOnboarding() {
  return updateOnboardingStatus('in_progress');
}

export async function completeOnboarding() {
  return updateOnboardingStatus('completed');
}
/** Whether a store record exists, so the sidebar card doesn't call a set-up store empty. */
export async function hasExistingStore(): Promise<boolean> {
  const response = await keystoneClient<{ storesCount: number }>(`query OnboardingStoreExists { storesCount }`);
  return response.success ? (response.data?.storesCount ?? 0) > 0 : false;
}
