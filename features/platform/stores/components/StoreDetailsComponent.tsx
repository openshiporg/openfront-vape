"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { StatusWord, Td, Th, Tr } from "../../components/vape-ui";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  Facts,
  formatDate,
  rowIconClass,
  type QueueItem,
} from "../../regions/components/config-kit";

interface Store {
  id: string;
  name: string;
  defaultCurrencyCode: string;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

interface StoreDetailsComponentProps {
  store: Store;
  list: any;
}

export const STORE_COLUMNS = 6;

export function StoreTableHead() {
  return (
    <tr>
      <Th>Store</Th>
      <Th>Setup</Th>
      <Th priority={2}>Default currency</Th>
      <Th priority={3}>Created</Th>
      <Th priority={3}>Updated</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

/** A store without a default currency falls back to USD; flag it so the owner sets one. */
export function storeAttention(store: Store): QueueItem | null {
  if (store.defaultCurrencyCode) return null;
  return {
    id: store.id,
    record: store.name,
    tone: "warn",
    state: "No currency",
    issue: "No default currency set, falling back to USD",
    fixLabel: "Set currency",
  };
}

export function StoreDetailsComponent({
  store,
  list,
}: StoreDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const detailId = `store-${store.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/stores/${store.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {store.name}
          </Link>
        </Td>
        <Td>
          {store.defaultCurrencyCode ? (
            <StatusWord tone="ok">Currency set</StatusWord>
          ) : (
            <StatusWord tone="warn">No currency</StatusWord>
          )}
        </Td>
        <Td priority={2} className="font-mono">{store.defaultCurrencyCode?.toUpperCase() || 'USD'}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(store.createdAt)}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(store.updatedAt) ?? "—"}</Td>
        <ActionsCell>
          <button
            type="button"
            className={rowIconClass}
            aria-label="Edit"
            onClick={() => setIsEditDrawerOpen(true)}
          >
            <MoreVertical />
          </button>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="store details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={STORE_COLUMNS}>
          <Facts
            facts={[
              { label: "Default currency", value: store.defaultCurrencyCode || 'USD', mono: true },
              { label: "Created", value: formatDate(store.createdAt) },
              { label: "Updated", value: formatDate(store.updatedAt) ?? '—' },
            ]}
          />
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="stores"
        itemId={store.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
