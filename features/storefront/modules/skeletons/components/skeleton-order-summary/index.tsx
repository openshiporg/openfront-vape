import SkeletonButton from "@/features/storefront/modules/skeletons/components/skeleton-button"
import SkeletonCartTotals from "@/features/storefront/modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderSummary = () => {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonCartTotals />
      <SkeletonButton />
    </div>
  )
}

export default SkeletonOrderSummary
