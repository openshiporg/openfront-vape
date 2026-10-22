import React from "react"
import { StorefrontAccountCustomer, StorefrontRegion } from "@/features/storefront/types"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { AccountPageHeader } from "../account-ui"

type AddressBookProps = {
  customer: StorefrontAccountCustomer
  region: StorefrontRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const { addresses } = customer
  return (
    <div className="w-full">
      <AccountPageHeader title="Addresses" count={addresses?.length || 0} action={<AddAddress region={region} />} />
      {addresses && addresses.length > 0 ? (
        <ul className="vp-band divide-y divide-vp-line">
          {addresses.map((address) => {
            return (
              <li key={address.id}>
                <EditAddress region={region} address={address} />
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="vp-band px-4 py-8 text-[15px] text-vp-ink-2 sm:px-5">No saved addresses</div>
      )}
    </div>
  )
}

export default AddressBook
