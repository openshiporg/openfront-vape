'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { completePickupOrderHandover, markPickupOrderPaid, updateOrderStatus } from '../actions/orders';

const ID_TYPES = [
  { value: 'drivers_license', label: "Driver's license" },
  { value: 'state_id', label: 'State ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'military_id', label: 'Military ID' },
];

/**
 * Counter actions for a reserve-online order: take payment, check ID and hand the
 * order over (fulfills and completes it), or cancel the reservation (stock is
 * returned and the unpaid payment is closed).
 */
export function PickupOrderActions({
  orderId,
  status,
  payAtPickupPending,
  isPickup = false,
  paid = false,
  handedOver = false,
}: {
  orderId: string;
  status: string;
  payAtPickupPending: boolean;
  isPickup?: boolean;
  paid?: boolean;
  handedOver?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [idType, setIdType] = useState('drivers_license');
  const [pending, startTransition] = useTransition();
  const open = status === 'pending' || status === 'requires_action';
  const readyForHandover = isPickup && status === 'pending' && paid && !payAtPickupPending;

  if (isPickup && handedOver) {
    return (
      <section aria-label="Pickup" className="flex flex-col gap-1 rounded-md border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Picked up</p>
        <p className="text-[13px] text-muted-foreground">ID checked at the counter and the order was handed over. The check is in the compliance record below.</p>
      </section>
    );
  }
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
    <section aria-label="Pickup actions" className="flex flex-col gap-3 rounded-md border bg-card p-4">
      <p className="text-sm font-medium text-foreground">
        {payAtPickupPending
          ? 'Unpaid. The customer pays at the counter and shows photo ID (21+).'
          : readyForHandover
            ? 'Paid, ready for pickup. Check photo ID (21+) before handing it over.'
            : 'Open order'}
      </p>
      {readyForHandover && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-[13px] text-muted-foreground">
            ID shown
            <select
              value={idType}
              onChange={(event) => setIdType(event.target.value)}
              className="h-9 w-full max-w-xs rounded-[4px] border bg-background px-2 text-sm text-foreground"
            >
              {ID_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" checked={idChecked} onChange={(event) => setIdChecked(event.target.checked)} className="mt-0.5 size-4" />
            <span>The ID is valid, shows 21 or older, and matches the name on the order.</span>
          </label>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {payAtPickupPending && (
          <Button type="button" disabled={pending} className="h-9 rounded-[4px]"
            onClick={() => run(() => markPickupOrderPaid(orderId), 'Marked paid')}>
            Mark paid
          </Button>
        )}
        {readyForHandover && (
          <Button type="button" disabled={pending || !idChecked} className="h-9 rounded-[4px]"
            onClick={() => run(() => completePickupOrderHandover(orderId, idType), 'Picked up')}>
            Hand over order
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
