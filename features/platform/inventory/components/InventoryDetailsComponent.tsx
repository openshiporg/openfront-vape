'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MoreVertical } from 'lucide-react';
import { Dot, ListBand, type DotTone } from '@/features/platform/components/vape-ui';
import { Button } from '@/components/ui/button';
import { EditItemDrawerClientWrapper } from '../../components/EditItemDrawerClientWrapper';
import { format } from 'date-fns';
import Link from 'next/link';

interface InventoryDetailsComponentProps {
  inventory: any;
  list: any;
}

const statusConfig: Record<string, { label: string; tone: DotTone }> = {
  in_stock: { label: 'In stock', tone: 'ok' },
  low_stock: { label: 'Low stock', tone: 'warn' },
  out_of_stock: { label: 'Out of stock', tone: 'danger' },
  backordered: { label: 'Backordered', tone: 'info' },
};

export function InventoryDetailsComponent({ inventory, list }: InventoryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const status = inventory.status || 'in_stock';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;

  const availableQuantity = inventory.quantity - inventory.reservedQuantity;
  const iconButton =
    'inline-flex size-8 items-center justify-center rounded-[4px] bg-muted text-muted-foreground hover:text-foreground [&_svg]:size-3.5 max-sm:size-10';

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={inventory.id} className="border-0">
          <div className="flex w-full items-start justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {inventory.product?.id ? (
                  <Link
                    href={`/dashboard/platform/products/${inventory.product.id}`}
                    className="font-mono text-sm font-medium tabular-nums text-foreground hover:underline underline-offset-4"
                  >
                    {inventory.sku || 'No SKU'}
                  </Link>
                ) : (
                  <span className="font-mono text-sm font-medium tabular-nums text-foreground">{inventory.sku || 'No SKU'}</span>
                )}
                <span className="inline-flex items-baseline gap-1.5 text-xs text-muted-foreground">
                  <Dot tone={config.tone} />
                  {config.label}
                </span>
              </div>
              {(inventory.product || inventory.variant) && (
                <p className="truncate text-xs text-foreground/80">
                  {inventory.product?.title}
                  {inventory.variant && <span className="font-mono tabular-nums"> {inventory.variant.title}</span>}
                </p>
              )}
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                <span>{inventory.location || 'Default'}</span>
                <span className="font-mono tabular-nums">{format(new Date(inventory.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-3">
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-medium text-foreground">{availableQuantity}</div>
                <div className="text-xs text-muted-foreground">of {inventory.quantity}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Edit inventory"
                  className={iconButton}
                  onClick={() => setIsEditDrawerOpen(true)}
                >
                  <MoreVertical />
                </button>
                <Button variant="secondary" size="icon" className={iconButton} asChild>
                  <AccordionTrigger className="py-0" />
                </Button>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            <div className="border-b border-border bg-muted/30 px-4 py-3 md:px-6">
              <ListBand className="grid grid-cols-2 divide-y-0 bg-background sm:grid-cols-4">
                {[
                  ['On hand', inventory.quantity],
                  ['Reserved', inventory.reservedQuantity],
                  ['Available', availableQuantity],
                  ['Incoming', inventory.incomingQuantity],
                ].map(([name, value]) => (
                  <div key={name as string} className="px-4 py-3">
                    <span className="block text-xs text-muted-foreground">{name}</span>
                    <span className="mt-0.5 block font-mono text-lg tabular-nums text-foreground">{value}</span>
                  </div>
                ))}
              </ListBand>
              <div className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
                Updated {format(new Date(inventory.updatedAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="inventory"
        itemId={inventory.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}