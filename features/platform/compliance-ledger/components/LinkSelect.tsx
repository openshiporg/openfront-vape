'use client';

import { useRouter } from 'next/navigation';
import { PickSelect, type PickOption } from '@/features/platform/components/admin-fields'

export type LinkSelectOption = { key: string; label: string; href: string; active: boolean; count?: number };

/** Compact select that navigates to the chosen option's URL; folds a filter group into one control. */
export function LinkSelect({ label, options, className }: { label: string; options: LinkSelectOption[]; className?: string }) {
  const router = useRouter();
  const current = options.find(option => option.active) ?? options[0];
  return (
    <label className={`inline-flex min-w-0 items-center gap-2 ${className ?? ''}`}>
      <span className="shrink-0 text-[12px] font-medium text-muted-foreground">{label}</span>
      <PickSelect
        aria-label={label}
        value={current?.key ?? ''}
        onChange={key => {
          const next = options.find(option => option.key === key);
          if (next) router.push(next.href, { scroll: false });
        }}
        className="h-8 w-auto max-w-full px-2 text-[13px] max-sm:h-10"
        options={options.map((option): PickOption => [option.key, option.count !== undefined ? `${option.label} (${option.count})` : option.label])}
      />
    </label>
  );
}
