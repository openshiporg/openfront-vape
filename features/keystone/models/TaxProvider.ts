import { Lists } from '.keystone/types';
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFieldsFor } from "./trackingFields";

export const TaxProvider = list<Lists.TaxProvider.TypeInfo>({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadUsers({ session }) ||
        permissions.canManageUsers({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels,
    },
  },
  fields: {
    ...trackingFieldsFor<Lists.TaxProvider.TypeInfo>(),
    isInstalled: checkbox({
      defaultValue: true,
    }),
    regions: relationship({
      ref: "Region.taxProvider",
      many: true,
    }),
  },
});
