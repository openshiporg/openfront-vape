import { Metadata } from "next"
import { notFound } from "next/navigation"

import PrivacySettings from "@/features/storefront/modules/account/components/privacy-settings"
import { AccountPageHeader } from "@/features/storefront/modules/account/components/account-ui"
import { getPrivacyPreferences } from "@/features/storefront/lib/data/privacy"
import { getUser } from "@/features/storefront/lib/data/user"

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy preferences, data export and deletion requests.",
}

export async function AccountPrivacyPage() {
  const customer = await getUser()
  if (!customer) {
    notFound()
  }
  const result = await getPrivacyPreferences()

  return (
    <div className="w-full" data-testid="privacy-page-wrapper">
      <AccountPageHeader title="Privacy" />
      <PrivacySettings
        initialPreferences={result.ok ? result.preferences : null}
        loadError={result.ok ? null : result.error}
      />
    </div>
  )
}
