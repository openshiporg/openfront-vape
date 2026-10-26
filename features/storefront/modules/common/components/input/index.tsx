import { Label } from "@/components/ui/label"
import { Input as BaseInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@/features/storefront/modules/common/icons/eye"
import EyeOff from "@/features/storefront/modules/common/icons/eye-off"
import { vpInput, vpLabel } from "@/features/storefront/modules/common/components/vp-classes"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
  placeholder?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, touched, errors, required, topLabel, placeholder, className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className={cn("flex w-full flex-col", className)}>
        {topLabel && (
          <Label className={cn(vpLabel, "mb-2")}>{topLabel}</Label>
        )}
        <div className="relative z-0 flex w-full">
          <BaseInput
            type={inputType}
            name={name}
            placeholder={placeholder || label}
            aria-label={props["aria-label"] || label}
            required={required}
            className={cn(vpInput, type === "password" && "pr-12")}
            {...props}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] text-vp-ink-3 outline-none transition-colors hover:text-vp-ink focus-visible:text-vp-ink"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
