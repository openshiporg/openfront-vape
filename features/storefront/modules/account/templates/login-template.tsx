"use client"

import { useState } from "react"

import Register from "@/features/storefront/modules/account/components/register"
import Login from "@/features/storefront/modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

export type PublishedPolicies = { privacy: boolean; terms: boolean }

const LoginTemplate = ({
  publishedPolicies = { privacy: false, terms: false },
}: {
  publishedPolicies?: PublishedPolicies
}) => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="flex w-full justify-center">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} publishedPolicies={publishedPolicies} />
      )}
    </div>
  )
}

export default LoginTemplate
