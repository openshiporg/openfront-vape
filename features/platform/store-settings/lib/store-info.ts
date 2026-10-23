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

// What a regulated store must publish before it can sell
export function missingStoreInfo(metadata: unknown): string[] {
  const business = readStoreBusiness(metadata);
  const policies = readStorePolicies(metadata);
  return [
    ...(business.legalName ? [] : ['Legal name']),
    ...(business.licenses.length ? [] : ['Licence numbers']),
    ...POLICY_PAGES.filter((page) => !policies[page.key]).map((page) => page.title),
  ];
}
