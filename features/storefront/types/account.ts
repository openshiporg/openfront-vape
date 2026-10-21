// Public account projections returned by the authenticated storefront queries.
export interface StorefrontCountry {
  id: string;
  iso2: string;
  name?: string;
  displayName?: string;
}

export interface StorefrontAddress {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province?: string | null;
  postalCode: string;
  country: StorefrontCountry;
  phone?: string | null;
  isBilling?: boolean;
  user?: { id: string } | null;
}

export interface StorefrontAccountCustomer {
  id: string;
  name?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  tokenGeneratedAt?: string | null;
  addresses?: StorefrontAddress[];
  billingAddress?: StorefrontAddress | null;
}

export interface StorefrontRegionBasic {
  id: string;
  name: string;
  countries: StorefrontCountry[];
  currency: { code: string; noDivisionCurrency?: boolean };
  currency_code?: string;
}

export interface StorefrontOrderLine {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  variantTitle?: string;
  formattedUnitPrice?: string;
  formattedTotal?: string;
}

export interface StorefrontOrderOverviewItem {
  id: string;
  displayId: number;
  createdAt: string;
  total: string;
  lineItems: StorefrontOrderLine[];
}

export interface StoreOrder extends StorefrontOrderOverviewItem {
  email: string;
  status: string;
  subtotal: string;
  shipping: string;
  discount: string;
  tax: string;
  giftCard?: string;
  formattedTotalPaid?: string;
  region: StorefrontRegionBasic;
  shippingAddress?: StorefrontAddress | null;
  billingAddress?: StorefrontAddress | null;
  shippingMethods?: Array<{ id: string; price: number; shippingOption?: { name: string } }>;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    paymentCollection?: { paymentSessions?: Array<{ id: string; isSelected: boolean; paymentProvider?: { id: string; code: string } }> };
  }>;
  fulfillmentStatus?: { status?: string };
}

export interface CreateCustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
export type UpdateCustomerData = Partial<CreateCustomerData>;
export interface AddShippingAddressData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
}
export type UpdateShippingAddressData = Partial<AddShippingAddressData>;
export type StorefrontCustomerProfile = StorefrontAccountCustomer;
export type StorefrontRegion = StorefrontRegionBasic;
export type Address = StorefrontAddress;
export type CustomerProfile = StorefrontAccountCustomer;
export type OrderSummary = StorefrontOrderOverviewItem;
export type OrdersList = StorefrontOrderOverviewItem[];
