// Turns a product's real option values into short spec lines,
// e.g. "Nicotine Strength: 3 mg, 6 mg, 12 mg" -> { label: "Nicotine", value: "3 · 6 · 12 mg" }.

type OptionLike = {
  title?: string | null
  productOptionValues?: { value?: string | null }[] | null
}

const LABELS: Record<string, string> = {
  "nicotine strength": "Nicotine",
  "bottle size": "Bottle",
  resistance: "Coil",
}

function formatUnit(unit: string) {
  return unit.toLowerCase() === "ohm" ? "Ω" : unit
}

export function summariseOption(option: OptionLike) {
  const title = (option.title || "").trim()
  const values = Array.from(
    new Set((option.productOptionValues || []).map((v) => (v.value || "").trim()).filter(Boolean))
  )
  if (!title || !values.length) return null

  const parsed = values.map((v) => v.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/))
  const units = new Set(parsed.map((m) => m?.[2]?.toLowerCase()))
  let value: string
  if (parsed.every(Boolean) && units.size === 1) {
    const numbers = parsed.map((m) => m![1]).sort((a, b) => Number(a) - Number(b))
    value = `${numbers.join(" · ")} ${formatUnit(parsed[0]![2])}`
  } else {
    value = values.length > 3 ? `${values.length} options` : values.join(" · ")
  }

  return { label: LABELS[title.toLowerCase()] || title, value }
}

export function productSpecs(product: { productOptions?: OptionLike[] | null } | null | undefined, limit = 3) {
  return (product?.productOptions || [])
    .map(summariseOption)
    .filter((s): s is { label: string; value: string } => !!s)
    .slice(0, limit)
}

export function displayOptionValue(value: string) {
  return value.replace(/(\d)\s*ohm\b/i, "$1 Ω")
}
