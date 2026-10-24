'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Checks, Field, Options, selectClass, textareaClass } from '@/features/platform/components/compliance-form';
import { Pill, Track } from '@/features/platform/components/vape-primitives';
import { CLASSIFICATION_CATEGORY_LABELS, RULE_TYPE_LABELS } from '@/features/keystone/regulated/labels';
import { validateRules } from '@/features/regulated-commerce/core/policy-validation';
import { RULE_TYPES, newRuleDraft, rulesToDrafts, serialiseRules, type RuleDraft, type RuleType } from '../lib/shared';

export type RulesState = { mode: 'rows' | 'json'; drafts: RuleDraft[]; text: string };

export function initialRulesState(rules: unknown[]): RulesState {
  const parsed = rulesToDrafts(rules);
  if (parsed.error) return { mode: 'json', drafts: [], text: JSON.stringify(rules, null, 2) };
  return { mode: 'rows', drafts: parsed.drafts, text: '' };
}

/** The rules value to submit, or a parse error from the JSON view. */
export function currentRules(state: RulesState): { rules: unknown; error: string } {
  if (state.mode === 'rows') return { rules: serialiseRules(state.drafts), error: '' };
  try {
    return { rules: JSON.parse(state.text || '[]'), error: '' };
  } catch {
    return { rules: null, error: 'Rules JSON is not valid JSON' };
  }
}

export function rulesErrors(state: RulesState): string[] {
  const current = currentRules(state);
  if (current.error) return [current.error];
  return validateRules(current.rules).errors;
}

const CATEGORY_OPTIONS = Object.entries(CLASSIFICATION_CATEGORY_LABELS);

const LIST_LABEL: Partial<Record<RuleType, string>> = {
  flavor_prohibition: 'Prohibited flavors (comma separated)',
  license_required: 'License types (comma separated)',
  package_marking: 'Required markings (comma separated)',
  marketing_restriction: 'Restricted claims (comma separated)',
};

const NUMBER_LABEL: Partial<Record<RuleType, string>> = {
  minimum_age: 'Minimum age',
  quantity_limit: 'Max units per order',
  adult_signature_required: 'Signature minimum age',
};

function RuleRow({ draft, index, onChange, onRemove, disabled }: {
  draft: RuleDraft;
  index: number;
  onChange: (patch: Partial<RuleDraft>) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const prefix = `rule-${draft.key}`;
  return (
    <div className="space-y-3 px-3 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          <span className="mr-2 font-mono text-xs text-muted-foreground">{index + 1}</span>
          {RULE_TYPE_LABELS[draft.type] || draft.type}
        </span>
        {!disabled && (
          <button
            type="button"
            aria-label={`Remove rule ${index + 1}`}
            onClick={onRemove}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`${prefix}-id`} label="Rule ID">
          <Input id={`${prefix}-id`} className="font-mono" disabled={disabled} value={draft.id} onChange={event => onChange({ id: event.target.value })} />
        </Field>
        {NUMBER_LABEL[draft.type] && (
          <Field id={`${prefix}-number`} label={NUMBER_LABEL[draft.type]!}>
            <Input
              id={`${prefix}-number`}
              type="number"
              inputMode="numeric"
              min={draft.type === 'quantity_limit' ? 1 : 18}
              max={draft.type === 'quantity_limit' ? undefined : 120}
              step={1}
              disabled={disabled}
              value={draft.number}
              onChange={event => onChange({ number: event.target.value })}
            />
          </Field>
        )}
        {draft.type === 'quantity_limit' && (
          <Field id={`${prefix}-category`} label="Product type">
            <Options id={`${prefix}-category`} labels={CLASSIFICATION_CATEGORY_LABELS} value={draft.category} disabled={disabled} onChange={category => onChange({ category })} />
          </Field>
        )}
        {draft.type === 'directory_required' && (
          <Field id={`${prefix}-authority`} label="Directory authority">
            <Input id={`${prefix}-authority`} disabled={disabled} value={draft.authority} onChange={event => onChange({ authority: event.target.value })} />
          </Field>
        )}
      </div>
      {draft.type === 'category_prohibition' && (
        disabled ? (
          <p className="text-sm text-foreground">{draft.categories.map(category => CLASSIFICATION_CATEGORY_LABELS[category] || category).join(', ') || 'None'}</p>
        ) : (
          <Checks label="Prohibited product types" options={CATEGORY_OPTIONS} value={draft.categories} onChange={categories => onChange({ categories })} />
        )
      )}
      {LIST_LABEL[draft.type] && (
        <Field id={`${prefix}-list`} label={LIST_LABEL[draft.type]!}>
          <Input id={`${prefix}-list`} disabled={disabled} value={draft.list} onChange={event => onChange({ list: event.target.value })} />
        </Field>
      )}
    </div>
  );
}

export function RulesEditor({ value, onChange, disabled }: {
  value: RulesState;
  onChange: (value: RulesState) => void;
  disabled?: boolean;
}) {
  const [addType, setAddType] = useState<RuleType>('minimum_age');
  const [switchError, setSwitchError] = useState('');
  const errors = useMemo(() => rulesErrors(value), [value]);
  const setDrafts = (drafts: RuleDraft[]) => onChange({ ...value, drafts });

  const toJson = () => {
    setSwitchError('');
    if (value.mode === 'json') return;
    onChange({ mode: 'json', drafts: value.drafts, text: JSON.stringify(serialiseRules(value.drafts), null, 2) });
  };
  const toRows = () => {
    if (value.mode === 'rows') return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(value.text || '[]');
    } catch {
      setSwitchError('Rules JSON is not valid JSON');
      return;
    }
    const result = rulesToDrafts(parsed);
    if (result.error) { setSwitchError(result.error); return; }
    setSwitchError('');
    onChange({ mode: 'rows', drafts: result.drafts, text: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Track label="Rules view">
          <Pill active={value.mode === 'rows'} onClick={toRows}>Rules</Pill>
          <Pill active={value.mode === 'json'} onClick={toJson}>JSON</Pill>
        </Track>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {value.mode === 'rows' ? `${value.drafts.length} rules` : 'Raw'}
        </span>
      </div>

      {value.mode === 'rows' ? (
        <>
          <div className="divide-y divide-border rounded-xl bg-muted/40 ring-1 ring-inset ring-border/60">
            {value.drafts.map((draft, index) => (
              <RuleRow
                key={draft.key}
                draft={draft}
                index={index}
                disabled={disabled}
                onChange={patch => setDrafts(value.drafts.map(item => (item.key === draft.key ? { ...item, ...patch } : item)))}
                onRemove={() => setDrafts(value.drafts.filter(item => item.key !== draft.key))}
              />
            ))}
            {value.drafts.length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">No rules</p>}
          </div>
          {!disabled && (
            <div className="flex gap-2">
              <select aria-label="Rule type" className={selectClass} value={addType} onChange={event => setAddType(event.target.value as RuleType)}>
                {RULE_TYPES.map(type => <option key={type} value={type}>{RULE_TYPE_LABELS[type] || type}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setDrafts([...value.drafts, newRuleDraft(addType, value.drafts)])}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-muted px-4 text-[13px] font-medium text-foreground hover:bg-muted/70"
              >
                <Plus className="size-3.5" />
                Add rule
              </button>
            </div>
          )}
        </>
      ) : (
        <textarea
          aria-label="Rules JSON"
          spellCheck={false}
          className={`${textareaClass} min-h-72 font-mono text-xs`}
          disabled={disabled}
          value={value.text}
          onChange={event => onChange({ ...value, text: event.target.value })}
        />
      )}

      {switchError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{switchError}</p>}
      {errors.length > 0 ? (
        <ul className="space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
          {errors.map(error => <li key={error}>{error}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">Rules valid</p>
      )}
    </div>
  );
}
