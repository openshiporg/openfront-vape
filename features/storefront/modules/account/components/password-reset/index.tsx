"use client"

import { useActionState } from "react"

import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { Field, primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"
import {
  redeemPasswordReset,
  requestPasswordReset,
  type PasswordResetState,
} from "@/features/storefront/lib/data/user"

const initialState: PasswordResetState = { status: "idle", error: null }

const titleClass = "text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink"
const bodyClass = "text-[15px] leading-[22px] text-vp-ink-2"
const linkClass = "font-medium text-vp-ink underline underline-offset-4"

const SignInLink = ({ label = "Back to sign in" }: { label?: string }) => (
  <LocalizedClientLink href="/account" className={`${linkClass} inline-flex min-h-11 items-center text-[14px]`} data-testid="reset-sign-in-link">
    {label}
  </LocalizedClientLink>
)

function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState)

  if (state.status === "sent") {
    return (
      <>
        <h1 className={titleClass}>Check your email</h1>
        <p className={bodyClass} role="status" data-testid="reset-link-sent">
          If that email has an account, a reset link is on its way.
        </p>
        <SignInLink />
      </>
    )
  }

  return (
    <>
      <h1 className={titleClass}>Reset password</h1>
      <form className="flex w-full flex-col gap-4" action={formAction}>
        <Field
          label="Email"
          id="reset-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          data-testid="reset-email-input"
        />
        <ErrorMessage error={state.error} data-testid="reset-error" />
        <SubmitButton className={`${primaryButtonClass} w-full`} data-testid="reset-request-button">
          Send reset link
        </SubmitButton>
      </form>
      <SignInLink />
    </>
  )
}

function RedeemResetForm({ token, email }: { token: string; email?: string }) {
  const [state, formAction] = useActionState(redeemPasswordReset, initialState)

  if (state.status === "reset") {
    return (
      <>
        <h1 className={titleClass}>Password updated</h1>
        <p className={bodyClass} role="status" data-testid="reset-complete">
          Sign in with your new password.
        </p>
        <LocalizedClientLink href="/account" className={`${primaryButtonClass} w-full`} data-testid="reset-sign-in-link">
          Sign in
        </LocalizedClientLink>
      </>
    )
  }

  return (
    <>
      <h1 className={titleClass}>Choose a new password</h1>
      <form className="flex w-full flex-col gap-4" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <Field
          label="Email"
          id="reset-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={email}
          required
          data-testid="reset-email-input"
        />
        <Field
          label="New password"
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          data-testid="reset-password-input"
        />
        <ErrorMessage error={state.error} data-testid="reset-error" />
        <SubmitButton className={`${primaryButtonClass} w-full`} data-testid="reset-submit-button">
          Update password
        </SubmitButton>
      </form>
      <LocalizedClientLink href="/account/reset" className={`${linkClass} inline-flex min-h-11 items-center text-[14px]`}>
        Request a new link
      </LocalizedClientLink>
    </>
  )
}

const PasswordReset = ({ token, email }: { token?: string; email?: string }) => (
  <div className="flex w-full max-w-[400px] flex-col gap-6" data-testid="password-reset-page">
    {token ? <RedeemResetForm token={token} email={email} /> : <RequestResetForm />}
  </div>
)

export default PasswordReset
