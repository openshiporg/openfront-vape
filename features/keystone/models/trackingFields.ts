import { timestamp } from '@keystone-6/core/fields';
import type { BaseListTypeInfo } from '@keystone-6/core/types';

export function trackingFieldsFor<ListTypeInfo extends BaseListTypeInfo>() {
  return {
    createdAt: timestamp<ListTypeInfo>({
      access: { read: () => true, create: () => false, update: () => false },
      validation: { isRequired: true },
      defaultValue: { kind: 'now' },
      ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
    }),
    updatedAt: timestamp<ListTypeInfo>({
      access: { read: () => true, create: () => false, update: () => false },
      db: { updatedAt: true },
      validation: { isRequired: true },
      defaultValue: { kind: 'now' },
      ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } },
    }),
  };
}

export const trackingFields = trackingFieldsFor<BaseListTypeInfo>();
