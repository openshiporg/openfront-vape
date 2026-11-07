// Invoices become `overdue` once their due date passes while still unpaid (`sent`).
// claimInvoicePaymentCommit already accepts sent and overdue, so paying an overdue invoice works.
export async function markOverdueInvoices(prisma: any, now = new Date()): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: { status: "sent", dueDate: { lt: now } },
    data: { status: "overdue" },
  });
  return result.count;
}

let started = false;
/** In-process hourly sweep; safe to run on every instance because the update is conditional on status. */
export function startInvoiceOverdueSweep(context: { prisma: any }) {
  if (started) return;
  started = true;
  const run = () => markOverdueInvoices(context.prisma).catch((error) => console.error("Invoice overdue sweep failed:", error?.message || error));
  void run();
  setInterval(run, 60 * 60 * 1000).unref?.();
}
