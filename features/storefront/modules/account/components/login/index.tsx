"use client"

import { login } from "@/features/storefront/lib/data/user"
import { LOGIN_VIEW } from "@/features/storefront/modules/account/templates/login-template"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import AuthSwitch from "@/features/storefront/modules/account/components/auth-switch"
import { fieldClass, labelClass, primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6" data-testid="login-page">
      <AuthSwitch
        current={LOGIN_VIEW.SIGN_IN}
        setCurrentView={setCurrentView}
        testIds={{ [LOGIN_VIEW.REGISTER]: "register-button" }}
      />
      <h1 className="text-[32px] leading-[36px] font-semibold tracking-[-0.025em] text-vp-ink">Sign in</h1>
      <form className="flex w-full flex-col gap-4" action={formAction}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            inputMode="email"
            required
            data-testid="email-input"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={isVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              data-testid="password-input"
              className={`${fieldClass} pe-12`}
            />
            <button
              className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-[14px] text-vp-ink-3 outline-none hover:text-vp-ink focus-visible:text-vp-ink"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              tabIndex={-1}
            >
              {isVisible ? <EyeOffIcon size={18} aria-hidden="true" /> : <EyeIcon size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="-mt-2 flex justify-end">
          <LocalizedClientLink
            href="/account/reset"
            className="inline-flex min-h-11 items-center text-[13px] font-medium text-vp-ink-2 underline decoration-vp-line underline-offset-4 hover:text-vp-ink"
            data-testid="forgot-password-link"
          >
            Forgot password
          </LocalizedClientLink>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className={`${primaryButtonClass} mt-2 w-full`}>
          Sign in
        </SubmitButton>
      </form>
    </div>
  )
}

export default Login
