import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  className?: string
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  className,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className={cn("inline-flex min-h-11 gap-x-1.5 items-center group text-vp-ink", className)}
      href={href}
      onClick={onClick}
      {...props}
    >
      <span className="text-[14px] font-medium underline decoration-vp-line underline-offset-4 group-hover:decoration-vp-ink">{children}</span>
      <ArrowUpRight className="h-4 w-4 text-vp-accent transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
