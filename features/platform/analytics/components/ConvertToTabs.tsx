"use client";

import { useId } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Pill, Track } from "@/features/platform/components/vape-ui";

interface ConvertToTabsProps {
  // Lowercase currency codes used by the store's regions.
  currencies: string[];
  value: string;
}

export function ConvertToTabs({ currencies, value }: ConvertToTabsProps) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  
  const convertTo = value;

  const handleConvertToChange = (currency: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('currency', currency);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Track label="Convert to">
      {currencies.map((code) => (
        <Pill
          key={code}
          id={`${id}-${code}`}
          active={convertTo === code}
          onClick={() => handleConvertToChange(code)}
          className="font-mono"
        >
          {code.toUpperCase()}
        </Pill>
      ))}
    </Track>
  );
}
