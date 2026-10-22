import React, { useState, useEffect, useMemo } from "react";
import Checkbox from "@/features/storefront/modules/common/components/checkbox";
import AddressSelect from "../address-select";
import CountrySelect from "../country-select";
import { Input as BaseInput } from "@/components/ui/input";
import { vpInput } from "@/features/storefront/modules/common/components/vp-classes";
import { cn } from "@/lib/utils";

// Placeholder doubles as the accessible name so the form stays one line per field.
const Input = ({ className, placeholder, ...props }: React.ComponentProps<typeof BaseInput>) => (
  <BaseInput
    placeholder={placeholder}
    aria-label={props["aria-label"] || placeholder}
    className={cn(vpInput, className)}
    {...props}
  />
);

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  countryCode,
}: {
  customer: any | null;
  cart: any | null;
  checked: boolean;
  onChange: () => void;
  countryCode: string | null;
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    "shippingAddress.firstName": cart?.shippingAddress?.firstName || "",
    "shippingAddress.lastName": cart?.shippingAddress?.lastName || "",
    "shippingAddress.address1": cart?.shippingAddress?.address1 || "",
    "shippingAddress.company": cart?.shippingAddress?.company || "",
    "shippingAddress.postalCode": cart?.shippingAddress?.postalCode || "",
    "shippingAddress.city": cart?.shippingAddress?.city || "",
    "shippingAddress.countryCode":
      cart?.shippingAddress?.country?.iso2 || countryCode || "",
    "shippingAddress.province": cart?.shippingAddress?.province || "",
    email: cart?.email || customer?.email || "",
    "shippingAddress.phone":
      cart?.shippingAddress?.phone || customer?.phone || "",
  });

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c: any) => c.iso2),
    [cart?.region]
  );

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses?.filter(
        (a: any) => a.country?.iso2 && countriesInRegion?.includes(a.country.iso2)
      ),
    [customer?.addresses, countriesInRegion]
  );

  useEffect(() => {
    setFormData({
      "shippingAddress.firstName": cart?.shippingAddress?.firstName || "",
      "shippingAddress.lastName": cart?.shippingAddress?.lastName || "",
      "shippingAddress.address1": cart?.shippingAddress?.address1 || "",
      "shippingAddress.company": cart?.shippingAddress?.company || "",
      "shippingAddress.postalCode": cart?.shippingAddress?.postalCode || "",
      "shippingAddress.city": cart?.shippingAddress?.city || "",
      "shippingAddress.countryCode":
        cart?.shippingAddress?.country?.iso2 ||
        countryCode ||
        cart?.region?.countries?.[0]?.iso2 ||
        "",
      "shippingAddress.province": cart?.shippingAddress?.province || "",
      email: cart?.email || customer?.email || "",
      "shippingAddress.phone":
        cart?.shippingAddress?.phone || customer?.phone || "",
    });
  }, [cart, countryCode, customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target.name.startsWith("shippingAddress.")) setSelectedAddressId(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressSelect = (address: any) => {
    if (!address) return;

    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      "shippingAddress.firstName": address.firstName || "",
      "shippingAddress.lastName": address.lastName || "",
      "shippingAddress.address1": address.address1 || "",
      "shippingAddress.company": address.company || "",
      "shippingAddress.postalCode": address.postalCode || "",
      "shippingAddress.city": address.city || "",
      "shippingAddress.countryCode": address.country?.iso2 || countryCode || "",
      "shippingAddress.province": address.province || "",
      "shippingAddress.phone": address.phone || prev["shippingAddress.phone"],
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <AddressSelect
          addresses={addressesInRegion}
          cart={cart}
          onSelect={handleAddressSelect}
          label="Saved addresses"
        />
      )}
      <input
        type="hidden"
        name="selectedAddressId"
        value={selectedAddressId || ""}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="First name"
          name="shippingAddress.firstName"
          autoComplete="given-name"
          value={formData["shippingAddress.firstName"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Last name"
          name="shippingAddress.lastName"
          autoComplete="family-name"
          value={formData["shippingAddress.lastName"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Address"
          name="shippingAddress.address1"
          autoComplete="address-line1"
          value={formData["shippingAddress.address1"]}
          onChange={handleChange}
          required
          className="col-span-2 sm:col-span-1"
        />
        <Input
          placeholder="Company (optional)"
          name="shippingAddress.company"
          value={formData["shippingAddress.company"]}
          onChange={handleChange}
          autoComplete="organization"
          className="col-span-2 sm:col-span-1"
        />
        <Input
          placeholder="City"
          name="shippingAddress.city"
          autoComplete="address-level2"
          value={formData["shippingAddress.city"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="State / Province"
          name="shippingAddress.province"
          autoComplete="address-level1"
          value={formData["shippingAddress.province"]}
          onChange={handleChange}
        />
        <Input
          placeholder="ZIP / Postal code"
          name="shippingAddress.postalCode"
          autoComplete="postal-code"
          inputMode="text"
          value={formData["shippingAddress.postalCode"]}
          onChange={handleChange}
          required
          className="font-vp-mono"
        />
        <CountrySelect
          id="country"
          name="shippingAddress.countryCode"
          region={cart?.region}
          value={formData["shippingAddress.countryCode"]}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          id="phone"
          name="shippingAddress.phone"
          type="tel"
          placeholder="Phone"
          autoComplete="tel"
          value={formData["shippingAddress.phone"]}
          onChange={handleChange}
          className="font-vp-mono"
        />
      </div>
      <Checkbox
        label="Billing address same as shipping address"
        name="same_as_billing"
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};

export default ShippingAddress;
