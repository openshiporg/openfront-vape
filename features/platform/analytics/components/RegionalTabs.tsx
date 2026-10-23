'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Pill, Track } from '@/features/platform/components/vape-ui';
import { Region } from '../lib/analyticsHelpers';

interface RegionalTabsProps {
  regions: Region[];
  selectedRegion?: string;
  className?: string;
}

export function RegionalTabs({ regions, selectedRegion, className }: RegionalTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const handleRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'all') {
      // The page defaults the conversion currency to the store's first.
      params.delete('region');
    } else {
      params.set('region', value);
      // Remove currency conversion when selecting specific region
      params.delete('currency');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentTab = selectedRegion || 'all';

  return (
    <div className={`flex min-w-0 items-center gap-4 ${className}`}>
      <Track label="Region">
        <Pill active={currentTab === 'all'} onClick={() => handleRegionChange('all')}>
          All regions
        </Pill>
        {regions.map((region) => (
          <Pill
            key={region.code}
            active={currentTab === region.code}
            onClick={() => handleRegionChange(region.code)}
          >
            {region.name}
          </Pill>
        ))}
      </Track>
    </div>
  );
}
