'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState';

export function ProfileSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams?.get('search') || '');

  return (
    <form
      role="search"
      className="relative w-full sm:max-w-xs"
      onSubmit={event => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams?.toString());
        if (value.trim()) params.set('search', value.trim());
        else params.delete('search');
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Search profiles"
        placeholder="Search"
        value={value}
        onChange={event => setValue(event.target.value)}
        className="h-10 rounded-full pl-9"
      />
    </form>
  );
}

export function ProfileEmpty({ filtered }: { filtered: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <PlatformEmptyState
      title={filtered ? 'No matching profiles' : 'No merchant profiles'}
      onReset={filtered ? () => router.push(pathname || '/dashboard/platform/merchant-profiles') : undefined}
    />
  );
}
