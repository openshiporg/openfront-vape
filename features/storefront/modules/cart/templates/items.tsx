import Item from "@/features/storefront/modules/cart/components/item"
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item"

interface ItemsTemplateProps {
  items?: any[];
  region?: any;
}

const ItemsTemplate = ({
  items,
  region
}: ItemsTemplateProps) => {
  return (
    <div className="vp-band divide-y divide-vp-line" aria-label="Items in bag" role="list">
      {items && region
        ? items
            .sort((a, b) => {
              return a.createdAt > b.createdAt ? -1 : 1
            })
            .map((item) => {
              return (
                <div role="listitem" key={item.id}>
                  <Item item={item} region={region} />
                </div>
              );
            })
        : Array.from(Array(5).keys()).map((i) => {
            return <SkeletonLineItem key={i} />;
          })}
    </div>
  );
}

export default ItemsTemplate
