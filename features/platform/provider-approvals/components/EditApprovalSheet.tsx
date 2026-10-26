'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checks, dayValue, ErrorLine, EvidenceFile, Field, selectClass } from '@/features/platform/components/compliance-form'
import { SectionTitle } from '@/features/platform/components/vape-ui'
import { CLASSIFICATION_CATEGORY_LABELS, PROVIDER_PURPOSE_LABELS, regulatedLabel } from '@/features/keystone/regulated/labels'
import { getApprovalOptions, type ApprovalOptions } from '@/features/platform/compliance-center/actions/approvals'
import { updateProviderApproval, type ApprovalDetail, type ApprovalEditInput } from '../actions/provider-approvals'
import { actionClass } from '@/features/platform/product-evidence/components/TransitionActions'

function initial(approval: ApprovalDetail): ApprovalEditInput {
  return {
    profileId: approval.profile?.id || '',
    providerCode: approval.providerCode,
    approvalReference: approval.approvalReference,
    evidenceDigest: '',
    coveredCategories: approval.coveredCategories,
    coveredJurisdictionCodes: approval.coveredJurisdictionCodes,
    capabilities: approval.capabilities.join(', '),
    paymentProviderId: approval.paymentProvider?.id || '',
    shippingProviderId: approval.shippingProvider?.id || '',
    effectiveAt: dayValue(approval.effectiveAt),
    expiresAt: dayValue(approval.expiresAt),
  }
}

export function EditApprovalSheet({ approval }: { approval: ApprovalDetail }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ApprovalOptions | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [value, setValue] = useState<ApprovalEditInput>(() => initial(approval))
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const set = (patch: Partial<ApprovalEditInput>) => setValue(current => ({ ...current, ...patch }))

  useEffect(() => {
    if (!open) return
    setError('')
    setValue(initial(approval))
    setLoadState('loading')
    getApprovalOptions()
      .then(result => {
        setOptions(result)
        setLoadState(result ? 'ready' : 'failed')
      })
      .catch(() => setLoadState('failed'))
  }, [open, approval])

  // Keep codes already on the record selectable even if the jurisdiction list is short
  const jurisdictionOptions: Array<[string, string]> = options
    ? [
        ...options.jurisdictions.map(jurisdiction => [jurisdiction.code, `${jurisdiction.code} ${jurisdiction.name}`] as [string, string]),
        ...approval.coveredJurisdictionCodes
          .filter(code => !options.jurisdictions.some(jurisdiction => jurisdiction.code === code))
          .map(code => [code, code] as [string, string]),
      ]
    : []

  return (
    <>
      <button type="button" className={actionClass} onClick={() => setOpen(true)}>Edit</button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-2">
            <SheetTitle>Edit {regulatedLabel(PROVIDER_PURPOSE_LABELS, approval.purpose).toLowerCase()} approval</SheetTitle>
            <SheetDescription className="sr-only">Edit a provider approval</SheetDescription>
          </SheetHeader>

          {loadState === 'loading' && <p className="px-4 text-sm text-muted-foreground">Loading…</p>}
          {loadState === 'failed' && <p role="alert" className="px-4 text-sm text-red-600 dark:text-red-400">Unable to load compliance records.</p>}

          {loadState === 'ready' && options && (
            <form
              className="space-y-6 px-4 pb-24 sm:pb-8"
              onSubmit={event => {
                event.preventDefault()
                setError('')
                startTransition(async () => {
                  const result = await updateProviderApproval(approval.id, approval.purpose, value)
                  if (!result.success) { setError(result.error); return }
                  toast.success('Approval saved')
                  setOpen(false)
                  router.refresh()
                })
              }}
            >
              <section className="space-y-3">
                <SectionTitle>Provider</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="ea-profile" label="Merchant profile">
                    <select id="ea-profile" className={selectClass} value={value.profileId} onChange={event => set({ profileId: event.target.value })}>
                      <option value="">None</option>
                      {options.profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.legalName}</option>)}
                    </select>
                  </Field>
                  <Field id="ea-code" label="Provider code">
                    <Input id="ea-code" required className="font-mono" value={value.providerCode} onChange={event => set({ providerCode: event.target.value })} />
                  </Field>
                  {approval.purpose === 'payment' && (
                    <Field id="ea-payment" label="Payment provider">
                      <select id="ea-payment" className={selectClass} value={value.paymentProviderId} onChange={event => set({ paymentProviderId: event.target.value })}>
                        <option value="">None</option>
                        {options.paymentProviders.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                      </select>
                    </Field>
                  )}
                  {approval.purpose === 'carrier' && (
                    <Field id="ea-shipping" label="Shipping provider">
                      <select id="ea-shipping" className={selectClass} value={value.shippingProviderId} onChange={event => set({ shippingProviderId: event.target.value })}>
                        <option value="">None</option>
                        {options.shippingProviders.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                      </select>
                    </Field>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Coverage</SectionTitle>
                <Checks
                  label="Product types"
                  options={Object.entries(CLASSIFICATION_CATEGORY_LABELS)}
                  value={value.coveredCategories}
                  onChange={coveredCategories => set({ coveredCategories })}
                />
                <Checks
                  label="Jurisdictions"
                  options={jurisdictionOptions}
                  value={value.coveredJurisdictionCodes}
                  onChange={coveredJurisdictionCodes => set({ coveredJurisdictionCodes })}
                />
                <Field id="ea-capabilities" label="Capabilities (comma separated)">
                  <Input id="ea-capabilities" className="font-mono" value={value.capabilities} onChange={event => set({ capabilities: event.target.value })} />
                </Field>
              </section>

              <section className="space-y-3">
                <SectionTitle>Evidence</SectionTitle>
                <Field id="ea-reference" label="Approval reference">
                  <Input id="ea-reference" required value={value.approvalReference} onChange={event => set({ approvalReference: event.target.value })} />
                </Field>
                <EvidenceFile id="ea-evidence" label="Evidence document" digest={value.evidenceDigest} onRecord={approval.hasEvidence} onDigest={evidenceDigest => set({ evidenceDigest })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="ea-from" label="Effective from">
                    <Input id="ea-from" type="date" value={value.effectiveAt} onChange={event => set({ effectiveAt: event.target.value })} />
                  </Field>
                  <Field id="ea-to" label="Expires">
                    <Input id="ea-to" type="date" value={value.expiresAt} onChange={event => set({ expiresAt: event.target.value })} />
                  </Field>
                </div>
              </section>

              <ErrorLine message={error} />
              <Button type="submit" disabled={pending || (!approval.hasEvidence && !value.evidenceDigest)} className="h-10 w-full rounded-[4px]">
                {pending ? 'Saving…' : 'Save approval'}
              </Button>
              {!approval.hasEvidence && !value.evidenceDigest && <p className="text-xs text-muted-foreground">Evidence document required</p>}
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
