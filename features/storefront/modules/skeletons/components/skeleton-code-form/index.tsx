const SkeletonCodeForm = () => {
  return (
    <div className="flex w-full flex-col animate-pulse">
      <div className="mb-3 h-4 w-40 rounded-[4px] bg-vp-well"></div>
      <div className="grid grid-cols-[1fr_88px] gap-x-2">
        <div className="h-12 rounded-[4px] bg-vp-well"></div>
        <div className="h-12 rounded-[4px] bg-vp-well"></div>
      </div>
    </div>
  )
}

export default SkeletonCodeForm
