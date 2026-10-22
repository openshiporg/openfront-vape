import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@/features/storefront/modules/common/components/radio"

import { isManual } from "@/features/storefront/lib/constants"
import SkeletonCardDetails from "@/features/storefront/modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-[14px] px-4 py-3 transition-colors",
        selectedPaymentOptionId === paymentProviderId
          ? "bg-vp-surface shadow-[0_1px_2px_rgb(20_24_22/0.12),0_0_0_0.5px_rgb(20_24_22/0.06)]"
          : "hover:bg-vp-surface/60"
      )}
    >
      <RadioGroupItem
        key={paymentProviderId}
        value={paymentProviderId}
        disabled={disabled}
        id={paymentProviderId}
        className="sr-only"
      />
      <div className="flex min-h-8 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <p className="text-[15px] leading-[20px] font-medium text-vp-ink">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </p>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden sm:block" />
          )}
        </div>
        <span className="flex-none text-vp-ink-2">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="sm:hidden" />
      )}
      {children}
    </div>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          fontSize: "16px",
          color: "#141816",
          "::placeholder": {
            color: "#878d89",
          },
        },
      },
      classes: {
        base: "block h-12 w-full rounded-[14px] border border-vp-line bg-vp-surface px-4 pt-[15px] transition-colors hover:border-vp-ink-3",
      },
      // Hide postal code since we already collect it in the billing address form
      hidePostalCode: true,
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-2 flex flex-col gap-2">
            <p className="text-[13px] leading-[18px] font-medium text-vp-ink-2">
              Card details
            </p>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          /* TODO: [Refactor Alignment] SkeletonCardDetails component usage commented out as it's not present in the old storefront. Re-evaluate integration later. */
          null
        ))}
    </PaymentContainer>
  )
}
