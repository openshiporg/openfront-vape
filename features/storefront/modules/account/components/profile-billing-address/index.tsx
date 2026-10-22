"use client"

import React, { useEffect, useMemo, useActionState } from "react"

import { Field, SelectField } from "@/features/storefront/modules/account/components/account-ui"

import AccountInfo from "../account-info"
import {
  createCustomerAddress, 
  updateCustomerAddress,
} from "@/features/storefront/lib/data/user" 

type MyInformationProps = {
  customer: any
  regions: any[]
}

const ProfileBillingAddress: React.FC<MyInformationProps> = ({
  customer,
  regions,
}) => {
  const regionOptions = useMemo(() => {
    return (
      regions
        // Added explicit any types and updated property access
        ?.map((region: any) => {
          return region.countries?.map((country: any) => ({
            value: country.iso2, 
            label: country.name, 
          }))
        })
        .flat() || []
    )
  }, [regions])

  const [successState, setSuccessState] = React.useState(false)

  // const billingAddress = customer.addresses?.find(
  //   (addr: any) => addr.is_default_billing
  // )
  const billingAddress = customer?.billingAddress

  const initialState: Record<string, any> = {
    isDefaultBilling: true, // This will be sent via hidden input
    // isDefaultShipping: false, // Not needed for billing address actions
    error: false,
    success: false,
  }

  if (billingAddress) {
    initialState.addressId = billingAddress.id
  }

  const [state, formAction] = useActionState(
    
    billingAddress ? updateCustomerAddress : createCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const currentInfo = useMemo(() => {
    if (!billingAddress) {
      return "No billing address"
    }

    const country =
      regionOptions?.find(
        (country) => country?.value === billingAddress.country?.iso2
      )?.label || billingAddress.country?.iso2?.toUpperCase()

    return (
      <div className="flex flex-col" data-testid="current-info">
        <span>
          {billingAddress.firstName} {billingAddress.lastName}
        </span>
        {billingAddress.company && <span className="text-vp-ink-2">{billingAddress.company}</span>}
        <span className="text-vp-ink-2">
          {billingAddress.address1}
          {billingAddress.address2 ? `, ${billingAddress.address2}` : ""}
        </span>
        <span className="text-vp-ink-2">
          {billingAddress.postalCode}, {billingAddress.city}
        </span>
        <span className="text-vp-ink-2">{country}</span>
      </div>
    )
  }, [billingAddress, regionOptions])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      {/* Add hidden input for is_billing */}
      <input type="hidden" name="is_billing" value="true" />
      <input type="hidden" name="addressId" value={billingAddress?.id} />
      <AccountInfo
        label="Billing address"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="account-billing-address-editor"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            id="billing-first-name"
            name="first_name"
            defaultValue={billingAddress?.firstName || undefined}
            required
            autoComplete="billing given-name"
            data-testid="billing-first-name-input"
          />
          <Field
            label="Last name"
            id="billing-last-name"
            name="last_name"
            defaultValue={billingAddress?.lastName || undefined}
            required
            autoComplete="billing family-name"
            data-testid="billing-last-name-input"
          />
          <div className="sm:col-span-2">
            <Field
              label="Company"
              id="billing-company"
              name="company"
              defaultValue={billingAddress?.company || undefined}
              autoComplete="billing organization"
              data-testid="billing-company-input"
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Address"
              id="billing-address-1"
              name="address_1"
              defaultValue={billingAddress?.address1 || undefined}
              required
              autoComplete="billing address-line1"
              data-testid="billing-address-1-input"
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Apartment, suite, etc."
              id="billing-address-2"
              name="address_2"
              defaultValue={billingAddress?.address2 || undefined}
              autoComplete="billing address-line2"
              data-testid="billing-address-2-input"
            />
          </div>
          <Field
            label="Postal code"
            id="billing-postal-code"
            name="postal_code"
            defaultValue={billingAddress?.postalCode || undefined}
            required
            autoComplete="billing postal-code"
            data-testid="billing-postcal-code-input"
          />
          <Field
            label="City"
            id="billing-city"
            name="city"
            defaultValue={billingAddress?.city || undefined}
            required
            autoComplete="billing address-level2"
            data-testid="billing-city-input"
          />
          <Field
            label="Province"
            id="billing-province"
            name="province"
            defaultValue={billingAddress?.province || undefined}
            autoComplete="billing address-level1"
            data-testid="billing-province-input"
          />
          <SelectField
            label="Country"
            id="billing-country-code"
            name="country_code"
            defaultValue={billingAddress?.country?.iso2 || undefined}
            required
            autoComplete="billing country"
            data-testid="billing-country-code-select"
          >
            <option value="">Select</option>
            {regionOptions.map((option, i) => {
              return (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              )
            })}
          </SelectField>
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileBillingAddress
