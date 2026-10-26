import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonClass, pillClass, trackClass } from '@/features/platform/components/vape-primitives';

export type LinkOption = { key: string; label: string; href: string; active: boolean; count?: number };

/** Underline tab row as links, for server-rendered option groups: hairline under the row, current choice underlined in ink. */
export function LinkTrack({ label, options, className }: { label: string; options: LinkOption[]; className?: string }) {
  return (
    <nav aria-label={label} className={cn(trackClass, className)}>
      {options.map(option => (
        <Link
          key={option.key}
          href={option.href}
          scroll={false}
          data-active={option.active}
          aria-current={option.active ? 'page' : undefined}
          className={pillClass}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="text-[11px] tabular-nums text-muted-foreground">{option.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export const outLinkClass =
  'inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline';

export function OrderLink({ order, cartId }: { order?: { id: string; displayId?: number | null } | null; cartId?: string | null }) {
  if (order?.id) {
    return (
      <Link href={`/dashboard/platform/orders/${order.id}`} className={outLinkClass}>
        Order {order.displayId ? `#${order.displayId}` : order.id.slice(-6)}
        <ArrowUpRight className="size-3" />
      </Link>
    );
  }
  if (cartId) return <span className="font-mono text-xs text-muted-foreground">Cart {cartId.slice(-6)}</span>;
  return null;
}

export function Pager({ page, count, pageSize, href }: { page: number; count: number; pageSize: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return null;
  const linkClass = cn(buttonClass.base, buttonClass.outline);
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {page} / {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className={linkClass}>Previous</Link>}
        {page < pages && <Link href={href(page + 1)} className={linkClass}>Next</Link>}
      </div>
    </div>
  );
}
