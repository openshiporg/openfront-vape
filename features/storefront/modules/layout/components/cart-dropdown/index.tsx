"use client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"
import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options"
import LineItemPrice from "@/features/storefront/modules/common/components/line-item-price"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail"
import { deleteLineItem } from "@/features/storefront/lib/data/cart";

interface CartItem {
  id: string
  quantity: number
  created_at: string
  thumbnail: string
  title: string
  variantTitle?: string
  percentageOff: number
  originalPrice: string | number
  total: string | number
  productVariant: {
    title?: string
    sku?: string
    product: {
      handle: string
    }
  }
}

interface CartState {
  lineItems: CartItem[]
  subtotal: string
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart: CartState | null;
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | undefined>(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => {
    setCartDropdownOpen(true);
    itemRef.current = totalItems;
  }

  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.lineItems?.reduce((acc: number, item: CartItem) => {
      return acc + item.quantity
    }, 0) || 0

  const itemRef = useRef(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  useEffect(() => {
    if (itemRef.current !== totalItems && !(pathname ?? "").includes("/cart")) {
      timedOpen()
    }
  }, [totalItems, pathname])

  const countBadge = (
    <span className="font-vp-mono text-[13px] text-vp-ink-3 group-data-[filled=true]:text-vp-accent">{totalItems}</span>
  )

  return (
    // TODO: Remove suppressHydrationWarning when React 19.2.0 useId bug is fixed upstream
    // Known issue: https://github.com/radix-ui/primitives/issues/3700
    <div className="z-50" suppressHydrationWarning>
      <Popover open={cartDropdownOpen} onOpenChange={setCartDropdownOpen}>
        <div className="relative" onMouseEnter={openAndCancel} onMouseLeave={close}>
          <div className="hidden sm:block">
            <PopoverTrigger asChild>
              <button
                type="button"
                data-filled={totalItems > 0}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-vp-well px-4 text-[14px] font-medium text-vp-ink"
                aria-label={`Open bag${totalItems > 0 ? `, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : ""}`}
                data-testid="nav-cart-trigger"
                suppressHydrationWarning
              >
                Bag {countBadge}
              </button>
            </PopoverTrigger>
          </div>
          <LocalizedClientLink
            data-filled={totalItems > 0}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-vp-well px-4 text-[14px] font-medium text-vp-ink sm:hidden"
            href="/cart"
            aria-label={`View bag${totalItems > 0 ? `, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : ""}`}
            data-testid="nav-cart-link"
          >
            Bag {countBadge}
          </LocalizedClientLink>
          <PopoverContent
            className="vape-sf hidden sm:block w-[400px] rounded-[22px] border-vp-line bg-vp-bg p-0 text-vp-ink shadow-[0_18px_60px_rgb(20_24_22/0.18)]"
            sideOffset={8}
            align="end"
            onMouseEnter={openAndCancel}
            onMouseLeave={close}
          >
            {cartState && cartState.lineItems?.length ? (
              <>
                <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
                  <h3 className="text-[15px] font-semibold">Bag</h3>
                  <span className="font-vp-mono text-[12px] text-vp-ink-3">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
                </div>
                <div className="mx-3 max-h-[360px] overflow-y-auto no-scrollbar vp-band divide-y divide-vp-line">
                  {cartState.lineItems
                    .sort((a: CartItem, b: CartItem) => {
                      return a.created_at > b.created_at ? -1 : 1
                    })
                    .map((item: CartItem) => (
                      <div className="grid grid-cols-[64px_1fr] gap-x-3 p-3" key={item.id}>
                        <LocalizedClientLink href={`/products/${item.productVariant.product.handle}`} className="w-16">
                          <Thumbnail thumbnail={item.thumbnail} size="square" title={item.title} />
                        </LocalizedClientLink>
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-[14px] font-medium">
                              <LocalizedClientLink href={`/products/${item.productVariant.product.handle}`}>
                                {item.title}
                              </LocalizedClientLink>
                            </h4>
                            <LineItemOptions variant={item.productVariant} variantTitle={item.variantTitle}/>
                            <div className="mt-1 flex items-center gap-2 text-[12px] text-vp-ink-2">
                              <span className="font-vp-mono">Qty {item.quantity}</span>
                              <span aria-hidden="true">·</span>
                              <DeleteButton id={item.id} />
                            </div>
                          </div>
                          <div className="font-vp-mono text-[13px]">
                            <LineItemPrice item={item} />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] text-vp-ink-2">Subtotal <span className="text-vp-ink-3">excl. tax</span></span>
                    <span className="font-vp-mono text-[16px] font-medium">{cartState.subtotal}</span>
                  </div>
                  <LocalizedClientLink
                    href="/cart"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-vp-ink text-[15px] font-medium text-vp-on-ink"
                  >
                    <LinkStatus />
                    View bag
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 px-6 py-12">
                <span className="font-vp-mono text-[28px] text-vp-ink-3">0</span>
                <span className="text-[14px] text-vp-ink-2">Your bag is empty</span>
                <LocalizedClientLink
                  href="/store"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-vp-ink px-5 text-[14px] font-medium text-vp-on-ink"
                >
                  Shop all
                </LocalizedClientLink>
              </div>
            )}
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
}

const DeleteButton = ({
  id,
}: {
  id: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteLineItem(id).catch(() => {
      setIsDeleting(false);
    });
  };

  return (
    <button
      onClick={() => handleDelete(id)}
      className="cursor-pointer text-[12px] font-medium text-vp-ink-2 underline-offset-2 hover:text-vp-danger hover:underline"
      disabled={isDeleting}
    >
      {isDeleting ? "Removing..." : "Remove"}
    </button>
  );
};

export default CartDropdown
