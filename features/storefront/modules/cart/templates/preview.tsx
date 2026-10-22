"use client";
import { cn } from "@/lib/utils";

import Item from "@/features/storefront/modules/cart/components/item";
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item";

interface ItemsPreviewTemplateProps {
  items?: any[];
  region?: any;
}

const ItemsPreviewTemplate = ({ items, region }: ItemsPreviewTemplateProps) => {
  const hasOverflow = items && items.length > 4;

  return (
    <div
      className={cn("vp-band divide-y divide-vp-line", {
        "no-scrollbar max-h-[360px] overflow-x-hidden overflow-y-auto": hasOverflow,
      })}
    >
      {items && region
        ? items
            .sort((a, b) => {
              return a.createdAt > b.createdAt ? -1 : 1;
            })
            .map((item) => {
              return (
                <Item
                  key={item.id}
                  item={item}
                  region={region}
                  type="preview"
                />
              );
            })
        : Array.from(Array(3).keys()).map((i) => {
            return <SkeletonLineItem key={i} compact />;
          })}
    </div>
  );
};

export default ItemsPreviewTemplate;
