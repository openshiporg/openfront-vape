import { nicotineWarningText } from "@/features/storefront/lib/nicotine-warning"

// The FDA nicotine warning (21 CFR 1143.3(b)(2)): top of the page, black text on white,
// bold sans, centred, inside a rule the colour of the text. Not dismissible, at least 12px.
// Whether it shows comes from the store's compliance setting, never from the page.
export default function NicotineWarning({ store }: { store: { nicotineWarningRequired?: boolean | null } | null }) {
  const text = nicotineWarningText(store)
  if (!text) return null
  return (
    <div className="bg-white px-2 py-1.5 sm:px-4" data-testid="nicotine-warning">
      <p
        role="note"
        className="mx-auto max-w-[1320px] border-[3px] border-black px-3 py-1.5 text-center font-[Helvetica,Arial,sans-serif] text-[13px] leading-[18px] font-bold text-black sm:text-[15px] sm:leading-[20px]"
      >
        {text}
      </p>
    </div>
  )
}
