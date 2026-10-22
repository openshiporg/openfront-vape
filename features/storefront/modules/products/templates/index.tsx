import React, { Suspense } from "react"

import ImageGallery from "@/features/storefront/modules/products/components/image-gallery"
import ProductActions from "@/features/storefront/modules/products/components/product-actions"
import ProductTabs from "@/features/storefront/modules/products/components/product-tabs"
import RelatedProducts from "@/features/storefront/modules/products/components/related-products"
import ProductInfo from "@/features/storefront/modules/products/templates/product-info"
import SkeletonRelatedProducts from "@/features/storefront/modules/skeletons/templates/skeleton-related-products"
import { productSpecs } from "@/features/storefront/lib/util/vape-specs"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront"

type ProductTemplateProps = {
  product: StoreProduct
  region: StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const anyProduct = product as any
  const category = anyProduct.productCategories?.[0] || null

  return (
    <>
      <div
        className="mx-auto grid w-full max-w-[1320px] gap-8 px-4 pt-4 pb-10 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
        data-testid="product-container"
      >
        <div className="min-w-0">
          <ImageGallery
            images={anyProduct.productImages || []}
            handle={product.handle}
            region={region}
            title={product.title}
            kicker={category?.title}
            specs={productSpecs(anyProduct)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-32 lg:self-start">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
                category={category}
              />
            }
          >
            <ProductActionsWrapper handle={product.handle} region={region} category={category} />
          </Suspense>
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="mx-auto w-full max-w-[1320px] px-4 sm:px-6"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
