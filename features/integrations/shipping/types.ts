// Shared input projections consumed by the existing carrier adapters.
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province?: string | null;
  postalCode: string;
  country: { iso2: string };
  phone?: string | null;
  email?: string | null;
}
export interface ShippingProviderInput {
  id: string;
  accessToken: string;
  fromAddress: ShippingAddress;
}
export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: string;
  weightUnit: string;
  value?: number;
}
export interface ShippingOrderInput { id: string; shippingAddress: ShippingAddress }
export interface GetRatesInput { provider: ShippingProviderInput; order: ShippingOrderInput; dimensions?: PackageDimensions }
export interface ValidateAddressInput { provider: ShippingProviderInput; address: ShippingAddress }
export interface TrackShipmentInput { provider: ShippingProviderInput; trackingNumber: string }
export interface CancelLabelInput { provider: ShippingProviderInput; labelId: string }
