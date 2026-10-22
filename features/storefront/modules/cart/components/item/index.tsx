"use client";
import { cn } from "@/lib/utils";

import CartItemSelect from "@/features/storefront/modules/cart/components/cart-item-select";
import DeleteButton from "@/features/storefront/modules/common/components/delete-button";
import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options";
import LineItemPrice from "@/features/storefront/modules/common/components/line-item-price";
import LineItemUnitPrice from "@/features/storefront/modules/common/components/line-item-unit-price";
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import { updateLineItem } from "@/features/storefront/lib/data/cart";
import { useState } from "react";
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message";
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link";
import { RiLoader2Fill } from "@remixicon/react";

interface CartItemProps {
  item: any;
  region: any;
  type?: "full" | "preview";
}

const Item = ({ item, region, type = "full" }: CartItemProps) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const { handle } = item.productVariant.product;

  const maxQuantity = Math.min(
    item.productVariant.inventoryQuantity > 0
      ? item.productVariant.inventoryQuantity
      : 10,
    10
  );

  const changeQuantity = async (quantity: number) => {
    setError(null);
    setUpdating(true);

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        return err.message;
      })
      .finally(() => {
        setUpdating(false);
      });

    message && setError(message);
  };

  const thumbnail = item.productVariant?.product?.thumbnail || item.thumbnail;

  if (type === "preview") {
    return (
      <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-3 p-3">
        <LocalizedClientLink href={`/products/${handle}`} className="block w-14">
          <Thumbnail thumbnail={thumbnail} size="square" title={item.title} />
        </LocalizedClientLink>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-[20px] font-medium text-vp-ink">{item.title}</p>
            <LineItemOptions
              variant={{ sku: item.productVariant?.sku || "" }}
              variantTitle={item.productVariant?.title}
            />
            <p className="mt-1 flex items-baseline gap-1 font-vp-mono text-[12px] leading-[16px] text-vp-ink-3">
              <span>{item.quantity} ×</span>
              <LineItemUnitPrice item={item} style="tight" />
            </p>
          </div>
          <div className="text-[14px] leading-[20px]">
            <LineItemPrice item={item} style="tight" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 p-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-4 sm:p-4">
      <LocalizedClientLink
        href={`/products/${handle}`}
        className="block w-[72px] sm:w-24"
      >
        <Thumbnail thumbnail={thumbnail} size="square" title={item.title} />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] leading-[20px] font-medium text-vp-ink">
              <LocalizedClientLink href={`/products/${handle}`} className="hover:underline hover:underline-offset-2">
                {item.title}
              </LocalizedClientLink>
            </h3>
            <LineItemOptions
              variant={{ sku: item.productVariant?.sku || "" }}
              variantTitle={item.productVariant?.title}
            />
            <p className="mt-1 hidden font-vp-mono text-[12px] leading-[16px] text-vp-ink-3 sm:block">
              <LineItemUnitPrice item={item} style="tight" /> each
            </p>
          </div>
          <div className="text-[15px] leading-[20px]">
            <LineItemPrice item={item} style="tight" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <CartItemSelect
            value={item.quantity}
            onChange={(e) => changeQuantity(parseInt(e.target.value))}
            min={1}
            max={maxQuantity}
            step={1}
          />
          <div className={cn("flex items-center", updating && "pr-3")}>
            {updating ? (
              <RiLoader2Fill className="size-4 animate-spin text-vp-ink-3" aria-label="Updating" />
            ) : (
              <DeleteButton id={item.id} />
            )}
          </div>
        </div>
        <ErrorMessage error={error} />
      </div>
    </div>
  );
};

export default Item;
