"use client"

import React, { useEffect, useState, useActionState } from "react"
import { RiLoader2Fill } from "@remixicon/react"
import { Dialog } from "@/components/ui/dialog"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import {
  deleteCustomerShippingAddress,
  updateCustomerAddress,
} from "@/features/storefront/lib/data/user"
import { cn } from "@/lib/utils"
import { StorefrontAddress, StorefrontRegion } from "@/features/storefront/types"
import {
  InlineError,
  primaryButtonClass,
  rowPillClass,
  secondaryButtonClass,
} from "@/features/storefront/modules/account/components/account-ui"
import { AddressDialogContent, AddressFields } from "./address-fields"

type EditAddressProps = {
  region: StorefrontRegion
  address: StorefrontAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerShippingAddress(address.id)
    setRemoving(false)
  }

  const f = formState.fields

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5",
          { "bg-vp-tint": isActive }
        )}
        data-testid="address-container"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-[15px] font-medium text-vp-ink" data-testid="address-name">
              {address.firstName} {address.lastName}
            </h3>
            {address.isBilling && (
              <span className="text-[12px] font-medium text-vp-accent">Billing</span>
            )}
          </div>
          {address.company && (
            <p className="text-[14px] text-vp-ink-2" data-testid="address-company">
              {address.company}
            </p>
          )}
          <div className="flex flex-col text-[14px] leading-[20px] text-vp-ink-2">
            <span data-testid="address-address">
              {address.address1}
              {address.address2 && <span>, {address.address2}</span>}
            </span>
            <span data-testid="address-city-province">
              {address.city}{address.province && `, ${address.province}`}
            </span>
            <span data-testid="address-postal-country">
              <span className="font-vp-mono">{address.postalCode}</span>{" "}
              <span className="font-vp-mono">{address.country?.iso2?.toUpperCase()}</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={open} className={rowPillClass} data-testid="address-edit-button">
            Edit
          </button>
          <button
            type="button"
            onClick={removeAddress}
            disabled={removing}
            className={cn(rowPillClass, "text-vp-ink-2 hover:text-vp-danger")}
            data-testid="address-delete-button"
          >
            {removing && <RiLoader2Fill className="size-4 animate-spin" />}
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <Dialog open={state} onOpenChange={(isOpen) => !isOpen && close()}>
        <AddressDialogContent title="Edit address" data-testid="edit-address-modal">
          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="addressId" value={address.id} />
            <AddressFields
              region={region}
              idPrefix={`edit-address-${address.id}`}
              defaults={{
                first_name: f?.first_name ?? (address.firstName || undefined),
                last_name: f?.last_name ?? (address.lastName || undefined),
                company: f?.company ?? (address.company || undefined),
                address_1: f?.address_1 ?? (address.address1 || undefined),
                address_2: f?.address_2 ?? (address.address2 || undefined),
                city: f?.city ?? (address.city || undefined),
                province: f?.province ?? (address.province || undefined),
                postal_code: f?.postal_code ?? (address.postalCode || undefined),
                country_code: address.country?.iso2 || undefined,
                phone: f?.phone ?? (address.phone || undefined),
                is_billing: !!address.isBilling,
              }}
            />
            {formState.error && <InlineError>{formState.error}</InlineError>}
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
    </>
  )
}

export default EditAddress
