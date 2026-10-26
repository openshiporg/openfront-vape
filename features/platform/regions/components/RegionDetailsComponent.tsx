"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { Count, Pill, StatusWord, Td, Th, Tr, Track, type DotTone } from "../../components/vape-ui";
import { ActionsCell, ExpandRow, ExpandToggle, RowMenu, SubTable, formatDate, type QueueItem } from "./config-kit";

interface Region {
  id: string;
  name: string;
  code: string;
  taxRate: number;
  createdAt: string;
  updatedAt?: string;
  automaticTaxes: boolean;
  currency: {
    id: string;
    code: string;
    symbol: string;
    symbolNative: string;
  };
  countries: Array<{
    id: string;
    iso2: string;
    displayName: string;
  }>;
  paymentProviders?: Array<{
    id: string;
    name: string;
    code: string;
    isInstalled: boolean;
  }>;
  fulfillmentProviders?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface RegionDetailsComponentProps {
  region: Region;
  list: any;
  salesDisabled?: boolean;
}

// Whether the region can take orders: it needs countries, a payment and a
// fulfillment provider, and the store-level release gate must be open.
function regionStatus(region: Region, salesDisabled: boolean): { tone: DotTone; label: string } {
  if (!region.countries?.length) return { tone: "muted", label: "No countries" };
  if (salesDisabled) return { tone: "danger", label: "Sales disabled" };
  if (!region.paymentProviders?.length) return { tone: "warn", label: "No payment provider" };
  if (!region.fulfillmentProviders?.length) return { tone: "warn", label: "No fulfillment provider" };
  return { tone: "ok", label: "Active" };
}

/** What stops a region from taking orders, worst first; null when it is ready. */
export function regionAttention(region: Region): QueueItem | null {
  const missing: string[] = [];
  if (!region.countries?.length) missing.push("no countries");
  if (!region.paymentProviders?.length) missing.push("no payment provider");
  else if (!region.paymentProviders.some((provider) => provider.isInstalled)) missing.push("payment provider not installed");
  if (!region.fulfillmentProviders?.length) missing.push("no fulfillment provider");
  if (missing.length === 0) return null;
  const blocksCheckout = !!region.countries?.length;
  const first = missing[0];
  return {
    id: region.id,
    record: region.name,
    serial: region.code?.toUpperCase(),
    tone: blocksCheckout ? "danger" : "warn",
    state: first.charAt(0).toUpperCase() + first.slice(1),
    issue: blocksCheckout
      ? `Checkout blocked: ${missing.join(", ")}`
      : `Unused: ${missing.join(", ")}`,
    fixLabel: "Edit region",
    listKey: "regions",
  };
}

export const REGION_COLUMNS = 8;

export function RegionTableHead() {
  return (
    <tr>
      <Th>Region</Th>
      <Th>Status</Th>
      <Th priority={2}>Currency</Th>
      <Th priority={2} align="right">Countries</Th>
      <Th priority={3} align="right">Tax</Th>
      <Th priority={3} align="right">Payment</Th>
      <Th priority={3} align="right">Fulfillment</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

type TabType = 'currency' | 'countries' | 'payment' | 'fulfillment';

export function RegionDetailsComponent({
  region,
  list,
  salesDisabled = false,
}: RegionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('currency');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    currency: 1,
    countries: 1,
    payment: 1,
    fulfillment: 1
  });
  
  // Individual edit drawers
  const [editCurrencyOpen, setEditCurrencyOpen] = useState(false);
  const [editCountryOpen, setEditCountryOpen] = useState(false);
  const [editCountryId, setEditCountryId] = useState<string>('');
  const [editPaymentOpen, setEditPaymentOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string>('');
  const [editFulfillmentOpen, setEditFulfillmentOpen] = useState(false);
  const [editFulfillmentId, setEditFulfillmentId] = useState<string>('');
  
  const itemsPerPage = 5;
  
  const status = regionStatus(region, salesDisabled);

  // Prepare data for tabs
  const currencyData = [{
    id: region.currency.id,
    code: region.currency.code,
    symbol: region.currency.symbol,
    symbolNative: region.currency.symbolNative,
    taxRate: region.taxRate,
    automaticTaxes: region.automaticTaxes
  }];

  const paymentProviders = region.paymentProviders || [];
  const fulfillmentProviders = region.fulfillmentProviders || [];

  const tabs = [
    { 
      key: 'currency' as TabType, 
      label: `${currencyData.length} Currency${currencyData.length !== 1 ? 's' : ''}`,
      count: currencyData.length,
      data: currencyData
    },
    { 
      key: 'countries' as TabType, 
      label: `${region.countries.length} Countr${region.countries.length !== 1 ? 'ies' : 'y'}`,
      count: region.countries.length,
      data: region.countries
    },
    { 
      key: 'payment' as TabType, 
      label: `${paymentProviders.length} Payment Provider${paymentProviders.length !== 1 ? 's' : ''}`,
      count: paymentProviders.length,
      data: paymentProviders
    },
    { 
      key: 'fulfillment' as TabType, 
      label: `${fulfillmentProviders.length} Fulfillment Provider${fulfillmentProviders.length !== 1 ? 's' : ''}`,
      count: fulfillmentProviders.length,
      data: fulfillmentProviders
    }
  ].filter(tab => tab.count > 0);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const tabLabels: Record<TabType, string> = {
    currency: 'Currency',
    countries: 'Countries',
    payment: 'Payment Providers',
    fulfillment: 'Fulfillment Providers',
  };
  const detailId = `region-${region.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              href={`/dashboard/regions/${region.id}`}
              className="truncate font-medium text-foreground hover:underline"
            >
              {region.name}
            </Link>
            <span className="shrink-0 font-mono text-[12px] uppercase text-muted-foreground">{region.code}</span>
          </div>
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td priority={2} className="whitespace-nowrap font-mono">
          {region.currency.symbol} {region.currency.code.toUpperCase()}
        </Td>
        <Td priority={2} align="right">{region.countries.length}</Td>
        <Td priority={3} align="right">{(region.taxRate * 100).toFixed(1)}%</Td>
        <Td priority={3} align="right" className={paymentProviders.length ? undefined : "text-muted-foreground"}>{paymentProviders.length}</Td>
        <Td priority={3} align="right" className={fulfillmentProviders.length ? undefined : "text-muted-foreground"}>{fulfillmentProviders.length}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              Edit Region
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="region details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={REGION_COLUMNS}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {tabs.length > 0 && (
                <Track label="Region details">
                  {tabs.map((tab) => (
                    <Pill
                      key={tab.key}
                      active={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tabLabels[tab.key]} <Count>{tab.count}</Count>
                    </Pill>
                  ))}
                </Track>
              )}
              {activeTabData && activeTabData.count > itemsPerPage && (
                <ItemPagination
                  currentPage={currentPages[activeTab]}
                  totalItems={activeTabData.count}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(newPage) => handlePageChange(activeTab, newPage)}
                />
              )}
            </div>

            {activeTabData && activeTab === 'currency' && (
              <SubTable head={<><Th>Currency</Th><Th priority={2}>Taxes</Th><Th align="right">Tax rate</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                {currencyData.slice(
                  (currentPages.currency - 1) * itemsPerPage,
                  currentPages.currency * itemsPerPage
                ).map((currency, index) => (
                  <Tr key={index}>
                    <Td className="font-mono">
                      <span className="text-muted-foreground">{currency.symbol}</span> {currency.code.toUpperCase()}
                    </Td>
                    <Td priority={2} className="text-muted-foreground">{currency.automaticTaxes ? 'Automatic taxes' : 'No automatic taxes'}</Td>
                    <Td align="right">{(currency.taxRate * 100).toFixed(1)}%</Td>
                    <ActionsCell>
                      <RowMenu>
                        <DropdownMenuItem onClick={() => setEditCurrencyOpen(true)}>
                          Edit Currency
                        </DropdownMenuItem>
                      </RowMenu>
                    </ActionsCell>
                  </Tr>
                ))}
              </SubTable>
            )}

            {activeTabData && activeTab === 'countries' && (
              <SubTable head={<><Th>Country</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                {region.countries.slice(
                  (currentPages.countries - 1) * itemsPerPage,
                  currentPages.countries * itemsPerPage
                ).map((country, index) => (
                  <Tr key={index}>
                    <Td>
                      <span className="mr-2 inline-block w-6 font-mono text-[12px] uppercase text-muted-foreground">{country.iso2}</span>
                      {country.displayName}
                    </Td>
                    <ActionsCell>
                      <RowMenu>
                        <DropdownMenuItem onClick={() => {
                          setEditCountryId(country.id);
                          setEditCountryOpen(true);
                        }}>
                          Edit Country
                        </DropdownMenuItem>
                      </RowMenu>
                    </ActionsCell>
                  </Tr>
                ))}
              </SubTable>
            )}

            {activeTabData && activeTab === 'payment' && (
              <SubTable head={<><Th>Payment provider</Th><Th>Status</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                {paymentProviders.slice(
                  (currentPages.payment - 1) * itemsPerPage,
                  currentPages.payment * itemsPerPage
                ).map((provider, index) => (
                  <Tr key={index}>
                    <Td>{provider.name}</Td>
                    <Td>
                      <StatusWord tone={provider.isInstalled ? "ok" : "danger"}>
                        {provider.isInstalled ? 'Installed' : 'Not installed'}
                      </StatusWord>
                    </Td>
                    <ActionsCell>
                      <RowMenu>
                        <DropdownMenuItem onClick={() => {
                          setEditPaymentId(provider.id);
                          setEditPaymentOpen(true);
                        }}>
                          Edit Payment Provider
                        </DropdownMenuItem>
                      </RowMenu>
                    </ActionsCell>
                  </Tr>
                ))}
              </SubTable>
            )}

            {activeTabData && activeTab === 'fulfillment' && (
              <SubTable head={<><Th>Fulfillment provider</Th><Th priority={2}>Code</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                {fulfillmentProviders.slice(
                  (currentPages.fulfillment - 1) * itemsPerPage,
                  currentPages.fulfillment * itemsPerPage
                ).map((provider, index) => (
                  <Tr key={index}>
                    <Td>{provider.name}</Td>
                    <Td priority={2} className="font-mono text-muted-foreground">{provider.code}</Td>
                    <ActionsCell>
                      <RowMenu>
                        <DropdownMenuItem onClick={() => {
                          setEditFulfillmentId(provider.id);
                          setEditFulfillmentOpen(true);
                        }}>
                          Edit Fulfillment Provider
                        </DropdownMenuItem>
                      </RowMenu>
                    </ActionsCell>
                  </Tr>
                ))}
              </SubTable>
            )}

            <p className="text-[12px] tabular-nums text-muted-foreground">Created {formatDate(region.createdAt)}</p>
          </div>
        </ExpandRow>
      )}

      {/* Edit Region Drawer */}
      <EditItemDrawerClientWrapper
        listKey="regions"
        itemId={region.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          // Refresh will be handled by the parent component
        }}
      />

      {/* Edit Currency Drawer */}
      <EditItemDrawerClientWrapper
        listKey="currencies"
        itemId={region.currency.id}
        open={editCurrencyOpen}
        onClose={() => setEditCurrencyOpen(false)}
      />

      {/* Edit Country Drawer */}
      {editCountryId && (
        <EditItemDrawerClientWrapper
          listKey="countries"
          itemId={editCountryId}
          open={editCountryOpen}
          onClose={() => {
            setEditCountryOpen(false);
            setEditCountryId('');
          }}
        />
      )}

      {/* Edit Payment Provider Drawer */}
      {editPaymentId && (
        <EditItemDrawerClientWrapper
          listKey="payment-providers"
          itemId={editPaymentId}
          open={editPaymentOpen}
          onClose={() => {
            setEditPaymentOpen(false);
            setEditPaymentId('');
          }}
        />
      )}

      {/* Edit Fulfillment Provider Drawer */}
      {editFulfillmentId && (
        <EditItemDrawerClientWrapper
          listKey="fulfillment-providers"
          itemId={editFulfillmentId}
          open={editFulfillmentOpen}
          onClose={() => {
            setEditFulfillmentOpen(false);
            setEditFulfillmentId('');
          }}
        />
      )}
    </>
  );
}