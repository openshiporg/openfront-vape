import { cn } from "@/lib/utils"

const Divider = ({ className }: { className?: string }) => (
  <div
    role="separator"
    className={cn("h-px w-full bg-vp-line", className)}
  />
)

export default Divider
