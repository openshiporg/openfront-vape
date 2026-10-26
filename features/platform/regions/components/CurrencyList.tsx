"use client";

import { useState } from "react";
import { DataTable, StatusFilter } from "../../components/vape-ui";
import { PlatformEmptyState } from "../../components/PlatformEmptyState";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { CurrencyDetailsComponent, CurrencyTableHead } from "./CurrencyDetailsComponent";
import { CreateCurrencyDrawer } from "./drawers/CreateCurrencyDrawer";
import { Currency } from "../actions/currency-actions";

interface CurrencyListProps {
  data: {
    items: Currency[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusOptions = [
  { value: "active", label: "Active", tone: "ok" as const },
  { value: "unused", label: "Unused", tone: "muted" as const },
];

export function CurrencyList({ data, statusCounts, list }: CurrencyListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-2 px-4 pb-6 md:px-6">
      <StatusFilter
        className="px-0 pt-0 md:px-0"
        allCount={statusCounts.all}
        statuses={statusOptions.map((status) => ({ ...status, count: statusCounts[status.value] }))}
      />

      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Add Currency"
      />


      {data.items.length === 0 ? (
        <PlatformEmptyState title="No currencies" />
      ) : (
        <DataTable aria-label="Currencies">
          <thead><CurrencyTableHead /></thead>
          <tbody>
            {data.items.map((currency) => (
              <CurrencyDetailsComponent
                key={currency.id}
                currency={currency}
                list={list}
              />
            ))}
          </tbody>
        </DataTable>
      )}

      {/* Create Drawer */}
      <CreateCurrencyDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}