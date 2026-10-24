import type { DotTone } from '@/features/platform/components/vape-primitives';

export const PROFILE_STATUS_TONES: Record<string, DotTone> = {
  draft: 'muted',
  review: 'info',
  active: 'ok',
  suspended: 'warn',
  revoked: 'danger',
};

export const LICENSE_STATUS_TONES: Record<string, DotTone> = {
  draft: 'muted',
  active: 'ok',
  conditioned: 'warn',
  suspended: 'warn',
  expired: 'danger',
  revoked: 'danger',
};

export const APPROVAL_STATUS_TONES: Record<string, DotTone> = {
  unconfigured: 'muted',
  review: 'info',
  active: 'ok',
  suspended: 'warn',
  expired: 'danger',
  revoked: 'danger',
};

export const day = (value: string | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : null);
