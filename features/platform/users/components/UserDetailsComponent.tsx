"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Count, Dot, ListBand, Pill, StatusWord, Td, Tr, Track } from "../../components/vape-ui";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { OrderDetailsComponent } from "../../orders/components/OrderDetailsComponent";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  hasAccount: boolean;
  role?: {
    id: string;
    name: string;
  };
  orders?: Array<{
    id: string;
    displayId: string;
    status: string;
    email: string;
    taxRate?: number;
    canceledAt?: string;
    createdAt: string;
    updatedAt?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    shippingAddress?: {
      id: string;
      company?: string;
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      phone?: string;
    };
    billingAddress?: {
      id: string;
      company?: string;
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      phone?: string;
    };
    lineItems?: Array<{
      id: string;
      title: string;
      quantity: number;
      sku?: string;
      thumbnail?: string;
      formattedUnitPrice?: string;
      formattedTotal?: string;
      variantData?: any;
      productData?: any;
    }>;
    total?: string;
  }>;
  addresses?: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phone?: string;
    metadata?: any;
  }>;
  carts?: Array<{
    id: string;
    status: string;
    completedAt?: string;
    createdAt: string;
    totalPrice?: string;
    lineItems?: Array<{
      id: string;
      title: string;
      quantity: number;
    }>;
  }>;
  customerGroups?: Array<{
    id: string;
    name: string;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface UserDetailsComponentProps {
  user: User;
  list: any;
}

type TabType = 'orders' | 'addresses' | 'carts' | 'customerGroups';

export function UserDetailsComponent({
  user,
  list,
}: UserDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    orders: 1,
    addresses: 1,
    carts: 1,
    customerGroups: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<string>('');
  const itemsPerPage = 5;

  // Prepare data for tabs
  const ordersData = user.orders || [];
  const addressesData = user.addresses || [];
  const cartsData = user.carts || [];
  const customerGroupsData = user.customerGroups || [];

  const tabs = [
    { 
      key: 'orders' as TabType, 
      label: `Orders`,
      count: ordersData.length,
      data: ordersData
    },
    { 
      key: 'addresses' as TabType, 
      label: `Addresses`,
      count: addressesData.length,
      data: addressesData
    },
    { 
      key: 'carts' as TabType, 
      label: `Carts`,
      count: cartsData.length,
      data: cartsData
    },
    { 
      key: 'customerGroups' as TabType, 
      label: `Customer groups`,
      count: customerGroupsData.length,
      data: customerGroupsData
    }
  ].filter(tab => tab.count > 0);

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const handleEditItem = (itemId: string, itemType: string) => {
    setEditItemId(itemId);
    setEditItemType(itemType);
    setEditItemOpen(true);
  };

  const [expanded, setExpanded] = useState(false);
  const displayName = user.name || `${user.firstName} ${user.lastName}`.trim() || user.email;
  const heldOrders = ordersData.filter((order) => order.status === 'requires_action').length;

  return (
    <>
      <Tr data-state={expanded ? 'open' : 'closed'}>
        <Td className="max-w-[16rem]">
          <Link
            href={`/dashboard/platform/users/${user.id}`}
            className="block truncate font-medium text-foreground hover:underline"
          >
            {displayName}
          </Link>
          {user.email && <span className="block truncate text-[12px] text-muted-foreground md:hidden">{user.email}</span>}
        </Td>
        <Td priority={2} className="max-w-[16rem]">
          <span className="block truncate text-muted-foreground">{user.email}</span>
          {user.phone && <span className="block text-[12px] tabular-nums text-muted-foreground">{user.phone}</span>}
        </Td>
        <Td priority={2}>
          {user.role ? <span className="text-foreground">{user.role.name}</span> : <span className="text-muted-foreground">Customer</span>}
        </Td>
        <Td>
          <StatusWord tone={user.hasAccount ? "ok" : "muted"}>{user.hasAccount ? "Account" : "Guest"}</StatusWord>
          {heldOrders > 0 && (
            <StatusWord tone="warn" className="ml-2 max-sm:ml-0 max-sm:flex">
              {heldOrders} held
            </StatusWord>
          )}
        </Td>
        <Td align="right" priority={3}>{ordersData.length}</Td>
        <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })}
        </Td>
        <Td align="right" className="whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-[4px] sm:size-8 [&_svg]:size-4"
                  aria-label="Actions"
                >
                  <MoreVertical className="stroke-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                  Edit user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-[4px] sm:size-8 [&_svg]:size-4"
              aria-expanded={expanded}
              aria-label={expanded ? `Hide records for ${displayName}` : `Show records for ${displayName}`}
              onClick={() => setExpanded((value) => !value)}
            >
              <ChevronDown className={`stroke-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </Td>
      </Tr>
      {expanded && (
        <tr className="border-b last:border-b-0">
          <td colSpan={7} className="p-0">
            <div className="space-y-3 border-t border-border bg-background/60 px-4 py-4">
              {tabs.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Track label="Customer records">
                    {tabs.map((tab) => (
                      <Pill
                        key={tab.key}
                        active={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.key === 'orders' && 'Orders'}
                        {tab.key === 'addresses' && 'Addresses'}
                        {tab.key === 'carts' && 'Carts'}
                        {tab.key === 'customerGroups' && 'Customer groups'}
                        <Count>{tab.count}</Count>
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
              )}

              {activeTabData && (
                <>
                  {activeTab === 'orders' && (
                    <ListBand>
                      {ordersData.slice(
                        (currentPages.orders - 1) * itemsPerPage,
                        currentPages.orders * itemsPerPage
                      ).map((order) => (
                        <div key={order.id} className="border-0">
                          <OrderDetailsComponent
                            order={order}
                            list={{ key: "Order" }}
                            removeEditItemButton={true}
                          />
                        </div>
                      ))}
                    </ListBand>
                  )}

                  {activeTab === 'addresses' && (
                    <ListBand>
                      {addressesData.slice(
                        (currentPages.addresses - 1) * itemsPerPage,
                        currentPages.addresses * itemsPerPage
                      ).map((address) => (
                        <div key={address.id} className="flex items-start justify-between gap-3 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                              {address.firstName} {address.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {address.address1}
                              {address.city && `, ${address.city}`}
                              {address.province && `, ${address.province}`}
                            </div>
                            {address.phone && (
                              <div className="text-xs tabular-nums text-muted-foreground">
                                {address.phone}
                              </div>
                            )}
                          </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-10 shrink-0 rounded-[4px] sm:size-8 [&_svg]:size-4"
                            aria-label="Address actions"
                          >
                            <MoreVertical className="stroke-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(address.id, 'addresses')}>
                            Edit address
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                        </div>
                      ))}
                    </ListBand>
                  )}

                  {activeTab === 'carts' && (
                    <ListBand>
                      {cartsData.slice(
                        (currentPages.carts - 1) * itemsPerPage,
                        currentPages.carts * itemsPerPage
                      ).map((cart) => (
                        <div key={cart.id} className="flex items-start justify-between gap-3 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                              <Dot tone={cart.status === 'COMPLETED' ? 'ok' : 'info'} />
                              <span className="text-sm font-medium text-foreground">
                                Cart <span className="font-mono tabular-nums">{cart.id.slice(-8)}</span>
                              </span>
                              <span className="text-xs capitalize text-muted-foreground">{cart.status.toLowerCase()}</span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                              {cart.totalPrice && (
                                <span className="tabular-nums text-foreground">{cart.totalPrice}</span>
                              )}
                              <span className="tabular-nums">{new Date(cart.createdAt).toLocaleDateString("en-US", { timeZone: "UTC" })}</span>
                              {cart.lineItems && (
                                <span><span className="tabular-nums">{cart.lineItems.length}</span> items</span>
                              )}
                            </div>
                          </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-10 shrink-0 rounded-[4px] sm:size-8 [&_svg]:size-4"
                            aria-label="Cart actions"
                          >
                            <MoreVertical className="stroke-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(cart.id, 'carts')}>
                            Edit cart
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                        </div>
                      ))}
                    </ListBand>
                  )}

                  {activeTab === 'customerGroups' && (
                    <ListBand>
                      {customerGroupsData.slice(
                        (currentPages.customerGroups - 1) * itemsPerPage,
                        currentPages.customerGroups * itemsPerPage
                      ).map((group) => (
                        <div key={group.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                          <span className="min-w-0 truncate text-sm font-medium text-foreground">{group.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-10 shrink-0 rounded-[4px] sm:size-8 [&_svg]:size-4"
                            aria-label="Customer group actions"
                          >
                            <MoreVertical className="stroke-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(group.id, 'customer-groups')}>
                            Edit customer group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                        </div>
                      ))}
                    </ListBand>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      )}

      <EditItemDrawerClientWrapper
        listKey="users"
        itemId={user.id}
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
