"use client"

import Image from "next/image"
import { useEffect, useState, type CSSProperties } from "react"

import SpecTile from "@/features/storefront/modules/common/components/vape/spec-tile"
import { cn } from "@/lib/utils"
import type { PhotoTone } from "@/features/storefront/modules/common/components/deneb/photo-tone"

type ImageGalleryProps = {
  images: any[];
  handle: string;
  region: any;
  title?: string;
  kicker?: string | null;
  specs?: { label: string; value: string }[];
  tone?: PhotoTone;
};

const ImageGallery = ({ images, title, kicker, specs, tone }: ImageGalleryProps) => {
  const sweep = tone
    ? ({ "--sw-l": tone.left, "--sw-r": tone.right, "--sw-b": tone.bottom, "--focus-x": `${tone.focusX}%` } as CSSProperties)
    : undefined
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [active, setActive] = useState(0)

  // Listen for variant changes from ProductActions
  useEffect(() => {
    const handleVariantChange = (event: any) => {
      setSelectedVariant(event.detail)
      setActive(0)
    }

    window.addEventListener('variantChange', handleVariantChange)
    return () => window.removeEventListener('variantChange', handleVariantChange)
  }, [])

  const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0))

  const displayImages = selectedVariant?.primaryImage
    ? [selectedVariant.primaryImage, ...sortedImages.filter(img => img.id !== selectedVariant.primaryImage.id)]
    : sortedImages

  const sources = displayImages
    .map((image) => ({ id: image.id, src: image?.image?.url || image?.imagePath, alt: image?.altText }))
    .filter((image) => !!image.src)

  if (!sources.length) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[4px] bg-vp-well sm:aspect-square lg:aspect-[4/5]">
        <SpecTile title={title || ""} kicker={kicker} specs={specs} size="lg" />
      </div>
    )
  }

  const current = sources[Math.min(active, sources.length - 1)]

  return (
    <div className="deneb-gallery" style={sweep} data-dark={tone?.dark || undefined}>
      <div className="deneb-gallery-main" id={current.id}>
        <Image
          key={current.id}
          src={current.src}
          priority
          className="object-cover"
          style={{ objectPosition: "var(--focus-x, 50%) 50%" }}
          alt={current.alt || title || "Product image"}
          fill
          sizes="(max-width: 1023px) 100vw, 60vw"
        />
      </div>
      {sources.length > 1 && (
        <div className="deneb-gallery-thumbs no-scrollbar">
          {sources.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Image ${index + 1}`}
              aria-pressed={index === active}
              className={cn("deneb-gallery-thumb", index === active && "is-active")}
            >
              <Image src={image.src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
