import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-vp-line px-4 py-3 sm:px-5">
      <h2 className="text-[14px] leading-[20px] font-medium text-vp-ink">
        Already have an account?
      </h2>
      <LocalizedClientLink
        href="/account"
        data-testid="sign-in-button"
        className="inline-flex min-h-11 flex-none items-center justify-center rounded-full bg-vp-well px-4 text-[14px] font-medium text-vp-ink transition-colors hover:bg-vp-line"
      >
        <LinkStatus />
        Sign in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
