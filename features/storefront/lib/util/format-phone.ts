/** 10-digit US numbers read as (813) 555-0177; anything else is shown as typed. */
export function formatPhone(value: string | null | undefined): string {
  const raw = value ?? ""
  const digits = raw.replace(/\D/g, "")
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  if (national.length !== 10) return raw
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`
}
