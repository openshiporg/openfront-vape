// The checks the release gate runs on a merchant profile (regulatedCommerceReadiness):
// active and inside its dates, kill switch off, PACT registered, an origin, product types and a launch jurisdiction.

export type ProfileFacts = {
  status: string;
  killSwitch: boolean;
  pactRegistered: boolean;
  hasOrigin: boolean;
  categoryCount: number;
  launchCount: number;
  effectiveAt: string | null;
  expiresAt: string | null;
};

export type Check = { key: string; label: string; ok: boolean; missing: string };

export function profileChecks(profile: ProfileFacts, now = Date.now()): Check[] {
  const from = profile.effectiveAt ? new Date(profile.effectiveAt).getTime() : NaN;
  const to = profile.expiresAt ? new Date(profile.expiresAt).getTime() : NaN;
  return [
    { key: 'status', label: 'Active', ok: profile.status === 'active', missing: 'Not active' },
    { key: 'dates', label: 'In its dates', ok: from <= now && to > now, missing: 'Outside its dates' },
    { key: 'pact', label: 'PACT registered', ok: profile.pactRegistered, missing: 'No PACT registration' },
    { key: 'origin', label: 'Origin', ok: profile.hasOrigin, missing: 'No origin' },
    { key: 'categories', label: 'Product types', ok: profile.categoryCount > 0, missing: 'No product types' },
    { key: 'launch', label: 'Launch jurisdiction', ok: profile.launchCount > 0, missing: 'No launch jurisdiction' },
    { key: 'sales', label: 'Kill switch off', ok: !profile.killSwitch, missing: 'Sales stopped' },
  ];
}
