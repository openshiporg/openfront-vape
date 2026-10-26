import repeat from "@/features/storefront/lib/util/repeat"
import SkeletonProductPreview from "@/features/storefront/modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="py-10 sm:py-14">
      <div className="mb-6 border-t border-vp-line pt-5">
        <div className="h-7 w-32 animate-pulse rounded-[4px] bg-vp-well" />
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {repeat(4).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
