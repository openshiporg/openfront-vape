import { ChevronRight } from "lucide-react"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <nav aria-label="Order help" className="flex flex-col gap-3">
      <h2 className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Help</h2>
      <ul className="vp-band divide-y divide-vp-line">
        <li>
          <LocalizedClientLink href="/contact" className="flex min-h-12 items-center justify-between gap-3 px-4 text-[14px] font-medium text-vp-ink hover:text-vp-accent">
            Contact
            <ChevronRight className="size-4 text-vp-ink-3" />
          </LocalizedClientLink>
        </li>
        <li>
          <LocalizedClientLink href="/contact" className="flex min-h-12 items-center justify-between gap-3 px-4 text-[14px] font-medium text-vp-ink hover:text-vp-accent">
            Returns and exchanges
            <ChevronRight className="size-4 text-vp-ink-3" />
          </LocalizedClientLink>
        </li>
      </ul>
    </nav>
  )
}

export default Help
