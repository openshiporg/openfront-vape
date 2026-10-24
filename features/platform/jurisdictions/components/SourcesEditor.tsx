'use client';

import { Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { Source } from '../lib/shared';

/** Rows of title + URL, used for authority sources and policy citations. */
export function SourcesEditor({ id, label, titleLabel, value, onChange, disabled }: {
  id: string;
  label: string;
  titleLabel: string;
  value: Source[];
  onChange: (value: Source[]) => void;
  disabled?: boolean;
}) {
  const set = (index: number, patch: Partial<Source>) =>
    onChange(value.map((source, position) => (position === index ? { ...source, ...patch } : source)));

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs text-muted-foreground">{label}</legend>
      {value.map((source, index) => (
        <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <Input
            id={`${id}-title-${index}`}
            aria-label={`${titleLabel} ${index + 1}`}
            placeholder={titleLabel}
            value={source.title}
            disabled={disabled}
            onChange={event => set(index, { title: event.target.value })}
          />
          <Input
            id={`${id}-url-${index}`}
            aria-label={`URL ${index + 1}`}
            placeholder="URL"
            type="url"
            className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto"
            value={source.url}
            disabled={disabled}
            onChange={event => set(index, { url: event.target.value })}
          />
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${index + 1}`}
              onClick={() => onChange(value.filter((_, position) => position !== index))}
              className="col-start-2 row-start-1 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:col-start-auto sm:row-start-auto"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ))}
      {value.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
      {!disabled && (
        <button
          type="button"
          onClick={() => onChange([...value, { title: '', url: '' }])}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-[13px] font-medium text-foreground hover:bg-muted/70"
        >
          <Plus className="size-3.5" />
          Add
        </button>
      )}
    </fieldset>
  );
}
