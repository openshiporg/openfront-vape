'use client';

import { useRouter } from 'next/navigation';

import { PlatformEmptyState } from '@/features/platform/components/PlatformEmptyState';

/** Empty state for server-rendered lists; offers a reset when a filter is applied. */
export function FilteredEmpty({ title, resetHref }: { title: string; resetHref?: string }) {
  const router = useRouter();
  return <PlatformEmptyState title={title} onReset={resetHref ? () => router.push(resetHref) : undefined} />;
}
