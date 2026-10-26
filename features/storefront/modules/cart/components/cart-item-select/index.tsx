"use client"

import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  InputHTMLAttributes,
} from "react"

type CartItemSelectProps = {
  min?: number
  max?: number
  step?: number
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">

const CartItemSelect = forwardRef<HTMLInputElement, CartItemSelectProps>(
  ({ className, min = 1, max = 10, step = 1, value: controlledValue, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<number | undefined>(
      typeof controlledValue === "number" ? controlledValue : Number(controlledValue)
    )

    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    useEffect(() => {
      if (typeof controlledValue === "number") {
        setValue(controlledValue)
      } else if (controlledValue !== undefined) {
        const parsed = Number(controlledValue)
        if (!isNaN(parsed)) setValue(parsed)
      }
    }, [controlledValue])

    const notifyChange = useCallback((newValue: number) => {
      if (onChange) {
        const event = {
          target: { value: String(newValue) }
        } as unknown as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }, [onChange])

    const handleIncrement = useCallback(() => {
      const newValue = value === undefined ? step : Math.min((value ?? 0) + step, max)
      setValue(newValue)
      notifyChange(newValue)
    }, [value, step, max, notifyChange])

    const handleDecrement = useCallback(() => {
      const newValue = value === undefined ? step : Math.max((value ?? 0) - step, min)
      setValue(newValue)
      notifyChange(newValue)
    }, [value, step, min, notifyChange])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (!isNaN(newValue)) {
        setValue(newValue)
        if (onChange) {
          onChange(e)
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === innerRef.current) {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          handleIncrement()
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          handleDecrement()
        }
      }
    }

    useEffect(() => {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleIncrement, handleDecrement])

    return (
      <div
        className={cn(
          "inline-flex h-11 items-center rounded-[4px] border border-vp-line bg-vp-surface",
          className
        )}
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-[4px] text-vp-ink transition-colors hover:bg-vp-well disabled:text-vp-ink-3 disabled:hover:bg-transparent"
          onClick={handleDecrement}
          disabled={value !== undefined && value <= min}
        >
          <Minus className="size-4" />
        </button>
        <input
          ref={innerRef}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          onChange={handleInputChange}
          aria-label="Quantity"
          className="h-full w-9 min-w-0 bg-transparent text-center font-vp-mono text-[15px] text-vp-ink outline-none [appearance:textfield] focus-visible:rounded-[4px] focus-visible:ring-2 focus-visible:ring-vp-accent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...props}
        />
        <button
          type="button"
          aria-label="Increase quantity"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-[4px] text-vp-ink transition-colors hover:bg-vp-well disabled:text-vp-ink-3 disabled:hover:bg-transparent"
          onClick={handleIncrement}
          disabled={value !== undefined && value >= max}
        >
          <Plus className="size-4" />
        </button>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
