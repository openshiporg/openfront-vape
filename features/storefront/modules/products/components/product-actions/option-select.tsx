"use client"

import React from "react"

import { onlyUnique } from "../../../../lib/util/only-unique"
import { displayOptionValue } from "@/features/storefront/lib/util/vape-specs"
import { SegmentedButton, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"

const SIZE_ORDER = {
  "XXS": 1, "XS": 2, "S": 3, "M": 4, "L": 5, "XL": 6, "XXL": 7, "XXXL": 8
};

type OptionSelectProps = {
  option: any;
  current: string | undefined;
  updateOption: (update: any) => void;
  title: string;
  disabled?: boolean;
  "data-testid"?: string;
};

function numeric(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values: string[] = option.productOptionValues
    .map((v: any) => v.value)
    .filter(onlyUnique)
    .sort((a: string, b: string) => {
      if (title.toLowerCase() === "size") {
        return (SIZE_ORDER[a as keyof typeof SIZE_ORDER] || 999) - (SIZE_ORDER[b as keyof typeof SIZE_ORDER] || 999);
      }
      const na = numeric(a)
      const nb = numeric(b)
      if (na !== null && nb !== null) return na - nb
      return 0;
    });

  const isNumeric = values.every((v) => numeric(v) !== null)

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-vp-ink">{title}</span>
        <span className="font-vp-mono text-[12px] text-vp-ink-2">{current ? displayOptionValue(current) : "Choose"}</span>
      </div>
      <SegmentedTrack label={title} stretch={values.length <= 4} data-testid={dataTestId}>
        {values.map((v) => (
          <SegmentedButton
            key={v}
            active={current === v}
            disabled={disabled}
            onClick={() => updateOption({ [option.id]: v })}
            className={isNumeric ? "font-vp-mono" : undefined}
            data-testid="option-button"
          >
            {displayOptionValue(v)}
          </SegmentedButton>
        ))}
      </SegmentedTrack>
    </div>
  );
}

export default OptionSelect;
