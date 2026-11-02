// Display helpers shared by the ledger, reports and overview screens.

import React, { createElement, type ReactNode } from 'react';
import { ViewerTime } from '@/features/dashboard/components/ViewerTime';
import type { DotTone } from '@/features/platform/components/vape-primitives';
import { COMPLIANCE_EVENT_LABELS, REASON_CODE_LABELS } from '@/features/keystone/regulated/labels';

export const ORDERS_PATH = '/dashboard/platform/orders';
export const LEDGER_PATH = '/dashboard/platform/compliance-ledger';
export const REPORTS_PATH = '/dashboard/platform/compliance-reports';

export const PAGE_SIZE = 50;

const titleCase = (value: string) =>
  value.toLowerCase().replaceAll(/[._]/g, ' ').replace(/^\w/, character => character.toUpperCase());

export function reasonLabel(code: string | null | undefined) {
  if (!code) return '';
  return REASON_CODE_LABELS[code] || titleCase(code);
}

export function eventLabel(type: string | null | undefined) {
  if (!type) return '';
  return COMPLIANCE_EVENT_LABELS[type] || titleCase(type);
}

export function label(labels: Record<string, string>, value: string | null | undefined) {
  if (!value) return '';
  return labels[value] || titleCase(value);
}

/** Tone for decision, verification and report states. */
export function stateTone(value: string | null | undefined): DotTone {
  switch (value) {
    case 'allow':
    case 'passed':
    case 'committed':
    case 'accepted':
    case 'submitted':
      return 'ok';
    case 'deny':
    case 'failed':
    case 'rejected':
    case 'revoked':
      return 'danger';
    case 'manual_review':
    case 'pending':
    case 'reviewed':
      return 'warn';
    case 'quoted':
    case 'generated':
      return 'info';
    default:
      return 'muted';
  }
}

/** Viewer zone with a short label; renders after mount so server and client match. */
export function dateTime(value: string | null | undefined): ReactNode {
  if (!value || !Number.isFinite(new Date(value).getTime())) return '';
  return createElement(ViewerTime, { value, style: 'datetime' });
}

export function day(value: string | null | undefined): ReactNode {
  if (!value || !Number.isFinite(new Date(value).getTime())) return '';
  return createElement(ViewerTime, { value, style: 'date' });
}

export function money(amount: number | null | undefined, currency: string | null | undefined) {
  const value = (amount ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'USD').toUpperCase() }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency || ''}`.trim();
  }
}

export const shortId = (id: string | null | undefined) => (id ? id.slice(-6) : '');

/** First value of a `["value"]` filter param, as written by StatusFilter. */
export function filterValue(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const result = typeof first === 'object' && first ? first.value : first;
    return typeof result === 'string' && result ? result : null;
  } catch {
    return null;
  }
}

export function pageNumber(raw: string | string[] | undefined) {
  const value = parseInt(String(Array.isArray(raw) ? raw[0] : raw || '1'), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/** Report periods are half-open; inventory snapshots have no span. */
export function periodText(startsAt: string | null | undefined, endsAt: string | null | undefined): ReactNode {
  if (!startsAt || !endsAt) return '';
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return '';
  if (end <= start) return createElement(React.Fragment, null, 'Snapshot ', dateTime(startsAt));
  return createElement(React.Fragment, null, day(startsAt), ' to ', day(new Date(end - 1).toISOString()));
}
