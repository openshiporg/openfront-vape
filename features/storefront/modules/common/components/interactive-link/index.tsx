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
      className={cn("inline-flex min-h-11 gap-x-1 items-center group", className)}
      href={href}
      onClick={onClick}
      {...props}
    >
      <span className="text-sm">{children}</span>
      <ArrowUpRight className="group-hover:rotate-45 ease-in-out duration-150 text-primary h-4 w-4" />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
