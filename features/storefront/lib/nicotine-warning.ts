// 21 CFR 1143.3(a)(1): the required warning, exact capitalisation and punctuation.
// It is fixed here, not stored, so nobody can reword it from the admin.
export const NICOTINE_WARNING = "WARNING: This product contains nicotine. Nicotine is an addictive chemical."

type StoreWarningSetting = { nicotineWarningRequired?: boolean | null } | null | undefined

// Fails closed: the warning shows unless compliance has explicitly turned it off.
// A missing store (fetch failed) or an unset field still shows it.
export function nicotineWarningText(store: StoreWarningSetting): string | null {
  return store?.nicotineWarningRequired === false ? null : NICOTINE_WARNING
}
