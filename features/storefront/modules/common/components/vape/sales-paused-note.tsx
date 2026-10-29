import { releaseBlockers } from "@/features/regulated-commerce/core/release-gate"
import { keystoneContext } from "@/features/keystone/context"
import { complianceReasonLines } from "@/features/storefront/modules/checkout/lib/compliance-reasons"
import StatusDot from "./status-dot"

// Server-only. Explains an empty catalog with the store release gate's own reason lines
// (the same lines checkout shows). Renders nothing when the gate is open.
export default async function SalesPausedNote({ className }: { className?: string }) {
  const lines = complianceReasonLines(await releaseBlockers(keystoneContext).catch(() => []))
  if (!lines.length) return null

  return (
    <div className={className} data-testid="sales-paused-note">
      <p className="flex items-baseline gap-2 text-[13px] font-semibold text-vp-ink">
        <StatusDot tone="danger" />
        Sales are paused
      </p>
      <ul className="mt-1.5 flex flex-col gap-0.5 pl-4 text-[14px] leading-[22px] text-vp-ink-2">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
