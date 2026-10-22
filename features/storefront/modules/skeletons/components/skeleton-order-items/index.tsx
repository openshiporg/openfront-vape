import repeat from "@/features/storefront/lib/util/repeat"
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item"

const SkeletonOrderItems = () => {
  return (
    <div className="vp-band divide-y divide-vp-line">
      {repeat(3).map((i) => (
        <SkeletonLineItem key={i} compact />
      ))}
    </div>
  )
}

export default SkeletonOrderItems
