"use client"

import { useState } from "react"
import { RiLoader2Fill } from "@remixicon/react"

import {
  exportMyPrivacyData,
  savePrivacyPreferences,
  submitPrivacyRequest,
  type PrivacyPreferences,
  type PrivacyRequestRecord,
} from "@/features/storefront/lib/data/privacy"
import { SegmentedButton, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { InlineError, formatAccountDate, rowPillClass } from "@/features/storefront/modules/account/components/account-ui"

type PreferenceKey = "analytics" | "marketingEmail"

const PREFERENCES: Array<{ key: PreferenceKey; label: string }> = [
  { key: "analytics", label: "Analytics" },
  { key: "marketingEmail", label: "Marketing email" },
]

const REQUEST_ACTIONS: Record<string, string> = {
  delete: "Deletion requested",
  access: "Access requested",
  correct: "Correction requested",
  restrict: "Restriction requested",
  object: "Objection filed",
}

const REQUEST_STATUSES: Record<string, { label: string; tone: "ok" | "warn" | "danger" | "muted" | "accent" }> = {
  pending_identity_verification: { label: "Pending identity verification", tone: "warn" },
  pending: { label: "Pending", tone: "warn" },
  in_progress: { label: "In progress", tone: "accent" },
  completed: { label: "Completed", tone: "ok" },
  rejected: { label: "Rejected", tone: "danger" },
}

function requestStatus(status: string) {
  return REQUEST_STATUSES[status] || { label: status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()), tone: "muted" as const }
}

export default function PrivacySettings({
  initialPreferences,
  loadError,
}: {
  initialPreferences: PrivacyPreferences | null
  loadError?: string | null
}) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>(
    initialPreferences ?? { analytics: false, marketingEmail: false, recordedAt: null }
  )
  const [saving, setSaving] = useState<PreferenceKey | null>(null)
  const [preferenceError, setPreferenceError] = useState<string | null>(loadError ?? null)

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requests, setRequests] = useState<PrivacyRequestRecord[]>([])

  const setPreference = async (key: PreferenceKey, value: boolean) => {
    if (saving || preferences[key] === value) return
    const previous = preferences
    const next = { ...preferences, [key]: value }
    setPreferences(next)
    setSaving(key)
    setPreferenceError(null)
    const result = await savePrivacyPreferences({ analytics: next.analytics, marketingEmail: next.marketingEmail })
    if (result.ok) {
      setPreferences(result.preferences)
    } else {
      setPreferences(previous)
      setPreferenceError(result.error)
    }
    setSaving(null)
  }

  const downloadData = async () => {
    setExporting(true)
    setExportError(null)
    const result = await exportMyPrivacyData()
    if (result.ok) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } else {
      setExportError(result.error)
    }
    setExporting(false)
  }

  const requestDeletion = async () => {
    setRequesting(true)
    setRequestError(null)
    const result = await submitPrivacyRequest("delete")
    if (result.ok) {
      setRequests((current) => [result.request, ...current])
      setConfirmingDelete(false)
    } else {
      setRequestError(result.error)
    }
    setRequesting(false)
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <section aria-labelledby="privacy-preferences" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="privacy-preferences" className="text-[17px] leading-[24px] font-semibold text-vp-ink">Preferences</h3>
          {preferences.recordedAt && (
            <span className="font-vp-mono text-[12px] text-vp-ink-3" data-testid="privacy-recorded-at">
              Saved {formatAccountDate(preferences.recordedAt)}
            </span>
          )}
        </div>
        <div className="vp-band flex flex-col divide-y divide-vp-line" data-testid="privacy-preferences">
          {PREFERENCES.map(({ key, label }) => (
            <div key={key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <span id={`privacy-${key}`} className="flex items-center gap-2 text-[15px] font-medium text-vp-ink">
                {label}
                {saving === key && <RiLoader2Fill className="h-4 w-4 animate-spin text-vp-ink-3" aria-label="Saving" />}
              </span>
              <SegmentedTrack label={label}>
                <SegmentedButton
                  active={!preferences[key]}
                  onClick={() => setPreference(key, false)}
                  data-testid={`privacy-${key}-off`}
                >
                  Off
                </SegmentedButton>
                <SegmentedButton
                  active={preferences[key]}
                  onClick={() => setPreference(key, true)}
                  data-testid={`privacy-${key}-on`}
                >
                  On
                </SegmentedButton>
              </SegmentedTrack>
            </div>
          ))}
        </div>
        {preferenceError && <InlineError data-testid="privacy-preferences-error">{preferenceError}</InlineError>}
      </section>

      <section aria-labelledby="privacy-data" className="flex flex-col gap-3">
        <h3 id="privacy-data" className="text-[17px] leading-[24px] font-semibold text-vp-ink">Your data</h3>
        <div className="vp-band flex flex-col divide-y divide-vp-line">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <span className="text-[15px] font-medium text-vp-ink">Account, addresses and orders</span>
            <button
              type="button"
              onClick={downloadData}
              disabled={exporting}
              className={rowPillClass}
              data-testid="privacy-download-button"
            >
              {exporting && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
              Download my data
            </button>
          </div>
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-vp-ink">Account deletion</span>
              {!confirmingDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setRequestError(null)
                    setConfirmingDelete(true)
                  }}
                  className={rowPillClass}
                  data-testid="privacy-delete-button"
                >
                  Request deletion
                </button>
              )}
            </div>
            {confirmingDelete && (
              <div className="flex flex-col gap-3" role="group" aria-label="Confirm deletion request">
                <p className="text-[14px] leading-[20px] text-vp-ink-2">Request deletion of this account and its data?</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={requestDeletion}
                    disabled={requesting}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-vp-danger px-4 text-[13px] font-medium text-vp-on-ink transition-opacity hover:opacity-90 disabled:opacity-60"
                    data-testid="privacy-delete-confirm"
                  >
                    {requesting && <RiLoader2Fill className="h-4 w-4 animate-spin" />}
                    Confirm request
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={requesting}
                    className={rowPillClass}
                    data-testid="privacy-delete-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {exportError && <InlineError data-testid="privacy-download-error">{exportError}</InlineError>}
        {requestError && <InlineError data-testid="privacy-request-error">{requestError}</InlineError>}
      </section>

      {requests.length > 0 && (
        <section aria-labelledby="privacy-requests" className="flex flex-col gap-3">
          <h3 id="privacy-requests" className="text-[17px] leading-[24px] font-semibold text-vp-ink">Requests</h3>
          <ul className="vp-band flex flex-col divide-y divide-vp-line" data-testid="privacy-requests">
            {requests.map((request, index) => {
              const status = requestStatus(request.status)
              return (
                <li key={request.id || index} className="flex flex-col gap-1 px-4 py-3 sm:px-5">
                  <p className="flex items-baseline gap-2.5 text-[15px] font-medium text-vp-ink">
                    <StatusDot tone={status.tone} />
                    {REQUEST_ACTIONS[request.action] || "Request filed"}
                  </p>
                  <p className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-vp-ink-2">
                    <span data-testid="privacy-request-status">{status.label}</span>
                    {request.requestedAt && (
                      <span className="font-vp-mono text-vp-ink-3">{formatAccountDate(request.requestedAt)}</span>
                    )}
                    {request.id && <span className="break-all font-vp-mono text-vp-ink-3">Ref {request.id}</span>}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
