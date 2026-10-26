import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import Addresses from "@/features/storefront/modules/checkout/components/addresses";
import Shipping from "@/features/storefront/modules/checkout/components/shipping";
import Payment from "@/features/storefront/modules/checkout/components/payment";
import Review from "@/features/storefront/modules/checkout/components/review";
import { listCartPaymentMethods } from "@/features/storefront/lib/data/payment";
import { getCartShippingOptions } from "@/features/storefront/lib/data/shipping";
import { getCheckoutCompliance } from "@/features/storefront/lib/data/compliance";

interface CheckoutFormProps {
  cart: {
    id: string;
    region: {
      id: string;
    };
    total: number;
    shippingMethods: any[];
    paymentCollection?: {
      paymentSessions?: Array<{
        isSelected: boolean;
        status?: string;
        paymentProvider: {
          id?: string;
          code: string;
        };
      }>;
    };
    giftCards?: any[];
    shippingAddress: any;
    billingAddress: any;
    email: string;
    shipping: string;
  };
  customer: any;
}

export default async function CheckoutForm({ cart, customer }: CheckoutFormProps) {
  if (!cart) {
    return null;
  }

  // get available shipping methods and payment methods
  const availableShippingMethods = await getCartShippingOptions(cart.id);
  const availablePaymentMethods = await listCartPaymentMethods(cart.region.id);

  if (!availableShippingMethods?.length || !availablePaymentMethods?.length) {
    return (
      <section role="status" className="flex flex-col items-start gap-4 border-t border-vp-line pt-6">
        <p className="flex items-baseline gap-2.5 text-[17px] leading-[24px] font-medium text-vp-ink">
          <StatusDot tone="danger" />
          Checkout isn&apos;t available right now. Please try again later.
        </p>
        <LocalizedClientLink
          href="/cart"
          className="inline-flex min-h-11 items-center justify-center rounded-[4px] bg-vp-well px-4 text-[14px] font-medium text-vp-ink transition-colors hover:bg-vp-line"
        >
          Back to bag
        </LocalizedClientLink>
      </section>
    );
  }

  // Re-evaluated on every render, so address, delivery, payment and bag changes refresh it.
  const selectedSession = cart.paymentCollection?.paymentSessions?.find((session) => session.isSelected);
  const compliance = selectedSession
    ? await getCheckoutCompliance("checkout", selectedSession.paymentProvider?.id)
    : cart.shippingAddress
      ? await getCheckoutCompliance("shipping")
      : null;

  return (
    <div className="flex w-full flex-col gap-8">
      <Addresses cart={cart} customer={customer} />
      <Shipping cart={cart} availableShippingMethods={availableShippingMethods} />
      <Payment cart={cart} availablePaymentMethods={availablePaymentMethods} />
      <Review cart={cart} compliance={compliance} />
    </div>
  );
}
