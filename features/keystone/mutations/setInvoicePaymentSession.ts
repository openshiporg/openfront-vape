import type { PaymentSessionSelection } from '../models/commerce-projections';
import type { KeystoneContext } from "@keystone-6/core/types";
import { assertInvoiceAccess } from "../security/invoice-access";

async function setInvoicePaymentSession(root: unknown, { invoiceId, providerId }: { invoiceId: string; providerId: string }, context: KeystoneContext<any>) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();

  // Get invoice with payment collection
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (!invoice.paymentCollection) {
    throw new Error("Invoice has no payment collection");
  }

  // Update all payment sessions to not selected
  for (const session of invoice.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }

  // Find and update the selected session
  const selectedSession = invoice.paymentCollection.paymentSessions?.find(
    (s: PaymentSessionSelection) => s.paymentProvider.id === providerId
  );

  if (!selectedSession) {
    throw new Error("Payment session not found");
  }

  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });

  return await sudoContext.db.Invoice.findOne({
    where: { id: invoiceId }
  });
}

export default setInvoicePaymentSession;