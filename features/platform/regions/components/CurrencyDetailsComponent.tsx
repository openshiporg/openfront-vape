"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { StatusWord, Td, Th, Tr } from "../../components/vape-ui";
import { Currency } from "../actions/currency-actions";
import { ActionsCell, ExpandRow, ExpandToggle, Facts, RowMenu, SubTable, formatDate } from "./config-kit";

interface CurrencyDetailsComponentProps {
  currency: Currency;
  list: any;
}

export const CURRENCY_COLUMNS = 6;

export function CurrencyTableHead() {
  return (
    <tr>
      <Th>Currency</Th>
      <Th>Status</Th>
      <Th priority={2}>Symbol</Th>
      <Th priority={2} align="right">Regions</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

export function CurrencyDetailsComponent({ currency, list }: CurrencyDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const isActive = currency.regions && currency.regions.length > 0;
  const statusTone = isActive ? "ok" : "muted";
  const statusText = isActive ? "Active" : "Unused";
  const detailId = `region-currency-${currency.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="w-8 shrink-0 font-mono text-[12px] uppercase text-muted-foreground">{currency.code}</span>
            <Link
              href={`/dashboard/platform/regions?tab=currencies&focus=${currency.id}`}
              className="truncate font-medium text-foreground hover:underline"
            >
              {currency.name}
            </Link>
          </div>
        </Td>
        <Td>
          <StatusWord tone={statusTone}>{statusText}</StatusWord>
        </Td>
        <Td priority={2} className="tabular-nums">
          {currency.symbol}
          {currency.symbolNative !== currency.symbol && (
            <span className="text-muted-foreground"> · {currency.symbolNative}</span>
          )}
        </Td>
        <Td priority={2} align="right">{currency.regions?.length || 0}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(currency.createdAt)}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Currency
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="currency details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={CURRENCY_COLUMNS}>
          <div className="space-y-4">
            <Facts
              facts={[
                { label: "Code", value: currency.code?.toUpperCase(), mono: true },
                { label: "Symbol", value: currency.symbol },
                { label: "Native symbol", value: currency.symbolNative },
                { label: "Regions", value: currency.regions?.length || 0 },
              ]}
            />

            {currency.regions && currency.regions.length > 0 && (
              <SubTable head={<><Th>Used by region</Th><Th align="right">Code</Th></>}>
                {currency.regions.map((region) => (
                  <Tr key={region.id}>
                    <Td>{region.name}</Td>
                    <Td align="right" className="font-mono uppercase text-muted-foreground">{region.code}</Td>
                  </Tr>
                ))}
              </SubTable>
            )}
          </div>
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
