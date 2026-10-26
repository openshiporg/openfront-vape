const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col animate-pulse">
      {header && <div className="mb-5 h-5 w-28 rounded-[4px] bg-vp-well"></div>}
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-24 rounded-[4px] bg-vp-well"></div>
            <div className="h-3 w-16 rounded-[4px] bg-vp-well"></div>
          </div>
        ))}
      </div>
      <div className="my-4 h-px w-full bg-vp-line"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded-[4px] bg-vp-well"></div>
        <div className="h-6 w-24 rounded-[4px] bg-vp-well"></div>
      </div>
    </div>
  )
}

export default SkeletonCartTotals
