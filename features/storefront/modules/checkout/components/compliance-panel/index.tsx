import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import type { CheckoutCompliance } from "../../lib/compliance-reasons"

const STATE_LABELS = {
  allowed: { tone: "ok", title: "Order allowed" },
  review: { tone: "warn", title: "Needs review" },
  denied: { tone: "danger", title: "Can't be ordered" },
  unavailable: { tone: "danger", title: "Not checked" },
} as const

export function complianceBlocksOrder(compliance: CheckoutCompliance | null | undefined) {
  return !compliance || (compliance.state !== "allowed" && compliance.state !== "not_applicable")
}

// Result of evaluateActiveCartCompliance for the active bag. Nothing renders for unregulated bags.
export default function CompliancePanel({
  compliance,
  loading = false,
}: {
  compliance: CheckoutCompliance | null
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="vp-band px-4 py-3" role="status" aria-live="polite" data-testid="checkout-compliance-panel">
        <p className="flex items-baseline gap-2.5 text-[15px] leading-[20px] font-medium text-vp-ink-2">
          <StatusDot tone="muted" />
          Checking order
        </p>
      </div>
    )
  }
  if (!compliance || compliance.state === "not_applicable") return null
  const label = STATE_LABELS[compliance.state]

  return (
    <div
      className="vp-band divide-y divide-vp-line"
      role="status"
      aria-live="polite"
      data-testid="checkout-compliance-panel"
      data-state={compliance.state}
    >
      <p className="flex items-baseline gap-2.5 px-4 py-3 text-[15px] leading-[20px] font-medium text-vp-ink">
        <StatusDot tone={label.tone} />
        {label.title}
      </p>
      {compliance.lines.length > 0 && (
        <ul className="divide-y divide-vp-line text-[14px] leading-[20px] text-vp-ink-2" data-testid="checkout-compliance-reasons">
          {compliance.lines.map((line) => (
            <li key={line} className="px-4 py-3">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
