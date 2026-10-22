import { ArrowUpRight } from "lucide-react"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

type Link = { id: string; title: string; handle: string }

interface HeroProps {
  storeName?: string
  title?: string
  description?: string
  categories: Link[]
  collections: Link[]
}

const Hero = ({ storeName, title, description, categories, collections }: HeroProps) => {
  const firstCollection = collections[0]

  return (
    <section className="mx-auto max-w-[1320px] px-4 pt-10 pb-6 sm:px-6 sm:pt-16 lg:pt-20">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex flex-col">
          {storeName && (
            <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">{storeName}</p>
          )}
          <h1 className="mt-4 max-w-[14ch] text-[42px] leading-[44px] font-semibold tracking-[-0.03em] text-vp-ink sm:text-[64px] sm:leading-[64px]">
            {title || storeName}
          </h1>
          {description && (
            <p className="mt-5 max-w-md text-[16px] leading-[24px] text-vp-ink-2 sm:text-[17px] sm:leading-[26px]">{description}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-2">
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-12 items-center rounded-full bg-vp-ink px-6 text-[15px] font-medium text-white"
            >
              Shop all
            </LocalizedClientLink>
            {firstCollection && (
              <LocalizedClientLink
                href={`/collections/${firstCollection.handle}`}
                className="inline-flex h-12 items-center rounded-full bg-vp-well px-6 text-[15px] font-medium text-vp-ink"
              >
                {firstCollection.title}
              </LocalizedClientLink>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Categories" className="vp-band self-start p-1.5">
            <ul className="divide-y divide-vp-line">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="group flex min-h-[68px] items-center gap-4 rounded-[14px] px-4 transition-colors hover:bg-vp-surface sm:min-h-[80px] sm:px-5"
                  >
                    <span className="font-vp-mono text-[12px] text-vp-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[22px] leading-[26px] font-semibold tracking-[-0.02em] text-vp-ink sm:text-[26px] sm:leading-[30px]">
                      {c.title}
                    </span>
                    <ArrowUpRight className="ml-auto size-5 text-vp-ink-3 transition-colors group-hover:text-vp-accent" />
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  )
}

export default Hero
