import repeat from "@/features/storefront/lib/util/repeat"
import Item from "@/features/storefront/modules/order/components/item"
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item"

// Define inline types based on GraphQL schema and component usage
export type OrderLineItem = {
  id: string;
  quantity: number;
  title: string;
  sku?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  productData?: Record<string, any>;
  variantData?: Record<string, any>;
  variantTitle?: string;
  formattedUnitPrice?: string;
  formattedTotal?: string;
  productVariant?: any;
  originalLineItem?: any;
  fulfillmentItems?: any[];
  createdAt?: string;
  updatedAt?: string;
};

import { StoreRegion } from "@/features/storefront/types/storefront";

export type ItemsProps = {
  items: OrderLineItem[];
  region: StoreRegion;
};

const Items = ({ items, region }: ItemsProps) => {

  return (
    <div className="vp-band divide-y divide-vp-line" role="list" aria-label="Items" data-testid="products-table">
      {items?.length
        ? items
            .sort((a: OrderLineItem, b: OrderLineItem) => {
              return (a.createdAt ?? "") > (b.createdAt ?? "") ? -1 : 1;
            })
            .map((item: OrderLineItem) => {
              return (
                <Item
                  key={item.id}
                  item={item}
                  region={region}
                />
              )
            })
        : repeat(3).map((i) => {
            return <SkeletonLineItem key={i} compact />
          })}
    </div>
  )
}

export default Items
