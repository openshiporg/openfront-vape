import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getStore } from "@/features/storefront/lib/data/store"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import { SegmentedLink, SegmentedTrack } from "@/features/storefront/modules/common/components/vape/segmented"
import {
  POLICY_PAGES,
  hasBusinessDetails,
  readStoreBusiness,
  readStorePolicies,
} from "@/features/platform/store-settings/lib/store-info"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

const PAGES = [
  ...POLICY_PAGES.map((p) => ({ slug: p.slug, title: p.title })),
  { slug: "contact", title: "Contact" },
]

function pageFor(slug: string) {
  return PAGES.find((p) => p.slug === slug)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const page = pageFor(slug)
  if (!page) notFound()
  return { title: page.title }
}

export async function PolicyPage(props: Props) {
  const { slug } = await props.params
  const page = pageFor(slug)
  if (!page) notFound()

  const store = await getStore()
  const business = readStoreBusiness(store?.metadata)
  const policy = POLICY_PAGES.find((p) => p.slug === slug)
  const body = policy ? readStorePolicies(store?.metadata)[policy.key] : ""
  const published = policy ? Boolean(body) : hasBusinessDetails(business)

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
      <header className="flex flex-col gap-2">
        <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">
          {store?.name || "Store"}
        </p>
        <div className="flex items-baseline gap-3">
          {!published && <StatusDot tone="muted" />}
          <h1 className="break-words text-[36px] leading-[40px] font-semibold tracking-[-0.03em] text-vp-ink sm:text-[52px] sm:leading-[56px]">
            {page.title}
          </h1>
        </div>
      </header>

      <nav aria-label="Policies" className="mt-6 border-b border-vp-line pb-5">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <SegmentedTrack label="Policies" className="w-max max-w-none overflow-visible">
            {PAGES.map((p) => (
              <SegmentedLink key={p.slug} href={`/policies/${p.slug}`} active={p.slug === slug} className="max-sm:min-h-11">
                {p.title}
              </SegmentedLink>
            ))}
          </SegmentedTrack>
        </div>
      </nav>

      <div className="mt-8 max-w-[68ch]">
        {!published ? (
          <p className="text-[15px] leading-[24px] text-vp-ink-2" data-testid="policy-unpublished">
            Not published yet.
          </p>
        ) : policy ? (
          <div className="flex flex-col gap-4 text-[15px] leading-[24px] text-vp-ink-2" data-testid="policy-body">
            {body.split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="whitespace-pre-line break-words">
                {para.trim()}
              </p>
            ))}
          </div>
        ) : (
          <dl className="vp-band divide-y divide-vp-line" data-testid="contact-details">
            {business.legalName && (
              <ContactRow label="Legal name">{business.legalName}</ContactRow>
            )}
            {business.email && (
              <ContactRow label="Email">
                <a href={`mailto:${business.email}`} className="break-all text-vp-ink underline underline-offset-2">
                  {business.email}
                </a>
              </ContactRow>
            )}
            {business.phone && (
              <ContactRow label="Phone">
                <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="font-vp-mono text-vp-ink underline underline-offset-2">
                  {business.phone}
                </a>
              </ContactRow>
            )}
            {business.address && (
              <ContactRow label="Address">
                <span className="whitespace-pre-line">{business.address}</span>
              </ContactRow>
            )}
            {business.licenses.length > 0 && (
              <ContactRow label={business.licenses.length > 1 ? "Licences" : "Licence"}>
                <ul className="flex flex-col gap-1">
                  {business.licenses.map((l) => (
                    <li key={l} className="font-vp-mono text-[14px] break-words">{l}</li>
                  ))}
                </ul>
              </ContactRow>
            )}
          </dl>
        )}
      </div>
    </div>
  )
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[13px] leading-[18px] font-medium text-vp-ink-3 sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-[15px] leading-[22px] text-vp-ink">{children}</dd>
    </div>
  )
}
