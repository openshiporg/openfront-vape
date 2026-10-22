const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-[14px] bg-vp-well" />
      <div className="mt-3 h-4 w-3/4 rounded-full bg-vp-well" />
      <div className="mt-2 h-4 w-1/3 rounded-full bg-vp-well" />
    </div>
  )
}

export default SkeletonProductPreview
