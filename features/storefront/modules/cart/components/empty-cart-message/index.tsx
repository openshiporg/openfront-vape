import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div className="flex flex-col items-start gap-4 py-16 sm:py-24" data-testid="empty-cart-message">
      <span className="font-vp-mono text-[13px] text-vp-ink-3">0 items</span>
      <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.03em] text-vp-ink sm:text-[52px] sm:leading-[56px]">
        Your bag is empty
      </h1>
      <LocalizedClientLink
        href="/store"
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-vp-ink px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Shop all
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
