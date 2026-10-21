import type { Lists } from '.keystone/types';
import { list, group, graphql } from '@keystone-6/core';
import { 
  text,
  integer,
  select,
  timestamp,
  relationship,
  virtual
} from '@keystone-6/core/fields';
import { trackingFieldsFor } from './trackingFields';
import { permissions, isSignedIn, isInteractiveUser } from '../access';
import { denyAll } from '@keystone-6/core/access';

const reviewAccess = { create: permissions.canManageOrders, update: permissions.canManageOrders };

export const BusinessAccountRequest = list<Lists.BusinessAccountRequest.TypeInfo>({
  access: {
    operation: {
      query: ({ session }) => {
        // Admins can query all requests
        if (permissions.canManageOrders({ session })) return true;
        // Regular users can query their own requests
        return isSignedIn({ session });
      },
      create: isInteractiveUser, // Interactive customers submit requests, never approval evidence
      update: permissions.canManageOrders, // Only admins can update/approve
      delete: permissions.canManageOrders, // Only admins can delete
    },
    filter: {
      query: ({ session }) => {
        // Admins can see all requests
        if (permissions.canManageOrders({ session })) return true;
        // Regular users can only see their own requests
        return { user: { id: { equals: session?.itemId } } };
      },
    },
  },
  fields: {
    // Core relationship
    user: relationship({
      ref: 'User.businessAccountRequest',
      many: false,
      access: { update: denyAll },
      hooks: {
        resolveInput: ({ operation, resolvedData, context }) => operation === 'create' && !permissions.canManageOrders({ session: context.session })
          ? { connect: { id: context.session.itemId } }
          : resolvedData.user,
      },
    }),
    
    // Request details
    businessName: text({
      validation: { isRequired: true },
    }),
    
    businessType: select({
      options: [
        { label: 'Wholesale Partner', value: 'wholesale' },
        { label: 'Distribution Channel', value: 'distribution' },
        { label: 'Authorized Reseller', value: 'reseller' },
        { label: 'B2B Platform', value: 'b2b_platform' },
        { label: 'Other', value: 'other' }
      ],
      validation: { isRequired: true },
    }),
    
    monthlyOrderVolume: select({
      options: [
        { label: '1-50 orders/month', value: 'low' },
        { label: '51-200 orders/month', value: 'medium' },
        { label: '201-1000 orders/month', value: 'high' },
        { label: '1000+ orders/month', value: 'enterprise' }
      ],
      validation: { isRequired: true },
    }),
    
    requestedCreditLimit: integer({
      validation: { isRequired: true },
      label: 'Requested Credit Limit (in cents)',
    }),
    
    businessDescription: text({
      ui: { displayMode: 'textarea' },
      validation: { isRequired: true },
    }),
    
    // Status tracking
    status: select({
      access: reviewAccess,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Not Approved', value: 'not_approved' },
        { label: 'Requires Info', value: 'requires_info' }
      ],
      defaultValue: 'pending',
      validation: { isRequired: true },
    }),
    
    // Admin fields
    reviewedBy: relationship({
      access: reviewAccess,
      ref: 'User',
      many: false,
      label: 'Reviewed By Admin',
    }),
    
    reviewNotes: text({
      access: reviewAccess,
      ui: { displayMode: 'textarea' },
      label: 'Admin Review Notes',
    }),
    
    approvedCreditLimit: integer({
      access: reviewAccess,
      label: 'Approved Credit Limit (in cents)',
    }),
    
    // Timestamps
    submittedAt: timestamp({
      access: reviewAccess,
      defaultValue: { kind: 'now' },
      validation: { isRequired: true },
    }),
    
    reviewedAt: timestamp({ access: reviewAccess }),
    
    // Generated account (once approved)
    generatedAccount: relationship({
      access: { create: denyAll, update: denyAll },
      ref: 'Account',
      many: false,
      label: 'Generated Account',
    }),

    // Virtual computed fields
    ...group({
      label: 'Computed Fields',
      description: 'Auto-calculated fields for request display',
      fields: {
        formattedRequestedCredit: virtual<Lists.BusinessAccountRequest.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            resolve(item: Lists.BusinessAccountRequest.Item) {
              const amount = Number(item.requestedCreditLimit || 0) / 100;
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount);
            },
          }),
        }),

        formattedApprovedCredit: virtual<Lists.BusinessAccountRequest.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            resolve(item: Lists.BusinessAccountRequest.Item) {
              if (!item.approvedCreditLimit) return null;
              const amount = Number(item.approvedCreditLimit || 0) / 100;
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount);
            },
          }),
        }),

        businessTypeLabel: virtual<Lists.BusinessAccountRequest.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            resolve(item: Lists.BusinessAccountRequest.Item) {
              const typeMap: Record<string, string> = {
                wholesale: 'Wholesale Partner',
                distribution: 'Distribution Channel',
                reseller: 'Authorized Reseller',
                b2b_platform: 'B2B Platform',
                other: 'Other'
              };
              return typeMap[item.businessType] || item.businessType;
            },
          }),
        }),

        volumeLabel: virtual<Lists.BusinessAccountRequest.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            resolve(item: Lists.BusinessAccountRequest.Item) {
              const volumeMap: Record<string, string> = {
                low: '1-50 orders/month',
                medium: '51-200 orders/month',
                high: '201-1000 orders/month',
                enterprise: '1000+ orders/month'
              };
              return volumeMap[item.monthlyOrderVolume] || item.monthlyOrderVolume;
            },
          }),
        }),

        statusLabel: virtual<Lists.BusinessAccountRequest.TypeInfo>({
          field: graphql.field({
            type: graphql.String,
            resolve(item: Lists.BusinessAccountRequest.Item) {
              const statusMap: Record<string, string> = {
                pending: 'Pending Review',
                approved: 'Approved',
                not_approved: 'Not Approved',
                requires_info: 'Requires Additional Information'
              };
              return statusMap[item.status] || item.status;
            },
          }),
        }),
      },
    }),

    ...trackingFieldsFor<Lists.BusinessAccountRequest.TypeInfo>(),
  },
  
  hooks: {
    validateInput: async ({ operation, resolvedData, item, addValidationError }) => {
      if (operation === 'create' && !resolvedData.user) {
        addValidationError('A user is required');
      }
      if (operation === 'create' && resolvedData.status !== 'pending') addValidationError('Create a pending request before review');
      const requested = resolvedData.requestedCreditLimit ?? item?.requestedCreditLimit;
      if (!Number.isSafeInteger(requested) || Number(requested) <= 0) addValidationError('A positive requested credit limit is required');
      const approved = resolvedData.approvedCreditLimit ?? item?.approvedCreditLimit;
      if ((resolvedData.status ?? item?.status) === 'approved' && (!Number.isSafeInteger(approved) || Number(approved) <= 0)) {
        addValidationError('A positive approved credit limit is required');
      }
      if (item?.generatedAccountId && ['status', 'approvedCreditLimit', 'user'].some(key => key in resolvedData)) {
        addValidationError('An approved request is retained; manage its account through the account workflow');
      }
    },
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (
        operation === 'update' &&
        item?.status === 'approved' &&
        originalItem?.status !== 'approved' &&
        !item.generatedAccountId
      ) {
        const accountId = await createAccountFromApprovedRequest(item, context);
        if (accountId) {
          await context.sudo().query.BusinessAccountRequest.updateOne({
            where: { id: String(item.id) },
            data: { generatedAccount: { connect: { id: accountId } } },
          });
        }
      }
    }
  }
});

// Helper function to create account from approved request
async function createAccountFromApprovedRequest(request: Lists.BusinessAccountRequest.Item, context: import('@keystone-6/core/types').KeystoneContext<any>): Promise<string> {
  try {
    // Get the request with user data
    const fullRequest = await context.sudo().query.BusinessAccountRequest.findOne({
      where: { id: request.id },
      query: `
        id
        businessName
        businessType
        approvedCreditLimit
        user {
          id
          email
          name
        }
      `
    });

    if (!fullRequest?.user?.id) throw new Error('Request customer unavailable');

    // Request amounts are explicitly USD in this interface. Currency codes may
    // be stored in either case.
    const currencies = await context.sudo().query.Currency.findMany({
      where: { code: { equals: 'USD', mode: 'insensitive' } },
      take: 2,
      query: 'id code',
    });
    if (currencies.length !== 1) throw new Error('Account currency unavailable or ambiguous');
    const defaultCurrency = currencies[0];

    // Create account
    const account = await context.sudo().query.Account.createOne({
      data: {
        user: { connect: { id: fullRequest.user.id } },
        title: fullRequest.businessName,
        description: fullRequest.businessName,
        currency: { connect: { id: defaultCurrency.id } },
        status: 'active',
        creditLimit: fullRequest.approvedCreditLimit,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        accountType: 'business',
        metadata: {
          createdFromRequest: fullRequest.id,
          businessType: fullRequest.businessType,
          businessName: fullRequest.businessName,
          approvedCreditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit
        }
      }
    });


    // Customer API credentials are created explicitly from the account UI so
    // the raw value can be shown exactly once. Approval never logs or stores a
    // plaintext bearer credential.
    return account.id;
    
  } catch {
    // The controlled approval root owns the transaction. Propagate failure so
    // neither an approved request nor an orphan account can survive it.
    throw new Error('Business account approval could not be completed');
  }
}
