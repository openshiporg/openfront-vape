import { formatAmount } from "@/features/storefront/lib/util/prices";
// Removed HttpTypes, Heading, Text imports



// Define inline types based on GraphQL schema and component usage
type CountryInfoForShipping = {
  iso2?: string | null;
};

type AddressInfoForShipping = {
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: CountryInfoForShipping | null;
  phone?: string | null;
};

type ShippingOptionInfo = {
  name?: string | null;
};

type ShippingMethodInfo = {
  shippingOption?: ShippingOptionInfo | null;
};

import { StoreRegion } from "@/features/storefront/types/storefront";

type OrderWithShipping = {
  id: string;
  email?: string | null;
  currencyCode?: string | null; // Correct field name
  shippingAddress?: AddressInfoForShipping | null; // Correct field name
  shippingMethods?: ShippingMethodInfo[] | null; // Correct field name
  shippingTotal?: number | null; // Correct field name
  region?: StoreRegion | null;
  shipping: number | string;
};

type ShippingDetailsProps = {
  order: OrderWithShipping;
};

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const a = order.shippingAddress;
  return (
    <section className="flex flex-col gap-4 border-t border-vp-line pt-5" aria-label="Delivery">
      <h2 className="vp-sign text-[26px] text-vp-ink">Delivery</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1" data-testid="shipping-address-summary">
          <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Ship to</p>
          <div className="text-[14px] leading-[20px] text-vp-ink-2">
            <p>{a?.firstName} {a?.lastName}</p>
            <p>{a?.address1} {a?.address2}</p>
            <p>
              {a?.city}
              {a?.province ? `, ${a.province}` : ""}
            </p>
            <p>
              <span className="font-vp-mono text-[13px]">{a?.postalCode}</span>{" "}
              {a?.country?.iso2?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1" data-testid="shipping-contact-summary">
          <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Contact</p>
          <div className="text-[14px] leading-[20px] text-vp-ink-2 [overflow-wrap:anywhere]">
            {a?.phone && <p className="font-vp-mono text-[13px]">{a.phone}</p>}
            <p>{order.email}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1" data-testid="shipping-method-summary">
          <p className="text-[13px] leading-[18px] font-medium text-vp-ink-3">Method</p>
          <p className="text-[14px] leading-[20px] text-vp-ink-2">
            {order.shippingMethods?.[0]?.shippingOption?.name}{" "}
            <span className="font-vp-mono text-[13px] text-vp-ink">{order.shipping}</span>
          </p>
          <p className="text-[13px] leading-[18px] text-vp-ink-3">Adult signature may be required</p>
        </div>
      </div>
    </section>
  );
};

export default ShippingDetails;
