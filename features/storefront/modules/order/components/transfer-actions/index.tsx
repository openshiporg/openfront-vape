"use client"

import { acceptTransferRequest, declineTransferRequest } from "@/features/storefront/lib/data/orders"
import { vpPrimaryButton, vpSecondaryButton } from "@/features/storefront/modules/common/components/vp-classes"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <p role="status" className="text-[14px] text-vp-ok">
          Order transferred successfully!
        </p>
      )}
      {status?.decline === "success" && (
        <p role="status" className="text-[14px] text-vp-ok">
          Order transfer declined successfully!
        </p>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={vpPrimaryButton}
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.accept === "pending" ? "Accepting..." : "Accept transfer"}
          </button>
          <button
            type="button"
            className={`${vpSecondaryButton} h-12 px-6`}
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.decline === "pending" ? "Declining..." : "Decline transfer"}
          </button>
        </div>
      )}
      {errorMessage && <p role="alert" className="text-[13px] text-vp-danger">{errorMessage}</p>}
    </div>
  )
}

export default TransferActions
