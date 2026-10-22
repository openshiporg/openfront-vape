"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import SpecTile from "@/features/storefront/modules/common/components/vape/spec-tile"
import { cn } from "@/lib/utils"

type ImageGalleryProps = {
  images: any[];
  handle: string;
  region: any;
  title?: string;
  kicker?: string | null;
  specs?: { label: string; value: string }[];
};

const ImageGallery = ({ images, title, kicker, specs }: ImageGalleryProps) => {
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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-vp-well sm:aspect-square lg:aspect-[4/5]">
        <SpecTile title={title || ""} kicker={kicker} specs={specs} size="lg" />
      </div>
    )
  }

  const current = sources[Math.min(active, sources.length - 1)]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-vp-well sm:aspect-square lg:aspect-[4/5]" id={current.id}>
        <Image
          key={current.id}
          src={current.src}
          priority
          className="object-cover"
          alt={current.alt || title || "Product image"}
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
        />
      </div>
      {sources.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sources.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Image ${index + 1}`}
              aria-pressed={index === active}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-[12px] bg-vp-well ring-offset-2 ring-offset-vp-bg sm:size-20",
                index === active ? "ring-2 ring-vp-ink" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
