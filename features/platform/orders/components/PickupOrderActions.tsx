'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { markPickupOrderPaid, updateOrderStatus } from '../actions/orders';

/**
 * Counter actions for a reserve-online order: take payment, or cancel the
 * reservation (stock is returned and the unpaid payment is closed).
 */
export function PickupOrderActions({ orderId, status, payAtPickupPending }: { orderId: string; status: string; payAtPickupPending: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pending, startTransition] = useTransition();
  const open = status === 'pending' || status === 'requires_action';
  if (!open && !payAtPickupPending) return null;

  const run = (work: () => Promise<{ success: boolean; error?: string }>, done: string) =>
    startTransition(async () => {
      setError('');
      const result = await work();
      if (!result.success) { setError(result.error || 'Could not update the order.'); return; }
      toast.success(done);
      setConfirmCancel(false);
      router.refresh();
    });

  return (
    <section aria-label="Pickup actions" className="flex flex-col gap-2 rounded-md border bg-card p-4">
      <p className="text-sm font-medium text-foreground">
        {payAtPickupPending ? 'Unpaid. The customer pays at the counter and shows photo ID (21+).' : 'Open order'}
      </p>
      <div className="flex flex-wrap gap-2">
        {payAtPickupPending && (
          <Button type="button" disabled={pending} className="h-9 rounded-[4px]"
            onClick={() => run(() => markPickupOrderPaid(orderId), 'Marked paid')}>
            Mark paid
          </Button>
        )}
        {open && !confirmCancel && (
          <Button type="button" variant="outline" disabled={pending} className="h-9 rounded-[4px]" onClick={() => setConfirmCancel(true)}>
            Cancel order
          </Button>
        )}
        {open && confirmCancel && (
          <Button type="button" variant="destructive" disabled={pending} className="h-9 rounded-[4px]"
            onClick={() => run(() => updateOrderStatus(orderId, 'canceled', 'Canceled at pickup by the merchant'), 'Order canceled')}>
            Confirm cancel
          </Button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </section>
  );
}
