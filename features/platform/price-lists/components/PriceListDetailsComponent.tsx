"use client";

import React, { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Count, Pill, StatusWord, Td, Th, Tr, Track, type DotTone } from "../../components/vape-ui";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import {
  ActionsCell,
  ExpandRow,
  ExpandToggle,
  RowMenu,
  SubTable,
  daysUntil,
  formatDate,
  type QueueItem,
} from "../../regions/components/config-kit";

interface PriceList {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  customerGroups?: Array<{
    id: string;
    name: string;
    metadata?: any;
  }>;
  prices?: Array<{
    id: string;
    amount: number;
    currency?: {
      id: string;
      code: string;
      symbol: string;
    };
    variant?: {
      id: string;
      title: string;
      product?: {
        id: string;
        title: string;
      };
    };
  }>;
  rules?: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface PriceListDetailsComponentProps {
  pricelist: PriceList;
  list: any;
}

type TabType = 'customerGroups' | 'prices' | 'rules';

export const PRICE_LIST_COLUMNS = 7;

export function PriceListTableHead() {
  return (
    <tr>
      <Th>Price list</Th>
      <Th>Status</Th>
      <Th priority={2}>Type</Th>
      <Th priority={2}>Starts</Th>
      <Th priority={2}>Ends</Th>
      <Th priority={3}>Created</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

export function priceListStatus(pricelist: PriceList): { tone: DotTone; label: string } {
  if (pricelist.status === "active" && pricelist.endsAt && new Date(pricelist.endsAt) <= new Date()) {
    return { tone: "danger", label: "Ended" };
  }
  if (pricelist.status === "active") return { tone: "ok", label: "Active" };
  if (pricelist.status === "draft") return { tone: "muted", label: "Draft" };
  return { tone: "muted", label: pricelist.status ? pricelist.status.charAt(0).toUpperCase() + pricelist.status.slice(1) : "No status" };
}

/** Active lists past their end date or ending within 7 days; drafts whose start date has passed. */
export function priceListAttention(pricelist: PriceList): QueueItem | null {
  const base = { id: pricelist.id, record: pricelist.name, fixLabel: "Edit" };
  if (pricelist.status === "active") {
    if (pricelist.endsAt && new Date(pricelist.endsAt) <= new Date()) {
      return { ...base, tone: "danger", state: "Ended", issue: `Ended ${formatDate(pricelist.endsAt)}, still active` };
    }
    const days = daysUntil(pricelist.endsAt);
    if (days !== null && days <= 7) {
      return { ...base, tone: "warn", state: "Ending soon", issue: `Ends in ${days} ${days === 1 ? "day" : "days"}` };
    }
  }
  if (pricelist.status === "draft" && pricelist.startsAt && new Date(pricelist.startsAt) <= new Date()) {
    return { ...base, tone: "warn", state: "Draft", issue: `Start date ${formatDate(pricelist.startsAt)} passed, still draft` };
  }
  return null;
}

export function PriceListDetailsComponent({
  pricelist,
  list,
}: PriceListDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('customerGroups');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    customerGroups: 1,
    prices: 1,
    rules: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<string>('');
  const itemsPerPage = 5;

  // Prepare data for tabs
  const customerGroupsData = pricelist.customerGroups || [];
  const pricesData = pricelist.prices || [];
  const rulesData = pricelist.rules || [];

  const tabs = [
    { 
      key: 'customerGroups' as TabType, 
      label: `Customer Groups`,
      count: customerGroupsData.length,
      data: customerGroupsData
    },
    { 
      key: 'prices' as TabType, 
      label: `Prices`,
      count: pricesData.length,
      data: pricesData
    },
    { 
      key: 'rules' as TabType, 
      label: `Rules`,
      count: rulesData.length,
      data: rulesData
    }
  ].filter(tab => tab.count > 0);

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const formatCurrency = (amount: number, currency?: { code: string; symbol: string }) => {
    if (!currency) return `$${(amount / 100).toFixed(2)}`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount / 100);
  };

  const handleEditItem = (itemId: string, itemType: string) => {
    setEditItemId(itemId);
    setEditItemType(itemType);
    setEditItemOpen(true);
  };

  const status = priceListStatus(pricelist);
  const detailId = `price-list-${pricelist.id}-detail`;

  const rowMenu = (label: string, onClick: () => void) => (
    <ActionsCell>
      <RowMenu>
        <DropdownMenuItem onClick={onClick}>{label}</DropdownMenuItem>
      </RowMenu>
    </ActionsCell>
  );

  return (
    <>
      <Tr>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/price-lists/${pricelist.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {pricelist.name}
          </Link>
          {pricelist.description && (
            <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{pricelist.description}</div>
          )}
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td priority={2} className="capitalize text-muted-foreground">{pricelist.type || "—"}</Td>
        <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(pricelist.startsAt) ?? "—"}</Td>
        <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(pricelist.endsAt) ?? "No end"}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(pricelist.createdAt)}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              Edit Price List
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="price list details" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={PRICE_LIST_COLUMNS}>
          {tabs.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Track label="Sections">
                  {tabs.map((tab) => (
                    <Pill key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                      {tab.label} <Count>{tab.count}</Count>
                    </Pill>
                  ))}
                </Track>
                {activeTabData && activeTabData.count > itemsPerPage && (
                  <ItemPagination
                    currentPage={currentPages[activeTab]}
                    totalItems={activeTabData.count}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(newPage) => handlePageChange(activeTab, newPage)}
                  />
                )}
              </div>

              {activeTab === 'customerGroups' && (
                <SubTable head={<><Th>Customer group</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                  {customerGroupsData.slice(
                    (currentPages.customerGroups - 1) * itemsPerPage,
                    currentPages.customerGroups * itemsPerPage
                  ).map((group) => (
                    <Tr key={group.id}>
                      <Td className="font-medium">{group.name}</Td>
                      {rowMenu("Edit Customer Group", () => handleEditItem(group.id, 'customer-groups'))}
                    </Tr>
                  ))}
                </SubTable>
              )}
              {activeTab === 'prices' && (
                <SubTable head={<><Th>Variant</Th><Th align="right">Amount</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                  {pricesData.slice(
                    (currentPages.prices - 1) * itemsPerPage,
                    currentPages.prices * itemsPerPage
                  ).map((price) => (
                    <Tr key={price.id}>
                      <Td className="max-w-[16rem] truncate">{price.variant?.product?.title} {price.variant?.title}</Td>
                      <Td align="right" className="font-medium">{formatCurrency(price.amount, price.currency)}</Td>
                      {rowMenu("Edit Price", () => handleEditItem(price.id, 'prices'))}
                    </Tr>
                  ))}
                </SubTable>
              )}
              {activeTab === 'rules' && (
                <SubTable head={<><Th>Rule</Th><Th>Type</Th><Th align="right">Value</Th><Th align="right"><span className="sr-only">Actions</span></Th></>}>
                  {rulesData.slice(
                    (currentPages.rules - 1) * itemsPerPage,
                    currentPages.rules * itemsPerPage
                  ).map((rule) => (
                    <Tr key={rule.id}>
                      <Td className="font-medium">{rule.name}</Td>
                      <Td className="capitalize text-muted-foreground">{rule.type}</Td>
                      <Td align="right">{rule.value}</Td>
                      {rowMenu("Edit Rule", () => handleEditItem(rule.id, 'price-list-rules'))}
                    </Tr>
                  ))}
                </SubTable>
              )}
            </div>
          ) : (
            <p className="py-2 text-center text-[13px] text-muted-foreground">No customer groups, prices or rules</p>
          )}
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="price-lists"
        itemId={pricelist.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />

      {/* Edit Item Drawer */}
      {editItemId && (
        <EditItemDrawerClientWrapper
          listKey={editItemType}
          itemId={editItemId}
          open={editItemOpen}
          onClose={() => {
            setEditItemOpen(false);
            setEditItemId('');
            setEditItemType('');
          }}
        />
      )}
    </>
  );
}
