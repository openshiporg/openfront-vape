import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import { productFacts, productSpecs } from "@/features/storefront/lib/util/vape-specs"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { retrievePricedProductById } from "@/features/storefront/lib/data/products"

import { StoreRegion } from "@/features/storefront/types/storefront";

interface ProductPreviewProps {
  productPreview: {
    id: string
    handle: string
    thumbnail: any
    title: string
  }
  isFeatured?: boolean
  region: StoreRegion;
}

export default async function ProductPreview({
  productPreview,
  isFeatured,
  region
}: ProductPreviewProps) {
  const product = await retrievePricedProductById({
    id: productPreview.id,
    regionId: region.id,
  }).then((response) => response.product)

  if (!product) {
    return null
  }

  const firstVariantId = product.productVariants?.[0]?.id || null
  const { cheapestPrice } = getProductPrice({
    product,
    variantId: firstVariantId,
    region,
  })
  const specs = productSpecs(product, 2)
  const facts = productFacts(product, 3)
  const category = product.productCategories?.[0]?.title
  const hasRange = (product.productVariants?.length || 0) > 1 &&
    new Set((product.productVariants || []).map((v: any) => v.prices?.[0]?.calculatedPrice?.calculatedAmount)).size > 1

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group block h-full" data-testid="product-wrapper">
      <div className="flex h-full flex-col gap-3">
        <Thumbnail
          thumbnail={productPreview.thumbnail}
          size="square"
          isFeatured={isFeatured}
          title={product.title}
          kicker={category}
          specs={specs}
          className="ring-1 ring-vp-line transition-shadow duration-150 group-hover:ring-vp-ink"
        />
        <div className="flex flex-1 flex-col gap-2">
          <h3
            className="text-[15px] leading-[20px] font-semibold text-vp-ink underline-offset-4 group-hover:underline"
            data-testid="product-title"
          >
            {productPreview.title}
          </h3>
          <dl className="mt-auto border-t border-vp-line text-[12px] leading-[16px]">
            {facts.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-3 border-b border-vp-line py-1.5">
                <dt className="shrink-0 text-vp-ink-2">{f.label}</dt>
                <dd className="min-w-0 truncate text-right font-vp-mono text-vp-ink">{f.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 py-1.5">
              <dt className="shrink-0 text-vp-ink-2">Price</dt>
              <dd className="min-w-0 text-right">
                {cheapestPrice ? (
                  <PreviewPrice price={cheapestPrice} region={region} from={hasRange} />
                ) : (
                  <span className="text-[13px] text-vp-ink-2">Unavailable</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
