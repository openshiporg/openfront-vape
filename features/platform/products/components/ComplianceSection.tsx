import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { Dot, ListBand, SectionTitle } from '@/features/platform/components/vape-ui'
import type { DotTone } from '@/features/platform/components/vape-primitives'
import type { ProductCompliance, VariantCompliance } from '../actions/compliance'
import {
  CLASSIFICATION_CATEGORY_LABELS,
  CLASSIFICATION_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels'

const CLASSIFICATIONS = '/dashboard/regulated-product-classifications'

function number(value: string | null) {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(parsed) : value
}

function classificationState(classification: VariantCompliance['classification']): { tone: DotTone; label: string } {
  if (!classification) return { tone: 'danger', label: 'No classification' }
  if (classification.status !== 'approved') return { tone: 'warn', label: `Classification ${regulatedLabel(CLASSIFICATION_STATUS_LABELS, classification.status).toLowerCase()}` }
  if (!classification.current) return { tone: 'danger', label: 'Classification expired' }
  return { tone: 'ok', label: 'Classification approved' }
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: DotTone }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="inline-flex items-baseline gap-1.5 text-right text-foreground">
        {tone && <Dot tone={tone} />}
        {value}
      </dd>
    </div>
  )
}

function VariantRow({ variant, onClassify }: { variant: VariantCompliance; onClassify: (variantId: string) => void }) {
  const { classification } = variant
  const state = classificationState(classification)
  const specs = classification
    ? [
        number(classification.nicotineConcentrationMgMl) !== null && `${number(classification.nicotineConcentrationMgMl)} mg/ml`,
        number(classification.liquidVolumeMl) !== null && `${number(classification.liquidVolumeMl)} ml`,
        classification.flavor,
      ].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex min-w-0 items-baseline gap-2">
          <Dot tone={state.tone} />
          <span className="truncate font-medium text-foreground">{variant.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{state.label}</span>
        </span>
        <button
          type="button"
          onClick={() => onClassify(variant.id)}
          className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-background px-3 text-xs font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.08)] max-sm:min-h-10"
        >
          {classification ? 'Edit' : 'Classify'}
        </button>
      </div>
      <dl className="mt-2 space-y-1 text-xs">
        {classification && (
          <>
            <Fact label="Category" value={regulatedLabel(CLASSIFICATION_CATEGORY_LABELS, classification.category)} />
            <Fact
              label="Marketing review"
              value={regulatedLabel(REVIEW_STATUS_LABELS, classification.marketingReviewStatus)}
              tone={classification.marketingReviewStatus === 'approved' ? 'ok' : 'warn'}
            />
            <Fact
              label="Federal authorization"
              value={classification.federalAuthorized ? 'Current' : 'Missing'}
              tone={classification.federalAuthorized ? 'ok' : 'danger'}
            />
            {specs && <Fact label="Specs" value={specs} />}
          </>
        )}
        {variant.sku && <Fact label="SKU" value={variant.sku} />}
      </dl>
    </div>
  )
}

export function ComplianceSection({ compliance, onClassify }: { compliance: ProductCompliance; onClassify: (variantId: string) => void }) {
  const ready = !compliance.publishIssue

  return (
    <section>
      <SectionTitle
        meta={
          <Link
            href={CLASSIFICATIONS}
            className="inline-flex items-center gap-1 font-sans text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            Classifications
            <ArrowUpRight className="size-3" />
          </Link>
        }
      >
        Compliance
      </SectionTitle>
      <ListBand>
        <div className="px-4 py-3 text-sm">
          <span className="inline-flex items-baseline gap-2 font-medium text-foreground">
            <Dot tone={ready ? 'ok' : 'danger'} />
            {ready ? 'Ready to publish' : 'Publishing blocked'}
          </span>
          {compliance.publishIssue && (
            <p className="mt-1 text-xs text-muted-foreground">{compliance.publishIssue}</p>
          )}
          {!compliance.regulated && (
            <p className="mt-1 text-xs text-muted-foreground">
              Exempt
              {compliance.exemptionExpiresAt && (
                <span className="ml-1 font-mono tabular-nums">until {new Date(compliance.exemptionExpiresAt).toISOString().slice(0, 10)}</span>
              )}
            </p>
          )}
        </div>
        {compliance.regulated && compliance.variants.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground">No variants</div>
        )}
        {compliance.regulated && compliance.variants.map(variant => <VariantRow key={variant.id} variant={variant} onClassify={onClassify} />)}
      </ListBand>
    </section>
  )
}
