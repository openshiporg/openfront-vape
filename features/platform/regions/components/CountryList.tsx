"use client";

import { useState } from "react";
import { DataTable, StatusFilter } from "../../components/vape-ui";
import { PlatformEmptyState } from "../../components/PlatformEmptyState";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { CountryDetailsComponent, CountryTableHead } from "./CountryDetailsComponent";
import { CreateCountryDrawer } from "./drawers/CreateCountryDrawer";
import { Country } from "../actions/country-actions";

interface CountryListProps {
  data: {
    items: Country[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusOptions = [
  { value: "assigned", label: "Assigned", tone: "ok" as const },
  { value: "unassigned", label: "Unassigned", tone: "muted" as const },
];

export function CountryList({ data, statusCounts, list }: CountryListProps) {
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
        createLabel="Add Country"
      />


      {data.items.length === 0 ? (
        <PlatformEmptyState title="No countries" />
      ) : (
        <DataTable aria-label="Countries">
          <thead><CountryTableHead /></thead>
          <tbody>
            {data.items.map((country) => (
              <CountryDetailsComponent
                key={country.id}
                country={country}
                list={list}
              />
            ))}
          </tbody>
        </DataTable>
      )}

      {/* Create Drawer */}
      <CreateCountryDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}