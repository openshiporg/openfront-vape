import Image from "next/image"
import { ChevronRight } from "lucide-react"
import type { CSSProperties } from "react"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import {
  colourValues,
  displayName,
  formatMoney,
  productTagline,
  specLine,
  swatchFill,
} from "@/features/storefront/modules/common/components/deneb/facts"
import { getCategoriesList } from "@/features/storefront/lib/data/categories"
import type { StoreRegion } from "@/features/storefront/types/storefront"
import BuyButton from "./buy-button"
import { denebCatalog, denebSlots, inStockVariant, type DenebProduct } from "./catalog"

// Deneb home: Apple-like device pages. Each product stands on a soft single-colour sweep (its
// photo's own backdrop, extended in CSS), few words, specs first.

const sweep = (p: DenebProduct): CSSProperties =>
  ({
    "--sw-l": p.tone.left,
    "--sw-r": p.tone.right,
    "--sw-b": p.tone.bottom,
    "--focus-x": `${p.tone.focusX}%`,
    "--fx": p.tone.focusX / 100,
    "--aspect": p.tone.aspect,
  }) as CSSProperties

function Price({ product, region, className }: { product: DenebProduct; region: StoreRegion; className?: string }) {
  if (!product.price) return null
  const from = new Set(product.productVariants.map((v: any) => v.prices?.[0]?.calculatedPrice?.calculatedAmount)).size > 1
  return (
    <p className={className} data-testid="price">
      {from && <span className="deneb-from">From </span>}
      {formatMoney(product.price.amount, product.price.currencyCode, region.locale)}
    </p>
  )
}

function Swatches({ product, small }: { product: DenebProduct; small?: boolean }) {
  const colours = colourValues(product)
    .map((name) => ({ name, fill: swatchFill(name) }))
    .filter((c) => c.fill)
  if (colours.length < 2) return null
  return (
    <ul className={small ? "deneb-swatches deneb-swatches-sm" : "deneb-swatches"} aria-label="Colours">
      {colours.map((c) => (
        <li key={c.name} title={c.name}>
          <span style={{ background: c.fill! }} aria-hidden="true" />
          <span className="sr-only">{c.name}</span>
        </li>
      ))}
    </ul>
  )
}

function Photo({
  product,
  sizes,
  priority,
  fit = "contain",
}: {
  product: DenebProduct
  sizes: string
  priority?: boolean
  fit?: "contain" | "cover"
}) {
  if (!product.thumbnail) return null
  return (
    <Image
      src={product.thumbnail}
      alt={product.title}
      fill
      sizes={sizes}
      priority={priority}
      className={fit === "cover" ? "object-cover" : "object-contain"}
      style={{ objectPosition: `var(--focus-x, 50%) 50%` }}
    />
  )
}

export default async function DenebHome({ region, countryCode }: { region: StoreRegion; countryCode: string }) {
  const [catalog, { productCategories }] = await Promise.all([
    denebCatalog(region, countryCode),
    getCategoriesList(0, 20),
  ])
  const categoryOrder = (productCategories || []).map((c: any) => c.id)
  const { hero, devices, refills, phoneGrid } = denebSlots(catalog, categoryOrder)
  if (!hero) return null

  const heroVariant = inStockVariant(hero)
  const heroTagline = productTagline(hero)
  const href = (p: DenebProduct) => `/products/${p.handle}`
  const heroSpec = specLine(hero.description)

  return (
    <div className="deneb-home">
      {/* Hero: the entry device on its own sweep. */}
      <section className="deneb-hero" style={sweep(hero)} aria-label={hero.title} data-testid="deneb-hero">
        <div className="deneb-hero-photo">
          <Photo product={hero} sizes="(max-width: 1023px) 70vw, 60vw" priority fit="cover" />
        </div>
        <div className="deneb-hero-inner">
          <div className="deneb-hero-copy">
            <h1 className="deneb-hero-name">{displayName(hero.title)}</h1>
            {heroTagline && <p className="deneb-hero-tagline">{heroTagline}</p>}
            <Price product={hero} region={region} className="deneb-hero-price" />
            <div className="deneb-hero-actions">
              <BuyButton
                variantId={heroVariant?.id || null}
                handle={hero.handle}
                label={`Buy ${hero.title}`}
                chevron
                className="deneb-btn deneb-btn-dark deneb-btn-buy"
              />
              {devices.length > 1 && (
                <a href="#compare" className="deneb-btn deneb-btn-outline max-lg:hidden">
                  Compare devices
                </a>
              )}
            </div>
            {heroSpec && <p className="sr-only">{heroSpec}</p>}
          </div>
        </div>
      </section>

      {/* Desktop: the device line-up, one sweep each. */}
      {devices.length > 0 && (
        <section className="deneb-devices max-lg:hidden" aria-label="Devices">
          {devices.map((p) => (
            <LocalizedClientLink key={p.id} href={href(p)} className="deneb-device" style={sweep(p)}>
              <div className="deneb-device-photo">
                <Photo product={p} sizes="20vw" fit="cover" />
              </div>
              <div className="deneb-device-copy">
                <h2>{p.title}</h2>
                <Price product={p} region={region} className="deneb-device-price" />
                {specLine(p.description) && <p className="deneb-device-spec">{specLine(p.description)}</p>}
                <Swatches product={p} />
              </div>
            </LocalizedClientLink>
          ))}
        </section>
      )}

      {/* Phone: a 2×2 grid of tiles, name and price only. */}
      {phoneGrid.length > 0 && (
        <section className="deneb-tiles lg:hidden" aria-label="Products">
          {phoneGrid.map((p, i) => (
            <LocalizedClientLink
              key={p.id}
              href={href(p)}
              className="deneb-tile"
              data-row={Math.floor(i / 2)}
              style={sweep(p)}
              data-dark={p.tone.dark}
            >
              <div className="deneb-tile-photo">
                <Photo product={p} sizes="50vw" fit="cover" />
              </div>
              <div className="deneb-tile-copy">
                <h2>{p.title}</h2>
                <Price product={p} region={region} className="deneb-tile-price" />
              </div>
            </LocalizedClientLink>
          ))}
        </section>
      )}

      {/* Desktop: refills and accessories. */}
      {refills.length > 0 && (
        <section className="deneb-refills max-lg:hidden" aria-labelledby="deneb-refills-title">
          <div className="deneb-section-head">
            <h2 id="deneb-refills-title">Refills</h2>
            <LocalizedClientLink href="/store" className="deneb-more">
              View all <ChevronRight className="size-4" aria-hidden="true" />
            </LocalizedClientLink>
          </div>
          <ul className="deneb-refill-row">
            {refills.slice(0, 7).map((p) => (
              <li key={p.id}>
                <LocalizedClientLink href={href(p)} className="deneb-refill" style={sweep(p)}>
                  <div className="deneb-refill-photo" data-dark={p.tone.dark}>
                    <Photo product={p} sizes="14vw" fit="cover" />
                  </div>
                  <h3>{p.title}</h3>
                  <Price product={p} region={region} className="deneb-refill-price" />
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desktop: compare devices, specs first. */}
      {devices.length > 1 && (
        <section id="compare" className="deneb-compare max-lg:hidden" aria-labelledby="deneb-compare-title">
          <h2 id="deneb-compare-title">Compare devices</h2>
          <ul>
            {devices.map((p) => (
              <li key={p.id}>
                <LocalizedClientLink href={href(p)} className="deneb-compare-item">
                  <div className="deneb-compare-photo" style={sweep(p)}>
                    <Photo product={p} sizes="80px" fit="cover" />
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    <Price product={p} region={region} className="deneb-compare-price" />
                    {specLine(p.description) && <p className="deneb-compare-spec">{specLine(p.description)}</p>}
                    <Swatches product={p} small />
                  </div>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
          <LocalizedClientLink
            href={hero.productCategories[0]?.handle ? `/categories/${hero.productCategories[0].handle}` : "/store"}
            className="deneb-more"
          >
            See all devices <ChevronRight className="size-4" aria-hidden="true" />
          </LocalizedClientLink>
        </section>
      )}
    </div>
  )
}
