import { Metadata } from "next"
import type { StorefrontCustomerProfile, StorefrontRegionBasic } from '@/features/storefront/types'

import ProfilePhone from "@/features/storefront/modules/account/components/profile-phone"
import ProfileBillingAddress from "@/features/storefront/modules/account/components/profile-billing-address"
import ProfileEmail from "@/features/storefront/modules/account/components/profile-email"
import ProfileName from "@/features/storefront/modules/account/components/profile-name"
import { AccountPageHeader } from "@/features/storefront/modules/account/components/account-ui"

import { notFound } from "next/navigation"
import { listRegions } from "@/features/storefront/lib/data/regions"
import { getUser } from "@/features/storefront/lib/data/user"

export const metadata: Metadata = {
  title: "Profile",
  description: "Name, email, phone and billing address.",
}

export async function AccountProfilePage() {
  const customer: StorefrontCustomerProfile | null = await getUser()
  const { regions }: { regions: StorefrontRegionBasic[] | null } = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <AccountPageHeader title="Profile" />
      <div className="vp-band flex w-full flex-col divide-y divide-vp-line">
        <ProfileName customer={customer} />
        <ProfileEmail customer={customer} />
        <ProfilePhone customer={customer} />
        {/* <ProfilePassword customer={customer} /> */}
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}
