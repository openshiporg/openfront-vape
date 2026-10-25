import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import React, { useId } from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  const id = useId()

  return (
    <div className="flex min-h-11 items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        name={name}
        data-testid={dataTestId}
        className="size-5 rounded-[6px] border-vp-ink-3 bg-vp-surface shadow-none data-[state=checked]:border-vp-ink data-[state=checked]:bg-vp-ink data-[state=checked]:text-vp-on-ink focus-visible:ring-vp-tint"
      />
      <Label htmlFor={id} className="cursor-pointer text-[14px] font-normal leading-[20px] text-vp-ink">
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
