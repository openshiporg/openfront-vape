import { Metadata } from "next"

import PasswordReset from "@/features/storefront/modules/account/components/password-reset"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your account password.",
}

type Props = {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>
}

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) || undefined

export async function AccountResetPage(props: Props) {
  const searchParams = await props.searchParams
  return <PasswordReset token={first(searchParams.token)} email={first(searchParams.email)} />
}
