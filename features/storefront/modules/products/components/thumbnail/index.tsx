import { cn } from "@/lib/utils"
import Image from "next/image"
import React from "react"

import SpecTile from "@/features/storefront/modules/common/components/vape/spec-tile"

type ThumbnailProps = {
  thumbnail?: string | null;
  images?: any[] | null;
  size?: "small" | "medium" | "large" | "full" | "square";
  isFeatured?: boolean;
  className?: string;
  title?: string | null;
  kicker?: string | null;
  specs?: { label: string; value: string }[];
  "data-testid"?: string;
};

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  title,
  kicker,
  specs,
  "data-testid": dataTestid,
}) => {
  const image =
    thumbnail ||
    images?.[0]?.url ||
    images?.[0]?.image?.url ||
    images?.[0]?.imagePath ||
    null;

  const compact = size === "small" || (size === "square" && !specs?.length)

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[4px] bg-vp-well",
        className,
        {
          "aspect-[4/5]": isFeatured,
          "aspect-[3/4]": !isFeatured && size !== "square",
          "aspect-square": size === "square",
        }
      )}
      data-testid={dataTestid}
    >
      {image ? (
        <Image
          src={image}
          alt={title || "Product image"}
          className="absolute inset-0 object-cover object-center"
          draggable={false}
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          fill
          suppressHydrationWarning
        />
      ) : (
        <SpecTile title={title || ""} kicker={kicker} specs={specs} size={compact ? "sm" : "md"} />
      )}
    </div>
  )
}

export default Thumbnail
