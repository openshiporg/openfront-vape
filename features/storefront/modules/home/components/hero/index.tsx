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
    <section className="mx-auto max-w-[1320px] px-4 pt-12 pb-10 sm:px-6 sm:pt-20 lg:pt-24">
      {storeName && (
        <p className="font-vp-mono text-[12px] uppercase tracking-[0.14em] text-vp-ink-3">{storeName}</p>
      )}
      <h1 className="mt-5 max-w-[16ch] text-[48px] leading-[46px] font-semibold tracking-[-0.04em] text-vp-ink text-balance sm:text-[88px] sm:leading-[82px] lg:text-[112px] lg:leading-[100px]">
        {title || storeName}
      </h1>
      <div className="mt-10 grid gap-10 border-t border-vp-line pt-8 lg:mt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col">
          {description && (
            <p className="max-w-md text-[16px] leading-[24px] text-vp-ink-2 sm:text-[17px] sm:leading-[26px]">{description}</p>
          )}
          <div className={`${description ? "mt-8" : ""} flex flex-wrap gap-2`}>
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-12 items-center rounded-full bg-vp-ink px-6 text-[15px] font-medium text-vp-on-ink"
            >
              Shop all
            </LocalizedClientLink>
            {firstCollection && (
              <LocalizedClientLink
                href={`/collections/${firstCollection.handle}`}
                className="inline-flex h-12 items-center rounded-full bg-vp-well px-6 text-[15px] font-medium text-vp-ink ring-1 ring-vp-line"
              >
                {firstCollection.title}
              </LocalizedClientLink>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Categories">
            <ul className="divide-y divide-vp-line border-y border-vp-line">
              {categories.map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="group flex min-h-[64px] items-center gap-4 transition-colors sm:min-h-[76px]"
                  >
                    <span className="text-[24px] leading-[28px] font-semibold tracking-[-0.025em] text-vp-ink transition-transform duration-300 ease-out group-hover:translate-x-1.5 sm:text-[30px] sm:leading-[34px]">
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
