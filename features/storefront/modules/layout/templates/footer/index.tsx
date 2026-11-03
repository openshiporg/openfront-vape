import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Wordmark from "@/features/storefront/modules/common/components/deneb/wordmark"
import { getStore } from "@/features/storefront/lib/data/store"
import { getUser } from "@/features/storefront/lib/data/user"
import {
  POLICY_PAGES,
  hasBusinessDetails,
  readStoreBusiness,
  livePolicies,
} from "@/features/platform/store-settings/lib/store-info"
import TabBar from "./tab-bar"
import { nicotineWarningText } from "@/features/storefront/lib/nicotine-warning"

// The age line the storefront carries on every page. Checkout runs the 21+ age check;
// delivery adds adult signature and ID.
export const AGE_LINE = "21+ only. Age checked at checkout."

const SHORT_POLICY: Record<string, string> = {
  shipping: "Shipping",
  returns: "Returns",
  "age-verification": "Age policy",
  privacy: "Privacy",
  terms: "Terms",
}

export default async function Footer() {
  const [{ productCategories }, store, customer] = await Promise.all([
    getCategoriesList(0, 8),
    getStore(),
    getUser(),
  ])
  const storeName = store?.name || "Store"
  const warning = nicotineWarningText(store as any)
  const business = readStoreBusiness(store?.metadata)
  const policies = livePolicies(store?.metadata)
  const policyLinks = POLICY_PAGES.filter((p) => policies[p.key])
  const showContact = hasBusinessDetails(business)
  const categories = (productCategories || []).filter(
    (c: any) => !c.parentCategory && !c.isInternal && c.isActive !== false
  )

  const link = "inline-flex min-h-10 items-center text-[13px] text-white/85 underline-offset-4 hover:text-white hover:underline"

  return (
    <>
      <footer className="deneb-footer bg-[#1d1f22] text-white" data-testid="footer">
        <div className="mx-auto max-w-[1600px] px-5 lg:px-12">
          <div className="flex flex-col gap-5 py-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8 lg:py-3">
            <Wordmark tone="light" className="deneb-footer-mark" />
            <p className="text-[14px] text-white/90 max-lg:hidden">{AGE_LINE}</p>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-0 lg:justify-end lg:gap-x-8">
              {showContact && (
                <LocalizedClientLink className={link} href="/policies/contact">
                  Support
                </LocalizedClientLink>
              )}
              {policyLinks.map((p) => (
                <LocalizedClientLink key={p.slug} className={link} href={`/policies/${p.slug}`}>
                  {SHORT_POLICY[p.slug] || p.title}
                </LocalizedClientLink>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-1 border-t border-white/10 py-4 lg:hidden">
            <nav aria-label="Departments" className="flex flex-wrap gap-x-6">
              {categories.slice(0, 6).map((c: any) => (
                <LocalizedClientLink key={c.id} className={link} href={`/categories/${c.handle}`}>
                  {c.title}
                </LocalizedClientLink>
              ))}
              <LocalizedClientLink className={link} href="/account" data-testid="footer-account-link">
                {customer ? "Account" : "Sign in"}
              </LocalizedClientLink>
            </nav>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 py-4 text-[12px] leading-[18px] text-white/70 lg:flex-row lg:items-start lg:justify-between">
            {showContact ? (
              <p className="flex flex-wrap gap-x-4 gap-y-1" data-testid="footer-business">
                {business.legalName && <span className="text-white/90">{business.legalName}</span>}
                {business.licenses.map((l) => (
                  <span key={l} className="break-all">{l}</span>
                ))}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="break-all hover:text-white hover:underline">
                    {business.email}
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white hover:underline">
                    {business.phone}
                  </a>
                )}
              </p>
            ) : (
              <span />
            )}
            <p suppressHydrationWarning className="shrink-0">
              © {new Date().getFullYear()} {business.legalName || storeName}
            </p>
          </div>
          {warning && (
            <p className="border-t border-white/10 py-3 text-[12px] font-semibold leading-[18px] text-white" data-testid="footer-nicotine-warning">
              {warning}
            </p>
          )}
        </div>
      </footer>
      <TabBar ageLine={AGE_LINE} />
    </>
  )
}
