"use client"

import React from "react"

import { onlyUnique } from "../../../../lib/util/only-unique"
import { displayOptionValue } from "@/features/storefront/lib/util/vape-specs"
import { isColourOption, swatchFill } from "@/features/storefront/modules/common/components/deneb/facts"
import { cn } from "@/lib/utils"

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

  const colour = isColourOption(title)

  // Deneb: label at left, choices at right. Colours show a swatch beside the name; other
  // options are outlined buttons. The choice handler is unchanged.
  // An option left without values in the dashboard has nothing to choose.
  if (!values.length) return null

  return (
    <div className="deneb-option" data-testid={dataTestId} role="group" aria-label={title}>
      <span className="deneb-option-label">{title}</span>
      <div className="deneb-option-values">
        {values.map((v) => {
          const active = current === v
          const fill = colour ? swatchFill(v) : null
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              data-active={active}
              disabled={disabled}
              onClick={() => updateOption({ [option.id]: v })}
              className={cn(colour ? "deneb-swatch-choice" : "deneb-choice", isNumeric && "tabular-nums")}
              data-testid="option-button"
            >
              {colour && (
                <span className="deneb-swatch-ring" aria-hidden="true">
                  <span style={{ background: fill || "#d9dce0" }} />
                </span>
              )}
              <span>{displayOptionValue(v)}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}

export default OptionSelect;
