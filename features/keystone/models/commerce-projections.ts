// Explicit server-side GraphQL projections consumed by commerce virtual fields.
export interface CurrencyProjection { code: string; symbol?: string; noDivisionCurrency?: boolean }
export interface RegionProjection { id: string; taxRate?: number; currency: CurrencyProjection }
export interface IdProjection { id: string }
export interface ProductEligibilityProjection extends IdProjection {
  title?: string;
  discountable?: boolean;
  productType?: IdProjection | null;
  productCollections?: IdProjection[];
  productTags?: IdProjection[];
}
export interface DiscountConditionProjection {
  type: string;
  operator: string;
  products?: IdProjection[];
  productTypes?: IdProjection[];
  productCollections?: IdProjection[];
  productTags?: IdProjection[];
}
export interface DiscountProjection extends IdProjection {
  discountRule?: { type: string; value: number; allocation?: string; discountConditions?: DiscountConditionProjection[] } | null;
}
export interface ShippingMethodProjection extends IdProjection { price: number; shippingOption?: { id: string; name: string } }
export interface CartLineProjection extends IdProjection {
  quantity: number;
  productVariant: { id: string; title?: string; product?: ProductEligibilityProjection | null };
}
export interface CartPricingProjection {
  lineItems: CartLineProjection[];
  discounts: DiscountProjection[];
  shippingMethods: ShippingMethodProjection[];
  region: RegionProjection;
  giftCards: Array<{ balance: number; value?: number }>;
  billingAddress?: IdProjection | null;
  shippingAddress?: IdProjection | null;
  paymentCollection?: { id: string; paymentSessions?: Array<{ isSelected: boolean }> } | null;
}
export interface OrderLineProjection extends IdProjection {
  quantity: number;
  title?: string;
  thumbnail?: string | null;
  sku?: string;
  variantTitle?: string;
  formattedUnitPrice?: string;
  formattedTotal?: string;
  productData?: unknown;
  variantData?: unknown;
  moneyAmount?: { amount: number; originalAmount?: number } | null;
}
export interface FulfillmentProjection extends IdProjection {
  createdAt: string;
  canceledAt?: string | null;
  shippingLabels: Array<{ id: string; trackingNumber?: string; trackingUrl?: string; carrier?: string; labelUrl?: string }>;
  fulfillmentItems: Array<{ id: string; quantity: number; lineItem: OrderLineProjection }>;
}
export interface PaymentSessionSelection {
  id: string;
  isSelected: boolean;
  isInitiated: boolean;
  paymentProvider: { id: string; code: string };
}
export interface PaymentProjection extends IdProjection {
  amount: number;
  status: string;
  createdAt: string;
  data?: { provider?: string; cardLast4?: string } | null;
  paymentCollection?: { paymentSessions: Array<{ id: string; amount: number; isSelected: boolean; paymentProvider?: { name: string } }> } | null;
}
export interface OrderPricingProjection {
  lineItems: OrderLineProjection[];
  discounts: DiscountProjection[];
  shippingMethods: ShippingMethodProjection[];
  region?: RegionProjection | null;
  currency?: CurrencyProjection | null;
  fulfillments: FulfillmentProjection[];
  payments: PaymentProjection[];
  accountLineItems: Array<{ amount: number; paymentStatus: string }>;
}
