"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { StatusWord, Td, Th, Tr, type DotTone } from "../../components/vape-ui";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  Facts,
  formatDate,
  rowIconClass,
} from "../../regions/components/config-kit";

const statusTones: Record<string, DotTone> = {
  active: "ok",
  inactive: "muted",
};

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  symbolNative: string;
  noDivisionCurrency: boolean;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CurrencyDetailsComponentProps {
  currency: Currency;
  list: any;
}

export const CURRENCY_COLUMNS = 6;

export function CurrencyTableHead() {
  return (
    <tr>
      <Th>Currency</Th>
      <Th>Code</Th>
      <Th priority={2}>Symbol</Th>
      <Th priority={2}>Minor units</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

export function CurrencyDetailsComponent({
  currency,
  list,
}: CurrencyDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const detailId = `currency-${currency.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/currencies/${currency.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {currency.name}
          </Link>
          {currency.status && (
            <div className="mt-0.5">
              <StatusWord tone={statusTones[currency.status] || "muted"} className="text-[12px]">
                {currency.status.charAt(0).toUpperCase() + currency.status.slice(1)}
              </StatusWord>
            </div>
          )}
        </Td>
        <Td className="font-mono uppercase">{currency.code}</Td>
        <Td priority={2} className="tabular-nums">{currency.symbol}</Td>
        <Td priority={2} className="text-muted-foreground">{currency.noDivisionCurrency ? "None" : "Yes"}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(currency.createdAt)}</Td>
        <ActionsCell>
          <button
            type="button"
            className={rowIconClass}
            onClick={() => setIsEditDrawerOpen(true)}
            aria-label="Edit"
          >
            <MoreVertical />
          </button>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="currency details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={CURRENCY_COLUMNS}>
          <Facts
            facts={[
              { label: "Native symbol", value: currency.symbolNative },
              { label: "Record ID", value: currency.id, mono: true },
              { label: "Updated", value: formatDate(currency.updatedAt) ?? '—' },
            ]}
          />
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="currencies"
        itemId={currency.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
