"use client"

import { submitAgeCheck } from "@/features/storefront/lib/data/compliance"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import StepHeader, { StepFact } from "@/features/storefront/modules/checkout/components/step-header"
import { vpInput, vpLabel, vpPrimaryButton } from "@/features/storefront/modules/common/components/vp-classes"
import { RiLoader2Fill } from "@remixicon/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

type AgeCheckProps = {
  index: number
  done: boolean
  hasShippingMethod: boolean
  shippingName: string
}

// Age check (21+). The date of birth is only used to compute age; the adult
// signature and ID check are completed by the carrier at delivery.
const AgeCheck = ({ index, done, hasShippingMethod, shippingName }: AgeCheckProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const isOpen = searchParams.get("step") === "age"
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [nameMatches, setNameMatches] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const complete = month.length > 0 && day.length > 0 && year.length === 4 && nameMatches

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)
    const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    try {
      const result = await submitAgeCheck(iso, nameMatches)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMonth("")
      setDay("")
      setYear("")
      router.push(pathname + "?step=payment", { scroll: false })
    } finally {
      setIsLoading(false)
    }
  }

  const numeric = (set: (value: string) => void, max: number) => (event: React.ChangeEvent<HTMLInputElement>) =>
    set(event.target.value.replace(/\D/g, "").slice(0, max))

  return (
    <section className="flex flex-col gap-5 border-t border-vp-line pt-5" aria-label="Age check" data-testid="age-check-step">
      <StepHeader
        index={index}
        title="Age check"
        state={isOpen ? "open" : done ? "done" : "todo"}
        onEdit={!isOpen && done ? () => router.push(pathname + "?step=age", { scroll: false }) : undefined}
        editLabel="Edit age check"
        editTestId="edit-age-check-button"
      />
      {isOpen && hasShippingMethod ? (
        <div className="flex flex-col gap-5 pb-2">
          <p className="text-[15px] leading-[22px] text-vp-ink-2">
            You must be 21 or older to order. Adult signature and ID required at delivery.
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className={vpLabel}>Date of birth</legend>
            <div className="grid max-w-sm grid-cols-[1fr_1fr_1.6fr] gap-3">
              <input aria-label="Month" inputMode="numeric" autoComplete="bday-month" placeholder="MM" value={month}
                onChange={numeric(setMonth, 2)} className={cn(vpInput, "text-center")} data-testid="age-check-month" />
              <input aria-label="Day" inputMode="numeric" autoComplete="bday-day" placeholder="DD" value={day}
                onChange={numeric(setDay, 2)} className={cn(vpInput, "text-center")} data-testid="age-check-day" />
              <input aria-label="Year" inputMode="numeric" autoComplete="bday-year" placeholder="YYYY" value={year}
                onChange={numeric(setYear, 4)} className={cn(vpInput, "text-center")} data-testid="age-check-year" />
            </div>
          </fieldset>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-[22px] text-vp-ink">
            <input type="checkbox" checked={nameMatches} onChange={(event) => setNameMatches(event.target.checked)}
              className="mt-[3px] h-[18px] w-[18px] flex-none accent-[var(--vp-ink)]" data-testid="age-check-name-match" />
            <span>
              The name on my government ID matches the shipping name{shippingName ? ` (${shippingName})` : ""}.
            </span>
          </label>
          <div>
            <button type="button" className={cn(vpPrimaryButton, "w-full sm:w-auto sm:px-8")} onClick={handleSubmit}
              disabled={!complete || isLoading} data-testid="submit-age-check-button">
              {isLoading && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
              Continue to payment
            </button>
            <ErrorMessage error={error} data-testid="age-check-error-message" />
          </div>
        </div>
      ) : (
        done && (
          <div className="pb-2">
            <StepFact label="Status">
              <p>Confirmed 21 or older. Adult signature and ID required at delivery.</p>
            </StepFact>
          </div>
        )
      )}
    </section>
  )
}

export default AgeCheck
