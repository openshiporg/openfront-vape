"use client"

import { ChevronRight } from "lucide-react"
import { RiLoader2Fill } from "@remixicon/react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { addToCart } from "@/features/storefront/lib/data/cart"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { cn } from "@/lib/utils"

// Buy: puts the featured variant in the bag through the same cart action as the product page,
// then opens the bag. With no buyable variant it goes to the product page to choose one.
export default function BuyButton({
  variantId,
  handle,
  label,
  chevron,
  className,
}: {
  variantId: string | null
  handle: string
  label: string
  chevron?: boolean
  className?: string
}) {
  const { countryCode } = (useParams() || {}) as { countryCode?: string }
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const body = (
    <>
      {busy && <RiLoader2Fill className="size-4 animate-spin" aria-hidden="true" />}
      Buy
      {chevron && !busy && <ChevronRight className="size-[18px] lg:hidden" strokeWidth={2.5} aria-hidden="true" />}
    </>
  )

  if (!variantId) {
    return (
      <LocalizedClientLink href={`/products/${handle}`} className={className} aria-label={label}>
        {body}
      </LocalizedClientLink>
    )
  }

  const buy = async () => {
    if (!countryCode) return
    setBusy(true)
    setError(null)
    try {
      const failed = await addToCart({ variantId, quantity: 1, countryCode })
      if (typeof failed === "string" && failed) {
        setError(failed)
        return
      }
      router.push(`/${countryCode}/cart`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add this to your bag")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        aria-label={label}
        className={cn(className, "disabled:opacity-70")}
        data-testid="home-buy-button"
      >
        {body}
      </button>
      {error && (
        <p role="alert" className="max-w-[28ch] text-[13px] leading-[18px] text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  )
}
