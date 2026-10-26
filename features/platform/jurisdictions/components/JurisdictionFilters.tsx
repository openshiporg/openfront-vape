'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState';
import { JURISDICTION_LEVEL_LABELS } from '@/features/keystone/regulated/labels';

export function JurisdictionFilters({ level, search }: { level: string; search: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(search);

  useEffect(() => setText(search), [search]);

  const update = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="relative w-full min-w-0 sm:w-64"
        onSubmit={event => {
          event.preventDefault();
          update({ search: text.trim() });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search jurisdictions"
          placeholder="Code or name"
          className="h-10 rounded-[4px] pl-9"
          value={text}
          onChange={event => setText(event.target.value)}
          onBlur={() => text.trim() !== search && update({ search: text.trim() })}
        />
      </form>
      <label className="flex shrink-0 items-center gap-2">
        <span className="text-[12px] font-medium text-muted-foreground">Level</span>
        <select
          aria-label="Level"
          className="h-10 rounded-[4px] border border-input bg-background px-2.5 text-[13px] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          value={level}
          onChange={event => update({ level: event.target.value })}
        >
          <option value="">All levels</option>
          {Object.entries(JURISDICTION_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function NoJurisdictions({ filtered }: { filtered: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <PlatformEmptyState
      title={filtered ? 'No matching jurisdictions' : 'No jurisdictions'}
      onReset={filtered ? () => router.push(pathname || '/dashboard/platform/jurisdictions') : undefined}
    />
  );
}
