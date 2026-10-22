"use client";

import { useActionState } from "react";
import type { CheckoutLinkActionState } from "@/features/storefront/lib/data/checkout-link-read-state";
import { primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui";

type CheckoutLinkSubmitProps = {
  action: (
    previousState: CheckoutLinkActionState,
    formData: FormData,
  ) => Promise<CheckoutLinkActionState>;
};

export default function CheckoutLinkSubmit({ action }: CheckoutLinkSubmitProps) {
  const [state, formAction, pending] = useActionState<CheckoutLinkActionState, FormData>(
    action,
    { status: "idle" },
  );

  return (
    <>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          data-testid="checkout-link-continue-button"
          className={`${primaryButtonClass} w-full sm:w-auto`}
        >
          {pending ? "Continuing..." : "Continue to checkout"}
        </button>
      </form>
      {state.status === "error" && (
        <p className="mt-3 text-[13px] text-vp-danger" role="alert" data-testid="checkout-link-action-error">
          We couldn&apos;t continue. Refresh to try again.
        </p>
      )}
    </>
  );
}
