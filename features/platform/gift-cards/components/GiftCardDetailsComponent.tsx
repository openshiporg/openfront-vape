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
import { GiftCard } from "../actions";

interface GiftCardDetailsComponentProps {
  giftcard: GiftCard;
  list: any;
}

type TabType = 'transactions';

export const GIFT_CARD_COLUMNS = 7;

export function GiftCardTableHead() {
  return (
    <tr>
      <Th>Code</Th>
      <Th>Status</Th>
      <Th align="right">Balance</Th>
      <Th priority={2} align="right">Value</Th>
      <Th priority={3}>Order</Th>
      <Th priority={3}>Expires</Th>
      <Th align="right"><span className="sr-only">Actions</span></Th>
    </tr>
  );
}

function formatAmount(giftcard: GiftCard, amount: number) {
  const currency = giftcard.region?.currency?.code || 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

export function giftCardStatus(giftcard: GiftCard): { tone: DotTone; label: string } {
  if (giftcard.isDisabled) return { tone: "muted", label: "Disabled" };
  if (giftcard.endsAt && new Date(giftcard.endsAt) <= new Date()) return { tone: "danger", label: "Expired" };
  if (giftcard.balance <= 0) return { tone: "muted", label: "Redeemed" };
  return { tone: "ok", label: "Active" };
}

/** Enabled cards that expired, or expire within 30 days with balance left. */
export function giftCardAttention(giftcard: GiftCard): QueueItem | null {
  if (giftcard.isDisabled) return null;
  const base = { id: giftcard.id, record: giftcard.code, fixLabel: "Edit" };
  if (giftcard.endsAt && new Date(giftcard.endsAt) <= new Date()) {
    return { ...base, tone: "danger", state: "Expired", issue: `Ended ${formatDate(giftcard.endsAt)} with ${formatAmount(giftcard, giftcard.balance)} left` };
  }
  const days = daysUntil(giftcard.endsAt);
  if (days !== null && days <= 30 && giftcard.balance > 0) {
    return { ...base, tone: "warn", state: "Expiring", issue: `Expires in ${days} ${days === 1 ? "day" : "days"}, ${formatAmount(giftcard, giftcard.balance)} left` };
  }
  return null;
}

export function GiftCardDetailsComponent({
  giftcard,
  list,
}: GiftCardDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    transactions: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const itemsPerPage = 5;

  const usagePercentage = giftcard.value > 0 ? ((giftcard.value - giftcard.balance) / giftcard.value) * 100 : 0;
  const hasBeenUsed = giftcard.value !== giftcard.balance;

  // Prepare data for tabs
  const transactionsData = giftcard.giftCardTransactions || [];

  const tabs = [
    {
      key: 'transactions' as TabType,
      label: `Transactions`,
      count: transactionsData.length,
      data: transactionsData
    }
  ];

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const formatCurrency = (amount: number) => formatAmount(giftcard, amount);

  const handleEditItem = (itemId: string) => {
    setEditItemId(itemId);
    setEditItemOpen(true);
  };

  const status = giftCardStatus(giftcard);
  const detailId = `gift-card-${giftcard.id}-detail`;

  return (
    <>
      <Tr>
        <Td className="max-w-[14rem]">
          <Link
            href={`/dashboard/gift-cards/${giftcard.id}`}
            className="font-mono text-[13px] font-semibold text-foreground hover:underline"
          >
            {giftcard.code}
          </Link>
          {giftcard.order && giftcard.order.user && (
            <div className="mt-0.5 truncate text-[12px]">
              <Link
                href={`/dashboard/users/${giftcard.order.user.id}`}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {giftcard.order.user.name || giftcard.order.user.email}
              </Link>
            </div>
          )}
        </Td>
        <Td>
          <StatusWord tone={status.tone}>{status.label}</StatusWord>
        </Td>
        <Td align="right" className="whitespace-nowrap">
          {formatCurrency(giftcard.balance)}
          {hasBeenUsed && <div className="text-[12px] text-muted-foreground">{usagePercentage.toFixed(0)}% used</div>}
        </Td>
        <Td priority={2} align="right" className="whitespace-nowrap text-muted-foreground">{formatCurrency(giftcard.value)}</Td>
        <Td priority={3} className="whitespace-nowrap">
          {giftcard.order ? (
            <Link
              href={`/dashboard/platform/orders/${giftcard.order.id}`}
              className="font-mono text-foreground hover:underline"
            >
              #{giftcard.order.displayId}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(giftcard.endsAt) ?? "No expiry"}</Td>
        <ActionsCell>
          <RowMenu>
            <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
              Edit Gift Card
            </DropdownMenuItem>
          </RowMenu>
          <ExpandToggle open={open} onToggle={() => setOpen(!open)} controls={detailId} label="transactions" />
        </ActionsCell>
      </Tr>

      {open && (
        <ExpandRow id={detailId} colSpan={GIFT_CARD_COLUMNS}>
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

            {activeTabData && activeTab === 'transactions' && (
              transactionsData.length > 0 ? (
                <SubTable
                  head={
                    <>
                      <Th>Order</Th>
                      <Th priority={2}>Date</Th>
                      <Th priority={2} align="right">Order total</Th>
                      <Th align="right">Amount</Th>
                      <Th align="right"><span className="sr-only">Actions</span></Th>
                    </>
                  }
                >
                  {transactionsData.slice(
                    (currentPages.transactions - 1) * itemsPerPage,
                    currentPages.transactions * itemsPerPage
                  ).map((transaction) => (
                    transaction.order && (
                      <Tr key={transaction.id}>
                        <Td>
                          <Link
                            href={`/dashboard/platform/orders/${transaction.order.id}`}
                            className="font-mono font-medium text-foreground hover:underline"
                          >
                            #{transaction.order.displayId}
                          </Link>
                        </Td>
                        <Td priority={2} className="whitespace-nowrap text-muted-foreground">{formatDate(transaction.createdAt)}</Td>
                        <Td priority={2} align="right" className="text-muted-foreground">{transaction.order.total}</Td>
                        <Td align="right">-{formatCurrency(transaction.amount)}</Td>
                        <ActionsCell>
                          <RowMenu label="Transaction actions">
                            <DropdownMenuItem onClick={() => handleEditItem(transaction.id)}>
                              Edit Transaction
                            </DropdownMenuItem>
                          </RowMenu>
                        </ActionsCell>
                      </Tr>
                    )
                  ))}
                </SubTable>
              ) : (
                <p className="py-4 text-center text-[13px] text-muted-foreground">No transactions</p>
              )
            )}
          </div>
        </ExpandRow>
      )}

      <EditItemDrawerClientWrapper
        listKey="gift-cards"
        itemId={giftcard.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />

      {/* Edit Item Drawer */}
      {editItemId && (
        <EditItemDrawerClientWrapper
          listKey="gift-card-transactions"
          itemId={editItemId}
          open={editItemOpen}
          onClose={() => {
            setEditItemOpen(false);
            setEditItemId('');
          }}
        />
      )}
    </>
  );
}
