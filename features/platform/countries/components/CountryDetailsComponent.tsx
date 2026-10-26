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

interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  numCode: number;
  displayName: string;
  status?: string;
  region?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

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

function countryStatus(country: Country): { tone: DotTone; label: string } {
  if (country.status) {
    return {
      tone: statusTones[country.status] || "muted",
      label: country.status.charAt(0).toUpperCase() + country.status.slice(1),
    };
  }
  return country.region ? { tone: "ok", label: "Assigned" } : { tone: "muted", label: "Unassigned" };
}

export function CountryDetailsComponent({
  country,
  list,
}: CountryDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const status = countryStatus(country);
  const detailId = `country-${country.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="w-6 shrink-0 font-mono text-[12px] uppercase text-muted-foreground">{country.iso2}</span>
            <Link
              href={`/dashboard/countries/${country.id}`}
              className="truncate font-medium text-foreground hover:underline"
            >
              {country.name || country.displayName}
            </Link>
          </div>
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td priority={2}>{country.region?.name ?? <span className="text-muted-foreground">—</span>}</Td>
        <Td priority={2} className="font-mono uppercase text-muted-foreground">{country.iso3}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(country.createdAt)}</Td>
        <ActionsCell>
          <button
            type="button"
            className={rowIconClass}
            onClick={() => setIsEditDrawerOpen(true)}
            aria-label="Edit"
          >
            <MoreVertical />
          </button>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="country details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={COUNTRY_COLUMNS}>
          <Facts
            facts={[
              { label: "Display name", value: country.displayName },
              { label: "ISO2", value: country.iso2?.toUpperCase(), mono: true },
              { label: "ISO3", value: country.iso3?.toUpperCase(), mono: true },
              { label: "Region", value: country.region?.name || '—' },
              { label: "Updated", value: formatDate(country.updatedAt) ?? '—' },
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
