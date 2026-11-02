// Release-gate blockers as launch steps: severity first (an active stop), then the order a shop sets up in.

import { PROVIDER_PURPOSE_LABELS } from '@/features/keystone/regulated/labels';
import type { DotTone } from '@/features/platform/components/vape-primitives';

export const COMPLIANCE_PATH = '/dashboard/platform/compliance';
export const PROFILES_PATH = '/dashboard/platform/merchant-profiles';
export const APPROVALS_PATH = '/dashboard/platform/provider-approvals';
export const EVIDENCE_PATH = '/dashboard/platform/product-evidence';

export type BlockerProfile = { id: string; legalName: string; status: string; killSwitch: boolean };

export type Blocker = {
  code: string;
  /** Launch step this blocker belongs to; lower is earlier. */
  step: number;
  severity: { tone: DotTone; word: string };
  title: string;
  detail: string;
  href: string;
  action: string;
  /** Provider purpose; the fix is the approval sheet for it. */
  purpose?: string;
};

const STOP = { tone: 'danger' as const, word: 'Stopped' };
const MISSING = { tone: 'warn' as const, word: 'Missing' };
const INCOMPLETE = { tone: 'warn' as const, word: 'Incomplete' };

// Providers in the order checkout calls them
const PROVIDER_ORDER = ['identity', 'registry', 'tax', 'payment', 'carrier'];

const label = (code: string) => code.toLowerCase().replaceAll('_', ' ').replace(/^\w/, character => character.toUpperCase());

/** Hide the broader profile check when the gate already names the profile problem. */
export function visibleBlockers(codes: string[]) {
  const gateProfileCode = codes.some(code => ['ACTIVE_MERCHANT_PROFILE_REQUIRED', 'KILL_SWITCH_ENABLED'].includes(code));
  return Array.from(new Set(codes)).filter(code => !(gateProfileCode && code === 'EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED'));
}

/** The profile a fix should open: the stopped one, else the only one, else the list. */
function profileHref(profiles: BlockerProfile[], pick?: (profile: BlockerProfile) => boolean) {
  const match = pick ? profiles.find(pick) : undefined;
  if (match) return `${PROFILES_PATH}/${match.id}`;
  const active = profiles.filter(profile => profile.status === 'active');
  if (active.length === 1) return `${PROFILES_PATH}/${active[0].id}`;
  if (profiles.length === 1) return `${PROFILES_PATH}/${profiles[0].id}`;
  return PROFILES_PATH;
}

export function describeBlocker(code: string, context: { missingInfo?: string[]; profiles?: BlockerProfile[] } = {}): Blocker {
  const missingInfo = context.missingInfo ?? [];
  const profiles = context.profiles ?? [];
  switch (code) {
    case 'KILL_SWITCH_ENABLED': {
      const stopped = profiles.filter(profile => profile.killSwitch);
      return {
        code, step: 0, severity: STOP,
        title: 'Kill switch on',
        detail: stopped.length ? `Stopped on ${stopped.map(profile => profile.legalName).join(', ')}.` : 'Every active profile has its kill switch on.',
        href: profileHref(profiles, profile => profile.killSwitch),
        action: 'Open profile',
      };
    }
    case 'STORE_POLICIES_REQUIRED':
      return {
        code, step: 1, severity: MISSING,
        title: 'Store details and policies',
        detail: missingInfo.length ? `Missing: ${missingInfo.join(', ')}.` : 'Publish them in Store Settings.',
        href: '/dashboard/platform/store',
        action: 'Store settings',
      };
    case 'ACTIVE_MERCHANT_PROFILE_REQUIRED':
      return {
        code, step: 2, severity: MISSING,
        title: 'Active merchant profile',
        detail: 'Set a merchant profile to Active with PACT evidence, origin and dates.',
        href: profileHref(profiles),
        action: profiles.length ? 'Open profile' : 'Add profile',
      };
    case 'EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED':
      return {
        code, step: 2, severity: INCOMPLETE,
        title: 'Merchant profile incomplete',
        detail: 'Exactly one current profile needs PACT registration, an origin, enabled categories and a launch jurisdiction, with the kill switch off.',
        href: profileHref(profiles),
        action: 'Open profile',
      };
    case 'LAUNCH_JURISDICTION_REQUIRED':
      return {
        code, step: 3, severity: MISSING,
        title: 'Launch jurisdiction',
        detail: 'Add a launch jurisdiction to the active merchant profile.',
        href: profileHref(profiles),
        action: 'Add jurisdiction',
      };
    case 'ACTIVE_REVIEWED_POLICY_REQUIRED':
      return {
        code, step: 4, severity: MISSING,
        title: 'Active rule set',
        detail: 'Activate a reviewed rule set that is in its effective dates.',
        href: '/dashboard/platform/jurisdictions',
        action: 'Rule sets',
      };
    case 'CURRENT_PRODUCT_AND_FEDERAL_AUTHORITY_REQUIRED':
      return {
        code, step: 5, severity: MISSING,
        title: 'Sellable product evidence',
        detail: 'Approve a product classification with marketing review and a current federal authorization.',
        href: EVIDENCE_PATH,
        action: 'Classify products',
      };
  }
  const purpose = code.match(/^([A-Z]+)_PROVIDER_AUTHORITY_REQUIRED$/)?.[1]?.toLowerCase();
  if (purpose) {
    const index = PROVIDER_ORDER.indexOf(purpose);
    return {
      code, step: 6 + (index === -1 ? PROVIDER_ORDER.length : index) / 10, severity: MISSING,
      title: `${PROVIDER_PURPOSE_LABELS[purpose] || label(purpose)} provider approval`,
      detail: 'Record an active provider approval for this purpose.',
      href: APPROVALS_PATH,
      action: 'Add approval',
      purpose,
    };
  }
  return { code, step: 9, severity: MISSING, title: label(code), detail: '', href: COMPLIANCE_PATH, action: 'Compliance Center' };
}

/** Visible blockers as ordered launch steps. */
export function launchSteps(codes: string[], context: { missingInfo?: string[]; profiles?: BlockerProfile[] } = {}) {
  return visibleBlockers(codes)
    .map(code => describeBlocker(code, context))
    .sort((a, b) => a.step - b.step);
}
