// Invoices become `overdue` once their due date passes while still unpaid (`sent`).
// claimInvoicePaymentCommit already accepts sent and overdue, so paying an overdue invoice works.
export async function markOverdueInvoices(prisma: any, now = new Date()): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: { status: "sent", dueDate: { lt: now } },
    data: { status: "overdue" },
  });
  // Business accounts too: active, past the due date, with a balance still owing.
  const accounts = await prisma.$executeRaw`UPDATE "Account" SET status = 'overdue' WHERE status = 'active' AND "dueDate" < ${now} AND COALESCE("totalAmount", 0) - COALESCE("paidAmount", 0) > 0`;
  return result.count + Number(accounts);
}
