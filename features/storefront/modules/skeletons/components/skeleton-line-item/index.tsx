const SkeletonLineItem = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div className={compact ? "grid grid-cols-[56px_1fr] gap-x-3 p-3 animate-pulse" : "grid grid-cols-[72px_1fr] gap-x-3 p-3 animate-pulse sm:grid-cols-[96px_1fr] sm:gap-x-4 sm:p-4"}>
      <div className="aspect-square w-full rounded-[14px] bg-vp-line/70" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-36 rounded-full bg-vp-line/70" />
          <div className="h-3 w-20 rounded-full bg-vp-line/70" />
          {!compact && <div className="mt-2 h-11 w-[130px] rounded-full bg-vp-line/70" />}
        </div>
        <div className="h-4 w-14 rounded-full bg-vp-line/70" />
      </div>
    </div>
  )
}

export default SkeletonLineItem
