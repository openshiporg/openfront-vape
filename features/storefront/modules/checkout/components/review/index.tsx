"use client"

import PaymentButton from "../payment-button"
import StepHeader from "../step-header"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams() ?? new URLSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.giftCard && cart?.giftCard?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart?.shippingAddress &&
    cart?.shippingMethods?.length > 0 &&
    (cart?.paymentCollection || paidByGiftcard)

  const active = isOpen && previousStepsCompleted

  return (
    <section className="flex flex-col gap-5 border-t border-vp-line pt-5" aria-label="Review">
      <StepHeader index={4} title="Review" state={active ? "open" : "todo"} />
      {active && (
        <div className="flex flex-col gap-4 pb-2">
          <dl className="vp-band divide-y divide-vp-line text-[14px] leading-[20px]">
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-vp-ink-2">Total</dt>
              <dd className="font-vp-mono text-[16px] font-medium text-vp-ink">{cart?.total}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-vp-ink-2">Delivery</dt>
              <dd className="text-right text-vp-ink">Adult signature may be required</dd>
            </div>
          </dl>
          <p className="text-[13px] leading-[18px] text-vp-ink-3">
            By placing this order you accept the Terms of Use, Terms of Sale, Returns Policy and Privacy Policy.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </div>
      )}
    </section>
  )
}

export default Review
