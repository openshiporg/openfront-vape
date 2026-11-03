// Deneb storefront facts. Every value is read from the live product record: its subtitle,
// description, options and variants. Nothing here invents copy or prices.

type Doc = { document?: any } | string | null | undefined

export function plainText(description: Doc): string {
  if (!description) return ""
  if (typeof description === "string") return description
  const out: string[] = []
  const walk = (node: any) => {
    if (!node) return
    if (Array.isArray(node)) return node.forEach(walk)
    if (typeof node.text === "string") out.push(node.text)
    if (node.children) {
      walk(node.children)
      if (node.type === "paragraph") out.push(" ")
    }
  }
  walk(description.document)
  return out.join("").replace(/\s+/g, " ").trim()
}

// The hero's one-line tagline: the saved subtitle, else the description's lead clause
// ("Compact refillable pod system with a 1000 mAh battery…" -> "Compact refillable pod system.").
export function productTagline(product: { subtitle?: string | null; description?: Doc }): string | null {
  const subtitle = (product.subtitle || "").trim()
  if (subtitle) return subtitle
  const text = plainText(product.description)
  if (!text) return null
  const sentence = text.split(/(?<=\.)\s/)[0] || text
  const lead = sentence.split(/:|,|\swith\s/i)[0].replace(/\.$/, "").trim()
  if (!lead || /^warning/i.test(lead) || lead.length > 48) return null
  return `${lead}.`
}

// "Nova Pod Kit" -> "Nova." The display name is the title's first word, as typed in the catalog.
export function displayName(title: string): string {
  const first = (title || "").trim().split(/\s+/)[0] || title
  return `${first.replace(/[.,:;]+$/, "")}.`
}

const withCommas = (n: string) => Number(n.replace(/,/g, "")).toLocaleString("en-US")

// Labelled specifications parsed from the product's own description.
export function descriptionSpecs(description: Doc): { label: string; value: string }[] {
  const text = plainText(description)
  if (!text) return []
  const specs: { label: string; value: string }[] = []
  const add = (label: string, value: string | null | undefined) => {
    if (value && !specs.some((s) => s.label === label)) specs.push({ label, value })
  }

  const output = text.match(/(\d+)\s?[–-]\s?(\d+)\s?W\b/)
  if (output) add("Output", `${output[1]} – ${output[2]} W`)
  const mah = text.match(/(\d[\d,]*)\s?mAh/i)
  if (mah) add("Battery", `${withCommas(mah[1])} mAh`)
  else if (/\b18650\b/.test(text)) {
    add("Battery", /battery sold separately/i.test(text) ? "Single 18650, sold separately" : "Single 18650")
  }
  const screen = text.match(/(\d+(?:\.\d+)?)[ -]inch(?:\s+(colou?r))?\s+(display|screen)/i)
  if (screen) add("Screen", `${screen[1]}-inch${screen[2] ? ` ${screen[2]}` : ""}`)
  if (/USB-C/i.test(text)) add("Charging", "USB-C")
  const pod = text.match(/(\d+(?:\.\d+)?)\s?ml\b/i)
  if (pod) add("Pod", `${pod[1]} ml`)
  const coil = text.match(/(\d+(?:\.\d+)?)\s?ohm/i)
  if (coil) add("Coil", `${coil[1]} Ω`)
  if (/adjustable airflow/i.test(text)) add("Airflow", "Adjustable")
  if (/temperature control/i.test(text)) add("Temperature control", "Yes")
  if (/draw activation|draw-activated/i.test(text)) add("Activation", "Draw")
  const base = text.match(/(\d+)\s?VG\s?\/\s?(\d+)\s?PG/i)
  if (base) add("Base", `${base[1]}VG / ${base[2]}PG`)
  return specs
}

// The short spec line under a device name: three parsed facts in their short form.
export function specLine(description: Doc, limit = 3): string {
  const short: Record<string, (v: string) => string> = {
    Battery: (v) => v.replace(/, sold separately$/, ""),
    Screen: (v) => `${v} screen`,
    Pod: (v) => `${v} pod`,
    Coil: (v) => `${v} coil`,
    Airflow: () => "Adjustable airflow",
  }
  return descriptionSpecs(description)
    .filter((s) => !["Temperature control", "Activation", "Base"].includes(s.label))
    .slice(0, limit)
    .map((s) => (short[s.label] ? short[s.label](s.value) : s.value))
    .join(" · ")
}

// Swatch fills for colour option names. Unknown names get no fill and show their name only.
const SWATCHES: Record<string, string> = {
  black: "#1c1d20",
  "jet black": "#1c1d20",
  silver: "#c8ccd2",
  white: "#f6f6f4",
  grey: "#8e9298",
  gray: "#8e9298",
  "space grey": "#5d6066",
  gunmetal: "#55585d",
  "ocean blue": "#2c6aa3",
  blue: "#2c6aa3",
  red: "#b3261e",
  green: "#3f6f4c",
  gold: "#c8a961",
  "rose gold": "#d4a59a",
}

export function swatchFill(name: string): string | null {
  return SWATCHES[(name || "").trim().toLowerCase()] || null
}

export function isColourOption(title?: string | null) {
  return /^colou?r$/i.test((title || "").trim())
}

export function colourValues(product: { productOptions?: any[] | null }): string[] {
  const option = (product.productOptions || []).find((o: any) => isColourOption(o.title))
  return Array.from(new Set((option?.productOptionValues || []).map((v: any) => v.value).filter(Boolean)))
}

// Products whose description names another product ("…for the Nova Pod Kit").
export function mentions(product: { description?: Doc }, other: { title: string }) {
  const text = plainText(product.description).toLowerCase()
  const name = (other.title || "").toLowerCase()
  return !!name && text.includes(name)
}

export function formatMoney(amount: number, currencyCode: string, locale?: string | null) {
  return new Intl.NumberFormat(locale || "en-US", { style: "currency", currency: currencyCode }).format(amount / 100)
}
