import React from "react"

import AccountNav from "../components/account-nav"

type CustomerInfoForLayout = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

interface AccountLayoutProps {
  customer: CustomerInfoForLayout | null;
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  if (!customer) {
    return (
      <div className="flex-1" data-testid="account-page">
        <div className="mx-auto flex w-full max-w-[1320px] justify-center px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
          {children}
        </div>
      </div>
    )
  }

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ")

  return (
    <div className="flex-1" data-testid="account-page">
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <header className="flex flex-col gap-2">
          <h1 className="break-words vp-sign text-[44px] text-vp-ink sm:text-[64px]">
            {name || customer.email || "Account"}
          </h1>
        </header>
        <div className="mt-6 border-b border-vp-line pb-5">
          <AccountNav customer={customer} />
        </div>
        <div className="mt-8 min-w-0">{children}</div>
      </div>
    </div>
  )
}

export default AccountLayout
