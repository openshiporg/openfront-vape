const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-[4px] bg-vp-well" />
      <div className="mt-3 h-4 w-3/4 rounded-[2px] bg-vp-well" />
      <div className="mt-3 flex flex-col border-t border-vp-line">
        <div className="flex justify-between border-b border-vp-line py-2">
          <span className="h-3 w-14 rounded-[2px] bg-vp-well" />
          <span className="h-3 w-12 rounded-[2px] bg-vp-well" />
        </div>
        <div className="flex justify-between py-2">
          <span className="h-3 w-10 rounded-[2px] bg-vp-well" />
          <span className="h-3 w-16 rounded-[2px] bg-vp-well" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
