import Image from "next/image"
import type { CSSProperties } from "react"
import { getProductByHandle, getProductsList } from "../../../../lib/data/products"
import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { formatMoney, mentions } from "@/features/storefront/modules/common/components/deneb/facts"
import { photoTone } from "@/features/storefront/modules/common/components/deneb/photo-tone"
import { getRegion } from "../../../../lib/data/regions"
import ProductPreview from "../product-preview"
// Define ProductPreviewType locally since product-preview doesn't export it
type ProductPreviewType = {
  id: string;
  handle: string;
  title: string;
  thumbnail: string;
}
import { StoreRegion } from "@/features/storefront/types/storefront"

// Define inline types based on schema assumptions
type CollectionInfo = {
  id: string;
  // Add other fields if needed
};

type TagInfo = {
  id: string;
  // Add other fields if needed
};

type ProductForRelated = {
  id: string;
  productCollections?: CollectionInfo[] | null; // Corrected name
  tags?: TagInfo[] | null;
};

// Define type for queryParams based on usage
type ProductListQueryParams = {
  collections?: string[];
  tags?: string[];
  isGiftCard?: boolean;
  // Add other potential query params if known
};

type RelatedProductsProps = {
  product: ProductForRelated & { title?: string; description?: any }; // Use defined type
  countryCode: string;
  /** "works-with": the parts whose own description names this product (beside the buy column). */
  variant?: "related" | "works-with";
};

export default async function RelatedProducts({
  product,
  countryCode,
  variant = "related",
}: RelatedProductsProps) {
  const region: StoreRegion | null = await getRegion(countryCode) // Add type for region

  if (!region) {
    return null
  }

  if (variant === "works-with") {
    return <WorksWith product={product} region={region} countryCode={countryCode} />
  }

  // Define query parameters for related products
  const queryParams: ProductListQueryParams = {} // Use defined type

  // Add collection filter if product has collections
  if (product.productCollections && product.productCollections.length > 0) {
    queryParams.collections = product.productCollections.map((c: CollectionInfo) => c.id) // Use CollectionInfo type
  }

  // Add tag filter if product has tags
  if (product.tags && product.tags.length > 0) {
    queryParams.tags = product.tags.map((t: TagInfo) => t.id) // Use TagInfo type
  }

  // Exclude gift cards
  queryParams.isGiftCard = false

  const { response: { products } } = await getProductsList({ queryParams, countryCode })

  // Filter out the current product from the fetched list
  // Assuming products returned by getProductsList match ProductPreviewType structure
  const filteredProducts = products.filter(
    (responseProduct: ProductPreviewType) => responseProduct.id !== product.id // Use ProductPreviewType
  )

  if (!filteredProducts.length) {
    return null
  }

  return (
    <section className="deneb-related">
      <h2>You may also like</h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {filteredProducts.slice(0, 4).map((productPreview: ProductPreviewType) => (
          <li key={productPreview.id}>
            <ProductPreview region={region} productPreview={productPreview} />
          </li>
        ))}
      </ul>
    </section>
  )
}

// Parts and accessories made for this product: their own descriptions name it
// ("Refillable 2 ml replacement pods for the Nova Pod Kit").
async function WorksWith({
  product,
  region,
  countryCode,
}: {
  product: { id: string; title?: string; description?: any }
  region: StoreRegion
  countryCode: string
}) {
  const {
    response: { products },
  } = await getProductsList({ queryParams: { limit: 60 }, countryCode })
  const candidates = (products || []).filter((p: any) => p.id !== product.id)
  const full = await Promise.all(
    candidates.map((p: any) =>
      getProductByHandle({ handle: p.handle, regionId: region.id })
        .then((r: any) => r.product)
        .catch(() => null)
    )
  )
  const parts = full.filter((p: any) => p && product.title && mentions(p, { title: product.title })).slice(0, 2)
  if (!parts.length) return null

  return (
    <section className="deneb-works" aria-labelledby="deneb-works-title">
      <h2 id="deneb-works-title">Works with</h2>
      <ul>
        {parts.map(async (p: any) => {
          const { cheapestPrice } = getProductPrice({ product: p, region })
          const tone = await photoTone(p.thumbnail)
          return (
            <li key={p.id}>
              <LocalizedClientLink
                href={`/products/${p.handle}`}
                className="deneb-works-item"
                style={{ "--sw-l": tone.left, "--sw-r": tone.right, "--sw-b": tone.bottom } as CSSProperties}
              >
                <span className="deneb-works-photo">
                  {p.thumbnail && <Image src={p.thumbnail} alt="" fill sizes="120px" className="object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="deneb-works-title">{p.title}</span>
                  {cheapestPrice && (
                    <span className="deneb-works-price">
                      {formatMoney(cheapestPrice.calculatedAmount, cheapestPrice.currencyCode, region.locale)}
                    </span>
                  )}
                </span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
