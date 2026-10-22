import { useEffect } from "react"
import { useFormStatus } from "react-dom"
import { RiLoader2Fill } from "@remixicon/react"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import { primaryButtonClass, rowPillClass } from "@/features/storefront/modules/account/components/account-ui"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

// One setting row inside the profile band: label, current value, Edit pill,
// and the edit fields underneath when open.
const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "Couldn't save. Try again.",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    toggle()
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="px-4 py-4 sm:px-5" data-testid={dataTestid}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-medium text-vp-ink-2">{label}</span>
          {typeof currentInfo === "string" ? (
            <span className="break-words text-[15px] text-vp-ink" data-testid="current-info">{currentInfo}</span>
          ) : (
            <div className="text-[15px] text-vp-ink">{currentInfo}</div>
          )}
        </div>
        <button
          className={rowPillClass}
          onClick={handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
          data-active={state}
          aria-expanded={state}
        >
          {state ? "Cancel" : "Edit"}
        </button>
      </div>

      {isSuccess && (
        <p role="status" className="mt-2 text-[13px] text-vp-ok" data-testid="success-message">
          {label} saved
        </p>
      )}

      {isError && (
        <p role="alert" className="mt-2 text-[13px] text-vp-danger" data-testid="error-message">
          {errorMessage}
        </p>
      )}

      {state && (
        <div className="mt-4 flex flex-col gap-4">
          {children}
          <div className="flex justify-end">
            <button
              disabled={pending}
              className={`${primaryButtonClass} w-full sm:w-auto sm:min-w-[140px]`}
              type="submit"
              data-testid="save-button"
            >
              {pending && <RiLoader2Fill className="size-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
