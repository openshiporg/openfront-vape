import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import { productSpecs } from "@/features/storefront/lib/util/vape-specs"
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
  const category = product.productCategories?.[0]?.title
  const hasRange = (product.productVariants?.length || 0) > 1 &&
    new Set((product.productVariants || []).map((v: any) => v.prices?.[0]?.calculatedPrice?.calculatedAmount)).size > 1

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group block" data-testid="product-wrapper">
      <div className="flex flex-col gap-3">
        <div className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
          <Thumbnail
            thumbnail={productPreview.thumbnail}
            size="square"
            isFeatured={isFeatured}
            title={product.title}
            kicker={category}
            specs={specs}
          />
        </div>
        <div className="flex flex-col gap-1 px-0.5">
          <h3 className="text-[15px] leading-[20px] font-medium text-vp-ink" data-testid="product-title">
            {productPreview.title}
          </h3>
          <div className="flex items-baseline justify-between gap-2">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} region={region} from={hasRange} />
            ) : (
              <span className="text-[13px] text-vp-ink-3">Unavailable</span>
            )}
            {(product.productVariants?.length || 0) > 1 && (
              <span className="font-vp-mono text-[11px] text-vp-ink-3">{product.productVariants.length} options</span>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
