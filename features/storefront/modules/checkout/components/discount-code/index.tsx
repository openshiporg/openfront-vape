"use client";
import { Minus, Plus, X } from "lucide-react";
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message";
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button";
import {
  removeDiscount,
  removeGiftCard,
  submitDiscountForm,
} from "@/features/storefront/lib/data/cart";
import { formatAmount } from "@/features/storefront/lib/util/prices";
import { useState, useMemo, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { vpInput } from "@/features/storefront/modules/common/components/vp-classes";
import { cn } from "@/lib/utils";

interface DiscountCodeProps {
  cart?: {
    discounts?: any[];
    giftCards?: any[];
    region?: any;
    discountsById?: Record<string, number>;
  };
}

const DiscountCode = ({ cart }: DiscountCodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);

  const { discounts, giftCards, region } = cart || {};

  const appliedDiscounts = useMemo(() => {
    if (!discounts || !discounts.length) {
      return [];
    }

    const discountAmounts = cart?.discountsById || {};

    return discounts
      .map((discount) => {
        if (!discount.discountRule) return null;

        const value = (() => {
          switch (discount.discountRule.type) {
            case "percentage":
              return `${discount.discountRule.value}% off`;
            case "fixed":
              return `${formatAmount({
                amount: discount.discountRule.value,
                region: region,
              })} off`;
            case "free_shipping":
              return "Free shipping";
            default:
              return "";
          }
        })();

        return {
          code: discount.code,
          value,
          id: discount.id,
          type: discount.discountRule.type,
          discountAmount: discountAmounts[discount.id] || 0,
        };
      })
      .filter(Boolean);
  }, [discounts, region, cart?.discountsById]);

  const removeGiftCardCode = async (code: string) => {
    await removeGiftCard(code);
  };

  const removeDiscountCode = async (code: string) => {
    setRemovalMessage(null);
    const result = await removeDiscount(code).catch(() => "Failed to remove discount code");
    setRemovalMessage(typeof result === "string" ? result : null);
  };

  const [message, formAction] = useActionState(submitDiscountForm, null);

  return (
    <div className="flex w-full flex-col">
      <form action={formAction} className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-expanded={isOpen}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-[14px] font-medium text-vp-ink"
        >
          Discount or gift card code
          {isOpen ? <Minus className="size-4 text-vp-ink-3" /> : <Plus className="size-4 text-vp-ink-3" />}
        </button>
        {isOpen && (
          <div className="pb-2">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Code"
                aria-label="Discount or gift card code"
                name="code"
                type="text"
                autoComplete="off"
                autoFocus={false}
                className={cn(vpInput, "min-w-0 flex-1 font-vp-mono")}
              />
              <SubmitButton variant="outline" className="h-12 flex-none px-5">Apply</SubmitButton>
            </div>
            <ErrorMessage error={message} />
          </div>
        )}
      </form>

      {giftCards && giftCards.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <h3 className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Gift cards</h3>
          <ul className="vp-band divide-y divide-vp-line">
            {giftCards.map((gc) => (
              <li className="flex items-center justify-between gap-3 py-1 pl-4 pr-1" key={gc.id}>
                <span className="min-w-0 truncate font-vp-mono text-[13px] text-vp-ink">{gc.code}</span>
                <span className="ml-auto font-vp-mono text-[13px] text-vp-ink-2">
                  {formatAmount({
                    region: region,
                    amount: gc.balance,
                    includeTaxes: false,
                  })}
                </span>
                <button
                  type="button"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-[4px] text-vp-ink-2 transition-colors hover:bg-vp-surface hover:text-vp-danger"
                  onClick={() => removeGiftCardCode(gc.code)}
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove gift card from order</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {appliedDiscounts.length > 0 && (
        <ul className="vp-band mt-3 divide-y divide-vp-line">
          {appliedDiscounts.map((discount) =>
            discount ? (
              <li className="flex items-center gap-3 py-1 pl-4 pr-1" key={discount.code}>
                <span className="flex min-w-0 flex-col py-1.5">
                  <span className="truncate font-vp-mono text-[13px] text-vp-ink">{discount.code}</span>
                  <span className="text-[12px] leading-[16px] text-vp-ink-2">{discount.value}</span>
                </span>
                <span className="ml-auto font-vp-mono text-[13px] text-vp-accent">
                  -{discount.discountAmount}
                </span>
                <button
                  type="button"
                  onClick={() => removeDiscountCode(discount.code)}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-[4px] text-vp-ink-2 transition-colors hover:bg-vp-surface hover:text-vp-danger"
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove discount code</span>
                </button>
              </li>
            ) : null
          )}
        </ul>
      )}
      <ErrorMessage error={removalMessage} />
    </div>
  );
};

export default DiscountCode;
