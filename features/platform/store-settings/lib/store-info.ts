// Business details and policies live in Store.metadata (no schema change):
//   metadata.business = { legalName, email, phone, address, licenses }
//   metadata.policies = { privacy, terms, shipping, returns, ageVerification }
// Pure helpers, shared by Store Settings and the storefront.

export type StoreBusiness = {
  legalName: string;
  email: string;
  phone: string;
  address: string;
  licenses: string[];
};

export const POLICY_KEYS = ['shipping', 'returns', 'ageVerification', 'privacy', 'terms'] as const;
export type PolicyKey = (typeof POLICY_KEYS)[number];
export type StorePolicies = Record<PolicyKey, string>;

export const POLICY_PAGES: { slug: string; key: PolicyKey; title: string }[] = [
  { slug: 'shipping', key: 'shipping', title: 'Shipping policy' },
  { slug: 'returns', key: 'returns', title: 'Returns policy' },
  { slug: 'age-verification', key: 'ageVerification', title: 'Age verification' },
  { slug: 'privacy', key: 'privacy', title: 'Privacy policy' },
  { slug: 'terms', key: 'terms', title: 'Terms of use' },
];

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export function readStoreBusiness(metadata: unknown): StoreBusiness {
  const business = asObject(asObject(metadata).business);
  const rawLicenses = business.licenses;
  const licenses = (Array.isArray(rawLicenses) ? rawLicenses : typeof rawLicenses === 'string' ? rawLicenses.split('\n') : [])
    .map(text)
    .filter(Boolean);

  return {
    legalName: text(business.legalName),
    email: text(business.email),
    phone: text(business.phone),
    address: text(business.address),
    licenses,
  };
}

export function readStorePolicies(metadata: unknown): StorePolicies {
  const policies = asObject(asObject(metadata).policies);
  return Object.fromEntries(POLICY_KEYS.map((key) => [key, text(policies[key])])) as StorePolicies;
}

export function hasBusinessDetails(business: StoreBusiness) {
  return Boolean(business.legalName || business.email || business.phone || business.address || business.licenses.length);
}

// Merge into the existing metadata so other keys (e.g. transactionMode) survive.
export function mergeStoreInfo(
  metadata: unknown,
  business: StoreBusiness,
  policies: StorePolicies
): Record<string, unknown> {
  return {
    ...asObject(metadata),
    business: {
      legalName: text(business.legalName),
      email: text(business.email),
      phone: text(business.phone),
      address: text(business.address),
      licenses: business.licenses.map(text).filter(Boolean),
    },
    policies: Object.fromEntries(POLICY_KEYS.map((key) => [key, text(policies[key])])),
  };
}

// Policies are drafted in metadata.policies and go live only when the merchant
// publishes them: publishing copies the five texts to metadata.policiesPublished.
// The storefront and the release gate read the published copy, never the draft.
export type PublishedPolicies = { publishedAt: string; policies: StorePolicies };

export function readPublishedPolicies(metadata: unknown): PublishedPolicies | null {
  const published = asObject(asObject(metadata).policiesPublished);
  const publishedAt = text(published.publishedAt);
  if (!publishedAt) return null;
  const policies = asObject(published.policies);
  return {
    publishedAt,
    policies: Object.fromEntries(POLICY_KEYS.map((key) => [key, text(policies[key])])) as StorePolicies,
  };
}

export function livePolicies(metadata: unknown): StorePolicies {
  return (
    readPublishedPolicies(metadata)?.policies ??
    (Object.fromEntries(POLICY_KEYS.map((key) => [key, ''])) as StorePolicies)
  );
}

export function policiesHaveUnpublishedChanges(metadata: unknown): boolean {
  const live = livePolicies(metadata);
  const draft = readStorePolicies(metadata);
  return POLICY_KEYS.some((key) => live[key] !== draft[key]);
}

export const MIN_POLICY_LENGTH = 40;

// Problems that stop a save or a publish, keyed to the form label.
export function validateStoreInfo(business: StoreBusiness, policies: StorePolicies): string[] {
  const errors: string[] = [];
  const email = text(business.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Contact email is not a valid address');
  const phone = text(business.phone);
  if (phone && (phone.replace(/\D/g, '').length < 10 || !/^[+\d\s().-]+$/.test(phone))) {
    errors.push('Contact phone needs at least 10 digits');
  }
  for (const page of POLICY_PAGES) {
    const body = text(policies[page.key]);
    if (body && body.length < MIN_POLICY_LENGTH) {
      errors.push(`${page.title} is too short to be a policy (minimum ${MIN_POLICY_LENGTH} characters)`);
    }
  }
  return errors;
}

// Drafts that cannot be published yet (blank or too short).
export function missingPolicies(metadata: unknown): string[] {
  const draft = readStorePolicies(metadata);
  return POLICY_PAGES.filter((page) => draft[page.key].length < MIN_POLICY_LENGTH).map((page) => page.title);
}

export function publishPolicies(metadata: unknown, now = new Date()): Record<string, unknown> {
  const draft = readStorePolicies(metadata);
  return {
    ...asObject(metadata),
    policiesPublished: { publishedAt: now.toISOString(), policies: draft },
  };
}

// What a regulated store must publish before it can sell. Empty means the
// store is blocked: a fresh store with no data can never sell.
export function missingStoreInfo(metadata: unknown): string[] {
  const business = readStoreBusiness(metadata);
  const live = livePolicies(metadata);
  return [
    ...(business.legalName ? [] : ['Legal name']),
    ...(business.licenses.length ? [] : ['Licence numbers']),
    ...POLICY_PAGES.filter((page) => !live[page.key]).map((page) => `${page.title} (not published)`),
  ];
}
