"use client"

import { Plus } from "lucide-react"
import { useEffect, useState, useActionState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import { createCustomerAddress } from "@/features/storefront/lib/data/user"
import {
  InlineError,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/features/storefront/modules/account/components/account-ui"
import { AddressDialogContent, AddressFields } from "./address-fields"

const AddAddress = ({
  region,
}: {
  region: any
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(createCustomerAddress, {
    success: false,
    error: null,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const f = formState.fields

  return (
    <Dialog open={state} onOpenChange={(isOpen) => isOpen ? open() : close()}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-vp-ink px-5 text-[15px] font-medium text-vp-on-ink"
          onClick={open}
          data-testid="add-address-button"
        >
          <Plus size={18} aria-hidden="true" />
          Add address
        </button>
      </DialogTrigger>

      <AddressDialogContent title="Add address" data-testid="add-address-modal">
        <form action={formAction} className="flex flex-col gap-5">
          <AddressFields
            region={region}
            idPrefix="add-address"
            defaults={{
              first_name: f?.first_name ?? "",
              last_name: f?.last_name ?? "",
              company: f?.company ?? "",
              address_1: f?.address_1 ?? "",
              address_2: f?.address_2 ?? "",
              city: f?.city ?? "",
              province: f?.province ?? "",
              postal_code: f?.postal_code ?? "",
              phone: f?.phone ?? "",
            }}
          />
          {formState.error && <InlineError data-testid="address-error">{formState.error}</InlineError>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="reset"
              onClick={close}
              className={secondaryButtonClass}
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <SubmitButton data-testid="save-button" className={primaryButtonClass}>
              Save
            </SubmitButton>
          </div>
        </form>
      </AddressDialogContent>
    </Dialog>
  )
}

export default AddAddress
