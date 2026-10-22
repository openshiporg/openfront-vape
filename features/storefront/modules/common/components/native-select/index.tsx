import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

export type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    { placeholder = "Select...", defaultValue, className, children, ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div>
        <div
          onFocus={() => innerRef.current?.focus()}
          onBlur={() => innerRef.current?.blur()}
          className={cn(
            "relative flex h-12 items-center rounded-[14px] border border-vp-line bg-vp-surface text-[16px] text-vp-ink transition-colors hover:border-vp-ink-3 focus-within:border-vp-accent sm:text-[15px]",
            className,
            {
              "text-vp-ink-3": isPlaceholder,
            }
          )}
        >
          <select
            ref={innerRef}
            defaultValue={defaultValue}
            {...props}
            className="h-full flex-1 appearance-none border-none bg-transparent pl-4 pr-10 outline-none"
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-vp-ink-3">
            <ChevronsUpDown className="h-4 w-4" />
          </span>
        </div>
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect
