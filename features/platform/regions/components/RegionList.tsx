"use client";

import { useState } from "react";
import { DataTable, StatusFilter } from "../../components/vape-ui";
import { NeedsYouQueue, collectQueue } from "./config-kit";
import { PlatformEmptyState } from "../../components/PlatformEmptyState";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { RegionDetailsComponent, RegionTableHead, regionAttention } from "./RegionDetailsComponent";
import { CreateItemDrawerClientWrapper } from "@/features/platform/components/CreateItemDrawerClientWrapper";
import { PopularRegionsDrawer } from "./drawers/PopularRegionsDrawer";
import { CreateRegionDropdown } from "./CreateRegionDropdown";
import { Region } from "../actions";

interface RegionListProps {
  data: {
    items: Region[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusOptions = [
  { value: "active", label: "Active", tone: "ok" as const },
  { value: "inactive", label: "Inactive", tone: "muted" as const },
];

export function RegionList({ data, statusCounts, list }: RegionListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isPopularRegionsOpen, setIsPopularRegionsOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'scratch' | 'popular'>('scratch');

  const handleCreateClick = (mode: 'scratch' | 'popular') => {
    setCreateMode(mode);
    if (mode === 'popular') {
      setIsPopularRegionsOpen(true);
    } else {
      setIsCreateDrawerOpen(true);
    }
  };

  const handlePopularRegionCreated = () => {
    setIsPopularRegionsOpen(false);
    // Data will refresh automatically via revalidation
  };

  return (
    <div className="space-y-2 px-4 pb-6 md:px-6">
      {/* Needs you: regions that cannot take orders, worst first */}
      <NeedsYouQueue
        listKey="regions"
        recordLabel="Region"
        items={collectQueue(data.items, regionAttention)}
        className="px-0 pb-4 md:px-0"
      />

      <StatusFilter
        className="px-0 pt-0 md:px-0"
        allCount={statusCounts.all}
        statuses={statusOptions.map((status) => ({ ...status, count: statusCounts[status.value] }))}
      />

      {/* Filter Bar with Custom Create Button */}
      <PlatformFilterBar 
        list={list}
        customCreateButton={
          <CreateRegionDropdown onCreateClick={handleCreateClick} />
        }
      />


      {data.items.length === 0 ? (
        <PlatformEmptyState title="No regions" />
      ) : (
        <DataTable aria-label="Regions">
          <thead><RegionTableHead /></thead>
          <tbody>
            {data.items.map((region) => (
              <RegionDetailsComponent
                key={region.id}
                region={region}
                list={list}
              />
            ))}
          </tbody>
        </DataTable>
      )}

      {/* Create Drawers */}
      <CreateItemDrawerClientWrapper
        listKey="regions"
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={() => {
          window.location.reload();
        }}
      />

      <PopularRegionsDrawer
        open={isPopularRegionsOpen}
        onClose={() => setIsPopularRegionsOpen(false)}
        onRegionCreated={handlePopularRegionCreated}
      />
    </div>
  );
}