"use client"

import { useActionState } from "react"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

import { createTransferRequest } from "@/features/storefront/lib/data/orders";
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button";
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { Field, InlineError, secondaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <section className="flex w-full flex-col gap-4">
      <h3 className="vp-sign text-[26px] text-vp-ink">Order transfer</h3>
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Field label="Order ID" id="transfer-order-id" name="order_id" required={false} />
        </div>
        <SubmitButton className={`${secondaryButtonClass} whitespace-nowrap`}>
          Request transfer
        </SubmitButton>
      </form>
      {!state.success && state.error && <InlineError>{state.error}</InlineError>}
      {showSuccess && (
        <div className="vp-band flex items-start justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="flex items-baseline gap-2 text-[14px] font-medium text-vp-ink">
              <StatusDot tone="ok" />
              <span>
                Transfer requested for <span className="font-vp-mono">{state.order?.id}</span>
              </span>
            </p>
            <p className="break-all text-[13px] text-vp-ink-2">Email sent to {state.order?.email}</p>
          </div>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[4px] text-vp-ink-3 hover:text-vp-ink"
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
