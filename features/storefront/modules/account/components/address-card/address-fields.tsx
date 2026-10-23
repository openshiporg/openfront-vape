"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

import CountrySelect from "@/features/storefront/modules/checkout/components/country-select"
import { Field, FieldFrame, SelectField } from "@/features/storefront/modules/account/components/account-ui"
import { US_STATES, isUsCountry, toUsStateCode } from "@/features/storefront/lib/util/us-states"
import { cn } from "@/lib/utils"

type AddressDefaults = {
  first_name?: string
  last_name?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
  is_billing?: boolean
}

// Field set shared by the add and edit address dialogs. Names and test ids
// match the server actions and existing tests.
export function AddressFields({
  region,
  idPrefix,
  defaults = {},
}: {
  region: any
  idPrefix: string
  defaults?: AddressDefaults
}) {
  const id = (n: string) => `${idPrefix}-${n}`
  const [country, setCountry] = useState<string>(defaults.country_code || "")
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="First name"
        id={id("first-name")}
        name="first_name"
        defaultValue={defaults.first_name}
        required
        autoComplete="given-name"
        data-testid="first-name-input"
      />
      <Field
        label="Last name"
        id={id("last-name")}
        name="last_name"
        defaultValue={defaults.last_name}
        required
        autoComplete="family-name"
        data-testid="last-name-input"
      />
      <div className="sm:col-span-2">
        <Field
          label="Company"
          id={id("company")}
          name="company"
          defaultValue={defaults.company}
          autoComplete="organization"
          data-testid="company-input"
        />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Address"
          id={id("address-1")}
          name="address_1"
          defaultValue={defaults.address_1}
          required
          autoComplete="address-line1"
          data-testid="address-1-input"
        />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Apartment, suite, etc."
          id={id("address-2")}
          name="address_2"
          defaultValue={defaults.address_2}
          autoComplete="address-line2"
          data-testid="address-2-input"
        />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="City"
          id={id("city")}
          name="city"
          defaultValue={defaults.city}
          required
          autoComplete="address-level2"
          data-testid="city-input"
        />
      </div>
      {isUsCountry(country) ? (
        <SelectField
          key="us-state"
          label="State"
          id={id("province")}
          name="province"
          defaultValue={toUsStateCode(defaults.province)}
          required
          autoComplete="address-level1"
          data-testid="state-input"
        >
          <option value="" disabled>
            Choose a state
          </option>
          {US_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </SelectField>
      ) : (
        <Field
          key="province-text"
          label="State / Province"
          id={id("province")}
          name="province"
          defaultValue={defaults.province}
          autoComplete="address-level1"
          data-testid="state-input"
        />
      )}
      <Field
        label="ZIP / Postal code"
        id={id("postal-code")}
        name="postal_code"
        defaultValue={defaults.postal_code}
        required
        autoComplete="postal-code"
        data-testid="postal-code-input"
      />
      <div className="sm:col-span-2">
        <FieldFrame label="Country">
          <CountrySelect
            region={region}
            name="country_code"
            required
            autoComplete="country"
            defaultValue={defaults.country_code}
            onChange={(e) => setCountry(e.target.value)}
            data-testid="country-select"
          />
        </FieldFrame>
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Phone"
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaults.phone}
          autoComplete="tel"
          data-testid="phone-input"
        />
      </div>
      <label
        htmlFor={id("is-billing")}
        className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2"
        data-testid="billing-label"
      >
        <Checkbox
          id={id("is-billing")}
          name="is_billing"
          value="true"
          defaultChecked={!!defaults.is_billing}
          className="size-5 rounded-[6px] border-vp-line bg-vp-surface data-[state=checked]:border-vp-ink data-[state=checked]:bg-vp-ink"
          data-testid="billing-checkbox"
        />
        <span className="text-[14px] text-vp-ink">Default billing address</span>
      </label>
    </div>
  )
}

// Sheet-like dialog frame in the storefront palette.
export function AddressDialogContent({
  title,
  children,
  className,
  "data-testid": dataTestId,
}: {
  title: string
  children: React.ReactNode
  className?: string
  "data-testid"?: string
}) {
  return (
    <DialogContent
      data-testid={dataTestId}
      aria-describedby={undefined}
      className={cn(
        "vape-sf flex max-h-[92dvh] w-[calc(100%-32px)] flex-col gap-0 overflow-y-auto rounded-[22px] border-vp-line bg-vp-bg p-0 text-vp-ink sm:max-w-xl [&>button:last-child]:hidden",
        className
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-vp-bg px-5 pt-5 pb-3">
        <DialogTitle className="text-[20px] leading-[26px] font-semibold tracking-[-0.02em]">{title}</DialogTitle>
        <DialogClose
          className="inline-flex size-11 items-center justify-center rounded-full bg-vp-well text-vp-ink-2 hover:text-vp-ink"
          data-testid="close-modal-button"
        >
          <X size={18} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </DialogContent>
  )
}
