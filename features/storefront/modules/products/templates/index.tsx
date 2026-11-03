import React, { Suspense } from "react"

import ImageGallery from "@/features/storefront/modules/products/components/image-gallery"
import ProductActions from "@/features/storefront/modules/products/components/product-actions"
import ProductTabs from "@/features/storefront/modules/products/components/product-tabs"
import RelatedProducts from "@/features/storefront/modules/products/components/related-products"
import ProductInfo from "@/features/storefront/modules/products/templates/product-info"
import SkeletonRelatedProducts from "@/features/storefront/modules/skeletons/templates/skeleton-related-products"
import { productSpecs } from "@/features/storefront/lib/util/vape-specs"
import { photoTone } from "@/features/storefront/modules/common/components/deneb/photo-tone"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront"

type ProductTemplateProps = {
  product: StoreProduct
  region: StoreRegion
  countryCode: string
}

// Deneb product page: the device on its own sweep at left, specs-first buying column at right.
const ProductTemplate = async ({ product, region, countryCode }: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const anyProduct = product as any
  const category = anyProduct.productCategories?.[0] || null
  const firstImage = anyProduct.productImages?.[0]
  const tone = await photoTone(firstImage?.image?.url || firstImage?.imagePath || anyProduct.thumbnail)

  return (
    <>
      <div className="deneb-pdp" data-testid="product-container">
        <div className="deneb-pdp-media min-w-0">
          <ImageGallery
            images={anyProduct.productImages || []}
            handle={product.handle}
            region={region}
            title={product.title}
            kicker={category?.title}
            specs={productSpecs(anyProduct)}
            tone={tone}
          />
        </div>

        <div className="deneb-pdp-buy flex min-w-0 flex-col">
          <Suspense
            fallback={<ProductActions disabled={true} product={product} region={region} category={category} />}
          >
            <ProductActionsWrapper handle={product.handle} region={region} category={category} />
          </Suspense>
          <ProductInfo product={product} />
          <Suspense fallback={null}>
            <RelatedProducts product={product} countryCode={countryCode} variant="works-with" />
          </Suspense>
          <ProductTabs product={product} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1290px] px-4 lg:px-6" data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
