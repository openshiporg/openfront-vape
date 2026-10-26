'use client';

import { useRouter } from 'next/navigation';

export type LinkSelectOption = { key: string; label: string; href: string; active: boolean; count?: number };

/** Compact select that navigates to the chosen option's URL; folds a filter group into one control. */
export function LinkSelect({ label, options, className }: { label: string; options: LinkSelectOption[]; className?: string }) {
  const router = useRouter();
  const current = options.find(option => option.active) ?? options[0];
  return (
    <label className={`inline-flex min-w-0 items-center gap-2 ${className ?? ''}`}>
      <span className="shrink-0 text-[12px] font-medium text-muted-foreground">{label}</span>
      <select
        aria-label={label}
        value={current?.key}
        onChange={event => {
          const next = options.find(option => option.key === event.target.value);
          if (next) router.push(next.href, { scroll: false });
        }}
        className="h-8 min-w-0 max-w-full rounded-[4px] border border-input bg-background px-2 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-ring max-sm:h-10"
      >
        {options.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
