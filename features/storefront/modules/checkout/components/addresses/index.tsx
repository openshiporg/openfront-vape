"use client";

import { setAddresses } from "@/features/storefront/lib/data/cart";
import compareAddresses from "@/features/storefront/lib/util/compare-addresses";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";
import BillingAddress from "../billing-address";
import ErrorMessage from "../error-message";
import ShippingAddress from "../shipping-address";
import { RiLoader2Fill } from "@remixicon/react";
import StepHeader, { StepFact } from "../step-header";
import { vpPrimaryButton } from "@/features/storefront/modules/common/components/vp-classes";
import { cn } from "@/lib/utils";

const Addresses = ({
  cart,
  customer,
}: {
  cart: any | null;
  customer: any | null;
}) => {

  const searchParams = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // A fresh cart has no address summary to collapse. Keep the address form open
  // until both server-owned cart relationships exist, regardless of a missing
  // or stale step query parameter.
  const isOpen =
    searchParams?.get("step") === "address" ||
    !cart?.shippingAddress ||
    !cart?.billingAddress;

  const [sameAsBilling, setSameAsBilling] = useState(
    cart?.shippingAddress && cart?.billingAddress
      ? compareAddresses(cart?.shippingAddress, cart?.billingAddress)
      : true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggleSameAsBilling = () => setSameAsBilling((prev) => !prev);

  const handleEdit = () => {
    router.push(pathname + "?step=address");
  };

  const params = useParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Check for required fields before calling setAddresses
    if (!formData.get("shippingAddress.countryCode")) {
      setError("Please select a country.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.firstName")) {
      setError("Please enter your first name.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.lastName")) {
      setError("Please enter your last name.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.address1")) {
      setError("Please enter your address.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.city")) {
      setError("Please enter your city.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.postalCode")) {
      setError("Please enter your postal code.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("email")) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await setAddresses(null, formData);

      // If successful, redirect client-side
      if (result && typeof result === 'object' && 'success' in result && result.success === true) {
        const countryCode = params?.countryCode as string;
        router.push(`/${countryCode}/checkout?step=delivery`);
        return;
      }

      // Otherwise set the error message
      if (typeof result === 'string') {
        setError(result);
      } else if (result && typeof result === 'object' && 'message' in result) {
        setError(result.message as string);
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || err.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const address = cart?.shippingAddress;
  const billing = cart?.billingAddress;

  return (
    <section className="flex flex-col gap-5 border-t border-vp-line pt-5" aria-label="Address">
      <StepHeader
        index={1}
        title="Address"
        state={isOpen ? "open" : "done"}
        onEdit={!isOpen && address ? handleEdit : undefined}
        editLabel="Edit address"
        editTestId="edit-address-button"
      />
      {isOpen ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-2">
          <ShippingAddress
            customer={customer}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
            countryCode={params?.countryCode as string}
          />

          {!sameAsBilling && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[15px] leading-[20px] font-semibold text-vp-ink">
                Billing address
              </h3>
              <BillingAddress cart={cart} />
            </div>
          )}
          <div>
            <button
              className={cn(vpPrimaryButton, "w-full sm:w-auto sm:px-8")}
              data-testid="submit-address-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
              Continue to delivery
            </button>
            <ErrorMessage error={error} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div className="pb-2">
          {cart && address ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              <StepFact label="Ship to" testId="shipping-address-summary">
                <p>{address.firstName} {address.lastName}</p>
                <p>{address.address1} {address.address2}</p>
                <p>
                  {address.city}
                  {address.province && `, ${address.province}`}
                </p>
                <p>
                  <span className="font-vp-mono text-[13px]">{address.postalCode}</span>{" "}
                  {address.countryCode?.toUpperCase()}
                </p>
              </StepFact>

              <StepFact label="Contact" testId="shipping-contact-summary">
                {address.phone && <p className="font-vp-mono text-[13px]">{address.phone}</p>}
                <p>{cart.email}</p>
              </StepFact>

              <StepFact label="Billing" testId="billing-address-summary">
                {sameAsBilling ? (
                  <p>Billing and delivery address are the same.</p>
                ) : (
                  <>
                    <p>{billing?.firstName} {billing?.lastName}</p>
                    <p>{billing?.address1} {billing?.address2}</p>
                    <p>
                      {billing?.city}
                      {billing?.province && `, ${billing.province}`}
                    </p>
                    <p>
                      <span className="font-vp-mono text-[13px]">{billing?.postalCode}</span>{" "}
                      {billing?.countryCode?.toUpperCase()}
                    </p>
                  </>
                )}
              </StepFact>
            </div>
          ) : (
            <RiLoader2Fill className="h-5 w-5 animate-spin text-vp-ink-3" aria-label="Loading" />
          )}
        </div>
      )}
    </section>
  );
};

export default Addresses;
