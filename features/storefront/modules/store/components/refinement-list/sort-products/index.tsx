"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { SegmentedButton, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Newest" },
  { value: "price_asc", label: "Price low" },
  { value: "price_desc", label: "Price high" },
]

export default function SortProducts({
  sortBy,
  "data-testid": dataTestId,
}: {
  sortBy: SortOptions
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  const choose = (value: SortOptions) => {
    const params = new URLSearchParams(searchParams ?? undefined)
    params.set("sortBy", value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <SegmentedTrack label="Sort by" data-testid={dataTestId}>
      {sortOptions.map((o) => (
        <SegmentedButton key={o.value} active={sortBy === o.value} onClick={() => choose(o.value)}>
          {o.label}
        </SegmentedButton>
      ))}
    </SegmentedTrack>
  )
}
