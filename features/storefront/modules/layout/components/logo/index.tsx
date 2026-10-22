import { cn } from '@/lib/utils';
import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link';
import { getStore } from '@/features/storefront/lib/data/store';
import { storeBrand } from '@/features/storefront/lib/vape-brand';

export function LogoMark({ svg, color, className }: { svg: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ filter: `hue-rotate(${color}deg)` }}
      className={cn('block shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full', className)}
    />
  );
}

export default async function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const store = await getStore();
  const storeName = store?.name || 'Store';
  const { logoSvg, logoColor } = storeBrand(store);

  return (
    <LocalizedClientLink
      href="/"
      className="group inline-flex min-h-11 items-center gap-2.5 text-vp-ink"
      data-testid="nav-store-link"
    >
      <LogoMark svg={logoSvg} color={logoColor} className={size === 'lg' ? 'size-8' : 'size-6'} />
      <span
        className={cn(
          'font-semibold tracking-[-0.02em] leading-none',
          size === 'lg' ? 'text-[22px]' : 'text-[17px]'
        )}
      >
        {storeName}
      </span>
    </LocalizedClientLink>
  );
}
