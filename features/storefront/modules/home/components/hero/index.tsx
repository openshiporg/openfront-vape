import { ArrowRight } from "lucide-react"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

type Link = { id: string; title: string; handle: string }

interface HeroProps {
  storeName?: string
  title?: string
  description?: string
  categories: Link[]
}

// The shop's front window: the name in gold leaf, the one neon element on screen (the
// saved tagline, as flat logo-hue type; the store has no open-hours data, so it never
// claims "Open"), the departments painted on the glass, and the 21+ note in window vinyl.
const Hero = ({ storeName, title, description, categories }: HeroProps) => {
  const name = storeName || title || "Store"
  const tagline = title && title.trim() !== name.trim() ? title : null
  const departments = [{ id: "all", title: "Shop all", href: "/store" }].concat(
    categories.map((c) => ({ id: c.id, title: c.title, href: `/categories/${c.handle}` }))
  )

  return (
    <section className="vp-window border-b border-vp-glass-line">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-14 lg:grid-cols-12 lg:gap-6 lg:pt-20 lg:pb-16">
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <h1 className="vp-sign vp-gold max-w-[12ch] break-words text-[60px] sm:text-[84px] lg:text-[96px]">
            {name}
          </h1>
          {tagline && (
            <p className="vp-sign vp-neon mt-4 max-w-[24ch] text-[26px] sm:mt-5 sm:text-[34px]">{tagline}</p>
          )}
          {description && (
            <p className="mt-6 hidden max-w-[52ch] text-[16px] leading-[25px] text-white/75 sm:block">{description}</p>
          )}
          {/* The one 21+ note in the band, lettered like door vinyl: cut white sign letters along the foot of the glass, no plate behind them. */}
          <p className="vp-sign mt-6 w-fit border-t border-white/70 pt-2 text-[20px] tracking-[0.02em] text-white sm:mt-8">
            Adults 21+ only
          </p>
        </div>

        <nav aria-label="Departments" className="min-w-0 lg:col-span-5 lg:self-end">
          <ul className="border-t border-vp-glass-line">
            {departments.map((d, i) => (
              <li key={d.id} className="border-b border-vp-glass-line">
                <LocalizedClientLink
                  href={d.href}
                  className="group flex min-h-[52px] items-center justify-between gap-4 py-2 outline-none focus-visible:bg-vp-glass-2 sm:min-h-[60px]"
                >
                  <span
                    className={
                      i === 0
                        ? "vp-sign vp-gold text-[30px] sm:text-[38px]"
                        : "vp-sign text-[30px] text-white transition-colors group-hover:text-vp-gold sm:text-[38px]"
                    }
                  >
                    {d.title}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-white/60 transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:text-vp-gold"
                  />
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}

export default Hero
