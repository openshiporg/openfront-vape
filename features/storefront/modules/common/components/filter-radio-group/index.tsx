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

export default function FilterRadioGroup<T extends string>({ title, items, value, handleChange, "data-testid": dataTestId }: FilterRadioGroupProps<T>) {
  return <div className="flex flex-col gap-3">
    <p className="text-xs font-medium leading-5 text-muted-foreground">{title}</p>
    <RadioGroup aria-label={title} data-testid={dataTestId} onValueChange={next => { const item = items.find(item => item.value === next); if (item) handleChange(item.value) }} value={value} className="gap-1 rounded-lg bg-muted p-1">
      {items.map(item => <RadioItem key={item.value} value={item.value} aria-label={item.label}
        className="inline-flex min-h-11 min-w-11 items-center rounded-md px-3 text-left text-sm text-muted-foreground outline-none data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm focus-visible:ring-2 focus-visible:ring-ring">
        {item.label}
      </RadioItem>)}
    </RadioGroup>
  </div>
}
