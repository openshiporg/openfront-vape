import type { KeystoneContext } from "@keystone-6/core/types";
async function getCustomerAccounts(root: unknown, { limit = 10, offset = 0 }: { limit?: number | null; offset?: number | null }, context: KeystoneContext<any>) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const accounts = await sudoContext.query.Account.findMany({
    where: { 
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit ?? 10, 1), 100),
    skip: Math.max(offset ?? 0, 0),
    query: `
      id
      accountNumber
      title
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedCreditLimit
      availableCredit
      totalOwedInAccountCurrency
      formattedTotalOwedInAccountCurrency
      availableCreditInAccountCurrency
      formattedAvailableCreditInAccountCurrency
      balanceDue
      dueDate
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        order {
          id
        }
      }
      unpaidLineItemsByRegion
    `
  });

  return accounts;
}

export default getCustomerAccounts;