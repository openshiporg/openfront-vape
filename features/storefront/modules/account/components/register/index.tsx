"use client"

import { useActionState } from "react"
import { LOGIN_VIEW } from "@/features/storefront/modules/account/templates/login-template"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import AuthSwitch from "@/features/storefront/modules/account/components/auth-switch"
import { Field, primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"
import { signUp } from "@/features/storefront/lib/data/user"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signUp, null)

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6" data-testid="register-page">
      <AuthSwitch current={LOGIN_VIEW.REGISTER} setCurrentView={setCurrentView} />
      <h1 className="text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink">Create account</h1>
      <form className="flex w-full flex-col gap-4" action={formAction}>
        <Field
          label="First name"
          id="register-first-name"
          name="first_name"
          required
          autoComplete="given-name"
          data-testid="first-name-input"
        />
        <Field
          label="Last name"
          id="register-last-name"
          name="last_name"
          required
          autoComplete="family-name"
          data-testid="last-name-input"
        />
        <Field
          label="Email"
          id="register-email"
          name="email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <Field
          label="Phone"
          id="register-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <Field
          label="Password"
          id="register-password"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />
        <ErrorMessage error={message} data-testid="register-error" />
        <p className="text-[13px] leading-[18px] text-vp-ink-2">
          By creating an account you agree to the{" "}
          <LocalizedClientLink href="/content/privacy-policy" className="font-medium text-vp-ink underline underline-offset-2">
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/content/terms-of-use" className="font-medium text-vp-ink underline underline-offset-2">
            Terms of Use
          </LocalizedClientLink>
          .
        </p>
        <SubmitButton className={`${primaryButtonClass} w-full`} data-testid="register-button">
          Create account
        </SubmitButton>
      </form>
    </div>
  )
}

export default Register
