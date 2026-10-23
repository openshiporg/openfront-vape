import { Metadata } from "next"

import LoginTemplate from "@/features/storefront/modules/account/templates/login-template"
import { getStore } from "@/features/storefront/lib/data/store"
import { readStorePolicies } from "@/features/platform/store-settings/lib/store-info"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account.",
}

export async function LoginPage() {
  const store = await getStore()
  const policies = readStorePolicies(store?.metadata)
  return (
    <LoginTemplate
      publishedPolicies={{ privacy: Boolean(policies.privacy), terms: Boolean(policies.terms) }}
    />
  )
}
