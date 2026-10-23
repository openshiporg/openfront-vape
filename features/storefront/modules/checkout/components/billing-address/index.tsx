import Input from "@/features/storefront/modules/common/components/input"
import React, { useState } from "react"
import CountrySelect from "../country-select"
import StateSelect from "../state-select"
import { isUsCountry, toUsStateCode } from "@/features/storefront/lib/util/us-states"

const BillingAddress = ({ cart }: { cart: any | null }) => {
  const [formData, setFormData] = useState<any>({
    "billingAddress.firstName": cart?.billingAddress?.firstName || "",
    "billingAddress.lastName": cart?.billingAddress?.lastName || "",
    "billingAddress.address1": cart?.billingAddress?.address1 || "",
    "billingAddress.company": cart?.billingAddress?.company || "",
    "billingAddress.postalCode": cart?.billingAddress?.postalCode || "",
    "billingAddress.city": cart?.billingAddress?.city || "",
    "billingAddress.countryCode": cart?.billingAddress?.country?.iso2 || "", // Corrected field access based on schema
    "billingAddress.province": cart?.billingAddress?.province || "",
    "billingAddress.phone": cart?.billingAddress?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          name="billingAddress.firstName"
          autoComplete="given-name"
          value={formData["billingAddress.firstName"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Last name"
          name="billingAddress.lastName"
          autoComplete="family-name"
          value={formData["billingAddress.lastName"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Address"
          name="billingAddress.address1"
          autoComplete="address-line1"
          value={formData["billingAddress.address1"]}
          onChange={handleChange}
          required
          className="col-span-2 sm:col-span-1"
          data-testid="billing-address-input"
        />
        <Input
          label="Company (optional)"
          className="col-span-2 sm:col-span-1"
          name="billingAddress.company"
          value={formData["billingAddress.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label="City"
          name="billingAddress.city"
          autoComplete="address-level2"
          value={formData["billingAddress.city"]}
          onChange={handleChange}
          required
          data-testid="billing-city-input"
        />
        {isUsCountry(formData["billingAddress.countryCode"]) ? (
          <StateSelect
            name="billingAddress.province"
            autoComplete="address-level1"
            value={toUsStateCode(formData["billingAddress.province"])}
            onChange={handleChange}
            data-testid="billing-province-input"
          />
        ) : (
          <Input
            label="State / Province"
            name="billingAddress.province"
            autoComplete="address-level1"
            value={formData["billingAddress.province"]}
            onChange={handleChange}
            data-testid="billing-province-input"
          />
        )}
        <Input
          label="ZIP / Postal code"
          name="billingAddress.postalCode"
          autoComplete="postal-code"
          value={formData["billingAddress.postalCode"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <CountrySelect
          name="billingAddress.countryCode"
          autoComplete="country"
          region={cart?.region}
          value={formData["billingAddress.countryCode"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        <Input
          label="Phone"
          type="tel"
          className="col-span-2 sm:col-span-1"
          name="billingAddress.phone"
          autoComplete="tel"
          value={formData["billingAddress.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
    </>
  )
}

export default BillingAddress
