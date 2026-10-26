import Footer from "@/features/storefront/modules/layout/templates/footer"
import Nav from "@/features/storefront/modules/layout/templates/nav"
import OpenfrontCTA from "@/features/storefront/modules/layout/components/openfront-cta"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStore } from "@/features/storefront/lib/data/store"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import StorefrontServer from "./StorefrontServer"
import VapeShell from "@/features/storefront/modules/layout/components/vape-shell"

// Page titles read "<page> | <store name>"; the store record is already fetched by the shell.
export async function generateMainMetadata(): Promise<Metadata> {
  const store = await getStore()
  const name = store?.name || "Store"
  return {
    title: { template: `%s | ${name}`, default: name },
    description: store?.homepageDescription || undefined,
  }
}

export async function MainLayout({ children }: { children: React.ReactNode }) {
  const hideBranding = process.env.HIDE_OPENFRONT_BRANDING === 'true'

  return (
    <StorefrontServer
      prefetchUser={true}
      prefetchCart={true}
      prefetchCollections={true}
      prefetchCategories={true}
    >
      <VapeShell>
        <Nav />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        {!hideBranding && <OpenfrontCTA />}
      </VapeShell>
    </StorefrontServer>
  )
}

export const MainNotFoundMetadata: Metadata = {
  title: "Page not found",
}

// Unmatched storefront paths render the branded not-found below.
export function UnmatchedPage(): never {
  notFound()
}

export function MainNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1320px] flex-col justify-center gap-4 px-4 py-24 sm:px-6">
      <h1 className="vp-sign text-[48px] text-vp-ink sm:text-[64px]">Page not found</h1>
      <p className="font-vp-mono text-[13px] text-vp-ink-2">Error 404</p>
      <div className="mt-4">
        <InteractiveLink href="/store">Shop all</InteractiveLink>
      </div>
    </div>
  )
}
