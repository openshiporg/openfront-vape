import { getProductsList } from "../../../../lib/data/products"
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
  product: ProductForRelated; // Use defined type
  countryCode: string;
};

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region: StoreRegion | null = await getRegion(countryCode) // Add type for region

  if (!region) {
    return null
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
    <section className="py-10 sm:py-14">
      <div className="mb-6 flex items-baseline gap-3 border-t border-vp-line pt-5">
        <h2 className="vp-sign text-[30px] text-vp-ink">Related</h2>
        <span className="font-vp-mono text-[12px] text-vp-ink-3">{Math.min(filteredProducts.length, 4)}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {filteredProducts.slice(0, 4).map((productPreview: ProductPreviewType) => (
          <li key={productPreview.id}>
            <ProductPreview region={region} productPreview={productPreview} />
          </li>
        ))}
      </ul>
    </section>
  )
}
