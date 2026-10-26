"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { StatusWord, Td, Th, Tr } from "../../components/vape-ui";
import { Country } from "../actions/country-actions";
import { ActionsCell, ExpandRow, ExpandToggle, Facts, RowMenu, formatDate } from "./config-kit";

interface CountryDetailsComponentProps {
  country: Country;
  list: any;
}

export const COUNTRY_COLUMNS = 6;

export function CountryTableHead() {
  return (
    <tr>
      <Th>Country</Th>
      <Th>Status</Th>
      <Th priority={2}>Region</Th>
      <Th priority={2}>ISO3</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

export function CountryDetailsComponent({ country, list }: CountryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const statusTone = country.region ? "ok" : "muted";
  const statusText = country.region ? "Assigned" : "Unassigned";
  const detailId = `region-country-${country.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="w-6 shrink-0 font-mono text-[12px] uppercase text-muted-foreground">{country.iso2}</span>
            <Link
              href={`/dashboard/platform/regions?tab=countries&focus=${country.id}`}
              className="truncate font-medium text-foreground hover:underline"
            >
              {country.displayName}
            </Link>
          </div>
        </Td>
        <Td>
          <StatusWord tone={statusTone}>{statusText}</StatusWord>
        </Td>
        <Td priority={2}>
          {country.region ? (
            <>
              {country.region.name}{" "}
              <span className="font-mono text-[12px] text-muted-foreground">{country.region.currency.code}</span>
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Td>
        <Td priority={2} className="font-mono uppercase text-muted-foreground">{country.iso3}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(country.createdAt)}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Country
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="country details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={COUNTRY_COLUMNS}>
          <Facts
            facts={[
              { label: "Full name", value: country.name },
              { label: "ISO3", value: country.iso3?.toUpperCase(), mono: true },
              { label: "Numeric code", value: country.numCode, mono: true },
              ...(country.region ? [{ label: "Region", value: `${country.region.name} (${country.region.currency.code})` }] : []),
            ]}
          />
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="countries"
        itemId={country.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
