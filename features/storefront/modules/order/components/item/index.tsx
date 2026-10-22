import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options"
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail"

import { OrderLineItem } from "@/features/storefront/modules/order/components/items";
import { StoreRegion } from "@/features/storefront/types/storefront";

type ItemProps = {
  item: OrderLineItem;
  region: StoreRegion;
};

const Item = ({ item, region }: ItemProps) => {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-3 p-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-x-4 sm:p-4" role="listitem">
      <div className="w-14 sm:w-[72px]">
        <Thumbnail thumbnail={item.thumbnail} size="square" title={item.title} />
      </div>

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] leading-[20px] font-medium text-vp-ink">{item.title}</p>
          {item.variantTitle && (
            <LineItemOptions variant={item.productVariant} variantTitle={item.variantTitle} />
          )}
          <p className="mt-1 font-vp-mono text-[12px] leading-[16px] text-vp-ink-3">
            {item.quantity} × {item.formattedUnitPrice}
          </p>
        </div>
        <span className="flex-none text-right font-vp-mono text-[15px] leading-[20px] text-vp-ink">
          {item.formattedTotal}
        </span>
      </div>
    </div>
  );
};

export default Item
