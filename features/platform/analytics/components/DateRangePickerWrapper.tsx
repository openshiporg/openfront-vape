'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DateRangePicker } from './DateRangePicker';

export function DateRangePickerWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const start = searchParams.get('startDate');
  const end = searchParams.get('endDate');
  const defaultValue = start && end && !Number.isNaN(Date.parse(start)) && !Number.isNaN(Date.parse(end))
    ? { from: new Date(start), to: new Date(end) }
    : undefined;

  return (
    <div className="flex items-center justify-end">
      <DateRangePicker
        defaultValue={defaultValue}
        onDateChange={(range) => {
          if (range?.from && range?.to) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('startDate', range.from.toISOString());
            params.set('endDate', range.to.toISOString());
            params.delete('period');
            router.push(`${pathname}?${params.toString()}`);
          }
        }}
      />
    </div>
  );
}