"use client";

import React, { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Count, Pill, StatusWord, Td, Th, Tr, Track, type DotTone } from "../../components/vape-ui";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  RowMenu,
  SubTable,
  formatDate,
  type QueueItem,
} from "../../regions/components/config-kit";

interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  isInstalled: boolean;
  metadata?: any;
  regions?: Array<{
    id: string;
    name: string;
    code: string;
    currency?: {
      code: string;
      symbol: string;
    };
    countries?: Array<{
      id: string;
      name: string;
      iso2: string;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentProviderDetailsComponentProps {
  paymentprovider: PaymentProvider;
  list: any;
}


export const PAYMENT_PROVIDER_COLUMNS = 5;

export function PaymentProviderTableHead() {
  return (
    <tr>
      <Th>Provider</Th>
      <Th>Status</Th>
      <Th priority={2} align="right">Regions</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

export function paymentProviderStatus(provider: PaymentProvider): { tone: DotTone; label: string } {
  if (!provider.isInstalled) return { tone: "danger", label: "Not installed" };
  if (!provider.regions?.length) return { tone: "warn", label: "No regions" };
  return { tone: "ok", label: "Installed" };
}

/** Providers that cannot take a payment: not installed, or installed in no region. */
export function paymentProviderAttention(provider: PaymentProvider): QueueItem | null {
  const base = { id: provider.id, record: provider.name, serial: provider.code, fixLabel: "Edit" };
  if (!provider.isInstalled) return { ...base, tone: "danger", state: "Not installed", issue: "Checkout cannot use this provider" };
  if (!provider.regions?.length) return { ...base, tone: "warn", state: "No regions", issue: "Installed but not offered in any region" };
  return null;
}

type TabType = 'regions';

export function PaymentProviderDetailsComponent({
  paymentprovider,
  list,
}: PaymentProviderDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('regions');
  const [currentPage, setCurrentPage] = useState(1);
  const [editRegionId, setEditRegionId] = useState('');
  const [editRegionOpen, setEditRegionOpen] = useState(false);
  
  const itemsPerPage = 5;
  const regions = paymentprovider.regions || [];
  
  const tabs = [
    {
      key: 'regions' as TabType,
      label: `${regions.length} Region${regions.length !== 1 ? 's' : ''}`,
      count: regions.length,
      data: regions
    }
  ];
  
  const activeTabData = tabs.find(tab => tab.key === activeTab);
  
  const resetPage = () => {
    setCurrentPage(1);
  };

  const status = paymentProviderStatus(paymentprovider);
  const detailId = `paymentprovider-${paymentprovider.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/payment-providers/${paymentprovider.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {paymentprovider.name}
          </Link>
          <div className="mt-0.5 truncate font-mono text-[12px] text-muted-foreground">{paymentprovider.code}</div>
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td priority={2} align="right">{regions.length}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(paymentprovider.createdAt) ?? "—"}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              Edit Payment Provider
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="regions" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={PAYMENT_PROVIDER_COLUMNS}>
          {regions.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Track label="Provider details">
                  {tabs.map((tab) => (
                    <Pill
                      key={tab.key}
                      active={activeTab === tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        resetPage();
                      }}
                    >
                      Regions <Count>{tab.count}</Count>
                    </Pill>
                  ))}
                </Track>
                {activeTabData && activeTabData.count > itemsPerPage && (
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] tabular-nums text-muted-foreground">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, activeTabData.count)}–{Math.min(currentPage * itemsPerPage, activeTabData.count)} of {activeTabData.count}
                    </span>
                    <ItemPagination
                      currentPage={currentPage}
                      totalItems={activeTabData.count}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>

              {activeTabData && activeTab === 'regions' && (
                <SubTable
                  head={
                    <>
                      <Th>Region</Th>
                      <Th priority={2}>Currency</Th>
                      <Th align="right">Countries</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </>
                  }
                >
                  {regions
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((region, index) => (
                      <Tr key={index}>
                        <Td>
                          {region.name}{" "}
                          <span className="font-mono text-[12px] uppercase text-muted-foreground">{region.code}</span>
                        </Td>
                        <Td priority={2} className="font-mono text-muted-foreground">
                          {region.currency ? `${region.currency.symbol} ${region.currency.code}` : "—"}
                        </Td>
                        <Td align="right">{region.countries?.length ?? 0}</Td>
                        <ActionsCell>
                          <RowMenu>
                            <DropdownMenuItem onClick={() => {
                              setEditRegionId(region.id);
                              setEditRegionOpen(true);
                            }}>
                              Edit Region
                            </DropdownMenuItem>
                          </RowMenu>
                        </ActionsCell>
                      </Tr>
                    ))}
                </SubTable>
              )}
            </div>
          ) : (
            <p className="py-2 text-center text-[13px] text-muted-foreground">Not assigned to any region</p>
          )}
        </ExpandRow>
      )}

      {/* Edit Payment Provider Drawer */}
      <EditItemDrawerClientWrapper
        listKey={list.key}
        itemId={paymentprovider.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
      
      {/* Edit Region Drawer */}
      <EditItemDrawerClientWrapper
        listKey="regions"
        itemId={editRegionId}
        open={editRegionOpen}
        onClose={() => {
          setEditRegionOpen(false);
          setEditRegionId('');
        }}
      />
    </>
  );
}
