"use client"

import { useActionState } from "react"
import { LOGIN_VIEW, type PublishedPolicies } from "@/features/storefront/modules/account/templates/login-template"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import AuthSwitch from "@/features/storefront/modules/account/components/auth-switch"
import { Field, primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"
import { signUp } from "@/features/storefront/lib/data/user"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  publishedPolicies?: PublishedPolicies
}

const policyLinkClass = "font-medium text-vp-ink underline underline-offset-2"

const Register = ({ setCurrentView, publishedPolicies }: Props) => {
  const [state, formAction] = useActionState(signUp, null)
  const fields = state?.fields
  // Only reference policies the store has actually published.
  const policyLinks = [
    publishedPolicies?.privacy && (
      <LocalizedClientLink key="privacy" href="/policies/privacy" className={policyLinkClass}>
        Privacy Policy
      </LocalizedClientLink>
    ),
    publishedPolicies?.terms && (
      <LocalizedClientLink key="terms" href="/policies/terms" className={policyLinkClass}>
        Terms of Use
      </LocalizedClientLink>
    ),
  ].filter(Boolean)

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6" data-testid="register-page">
      <AuthSwitch current={LOGIN_VIEW.REGISTER} setCurrentView={setCurrentView} />
      <h1 className="vp-sign text-[40px] text-vp-ink">Create account</h1>
      <form className="flex w-full flex-col gap-4" action={formAction}>
        <Field
          label="First name"
          id="register-first-name"
          name="first_name"
          defaultValue={fields?.first_name}
          required
          autoComplete="given-name"
          data-testid="first-name-input"
        />
        <Field
          label="Last name"
          id="register-last-name"
          name="last_name"
          defaultValue={fields?.last_name}
          required
          autoComplete="family-name"
          data-testid="last-name-input"
        />
        <Field
          label="Email"
          id="register-email"
          name="email"
          defaultValue={fields?.email}
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
          defaultValue={fields?.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <Field
          label="Password (10+ characters)"
          id="register-password"
          name="password"
          required
          minLength={10}
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-age-21" className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-medium text-vp-ink">
            <input
              id="register-age-21"
              name="age_21"
              type="checkbox"
              defaultChecked={fields?.age_21}
              required
              data-testid="age-21-checkbox"
              className="size-5 shrink-0 cursor-pointer rounded accent-vp-ink"
            />
            I am 21 or older
          </label>
          <p className="text-[13px] leading-[18px] text-vp-ink-3">ID is verified at checkout.</p>
        </div>
        <ErrorMessage error={state?.error} data-testid="register-error" />
        {policyLinks.length > 0 && (
          <p className="text-[13px] leading-[18px] text-vp-ink-2" data-testid="register-policy-agreement">
            By creating an account you agree to the{" "}
            {policyLinks.length === 2 ? (
              <>
                {policyLinks[0]} and {policyLinks[1]}
              </>
            ) : (
              policyLinks[0]
            )}
            .
          </p>
        )}
        <SubmitButton className={`${primaryButtonClass} w-full`} data-testid="register-button">
          Create account
        </SubmitButton>
      </form>
    </div>
  )
}

export default Register
