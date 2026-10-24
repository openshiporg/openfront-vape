'use client'

import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Form pieces shared by the compliance record sheets and drawers.

export const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60'

export const textareaClass =
  'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60'

/** Evidence documents are hashed in the browser; only the SHA-256 is stored. */
export async function sha256(file: File) {
  const buffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function Options({ id, labels, value, onChange, disabled, empty }: {
  id: string
  labels: Record<string, string>
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  empty?: string
}) {
  return (
    <select id={id} className={selectClass} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
      {empty !== undefined && <option value="">{empty}</option>}
      {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select>
  )
}

export function EvidenceFile({ id, label, digest, onRecord, onDigest }: {
  id: string
  label: string
  digest: string
  onRecord: boolean
  onDigest: (digest: string) => void
}) {
  return (
    <Field id={id} label={label}>
      <Input
        id={id}
        type="file"
        className="h-10 cursor-pointer pt-2 text-xs"
        onChange={async event => {
          const file = event.target.files?.[0]
          onDigest(file ? await sha256(file) : '')
        }}
      />
      <p className="truncate font-mono text-[11px] text-muted-foreground">
        {digest ? `SHA-256 ${digest}` : onRecord ? 'On file' : 'No file'}
      </p>
    </Field>
  )
}

export function Checks({ label, options, value, onChange }: {
  label: string
  options: Array<[string, string]>
  value: string[]
  onChange: (value: string[]) => void
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs text-muted-foreground">{label}</legend>
      <div className="grid max-h-48 gap-1 overflow-y-auto rounded-md border border-input p-2 sm:grid-cols-2">
        {options.map(([key, text]) => (
          <label key={key} className="flex min-h-8 items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={value.includes(key)}
              onChange={event => onChange(event.target.checked ? [...value, key] : value.filter(item => item !== key))}
            />
            {text}
          </label>
        ))}
        {options.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
      </div>
    </fieldset>
  )
}

export function ErrorLine({ message }: { message: string }) {
  if (!message) return null
  return <p role="alert" className="text-xs text-red-600 dark:text-red-400">{message}</p>
}

/** yyyy-mm-dd for date inputs, and back to an ISO midnight UTC timestamp. */
export const dayValue = (value: string | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : '')
