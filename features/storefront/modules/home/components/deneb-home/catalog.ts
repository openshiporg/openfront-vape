import { getProductByHandle, getProductsList } from "@/features/storefront/lib/data/products"
import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import type { StoreRegion } from "@/features/storefront/types/storefront"
import { mentions } from "@/features/storefront/modules/common/components/deneb/facts"
import { photoTone, type PhotoTone } from "@/features/storefront/modules/common/components/deneb/photo-tone"

export type DenebProduct = {
  id: string
  title: string
  handle: string
  subtitle?: string | null
  thumbnail: string | null
  description: any
  productOptions: any[]
  productVariants: any[]
  productCategories: { id: string; title: string; handle: string }[]
  price: { amount: number; currencyCode: string } | null
  isDevice: boolean
  tone: PhotoTone
}

const isDeviceCategory = (title?: string | null) => /^devices?$|\bdevice|hardware|\bkits?\b|\bmods?\b/i.test(title || "")

// Every published product priced in this region, with the full record (description, options,
// variants, categories) the Deneb layout reads its words and specs from.
export async function denebCatalog(region: StoreRegion, countryCode: string): Promise<DenebProduct[]> {
  const {
    response: { products },
  } = await getProductsList({ countryCode, queryParams: { limit: 60 }, sortBy: { createdAt: "asc" } })

  const full = await Promise.all(
    (products || []).map(async (p: any) => {
      const { product } = await getProductByHandle({ handle: p.handle, regionId: region.id }).catch(() => ({ product: null }))
      if (!product) return null
      const { cheapestPrice } = getProductPrice({ product, region })
      const thumbnail = product.thumbnail || p.thumbnail || null
      const item: DenebProduct = {
        id: product.id,
        title: product.title,
        handle: product.handle,
        subtitle: product.subtitle,
        thumbnail,
        description: product.description,
        productOptions: product.productOptions || [],
        productVariants: product.productVariants || [],
        productCategories: product.productCategories || [],
        price: cheapestPrice
          ? { amount: cheapestPrice.calculatedAmount, currencyCode: cheapestPrice.currencyCode }
          : null,
        isDevice: (product.productCategories || []).some((c: any) => isDeviceCategory(c.title)),
        tone: await photoTone(thumbnail),
      }
      return item
    })
  )

  return full.filter((p): p is DenebProduct => !!p && !!p.price)
}

// The layout's slots, each filled by a rule over the catalog rather than by hand.
// `categoryOrder` is the store's own department order (the nav order).
export function denebSlots(catalog: DenebProduct[], categoryOrder: string[] = []) {
  const byPrice = (a: DenebProduct, b: DenebProduct) => (a.price?.amount ?? 0) - (b.price?.amount ?? 0)
  const devices = catalog.filter((p) => p.isDevice).sort(byPrice)
  // The hero is the shop's entry device: its lowest-priced device (or its lowest-priced product).
  const hero = devices[0] || [...catalog].sort(byPrice)[0] || null
  // Parts made for a device on sale here ("…pods for the Nova Pod Kit"), in the devices' order.
  const deviceIndex = (p: DenebProduct) => devices.findIndex((d) => mentions(p, d))
  const parts = catalog
    .filter((p) => !p.isDevice && deviceIndex(p) >= 0)
    .sort((a, b) => deviceIndex(a) - deviceIndex(b))
  const rank = (p: DenebProduct) => {
    const i = categoryOrder.indexOf(p.productCategories[0]?.id || "")
    return i < 0 ? 999 : i
  }
  const others = catalog
    .filter((p) => !p.isDevice && !parts.includes(p))
    .sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title))
  const refills = [...parts, ...others]
  const phoneGrid = [...devices.filter((d) => d !== hero), ...parts, ...others].slice(0, 4)
  return { hero, devices: devices.slice(0, 3), refills, phoneGrid }
}

export function inStockVariant(product: DenebProduct) {
  const variants = product.productVariants || []
  return (
    variants.find((v: any) => (typeof v.inventoryQuantity !== "number" || v.inventoryQuantity > 0) && v.prices?.length) ||
    null
  )
}
