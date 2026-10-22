"use client"

import React, { useEffect, useActionState } from "react";

import { Field } from "@/features/storefront/modules/account/components/account-ui"

import AccountInfo from "../account-info"
import { updateCustomerName } from "@/features/storefront/lib/data/user" // Added import

type MyInformationProps = {
  customer: any
}

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // Removed placeholder function

  const [state, formAction] = useActionState(updateCustomerName, {
    error: null, // Initialize error as null
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full overflow-visible">
      <AccountInfo
        label="Name"
        
        currentInfo={[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Not set"}
        isSuccess={successState}
        isError={!!state?.error}
        clearState={clearState}
        data-testid="account-name-editor"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            id="profile-first-name"
            name="firstName"
            required
            defaultValue={customer.firstName ?? ""} 
            data-testid="first-name-input"
          />
          <Field
            label="Last name"
            id="profile-last-name"
            name="lastName"
            required
            defaultValue={customer.lastName ?? ""} 
            data-testid="last-name-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileName
