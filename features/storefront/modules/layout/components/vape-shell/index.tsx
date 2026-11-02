import type { CSSProperties, ReactNode } from "react"
import { cookies } from "next/headers"

import { getStore } from "@/features/storefront/lib/data/store"
import { storeBrand } from "@/features/storefront/lib/vape-brand"
import AgeGate from "../age-gate"
import NicotineWarning from "../nicotine-warning"
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
      <NicotineWarning store={store} />
      {store?.demoCatalogue && (
        <p className="bg-vp-surface px-4 py-1.5 text-center text-[12px] leading-[16px] text-vp-ink-2 sm:text-[13px]" role="note" data-testid="demo-catalogue-note">
          Demo catalogue. Products are display only and nothing here is for sale.
        </p>
      )}
      {children}
      <AgeGate storeName={store?.name || "Store"} confirmed={ageConfirmed} />
    </div>
  )
}
