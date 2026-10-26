import { FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentTestProps {
  className?: string
  provider?: "stripe" | "paypal" | "general"
}

const PaymentTest = ({ className, provider = "general" }: PaymentTestProps) => {
  const providerText = provider === "stripe"
    ? "Stripe test mode"
    : provider === "paypal"
    ? "PayPal sandbox"
    : "Test mode"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border border-vp-warn bg-vp-surface px-2.5 py-1 text-[12px] leading-[16px] font-medium text-vp-warn",
        className
      )}
    >
      <FlaskConical className="h-3 w-3 flex-none" />
      <span>{providerText}</span>
      <span aria-hidden="true">·</span>
      <span>Do not enter real payment info</span>
    </span>
  )
}

export default PaymentTest
