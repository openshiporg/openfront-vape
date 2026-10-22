"use client"

import { SegmentedButton, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import { LOGIN_VIEW } from "@/features/storefront/modules/account/templates/login-template"

// "Sign in" / "Create account" switch at the top of both auth views.
export default function AuthSwitch({
  current,
  setCurrentView,
  testIds = {},
}: {
  current: LOGIN_VIEW
  setCurrentView: (view: LOGIN_VIEW) => void
  testIds?: Partial<Record<LOGIN_VIEW, string>>
}) {
  return (
    <SegmentedTrack label="Account access" stretch>
      <SegmentedButton
        active={current === LOGIN_VIEW.SIGN_IN}
        onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        className="min-h-11"
        data-testid={testIds[LOGIN_VIEW.SIGN_IN]}
      >
        Sign in
      </SegmentedButton>
      <SegmentedButton
        active={current === LOGIN_VIEW.REGISTER}
        onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
        className="min-h-11"
        data-testid={testIds[LOGIN_VIEW.REGISTER]}
      >
        Create account
      </SegmentedButton>
    </SegmentedTrack>
  )
}
