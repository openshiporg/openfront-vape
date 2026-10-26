const SkeletonOrderConfirmedHeader = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-3 w-28 rounded-[4px] bg-vp-well"></div>
      <div className="h-11 w-56 rounded-[4px] bg-vp-well sm:h-14"></div>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="h-10 rounded-[4px] bg-vp-well"></div>
        <div className="h-10 rounded-[4px] bg-vp-well"></div>
        <div className="h-10 rounded-[4px] bg-vp-well"></div>
      </div>
    </div>
  )
}

export default SkeletonOrderConfirmedHeader
