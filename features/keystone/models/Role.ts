
import { relationship, text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { permissions } from '../access';
import { permissionFields } from './fields';
import { trackingFields } from './trackingFields';
import { allowAll, denyAll } from '@keystone-6/core/access';

export const Role = list({
  access: {
    operation: {
      // Any signed-in user may read a role, but the filter below limits non-role-admins to their own.
      query: ({ session }) => Boolean(session?.itemId),
      create: permissions.canManageRoles,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles,
    },
    filter: {
      query: ({ session }) => {
        if (!session?.itemId) return false;
        if (permissions.canReadRoles({ session }) || permissions.canManageRoles({ session })) return true;
        // Staff read only their own role (the dashboard gate needs role.canAccessDashboard).
        return { assignedTo: { some: { id: { equals: session.itemId } } } };
      },
    },
  },
  ui: {
    hideCreate: args => !permissions.canManageRoles(args),
    hideDelete: args => !permissions.canManageRoles(args),
    isHidden: args => !permissions.canManageRoles(args),
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    ...permissionFields,
    assignedTo: relationship({
      ref: 'User.role', // TODO: Add this to the User
      many: true,
      // ui: {
      //   itemView: { fieldMode: 'read' },
      // },
    }),
    ...trackingFields
  },
});
