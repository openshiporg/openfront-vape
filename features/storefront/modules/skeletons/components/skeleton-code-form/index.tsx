const SkeletonCodeForm = () => {
  return (
    <div className="flex w-full flex-col animate-pulse">
      <div className="mb-3 h-4 w-40 rounded-full bg-vp-well"></div>
      <div className="grid grid-cols-[1fr_88px] gap-x-2">
        <div className="h-12 rounded-[14px] bg-vp-well"></div>
        <div className="h-12 rounded-full bg-vp-well"></div>
      </div>
    </div>
  )
}

export default SkeletonCodeForm
