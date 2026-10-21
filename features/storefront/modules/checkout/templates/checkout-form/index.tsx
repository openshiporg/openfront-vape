import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Addresses from "@/features/storefront/modules/checkout/components/addresses";
import Shipping from "@/features/storefront/modules/checkout/components/shipping";
import Payment from "@/features/storefront/modules/checkout/components/payment";
import Review from "@/features/storefront/modules/checkout/components/review";
import { listCartPaymentMethods } from "@/features/storefront/lib/data/payment";
import { getCartShippingOptions } from "@/features/storefront/lib/data/shipping";

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
      <section role="status" className="space-y-3 rounded-lg border p-6">
        <p>Checkout isn&apos;t available right now. Please try again later.</p>
        <LocalizedClientLink href="/cart" className="inline-flex min-h-11 items-center underline underline-offset-4">
          Back to cart
        </LocalizedClientLink>
      </section>
    );
  }

  return (
    <div>
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div>
          <Addresses cart={cart} customer={customer} />
        </div>

        <div>
          <Shipping cart={cart} availableShippingMethods={availableShippingMethods} />
        </div>

        <div>
          <Payment cart={cart} availablePaymentMethods={availablePaymentMethods} />
        </div>

        <div>
          <Review cart={cart} />
        </div>
      </div>
    </div>
  );
}
