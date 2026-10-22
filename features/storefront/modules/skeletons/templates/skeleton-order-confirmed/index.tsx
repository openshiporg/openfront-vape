import SkeletonOrderConfirmedHeader from "@/features/storefront/modules/skeletons/components/skeleton-order-confirmed-header"
import SkeletonOrderInformation from "@/features/storefront/modules/skeletons/components/skeleton-order-information"
import SkeletonOrderItems from "@/features/storefront/modules/skeletons/components/skeleton-order-items"

const SkeletonOrderConfirmed = () => {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12" aria-busy="true">
      <SkeletonOrderConfirmedHeader />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="animate-pulse">
          <SkeletonOrderItems />
        </div>
        <SkeletonOrderInformation />
      </div>
    </div>
  )
}

export default SkeletonOrderConfirmed
