/** Short, stable record serial for a stamp: the tail of the record id, upper-cased. */
export function recordSerial(id: string | null | undefined) {
  if (!id) return ''
  return id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()
}
