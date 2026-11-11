// Invoices become `overdue` once their due date passes while still unpaid (`sent`).
// claimInvoicePaymentCommit already accepts sent and overdue, so paying an overdue invoice works.
export async function markOverdueInvoices(prisma: any, now = new Date()): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: { status: "sent", dueDate: { lt: now } },
    data: { status: "overdue" },
  });
  return result.count;
}
