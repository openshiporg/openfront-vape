"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { CheckoutLinkActionState } from "@/features/storefront/lib/data/checkout-link-read-state";

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
        <Button type="submit" disabled={pending} data-testid="checkout-link-continue-button" variant="default" size="sm">
          Continue to checkout
        </Button>
      </form>
      {state.status === "error" && (
        <p className="mt-3 text-sm text-destructive" role="alert" data-testid="checkout-link-action-error">
          We couldn&apos;t continue. Refresh to try again.
        </p>
      )}
    </>
  );
}
