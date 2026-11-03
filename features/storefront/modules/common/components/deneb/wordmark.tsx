import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { LogoMark } from "@/features/storefront/modules/layout/components/logo"
import { getStore } from "@/features/storefront/lib/data/store"
import { storeBrand } from "@/features/storefront/lib/vape-brand"
import { cn } from "@/lib/utils"

// The store's name from Store Settings, set as a lowercase-free tight grotesque wordmark beside
// its saved mark (unchanged: same registry icon, same hue rotation as everywhere else).
export default async function Wordmark({ tone = "ink", className }: { tone?: "ink" | "light"; className?: string }) {
  const store = await getStore()
  const name = store?.name || "Store"
  const { logoSvg, logoColor } = storeBrand(store)

  return (
    <LocalizedClientLink
      href="/"
      className={cn(
        "deneb-wordmark inline-flex min-h-11 min-w-0 items-center gap-2",
        tone === "light" ? "text-white" : "text-[#16181b]",
        className
      )}
      data-testid="nav-store-link"
    >
      {logoSvg ? <LogoMark svg={logoSvg} color={logoColor} className="size-[0.9em]" /> : null}
      <span className="truncate">{name}</span>
    </LocalizedClientLink>
  )
}
