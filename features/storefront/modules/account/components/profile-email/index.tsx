"use client"

import React, { useEffect, useActionState } from "react";

import { Field } from "@/features/storefront/modules/account/components/account-ui"

import AccountInfo from "../account-info"
import { updateCustomerEmail } from "@/features/storefront/lib/data/user" // Added import

type MyInformationProps = {
  customer: any
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // Removed placeholder function

  const [state, formAction] = useActionState(updateCustomerEmail, {
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
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Email"
        currentInfo={`${customer.email}`}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-email-editor"
      >
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Email"
            id="profile-email"
            name="email"
            inputMode="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={customer.email}
            data-testid="email-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
