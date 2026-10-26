'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Dot, ListBand, StatusWord } from '@/features/platform/components/vape-ui';
import { Button } from '@/components/ui/button';
import { UnfulfilledItems } from '../components/UnfulfilledItems';
import { FulfillmentHistory } from '../components/FulfillmentHistory';
import { ShippingTabs } from '../components/ShippingTabs';
import { cancelFulfillment, toggleProvider } from '@/features/platform/orders/actions';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Order } from '../types';
import { FulfilmentEvidence } from '../components/FulfilmentEvidence';
import type { FulfilmentEvidence as Evidence } from '../actions/label-evidence';

interface FulfillOrderClientProps {
  order: Order;
  evidence: Evidence;
}

export function FulfillOrderClient({ order, evidence }: FulfillOrderClientProps) {
  const router = useRouter();
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!order) {
    return notFound();
  }

  const handleProviderToggle = async (providerId: string) => {
    setIsLoading(true);
    const response = await toggleProvider(providerId);

    if (response.success) {
      toast.success('Provider status updated successfully');
      router.refresh();
    } else {
      console.error('Failed to toggle provider:', response.error, response.errors);
      toast.error('Failed to update provider', {
        description: response.error
      });
    }
    setIsLoading(false);
  };

  const handleDeleteFulfillment = async (id: string) => {
    setIsLoading(true);
    const response = await cancelFulfillment(id);

    if (response.success) {
      toast.success('Fulfillment cancelled');
      router.refresh();
    } else {
      toast.error('Fulfillment not cancelled', { description: response.error });
    }
    setIsLoading(false);
  };

  const handleCancelAll = async () => {
    setIsLoading(true);
    const activeFulfillments = order.fulfillmentDetails?.filter(f => !f.canceledAt) || [];
    
    for (const fulfillment of activeFulfillments) {
      await handleDeleteFulfillment(fulfillment.id);
    }
    setIsLoading(false);
  };

  const unfulfilledItems = order.unfulfilled || [];
  const isFullyFulfilled = unfulfilledItems.length === 0;

  return (
    <div>
      <div className="max-w-6xl space-y-8 p-4 pb-24 sm:pb-10 md:p-6">
        <div className="space-y-3">
          <Link
            href={`/dashboard/platform/orders/${order.id}`}
            className="inline-flex min-h-8 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Order <span className="font-mono tabular-nums">#{order.displayId}</span>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
                Fulfill order <span className="font-mono tabular-nums">#{order.displayId}</span>
              </h1>
              <StatusWord tone={isFullyFulfilled ? 'ok' : 'warn'} className="text-[14px]">
                {isFullyFulfilled ? 'Fulfilled' : `${unfulfilledItems.length} unfulfilled`}
              </StatusWord>
            </div>
            <div className="text-[13px] tabular-nums text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="min-w-0 space-y-8 lg:col-span-8">
            {isFullyFulfilled ? (
              <ListBand>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-baseline gap-2.5 text-sm text-foreground">
                    <Dot tone="ok" />
                    All items fulfilled
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex min-h-9 items-center rounded-[4px] bg-background px-4 text-sm font-medium text-foreground ring-1 ring-border disabled:opacity-50 max-sm:min-h-10"
                        disabled={isLoading}
                      >
                        Start over
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-3" side="bottom">
                      <div className="space-y-2.5">
                        <p className="text-[13px] font-medium">
                          Cancel all fulfillments?
                        </p>
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 rounded-[4px] text-xs"
                            onClick={handleCancelAll}
                            disabled={isLoading}
                          >
                            Cancel All
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </ListBand>
            ) : (
              <UnfulfilledItems
                items={unfulfilledItems}
                selectedQuantities={selectedQuantities}
                setSelectedQuantities={setSelectedQuantities}
                order={order}
              />
            )}
            {order.fulfillmentDetails && order.fulfillmentDetails.length > 0 && (
              <FulfillmentHistory
                fulfillments={order.fulfillmentDetails}
                order={{
                  id: order.id,
                  unfulfilled: order.unfulfilled?.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                  })) || []
                }}
                onDelete={handleDeleteFulfillment}
              />
            )}
            <FulfilmentEvidence evidence={evidence} />
          </div>

          {!isFullyFulfilled && (
            <div className="min-w-0 space-y-6 lg:col-span-4">
              <div className="lg:sticky lg:top-6">
                <ShippingTabs
                  order={order}
                  onProviderToggle={handleProviderToggle}
                  selectedQuantities={selectedQuantities}
                  setSelectedQuantities={setSelectedQuantities}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 