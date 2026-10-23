import React from "react"
import { ChevronDown } from "lucide-react"

import { vpInput } from "@/features/storefront/modules/common/components/vp-classes"
import { US_STATES } from "@/features/storefront/lib/util/us-states"
import { cn } from "@/lib/utils"

// Required state picker for US checkout addresses. The value is the two-letter
// USPS code the compliance engine expects.
const StateSelect = ({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { "data-testid"?: string }) => (
  <div className={cn("relative", className)}>
    <select
      aria-label="State"
      required
      {...props}
      className={cn(vpInput, "appearance-none pr-10", !props.value && "text-vp-ink-3")}
    >
      <option value="" disabled>
        State
      </option>
      {US_STATES.map((state) => (
        <option key={state.code} value={state.code} className="text-vp-ink">
          {state.name}
        </option>
      ))}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-vp-ink-3"
    />
  </div>
)

export default StateSelect
