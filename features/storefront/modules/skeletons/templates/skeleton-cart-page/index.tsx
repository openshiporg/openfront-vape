import repeat from "@/features/storefront/lib/util/repeat"
import SkeletonCartItem from "@/features/storefront/modules/skeletons/components/skeleton-cart-item"
import SkeletonCodeForm from "@/features/storefront/modules/skeletons/components/skeleton-code-form"
import SkeletonOrderSummary from "@/features/storefront/modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12" aria-busy="true">
      <div className="flex items-baseline gap-3 animate-pulse">
        <div className="h-10 w-28 rounded-full bg-vp-well sm:h-14" />
        <div className="h-4 w-14 rounded-full bg-vp-well" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="vp-band divide-y divide-vp-line">
          {repeat(3).map((index) => (
            <SkeletonCartItem key={index} />
          ))}
        </div>
        <div className="flex flex-col gap-6 rounded-[22px] border border-vp-line bg-vp-surface p-5 sm:p-6">
          <SkeletonCodeForm />
          <SkeletonOrderSummary />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
