'use server';

import { sessionContext } from '@/features/platform/lib/session-context';

export type CustomerAddress = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  isBilling: boolean;
  country: { iso2: string } | null;
};

export type CustomerDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  hasAccount: boolean;
  onboardingStatus: string | null;
  createdAt: string;
  role: { name: string } | null;
  customerGroups: Array<{ id: string; name: string }>;
  addresses: CustomerAddress[];
  orders: Array<{ id: string; displayId: string; status: string; total: string | null; createdAt: string }>;
  carts: Array<{ id: string; status: string; total: string | null; createdAt: string; lineItemsCount: number; order: { id: string; displayId: string } | null }>;
  accounts: Array<{ id: string; accountNumber: string; status: string; accountType: string; formattedTotal: string | null; formattedCreditLimit: string | null }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; formattedTotal: string | null; createdAt: string; dueDate: string | null }>;
};

export type Attestation =
  | { state: 'attested'; occurredAt: string }
  | { state: 'none' }
  | { state: 'unavailable'; error: string };

export type CustomerResult =
  | { success: true; data: CustomerDetail | null; attestation: Attestation }
  | { success: false; error: string };

const CUSTOMER_QUERY = `
  id name email phone hasAccount onboardingStatus createdAt
  role { name }
  customerGroups { id name }
  addresses { id firstName lastName company address1 address2 city province postalCode phone isBilling country { iso2 } }
  orders(orderBy: [{ createdAt: desc }]) { id displayId status total createdAt }
  carts(orderBy: [{ createdAt: desc }], take: 25) { id status total createdAt lineItemsCount order { id displayId } }
  accounts { id accountNumber status accountType formattedTotal formattedCreditLimit }
  invoices(orderBy: [{ createdAt: desc }]) { id invoiceNumber status formattedTotal createdAt dueDate }
`;

export async function getCustomer(id: string): Promise<CustomerResult> {
  const context = await sessionContext();
  if (!context.session?.itemId) return { success: false, error: 'Sign in again to view this customer.' };

  let customer: CustomerDetail | null;
  try {
    customer = (await context.query.User.findOne({ where: { id }, query: CUSTOMER_QUERY })) as unknown as CustomerDetail | null;
  } catch (error) {
    console.error('Customer read failed', (error as any)?.name);
    return { success: false, error: 'Unable to load this customer.' };
  }
  if (!customer) return { success: true, data: null, attestation: { state: 'none' } };

  // The sign-up 21+ attestation is a compliance event keyed to the user id.
  let attestation: Attestation;
  try {
    const events = await context.query.ComplianceEvent.findMany({
      where: { eventType: { equals: 'AGE_ATTESTED_21' }, resourceType: { equals: 'User' }, resourceId: { equals: id } },
      orderBy: [{ occurredAt: 'desc' }],
      take: 1,
      query: 'id occurredAt',
    });
    attestation = events[0] ? { state: 'attested', occurredAt: String(events[0].occurredAt) } : { state: 'none' };
  } catch {
    attestation = { state: 'unavailable', error: "You don't have permission to view compliance records." };
  }

  return { success: true, data: customer, attestation };
}
