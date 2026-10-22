"use client"

import React, { useEffect, useActionState } from "react"
import { Field } from "@/features/storefront/modules/account/components/account-ui"
import AccountInfo from "../account-info"
import { updateCustomerPassword } from "@/features/storefront/lib/data/user" // Added import

type MyInformationProps = {
  customer: any
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // Removed placeholder function

  // Added useActionState
  const [state, formAction] = useActionState(updateCustomerPassword, {
    error: null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  // Added useEffect to sync success state
  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form
      action={formAction}
      onReset={() => clearState()}
      className="w-full"
    >
      <AccountInfo
        label="Password"
        currentInfo={
          <span className="font-vp-mono text-vp-ink-2">••••••••</span>
        }
        isSuccess={successState}
        isError={!!state.error} 
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Old password"
            name="oldPassword" 
            required
            type="password"
            data-testid="old-password-input"
          />
          <Field
            label="New password"
            type="password"
            name="newPassword" 
            required
            data-testid="new-password-input"
          />
          <Field
            label="Confirm password"
            type="password"
            name="confirmPassword" 
            required
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
