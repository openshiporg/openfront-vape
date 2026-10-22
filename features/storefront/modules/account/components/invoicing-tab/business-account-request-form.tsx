"use client"

import { useActionState, useEffect, startTransition } from "react"
import { toast } from "@/components/ui/use-toast"
import type { StorefrontAccountCustomer as User } from "@/features/storefront/types"
import { submitBusinessAccountRequest } from "@/features/storefront/lib/data/business-accounts"
import { primaryButtonClass } from "@/features/storefront/modules/account/components/account-ui"

type BusinessAccountRequestFormProps = {
  customer: User
}

type RequestState = { success: boolean; message?: string; error?: string; data?: unknown }

const BusinessAccountRequestForm = ({ customer }: BusinessAccountRequestFormProps) => {
  // Server action with useActionState
  const [state, action, loading] = useActionState<RequestState, FormData>(submitBusinessAccountRequest, { success: false })

  const handleSubmit = () => {
    const form = new FormData()
    form.append('customerId', customer.id)
    form.append('businessName', customer.name || 'Business Account')
    form.append('businessType', 'other')
    form.append('monthlyOrderVolume', 'medium')
    form.append('requestedCreditLimit', '100000')
    form.append('businessDescription', 'Business account request')

    startTransition(() => action(form))
  }

  // Handle server action results
  useEffect(() => {
    if (state.success) {
      toast({
        title: "Request submitted",
        description: state.message || "Your business account request is under review.",
      })
      // Refresh the page to show the new state
      window.location.reload()
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state])

  return (
    <button type="button" onClick={handleSubmit} disabled={loading} className={primaryButtonClass}>
      {loading ? "Requesting..." : "Request invoicing"}
    </button>
  )
}

export default BusinessAccountRequestForm
