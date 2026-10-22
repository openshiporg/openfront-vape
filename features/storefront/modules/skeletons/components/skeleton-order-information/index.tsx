import SkeletonCartTotals from "@/features/storefront/modules/skeletons/components/skeleton-cart-totals"

const Block = () => (
  <div className="flex flex-col gap-2">
    <div className="h-3 w-20 rounded-full bg-vp-well"></div>
    <div className="h-3 w-3/4 rounded-full bg-vp-well"></div>
    <div className="h-3 w-1/2 rounded-full bg-vp-well"></div>
  </div>
)

const SkeletonOrderInformation = () => {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="grid grid-cols-1 gap-6 border-t border-vp-line pt-6 sm:grid-cols-3">
        <Block />
        <Block />
        <Block />
      </div>
      <div className="rounded-[22px] border border-vp-line bg-vp-surface p-5 sm:p-6">
        <SkeletonCartTotals />
      </div>
    </div>
  )
}

export default SkeletonOrderInformation
