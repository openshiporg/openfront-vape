'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dot, ListBand, SectionTitle } from '@/features/platform/components/vape-ui'
import { Pill, Track } from '@/features/platform/components/vape-primitives'
import {
  AUTHORIZATION_STATUS_LABELS,
  AUTHORIZATION_TYPE_LABELS,
  CLASSIFICATION_CATEGORY_LABELS,
  CLASSIFICATION_STATUS_LABELS,
  NICOTINE_SOURCE_LABELS,
  REVIEW_STATUS_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels'
import {
  getClassifyForm,
  saveAuthorization,
  saveClassification,
  type AuthorizationInput,
  type ClassificationInput,
  type ClassifyForm,
} from '../actions/classify'

const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring'

async function sha256(file: File) {
  const buffer = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('')
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Options({ id, labels, value, onChange, disabled }: {
  id: string
  labels: Record<string, string>
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <select id={id} className={selectClass} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
      {Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select>
  )
}

function EvidenceFile({ id, label, onDigest, digest, onRecord }: {
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

const emptyClassification: ClassificationInput = {
  category: 'e_liquid',
  nicotineSource: 'unknown',
  nicotineConcentrationMgMl: '',
  liquidVolumeMl: '',
  flavor: '',
  packageUnits: 1,
  manufacturer: '',
  brand: '',
  sourceReference: '',
  evidenceDigest: '',
  marketingReviewStatus: 'pending',
  marketingEvidenceDigest: '',
  status: 'draft',
  effectiveAt: '',
  expiresAt: '',
}

const emptyAuthorization: AuthorizationInput = {
  authority: 'FDA',
  authorizationType: 'federal_marketing_order',
  authorizationIdentifier: '',
  evidenceUrl: '',
  evidenceDigest: '',
  jurisdictionId: '',
  status: 'pending',
  effectiveAt: '',
  expiresAt: '',
}

const EDITABLE_STATUSES = ['draft', 'review', 'approved'] as const

function ErrorLine({ message }: { message: string }) {
  if (!message) return null
  return <p role="alert" className="text-xs text-red-600 dark:text-red-400">{message}</p>
}

function AuthorizationForm({ form, onSaved }: { form: ClassifyForm; onSaved: () => void }) {
  const [value, setValue] = useState<AuthorizationInput>(emptyAuthorization)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (patch: Partial<AuthorizationInput>) => setValue(current => ({ ...current, ...patch }))
  const classificationId = form.classification!.id

  return (
    <form
      className="space-y-3 px-4 py-4"
      onSubmit={event => {
        event.preventDefault()
        setError('')
        startTransition(async () => {
          const result = await saveAuthorization(classificationId, value)
          if (!result.success) { setError(result.error); return }
          toast.success('Authorization added')
          setValue(emptyAuthorization)
          onSaved()
        })
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="auth-type" label="Type">
          <Options id="auth-type" labels={AUTHORIZATION_TYPE_LABELS} value={value.authorizationType} onChange={authorizationType => set({ authorizationType })} />
        </Field>
        <Field id="auth-authority" label="Authority">
          <Input id="auth-authority" required value={value.authority} onChange={event => set({ authority: event.target.value })} />
        </Field>
        <Field id="auth-number" label="Authorization number">
          <Input id="auth-number" required value={value.authorizationIdentifier} onChange={event => set({ authorizationIdentifier: event.target.value })} />
        </Field>
        <Field id="auth-jurisdiction" label="Jurisdiction">
          <select id="auth-jurisdiction" className={selectClass} value={value.jurisdictionId} onChange={event => set({ jurisdictionId: event.target.value })}>
            <option value="">Federal</option>
            {form.jurisdictions.map(jurisdiction => (
              <option key={jurisdiction.id} value={jurisdiction.id}>{jurisdiction.code} {jurisdiction.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="auth-url" label="Evidence URL">
        <Input id="auth-url" type="url" required value={value.evidenceUrl} onChange={event => set({ evidenceUrl: event.target.value })} />
      </Field>
      <EvidenceFile id="auth-file" label="Evidence document" digest={value.evidenceDigest} onRecord={false} onDigest={evidenceDigest => set({ evidenceDigest })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field id="auth-status" label="Status">
          <Options id="auth-status" labels={{ pending: AUTHORIZATION_STATUS_LABELS.pending, authorized: AUTHORIZATION_STATUS_LABELS.authorized }} value={value.status} onChange={status => set({ status })} />
        </Field>
        <Field id="auth-from" label="Effective from">
          <Input id="auth-from" type="date" required value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
        </Field>
        <Field id="auth-to" label="Expires">
          <Input id="auth-to" type="date" value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
        </Field>
      </div>
      <ErrorLine message={error} />
      <Button type="submit" disabled={pending || !value.evidenceDigest} className="h-10 w-full rounded-full">
        {pending ? 'Saving…' : 'Add authorization'}
      </Button>
    </form>
  )
}

export function ClassifySheet({ variantId, open, onOpenChange, onSaved }: {
  variantId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<ClassifyForm | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [value, setValue] = useState<ClassificationInput>(emptyClassification)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const load = (id: string) => {
    setLoadState('loading')
    getClassifyForm(id)
      .then(result => {
        setForm(result)
        setLoadState(result ? 'ready' : 'failed')
        if (result?.classification) {
          const { id: _id, hasEvidence: _e, hasMarketingEvidence: _m, ...fields } = result.classification
          setValue({ ...emptyClassification, ...fields })
        } else {
          setValue(emptyClassification)
        }
      })
      .catch(() => setLoadState('failed'))
  }

  useEffect(() => {
    if (open && variantId) { setError(''); load(variantId) }
  }, [open, variantId])

  const set = (patch: Partial<ClassificationInput>) => setValue(current => ({ ...current, ...patch }))
  const existing = form?.classification
  const locked = Boolean(existing && ['approved', 'rejected', 'revoked'].includes(existing.status))
  const needsEvidence = !existing?.hasEvidence && !value.evidenceDigest

  const refresh = () => {
    if (variantId) load(variantId)
    onSaved()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span>Classify {form?.variant.title || 'variant'}</span>
            {existing && (
              <span className="inline-flex items-baseline gap-1.5 text-sm font-normal text-muted-foreground">
                <Dot tone={existing.status === 'approved' ? 'ok' : existing.status === 'review' ? 'warn' : 'muted'} />
                {regulatedLabel(CLASSIFICATION_STATUS_LABELS, existing.status)}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">Product classification and authorization</SheetDescription>
        </SheetHeader>

        {loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
        {loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load compliance records.</p>}

        {loadState === 'ready' && form && (
          <div className="space-y-8 px-4 pb-24 sm:pb-8">
            <form
              className="space-y-6"
              onSubmit={event => {
                event.preventDefault()
                if (locked) return
                setError('')
                startTransition(async () => {
                  const result = await saveClassification(form.variant.id, existing?.id || null, value)
                  if (!result.success) { setError(result.error); return }
                  toast.success('Classification saved')
                  refresh()
                })
              }}
            >
              <fieldset disabled={locked} className="space-y-6">
                <section>
                  <SectionTitle>Product</SectionTitle>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field id="cls-category" label="Product type">
                      <Options id="cls-category" labels={CLASSIFICATION_CATEGORY_LABELS} value={value.category} onChange={category => set({ category })} />
                    </Field>
                    <Field id="cls-source" label="Nicotine source">
                      <Options id="cls-source" labels={NICOTINE_SOURCE_LABELS} value={value.nicotineSource} onChange={nicotineSource => set({ nicotineSource })} />
                    </Field>
                    <Field id="cls-strength" label="Nicotine strength (mg/ml)">
                      <Input id="cls-strength" inputMode="decimal" className="font-mono" value={value.nicotineConcentrationMgMl} onChange={event => set({ nicotineConcentrationMgMl: event.target.value })} />
                    </Field>
                    <Field id="cls-volume" label="Liquid volume (ml)">
                      <Input id="cls-volume" inputMode="decimal" className="font-mono" value={value.liquidVolumeMl} onChange={event => set({ liquidVolumeMl: event.target.value })} />
                    </Field>
                    <Field id="cls-flavor" label="Flavour">
                      <Input id="cls-flavor" value={value.flavor} onChange={event => set({ flavor: event.target.value })} />
                    </Field>
                    <Field id="cls-units" label="Units per pack">
                      <Input id="cls-units" type="number" min={1} className="font-mono" value={value.packageUnits} onChange={event => set({ packageUnits: Math.max(1, Number(event.target.value) || 1) })} />
                    </Field>
                    <Field id="cls-brand" label="Brand">
                      <Input id="cls-brand" required value={value.brand} onChange={event => set({ brand: event.target.value })} />
                    </Field>
                    <Field id="cls-maker" label="Manufacturer">
                      <Input id="cls-maker" required value={value.manufacturer} onChange={event => set({ manufacturer: event.target.value })} />
                    </Field>
                  </div>
                </section>

                <section>
                  <SectionTitle>Evidence</SectionTitle>
                  <div className="space-y-3">
                    <Field id="cls-reference" label="Source reference">
                      <Input id="cls-reference" required value={value.sourceReference} onChange={event => set({ sourceReference: event.target.value })} />
                    </Field>
                    <EvidenceFile id="cls-evidence" label="Evidence document" digest={value.evidenceDigest || ''} onRecord={Boolean(existing?.hasEvidence)} onDigest={evidenceDigest => set({ evidenceDigest })} />
                  </div>
                </section>

                <section>
                  <SectionTitle>Review</SectionTitle>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field id="cls-marketing" label="Marketing review">
                        <Options id="cls-marketing" labels={{ pending: REVIEW_STATUS_LABELS.pending, approved: REVIEW_STATUS_LABELS.approved, rejected: REVIEW_STATUS_LABELS.rejected }} value={value.marketingReviewStatus} onChange={marketingReviewStatus => set({ marketingReviewStatus })} />
                      </Field>
                      <EvidenceFile id="cls-marketing-evidence" label="Marketing review document" digest={value.marketingEvidenceDigest || ''} onRecord={Boolean(existing?.hasMarketingEvidence)} onDigest={marketingEvidenceDigest => set({ marketingEvidenceDigest })} />
                      <Field id="cls-from" label="Effective from">
                        <Input id="cls-from" type="date" value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                      </Field>
                      <Field id="cls-to" label="Expires">
                        <Input id="cls-to" type="date" value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                      </Field>
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-xs text-muted-foreground">Status</span>
                      <Track label="Classification status">
                        {EDITABLE_STATUSES.map(status => (
                          <Pill key={status} active={value.status === status} onClick={() => set({ status })}>
                            {CLASSIFICATION_STATUS_LABELS[status]}
                          </Pill>
                        ))}
                      </Track>
                    </div>
                  </div>
                </section>
              </fieldset>

              <ErrorLine message={error} />
              {!locked && (
                <Button type="submit" disabled={pending || needsEvidence} className="h-10 w-full rounded-full">
                  {pending ? 'Saving…' : existing ? 'Save classification' : 'Create classification'}
                </Button>
              )}
              {!locked && needsEvidence && <p className="text-xs text-muted-foreground">Evidence document required</p>}
            </form>

            {existing && (
              <section>
                <SectionTitle meta={form.authorizations.length}>Authorizations</SectionTitle>
                <ListBand>
                  {form.authorizations.map(authorization => (
                    <div key={authorization.id} className="px-4 py-3 text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="inline-flex min-w-0 items-baseline gap-2 font-medium text-foreground">
                          <Dot tone={authorization.status === 'authorized' ? 'ok' : authorization.status === 'pending' ? 'warn' : 'danger'} />
                          <span className="truncate">{regulatedLabel(AUTHORIZATION_TYPE_LABELS, authorization.authorizationType)}</span>
                          <span className="shrink-0 text-xs font-normal text-muted-foreground">{regulatedLabel(AUTHORIZATION_STATUS_LABELS, authorization.status)}</span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">{authorization.jurisdiction || 'Federal'}</span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {authorization.authority} {authorization.authorizationIdentifier}
                        {authorization.expiresAt && ` · until ${authorization.expiresAt.slice(0, 10)}`}
                      </p>
                    </div>
                  ))}
                  <AuthorizationForm form={form} onSaved={refresh} />
                </ListBand>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
