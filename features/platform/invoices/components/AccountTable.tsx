"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTable,
  Stamp,
  StatusWord,
  Td,
  Th,
  Tr,
  buttonClass,
  type DotTone,
} from "../../components/vape-ui";
import { cn } from "@/lib/utils";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

type Word = { label: string; tone: DotTone };

const STATUS: Record<string, Word> = {
  active: { label: "Active", tone: "ok" },
  paid: { label: "Paid", tone: "ok" },
  suspended: { label: "Suspended", tone: "danger" },
  not_approved: { label: "Not approved", tone: "warn" },
  overdue: { label: "Overdue", tone: "danger" },
};

export function accountStatus(account: any): Word {
  return STATUS[account?.status] ?? { label: account?.status ?? "Unknown", tone: "muted" };
}

const pastDue = (account: any) =>
  !!account?.dueDate && new Date(account.dueDate).getTime() < Date.now() && (account.balanceDue ?? 0) > 0;

/** Why an account is waiting on the operator, with a severity rank (lower is worse), or null. */
export function accountNeed(account: any): (Word & { rank: number }) | null {
  if (!account) return null;
  if (account.status === "overdue") return { label: "Overdue balance", tone: "danger", rank: 0 };
  if (account.status !== "paid" && pastDue(account)) return { label: "Past due date", tone: "danger", rank: 1 };
  if (typeof account.availableCredit === "number" && account.availableCredit < 0)
    return { label: "Over credit limit", tone: "danger", rank: 2 };
  if (account.status === "not_approved") return { label: "Approval needed", tone: "warn", rank: 3 };
  if (account.status === "suspended") return { label: "Suspended", tone: "warn", rank: 4 };
  return null;
}

const accountHref = (account: any) => `/dashboard/accounts/${account.id}`;
const shortDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "None";
const holder = (account: any) => account?.user?.name || account?.user?.email || "No holder";

function AccountLink({ account }: { account: any }) {
  return (
    <Link href={accountHref(account)} className="font-mono font-medium tabular-nums text-foreground underline-offset-4 hover:underline">
      {account.invoiceNumber || account.accountNumber || account.id.slice(-8)}
    </Link>
  );
}

function AccountActions({ account }: { account: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Actions"
            className={cn(buttonClass.base, buttonClass.ghost, "size-8 px-0 max-sm:size-10")}
          >
            <MoreHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-md">
          <DropdownMenuItem onClick={() => setOpen(true)}>Edit Account</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditItemDrawerClientWrapper listKey="accounts" itemId={account.id} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AccountQueue({ accounts }: { accounts: any[] }) {
  return (
    <DataTable aria-label="Accounts needing action">
      <thead>
        <tr>
          <Th>Account</Th>
          <Th>Needs</Th>
          <Th priority={2}>Holder</Th>
          <Th align="right" priority={2}>Balance</Th>
          <Th priority={3}>Due</Th>
          <Th align="right"><span className="sr-only">Next step</span></Th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => {
          const need = accountNeed(account)!;
          return (
            <Tr key={account.id}>
              <Td><AccountLink account={account} /></Td>
              <Td><StatusWord tone={need.tone}>{need.label}</StatusWord></Td>
              <Td priority={2} className="max-w-[14rem] truncate text-foreground">{holder(account)}</Td>
              <Td align="right" priority={2} className="whitespace-nowrap text-foreground">
                {account.formattedCurrentBalance || account.formattedTotal}
              </Td>
              <Td priority={3} className="whitespace-nowrap tabular-nums text-muted-foreground">{shortDate(account.dueDate)}</Td>
              <Td align="right">
                <Link href={accountHref(account)} className={cn(buttonClass.base, buttonClass.outline)}>
                  Open
                </Link>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}

export function AccountTable({ accounts }: { accounts: any[] }) {
  return (
    <DataTable aria-label="Business accounts">
      <thead>
        <tr>
          <Th>Account</Th>
          <Th priority={2}>Name</Th>
          <Th priority={3}>Holder</Th>
          <Th>Status</Th>
          <Th align="right">Balance</Th>
          <Th align="right" priority={3}>Credit limit</Th>
          <Th priority={2}>Due</Th>
          <Th align="right" priority={3}>Orders</Th>
          <Th className="w-10"><span className="sr-only">Actions</span></Th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => {
          const status = accountStatus(account);
          return (
            <Tr key={account.id}>
              <Td>
                <AccountLink account={account} />
                <div className="max-w-[12rem] truncate text-[12px] text-muted-foreground md:hidden">{account.title || holder(account)}</div>
              </Td>
              <Td priority={2} className="max-w-[14rem] truncate text-foreground">{account.title || "Untitled"}</Td>
              <Td priority={3} className="max-w-[14rem] truncate text-muted-foreground">{holder(account)}</Td>
              <Td><Stamp tone={status.tone}>{status.label}</Stamp></Td>
              <Td align="right" className="whitespace-nowrap text-foreground">
                {account.formattedCurrentBalance || account.formattedTotal}
              </Td>
              <Td align="right" priority={3} className="whitespace-nowrap text-muted-foreground">{account.formattedCreditLimit}</Td>
              <Td priority={2} className="whitespace-nowrap tabular-nums text-muted-foreground">{shortDate(account.dueDate)}</Td>
              <Td align="right" priority={3}>{account.orders?.length ?? 0}</Td>
              <Td className="w-10 pr-2"><AccountActions account={account} /></Td>
            </Tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
