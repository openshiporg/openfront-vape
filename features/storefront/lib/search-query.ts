// Turns the header search text into a Product where-clause over published products.
// The access filter already hides drafts from the public; the explicit status keeps
// drafts out even for a signed-in staff session.
export const SEARCH_MAX_LENGTH = 80

export function normaliseSearch(raw: unknown): string {
  const text = Array.isArray(raw) ? raw[0] : raw
  if (typeof text !== "string") return ""
  return text.replace(/\s+/g, " ").trim().slice(0, SEARCH_MAX_LENGTH)
}

export function searchWhere(query: string, countryCode: string) {
  const words = normaliseSearch(query).split(" ").filter(Boolean).slice(0, 6)
  const match = (word: string) => ({
    OR: [
      { title: { contains: word, mode: "insensitive" } },
      { subtitle: { contains: word, mode: "insensitive" } },
      { handle: { contains: word.toLowerCase().replace(/[^a-z0-9-]/g, "") || word, mode: "insensitive" } },
      { productCategories: { some: { title: { contains: word, mode: "insensitive" } } } },
      { productTags: { some: { value: { contains: word, mode: "insensitive" } } } },
    ],
  })
  return {
    AND: [
      { status: { equals: "published" } },
      { isGiftcard: { equals: false } },
      { productVariants: { some: { prices: { some: { region: { countries: { some: { iso2: { equals: countryCode } } } } } } } } },
      // Every word must match somewhere ("menthol 30" finds the 30 ml menthol).
      ...words.map(match),
    ],
  }
}
