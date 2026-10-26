import type { CSSProperties, ReactNode } from "react"
import { cookies } from "next/headers"

import { getStore } from "@/features/storefront/lib/data/store"
import { storeBrand } from "@/features/storefront/lib/vape-brand"
import AgeGate from "../age-gate"
import { AGE_COOKIE } from "../age-gate/constants"
import { BodyTheme } from "./body-theme"
import { vpMono, vpSans, vpSign } from "./fonts"

export default async function VapeShell({ children }: { children: ReactNode }) {
  const [store, cookieStore] = await Promise.all([getStore(), cookies()])
  const ageConfirmed = cookieStore.get(AGE_COOKIE)?.value === "1"
  const { hue } = storeBrand(store)
  const themeClass = `vape-sf ${vpSans.variable} ${vpMono.variable} ${vpSign.variable}`

  return (
    <div
      className={`${themeClass} min-h-screen antialiased`}
      style={{ "--vp-h": hue } as CSSProperties}
    >
      <BodyTheme className={themeClass} hue={hue} />
      {children}
      <AgeGate storeName={store?.name || "Store"} confirmed={ageConfirmed} />
    </div>
  )
}
