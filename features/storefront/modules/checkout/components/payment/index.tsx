"use client";
import { isStripe, paymentInfoMap, isStripeSandbox, isPayPalSandbox } from "@/features/storefront/lib/constants";
import { getCheckoutCompliance, startCheckoutPayment } from "@/features/storefront/lib/data/compliance";
import CompliancePanel from "../compliance-panel";
import { checkoutErrorText, type CheckoutCompliance } from "../../lib/compliance-reasons";
import { CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ErrorMessage from "../error-message";
import { StripeContext } from "../payment-wrapper/stripe-wrapper";
import StepHeader, { StepFact } from "../step-header";
import { vpPrimaryButton } from "@/features/storefront/modules/common/components/vp-classes";
import { CardElement } from "@stripe/react-stripe-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RiLoader2Fill } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface PaymentProps {
  cart: {
    id: string;
    total: number;
    paymentCollection?: {
      paymentSessions?: Array<{
        isSelected: boolean;
        status?: string;
        paymentProvider: {
          code: string;
        };
      }>;
    };
    shippingMethods: any[];
    giftCards?: any[];
  };
  availablePaymentMethods: Array<{
    id: string;
    code: string;
  }>;
}

const Payment = ({ cart, availablePaymentMethods }: PaymentProps) => {
  const activeSession = cart.paymentCollection?.paymentSessions?.find(
    (session) => session.isSelected
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.paymentProvider?.code ?? ""
  );

  const searchParams = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams?.get("step") === "payment";

  const isStripePayment = isStripe(selectedPaymentMethod);
  const stripeReady = useContext(StripeContext);

  // Check if we're in sandbox/test mode
  const isSandboxMode = isStripeSandbox() || isPayPalSandbox();

  const paidByGiftcard =
    cart?.giftCards && cart?.giftCards?.length > 0 && cart?.total === 0;

  const paymentReady =
    (activeSession && cart?.shippingMethods.length !== 0) || paidByGiftcard;

  const useOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          fontSize: "16px",
          color: "#121816", // vp-ink (Stripe iframes cannot read CSS variables)
          iconColor: "#3c4743",
          "::placeholder": {
            color: "#5b6763", // vp-ink-3
          },
        },
      },
      classes: {
        base: "block h-12 w-full rounded-[4px] border border-vp-line bg-vp-surface px-4 pt-[15px] transition-colors hover:border-vp-ink-3",
        focus: "border-vp-accent",
        invalid: "border-vp-danger",
      },
      // Hide postal code since we already collect it in the billing address form
      hidePostalCode: true,
    };
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    });
  };

  // Pre-payment check for the chosen method; re-runs when the method or the bag changes.
  const selectedProviderId = availablePaymentMethods?.find((method) => method.code === selectedPaymentMethod)?.id;
  const hasShipping = (cart?.shippingMethods?.length ?? 0) > 0;
  const [compliance, setCompliance] = useState<CheckoutCompliance | null>(null);
  const [complianceLoading, setComplianceLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !hasShipping || !selectedProviderId) {
      setCompliance(null);
      return;
    }
    let current = true;
    setComplianceLoading(true);
    getCheckoutCompliance("payment", selectedProviderId)
      .then((result) => {
        if (current) setCompliance(result);
      })
      .catch(() => {
        if (current) setCompliance({ state: "unavailable", purpose: "payment", reasonCodes: [], lines: ["We couldn't check this order. Please try again."] });
      })
      .finally(() => {
        if (current) setComplianceLoading(false);
      });
    return () => {
      current = false;
    };
  }, [isOpen, hasShipping, selectedProviderId, cart?.total, cart?.shippingMethods]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const shouldInputCard = isStripe(selectedPaymentMethod) && !cardComplete;

      const hasExistingSelectedSession =
        cart.paymentCollection?.paymentSessions?.some(
          (session) =>
            session.isSelected &&
            session.paymentProvider.code === selectedPaymentMethod &&
            session.status !== "error"
        );

      if (!hasExistingSelectedSession) {
        const started = await startCheckoutPayment(selectedPaymentMethod);
        if (!started.ok) {
          setError(started.error);
          return;
        }
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        );
      }
    } catch (err) {
      setError(checkoutErrorText(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  const methodTitle = paymentInfoMap[selectedPaymentMethod]?.title || selectedPaymentMethod;

  return (
    <section className="flex flex-col gap-5 border-t border-vp-line pt-5" aria-label="Payment">
      <StepHeader
        index={3}
        title="Payment"
        state={isOpen ? "open" : paymentReady ? "done" : "todo"}
        onEdit={!isOpen && paymentReady ? handleEdit : undefined}
        editLabel="Edit payment"
        editTestId="edit-payment-button"
      />
      <div className={isOpen ? "flex flex-col gap-5 pb-2" : "hidden"}>
        {!paidByGiftcard && availablePaymentMethods?.length > 0 && (
          <>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              aria-label="Payment method"
              className="vp-band flex flex-col gap-0.5 p-1"
            >
              {availablePaymentMethods.map((method) => {
                const selected = selectedPaymentMethod === method.code;
                return (
                  <div key={method.id} className="relative">
                    <RadioGroupItem
                      value={method.code}
                      id={method.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.id}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[4px] px-4 py-3 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-vp-accent",
                        selected
                          ? "bg-vp-surface shadow-[0_1px_2px_rgb(20_24_22/0.12),0_0_0_0.5px_rgb(20_24_22/0.06)]"
                          : "hover:bg-vp-surface/60"
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
                        <span className="text-[15px] leading-[20px] font-medium text-vp-ink">
                          {paymentInfoMap[method.code]?.title || method.code}
                        </span>
                      </span>
                      <span className="flex flex-none items-center gap-3 text-vp-ink-2">
                        {isSandboxMode && (
                          <span className="text-[12px] font-medium text-vp-warn" title="Sandbox environment, do not enter real payment info">
                            Test
                          </span>
                        )}
                        <span className="flex h-5 w-5 items-center justify-center">
                          {paymentInfoMap[method.code]?.icon}
                        </span>
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            {isStripePayment && stripeReady && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] leading-[18px] font-medium text-vp-ink-2">
                  Card details
                </p>
                <CardElement
                  options={useOptions}
                  onChange={(e) => {
                    if (e.brand) {
                      setCardBrand(e.brand.charAt(0).toUpperCase() + e.brand.slice(1));
                    }
                    setError(e.error?.message || null);
                    setCardComplete(e.complete);
                  }}
                />
              </div>
            )}
          </>
        )}

        {paidByGiftcard && (
          <StepFact label="Payment method">
            <p data-testid="payment-method-summary">Gift card</p>
          </StepFact>
        )}

        <CompliancePanel compliance={compliance} loading={complianceLoading} />

        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              (!selectedPaymentMethod && !paidByGiftcard) ||
              !cart?.shippingMethods?.length ||
              isLoading
            }
            data-testid="submit-payment-button"
            className={cn(vpPrimaryButton, "w-full sm:w-auto sm:px-8")}
          >
            {isLoading && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
            {isStripePayment && !cardComplete
              ? "Enter card details"
              : "Continue to review"}
          </button>
          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />
        </div>
      </div>

      <div className={isOpen ? "hidden" : "block"}>
        {cart && paymentReady && activeSession ? (
          <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-3 sm:gap-6">
            <StepFact label="Method">
              <p data-testid="payment-method-summary">{methodTitle}</p>
            </StepFact>
            <StepFact label="Details" className="sm:col-span-2">
              <div className="flex items-center gap-2" data-testid="payment-details-summary">
                <span className="flex h-8 w-11 flex-none items-center justify-center rounded-[4px] bg-vp-well text-vp-ink">
                  {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard className="h-5 w-5" />}
                </span>
                <span>
                  {isStripe(selectedPaymentMethod) && cardBrand
                    ? cardBrand
                    : "Another step will appear"}
                </span>
              </div>
            </StepFact>
          </div>
        ) : paidByGiftcard ? (
          <div className="pb-2">
            <StepFact label="Payment method">
              <p data-testid="payment-method-summary">Gift card</p>
            </StepFact>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Payment;
