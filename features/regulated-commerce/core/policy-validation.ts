import { REGULATED_CATEGORIES, type Rule } from './decision-types';

const categories = new Set<string>(REGULATED_CATEGORIES);
const nonEmptyStrings = (value: unknown) => Array.isArray(value) && value.length > 0 && value.every(entry => typeof entry === 'string' && entry.trim());

export function validateRules(value: unknown): { valid: boolean; errors: string[]; rules: Rule[] } {
  if (!Array.isArray(value) || value.length === 0) return { valid: false, errors: ['At least one rule is required'], rules: [] };
  const errors: string[] = [];
  const ids = new Set<string>();
  value.forEach((candidate, index) => {
    const rule: any = candidate;
    const prefix = `Rule ${index + 1}`;
    if (!rule || typeof rule !== 'object' || typeof rule.id !== 'string' || !rule.id.trim()) {
      errors.push(`${prefix} requires an ID`); return;
    }
    if (ids.has(rule.id)) errors.push(`${prefix} has a duplicate ID`);
    ids.add(rule.id);
    switch (rule.type) {
      case 'minimum_age':
        if (!Number.isSafeInteger(rule.value) || rule.value < 18 || rule.value > 120) errors.push(`${prefix} has an invalid minimum age`);
        break;
      case 'category_prohibition':
        if (!nonEmptyStrings(rule.categories) || !rule.categories.every((entry: string) => categories.has(entry))) errors.push(`${prefix} has invalid categories`);
        break;
      case 'flavor_prohibition':
        if (!nonEmptyStrings(rule.flavors)) errors.push(`${prefix} requires flavors`);
        break;
      case 'directory_required':
        if (typeof rule.authority !== 'string' || !rule.authority.trim()) errors.push(`${prefix} requires an authority`);
        break;
      case 'license_required':
        if (!nonEmptyStrings(rule.licenseTypes)) errors.push(`${prefix} requires license types`);
        break;
      case 'quantity_limit':
        if (!categories.has(rule.category) || !Number.isSafeInteger(rule.maxUnits) || rule.maxUnits <= 0) errors.push(`${prefix} has an invalid quantity limit`);
        break;
      case 'adult_signature_required':
        if (!Number.isSafeInteger(rule.minimumAge) || rule.minimumAge < 18 || rule.minimumAge > 120) errors.push(`${prefix} has an invalid signature age`);
        break;
      case 'package_marking':
        if (!nonEmptyStrings(rule.markings)) errors.push(`${prefix} requires markings`);
        break;
      case 'marketing_restriction':
        if (!nonEmptyStrings(rule.restrictedClaims)) errors.push(`${prefix} requires restricted claims`);
        break;
      default:
        errors.push(`${prefix} has an unsupported type`);
    }
  });
  return { valid: errors.length === 0, errors, rules: errors.length ? [] : value as Rule[] };
}
