// Client-safe types and helpers for the jurisdictions and policies slice.

import { REGULATED_CATEGORIES, type Rule } from '@/features/regulated-commerce/core/decision-types';
import type { DotTone } from '@/features/platform/components/vape-primitives';

export type Source = { title: string; url: string };

export type JurisdictionRow = {
  id: string;
  code: string;
  name: string;
  level: string;
  status: string;
  parent: { id: string; code: string } | null;
  sourceCount: number;
  ruleSetCount: number;
  activeRuleSetCount: number;
  inForce: boolean;
};

export type RuleSetRecord = {
  id: string;
  packName: string;
  version: string;
  policyHash: string;
  status: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  approvedAt: string | null;
  reviewer: string | null;
  hasSignature: boolean;
  authorityCitations: Source[];
  rules: unknown[];
  createdAt: string | null;
};

export type JurisdictionDetail = {
  id: string;
  code: string;
  name: string;
  level: string;
  status: string;
  parent: { id: string; code: string; name: string } | null;
  children: Array<{ id: string; code: string; name: string; status: string }>;
  postalScope: string[];
  authoritySources: Source[];
  createdAt: string | null;
  updatedAt: string | null;
  ruleSets: RuleSetRecord[];
  licenses: Array<{
    id: string;
    licenseType: string;
    licenseNumber: string;
    issuingAuthority: string;
    status: string;
    expiresAt: string | null;
    profile: { id: string; legalName: string } | null;
  }>;
  authorizations: Array<{
    id: string;
    authority: string;
    authorizationType: string;
    authorizationIdentifier: string;
    status: string;
    expiresAt: string | null;
    product: { id: string; title: string } | null;
  }>;
};

export type JurisdictionInput = {
  code: string;
  name: string;
  level: string;
  parentId: string;
  postalScope: string;
  authoritySources: Source[];
};

export type RuleSetInput = {
  packName: string;
  version: string;
  effectiveAt: string;
  expiresAt: string;
  authorityCitations: Source[];
  rules: unknown;
};

export const JURISDICTION_TONES: Record<string, DotTone> = { draft: 'muted', active: 'ok', retired: 'warn' };
export const RULE_SET_TONES: Record<string, DotTone> = {
  draft: 'muted',
  approved: 'info',
  active: 'ok',
  retired: 'warn',
  emergency_disabled: 'danger',
};

/** Same test the readiness query uses: active and inside its effective dates. */
export function ruleSetInForce(ruleSet: { status: string; effectiveAt: string | null; expiresAt: string | null }, now = Date.now()) {
  if (ruleSet.status !== 'active') return false;
  const from = ruleSet.effectiveAt ? new Date(ruleSet.effectiveAt).getTime() : NaN;
  const to = ruleSet.expiresAt ? new Date(ruleSet.expiresAt).getTime() : NaN;
  return from <= now && to > now;
}

export function cleanSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(entry => {
      if (typeof entry === 'string') return { title: entry, url: '' };
      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        return {
          title: String(record.title ?? record.name ?? record.citation ?? record.reference ?? ''),
          url: String(record.url ?? ''),
        };
      }
      return { title: '', url: '' };
    })
    .filter(entry => entry.title.trim() || entry.url.trim());
}

export const formatDay = (value: string | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

/** Suggest the next version label: bump the last number, or append ".1". */
export function nextVersion(version: string) {
  const match = version.match(/^(.*?)(\d+)(\D*)$/);
  if (!match) return `${version}.1`;
  return `${match[1]}${Number(match[2]) + 1}${match[3]}`;
}

// Rules editor rows. Text lists stay as typed until serialised.

export const RULE_TYPES = [
  'minimum_age',
  'category_prohibition',
  'flavor_prohibition',
  'directory_required',
  'license_required',
  'quantity_limit',
  'adult_signature_required',
  'package_marking',
  'marketing_restriction',
] as const;

export type RuleType = (typeof RULE_TYPES)[number];

export type RuleDraft = {
  key: string;
  id: string;
  type: RuleType;
  number: string;
  categories: string[];
  category: string;
  list: string;
  authority: string;
};

const LIST_FIELD: Partial<Record<RuleType, string>> = {
  flavor_prohibition: 'flavors',
  license_required: 'licenseTypes',
  package_marking: 'markings',
  marketing_restriction: 'restrictedClaims',
};

const NUMBER_FIELD: Partial<Record<RuleType, string>> = {
  minimum_age: 'value',
  quantity_limit: 'maxUnits',
  adult_signature_required: 'minimumAge',
};

let counter = 0;
const key = () => `rule-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function newRuleDraft(type: RuleType, existing: RuleDraft[]): RuleDraft {
  const ids = new Set(existing.map(rule => rule.id));
  let index = 1;
  while (ids.has(`${type}-${index}`)) index += 1;
  return {
    key: key(),
    id: `${type}-${index}`,
    type,
    number: type === 'minimum_age' || type === 'adult_signature_required' ? '21' : '',
    categories: [],
    category: REGULATED_CATEGORIES[0],
    list: '',
    authority: '',
  };
}

const splitList = (value: string) => value.split(',').map(entry => entry.trim()).filter(Boolean);
const toNumber = (value: string) => (value.trim() === '' ? NaN : Number(value.trim()));

export function serialiseRules(drafts: RuleDraft[]): Rule[] {
  return drafts.map(draft => {
    const rule: Record<string, unknown> = { id: draft.id.trim(), type: draft.type };
    const numberField = NUMBER_FIELD[draft.type];
    const listField = LIST_FIELD[draft.type];
    if (numberField) rule[numberField] = toNumber(draft.number);
    if (listField) rule[listField] = splitList(draft.list);
    if (draft.type === 'category_prohibition') rule.categories = draft.categories;
    if (draft.type === 'quantity_limit') rule.category = draft.category;
    if (draft.type === 'directory_required') rule.authority = draft.authority.trim();
    return rule as Rule;
  });
}

/** Rules JSON back into editor rows; returns an error for anything the editor cannot show. */
export function rulesToDrafts(value: unknown): { drafts: RuleDraft[]; error: string } {
  if (!Array.isArray(value)) return { drafts: [], error: 'Rules must be a JSON array' };
  const drafts: RuleDraft[] = [];
  for (const [index, candidate] of value.entries()) {
    const rule = candidate as Record<string, any>;
    if (!rule || typeof rule !== 'object' || !RULE_TYPES.includes(rule.type)) {
      return { drafts: [], error: `Rule ${index + 1} has an unsupported type` };
    }
    const type = rule.type as RuleType;
    const numberField = NUMBER_FIELD[type];
    const listField = LIST_FIELD[type];
    drafts.push({
      key: key(),
      id: typeof rule.id === 'string' ? rule.id : '',
      type,
      number: numberField && rule[numberField] !== undefined && rule[numberField] !== null ? String(rule[numberField]) : '',
      categories: Array.isArray(rule.categories) ? rule.categories.map(String) : [],
      category: typeof rule.category === 'string' ? rule.category : REGULATED_CATEGORIES[0],
      list: listField && Array.isArray(rule[listField]) ? rule[listField].join(', ') : '',
      authority: typeof rule.authority === 'string' ? rule.authority : '',
    });
  }
  return { drafts, error: '' };
}
