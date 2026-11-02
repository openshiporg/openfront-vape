import { LOGO_ICONS } from "@/features/platform/store-settings/lib/icon-registry"
import { storeOwnMark } from "./store-mark"

// Untitled UI marks are drawn in #155eef (hue 221) and tinted with hue-rotate.
const REGISTRY_BASE_HUE = 221

// The mark onboarding saves to Store Settings: AlphaWave from the registry, rotated to teal.
export const VAPE_LOGO_ICON_ID = "alphawave"
export const VAPE_LOGO_COLOR = "317"
export const VAPE_LOGO_ICON =
  LOGO_ICONS.find((icon) => icon.id === VAPE_LOGO_ICON_ID)?.lightSvg ?? LOGO_ICONS[0].lightSvg

type BrandSource = { logoIcon?: string | null; logoColor?: string | null } | null | undefined

export function storeBrand(store: BrandSource) {
  // The saved mark always shows beside the name; with none saved the platform default icon stands in.
  const logoSvg = storeOwnMark(store?.logoIcon)
  const rotation = store?.logoIcon ? Number.parseFloat(store?.logoColor || "0") : Number.parseFloat(VAPE_LOGO_COLOR)
  const safeRotation = Number.isFinite(rotation) ? rotation : 0
  const hue = (((REGISTRY_BASE_HUE + safeRotation) % 360) + 360) % 360

  return { logoSvg, logoColor: String(safeRotation), hue: Math.round(hue) }
}
