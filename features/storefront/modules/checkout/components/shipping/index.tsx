"use client"

import { setShippingMethod } from "@/features/storefront/lib/data/cart"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import { checkoutErrorText } from "@/features/storefront/modules/checkout/lib/compliance-reasons"
import StepHeader, { StepFact } from "@/features/storefront/modules/checkout/components/step-header"
import { vpPrimaryButton } from "@/features/storefront/modules/common/components/vp-classes"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { RiLoader2Fill } from "@remixicon/react";

interface ShippingOption {
  id: string;
  name: string;
  calculatedAmount: string;
  data?: { pickup?: boolean; instructions?: string } | null;
}

interface ShippingProps {
  cart: {
    id: string;
    shippingMethods: {
      shippingOption: {
        id: string;
        name: string;
      };
    }[];
    shippingAddress: any;
    billingAddress: any;
    email: string;
    shipping: string;
  };
  availableShippingMethods: ShippingOption[] | null
  nextStep?: "age" | "payment"
  /** False when no card provider is set up, so only pay-in-store pickup can be paid. */
  deliveryCardAvailable?: boolean
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
  nextStep = "payment",
  deliveryCardAvailable = true,
}) => {
  const pickupId = availableShippingMethods?.find((option) => option.data?.pickup === true)?.id ?? null
  // Without card payment a delivery order cannot be paid; steer to pickup, which is paid at the counter.
  const deliveryBlocked = !deliveryCardAvailable && Boolean(pickupId)
  const initialOption = () => {
    const current = cart?.shippingMethods?.[0]?.shippingOption?.id || null
    if (deliveryBlocked && current !== pickupId) return pickupId
    return current
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(initialOption)

  const searchParams = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams?.get("step") === "delivery"

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    if (!selectedOption) return

    setIsLoading(true)
    try {
      await setShippingMethod(selectedOption)
      router.push(pathname + "?step=" + nextStep, { scroll: false })
    } catch (err: any) {
      setError(checkoutErrorText(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (value: string) => {
    setSelectedOption(value)
  }

  useEffect(() => {
    setIsLoading(false)
    setError(null)
    setSelectedOption(initialOption())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cart?.shippingMethods, deliveryBlocked, pickupId])

  const hasMethod = (cart?.shippingMethods?.length ?? 0) > 0
  const canEdit = !isOpen && !!cart?.shippingAddress && !!cart?.billingAddress && !!cart?.email

  return (
    <section className="flex flex-col gap-5 border-t border-vp-line pt-5" aria-label="Delivery">
      <StepHeader
        index={2}
        title="Delivery"
        state={isOpen ? "open" : hasMethod ? "done" : "todo"}
        onEdit={canEdit ? handleEdit : undefined}
        editLabel="Edit delivery"
        editTestId="edit-delivery-button"
      />
      {isOpen ? (
        <div className="flex flex-col gap-5 pb-2">
          {deliveryBlocked && (
            <p role="status" className="text-[14px] leading-[20px] text-vp-ink-2" data-testid="delivery-card-unavailable">
              Delivery needs card payment, which isn&apos;t available yet. Reserve online and pay in store when you collect.
            </p>
          )}
          <div data-testid="delivery-options-container">
            <RadioGroup
              value={selectedOption || ""}
              onValueChange={handleChange}
              aria-label="Shipping method"
              className="vp-band flex flex-col gap-0.5 p-1"
            >
              {availableShippingMethods?.map((option) => {
                const isDisabled = deliveryBlocked && option.data?.pickup !== true
                const selected = option.id === selectedOption

                return (
                  <div
                    key={option.id}
                    data-testid="delivery-option-radio"
                    className="relative"
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={isDisabled}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.id}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[4px] px-4 py-3 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-vp-accent",
                        {
                          "bg-vp-surface shadow-[0_1px_2px_rgb(20_24_22/0.12),0_0_0_0.5px_rgb(20_24_22/0.06)]": selected,
                          "hover:bg-vp-surface/60": !selected && !isDisabled,
                          "cursor-not-allowed opacity-50": isDisabled,
                        }
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "block h-[18px] w-[18px] flex-none rounded-[4px] bg-vp-surface transition-all",
                            selected ? "border-[5px] border-vp-ink" : "border-[1.5px] border-vp-ink-3"
                          )}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="text-[15px] leading-[20px] font-medium text-vp-ink">
                            {option.name}
                          </span>
                          {option.data?.pickup && option.data.instructions && (
                            <span className="text-[13px] leading-[18px] text-vp-ink-3">{option.data.instructions}</span>
                          )}
                          {isDisabled && (
                            <span className="text-[13px] leading-[18px] text-vp-ink-3">Card payment for delivery isn&apos;t available yet</span>
                          )}
                        </span>
                      </span>
                      <span className="flex-none font-vp-mono text-[14px] text-vp-ink">
                        {option.calculatedAmount}
                      </span>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <div>
            <button
              type="button"
              className={cn(vpPrimaryButton, "w-full sm:w-auto sm:px-8")}
              onClick={handleSubmit}
              disabled={!selectedOption || isLoading}
              data-testid="submit-delivery-option-button"
            >
              {isLoading && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
              {nextStep === "age" ? "Continue" : "Continue to payment"}
            </button>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
          </div>
        </div>
      ) : (
        cart && hasMethod && (
          <div className="pb-2">
            <StepFact label="Method">
              <p>
                {cart.shippingMethods[0].shippingOption.name}{" "}
                <span className="font-vp-mono text-[13px] text-vp-ink">{cart.shipping}</span>
              </p>
            </StepFact>
          </div>
        )
      )}
    </section>
  )
}

export default Shipping
