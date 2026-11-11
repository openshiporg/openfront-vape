import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import StatusDot from "@/features/storefront/modules/common/components/vape/status-dot"
import Addresses from "@/features/storefront/modules/checkout/components/addresses";
import Shipping from "@/features/storefront/modules/checkout/components/shipping";
import Payment from "@/features/storefront/modules/checkout/components/payment";
import Review from "@/features/storefront/modules/checkout/components/review";
import { listCartPaymentMethods } from "@/features/storefront/lib/data/payment";
import { getCartShippingOptions } from "@/features/storefront/lib/data/shipping";
import AgeCheck from "@/features/storefront/modules/checkout/components/age-check";
import { getCustomerBusinessAccount } from "@/features/storefront/lib/data/business-accounts";
import { getAgeCheckStatus, getCheckoutCompliance } from "@/features/storefront/lib/data/compliance";

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
  const availablePaymentMethods = await listCartPaymentMethods(cart.region.id, cart.id);
  // Delivery orders must be paid by card; without a configured card provider only
  // "Reserve online, pay in store" can complete, so checkout steers there instead of dead-ending.
  const deliveryCardAvailable = ((await listCartPaymentMethods(cart.region.id)) ?? []).length > 0;
  const pickupOptionId = (availableShippingMethods ?? []).find((option: any) => option?.data?.pickup === true)?.id ?? null;

  // Payment methods can legitimately be empty (no card configured yet, or delivery chosen
  // without a card); the Payment step explains that, and the shopper can still change delivery.
  // Delivery options depend on the destination, so a cart with no address yet has none.
  // Show the address step on its own until there is one.
  if (!cart.shippingAddress) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Addresses cart={cart} customer={customer} />
      </div>
    );
  }

  if (!availableShippingMethods?.length) {
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

  const ageCheck = cart.shippingAddress ? await getAgeCheckStatus() : { required: false, done: true };
  const shift = ageCheck.required ? 1 : 0;
  // An approved business account with enough available credit can take the order on terms.
  const account = customer?.id ? await getCustomerBusinessAccount(customer.id).catch(() => null) : null;
  const rawTotal = Number((cart as any).rawTotal ?? 0);
  const accountTender = account && account.accountType === "business" && account.status === "active" &&
    Number(account.availableCredit ?? 0) >= rawTotal && rawTotal > 0
    ? { title: String(account.title || "Business account"), availableCredit: Number(account.availableCredit), currency: String(account.currency?.code || "") }
    : null;
  const shippingName = [cart.shippingAddress?.firstName, cart.shippingAddress?.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex w-full flex-col gap-8">
      <Addresses cart={cart} customer={customer} />
      <Shipping cart={cart} availableShippingMethods={availableShippingMethods} nextStep={ageCheck.required ? "age" : "payment"} deliveryCardAvailable={deliveryCardAvailable} />
      {ageCheck.required && (
        <AgeCheck index={3} done={ageCheck.done && (cart.shippingMethods?.length ?? 0) > 0}
          hasShippingMethod={(cart.shippingMethods?.length ?? 0) > 0} shippingName={shippingName}
          pickup={cart.shippingMethods?.[0]?.shippingOption?.data?.pickup === true} />
      )}
      <Payment cart={cart} availablePaymentMethods={availablePaymentMethods} stepIndex={3 + shift} pickupOptionId={deliveryCardAvailable ? null : pickupOptionId} accountTender={accountTender} />
      <Review cart={cart} compliance={compliance} stepIndex={4 + shift} />
    </div>
  );
}
