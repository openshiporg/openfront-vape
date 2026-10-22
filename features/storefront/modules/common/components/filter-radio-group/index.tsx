"use client"

import { RadioGroup } from "@/components/ui/radio-group"
import { Item as RadioItem } from "@radix-ui/react-radio-group"

type FilterRadioGroupProps<T extends string> = {
  title: string
  items: readonly { value: T; label: string }[]
  value: T
  handleChange: (value: T) => void
  "data-testid"?: string
}

// Same raised-pill-in-a-track switch as SegmentedTrack, on a Radix radio group.
export default function FilterRadioGroup<T extends string>({ title, items, value, handleChange, "data-testid": dataTestId }: FilterRadioGroupProps<T>) {
  return <div className="flex flex-col gap-2">
    <p className="text-[13px] leading-[18px] font-medium text-vp-ink-2">{title}</p>
    <RadioGroup aria-label={title} data-testid={dataTestId} onValueChange={next => { const item = items.find(item => item.value === next); if (item) handleChange(item.value) }} value={value} className="vp-track no-scrollbar flex max-w-full gap-0.5 overflow-x-auto">
      {items.map(item => <RadioItem key={item.value} value={item.value} aria-label={item.label}
        className="vp-pill min-h-11 data-[state=checked]:bg-vp-surface data-[state=checked]:text-vp-ink data-[state=checked]:shadow-[0_1px_2px_rgb(20_24_22/0.12),0_0_0_0.5px_rgb(20_24_22/0.06)]">
        {item.label}
      </RadioItem>)}
    </RadioGroup>
  </div>
}
