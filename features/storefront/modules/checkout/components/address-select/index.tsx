import { useId, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import compareAddresses from "@/features/storefront/lib/util/compare-addresses";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  province?: string;
  country?: {
    iso2?: string;
  };
  phone?: string;
};

type AddressSelectProps = {
  addresses: Address[]
  cart?: {
    shippingAddress?: Partial<Address>
    region?: {
      id: string
      name: string
      countries: {
        id: string
        name: string
        iso2: string
      }[]
    }
  }
  onSelect: (address: Address) => void
  label?: string
}

const AddressSelect = ({
  addresses,
  cart,
  onSelect,
  label,
}: AddressSelectProps) => {
  const id = useId()
  const [selected, setSelected] = useState<Address | null>(null)

  const filteredAddresses = useMemo(() => {
    if (!cart?.region) {
      return addresses
    }

    const regionCountryCodes = cart.region.countries.map(
      (country) => country.iso2
    )

    return addresses.filter((address) => {
      return address.country?.iso2
        ? regionCountryCodes.includes(address.country.iso2)
        : false
    })
  }, [addresses, cart?.region])

  const handleSelect = (addressId: string) => {
    const savedAddress = filteredAddresses.find((a) => a.id === addressId)
    if (savedAddress) {
      setSelected(savedAddress)
      onSelect(savedAddress)
    }
  }

  const selectedAddress = useMemo(() => {
    return (
      filteredAddresses.find((a) =>
        compareAddresses(a, cart?.shippingAddress)
      ) || selected
    )
  }, [filteredAddresses, cart?.shippingAddress, selected])

  // Format address for display in American style
  const formatAddressLine = (address: Address) => {
    return [
      address.address1,
      address.address2,
      `${address.city}${address.province ? `, ${address.province}` : ""}`,
      `${address.postalCode} ${address.country?.iso2 ? address.country.iso2.toUpperCase() : ""}`,
    ].filter(Boolean).join(", ");
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} className="text-[13px] leading-[18px] font-medium text-vp-ink-2">{label}</Label>}
      <Select
        value={selectedAddress?.id}
        onValueChange={handleSelect}
        defaultValue={selectedAddress?.id}
      >
        <SelectTrigger
          id={id}
          className="h-auto min-h-14 rounded-[4px] border-vp-line bg-vp-surface px-4 py-3 text-left text-vp-ink shadow-none hover:border-vp-ink-3 focus:border-vp-accent focus:ring-2 focus:ring-vp-tint [&>span]:flex [&>span]:items-center [&>span]:gap-2"
        >
          <SelectValue
            placeholder="Choose an address"
          >
            {selectedAddress && (
               <span className="flex flex-col gap-1">
               <span className="font-medium">
                 {selectedAddress.firstName} {selectedAddress.lastName}
               </span>
               {selectedAddress.company && (
                 <span className="text-vp-ink-2 text-xs">
                   {selectedAddress.company}
                 </span>
               )}
               <span className="text-sm text-vp-ink-2">
                 {formatAddressLine(selectedAddress)}
               </span>
               {selectedAddress.phone && (
                 <span className="text-xs text-vp-ink-2">
                   {selectedAddress.phone}
                 </span>
               )}
             </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-[4px] border-vp-line bg-vp-surface text-vp-ink [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
          {addresses.map((address) => (
            <SelectItem
              key={address.id}
              value={address.id}
              className={cn(
                "cursor-pointer rounded-[4px] py-3",
                selectedAddress?.id === address.id && "bg-vp-well"
              )}
            >
              <span className="flex flex-col gap-1">
                <span className="font-medium">
                  {address.firstName} {address.lastName}
                </span>
                {address.company && (
                  <span className="text-vp-ink-2 text-xs">
                    {address.company}
                  </span>
                )}
                <span className="text-sm text-vp-ink-2">
                  {formatAddressLine(address)}
                </span>
                {address.phone && (
                  <span className="text-xs text-vp-ink-2">
                    {address.phone}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AddressSelect;
