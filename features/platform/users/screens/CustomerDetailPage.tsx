import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, SectionTitle, type DotTone } from '@/features/platform/components/vape-ui';
import { getCustomer, type CustomerAddress } from '../actions/customer';

const LIST = '/dashboard/platform/users';

const ORDER_TONES: Record<string, DotTone> = {
  pending: 'warn',
  completed: 'ok',
  archived: 'muted',
  canceled: 'danger',
  requires_action: 'danger',
};

const ORDER_LABELS: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  archived: 'Archived',
  canceled: 'Canceled',
  requires_action: 'Requires action',
};

const STATUS_TONES: Record<string, DotTone> = {
  active: 'ok',
  paid: 'ok',
  sent: 'info',
  draft: 'muted',
  suspended: 'warn',
  overdue: 'danger',
  not_approved: 'danger',
  cancelled: 'muted',
};

const statusLabel = (value: string) => value.replaceAll('_', ' ').replace(/^\w/, character => character.toUpperCase());

const day = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children || <span className="text-muted-foreground">None</span>}</dd>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-3 text-sm text-muted-foreground">{children}</div>;
}

function addressLines(address: CustomerAddress) {
  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.company,
    [address.address1, address.address2].filter(Boolean).join(', '),
    [address.city, address.province, address.postalCode].filter(Boolean).join(' '),
    address.country?.iso2?.toUpperCase(),
  ].filter(Boolean);
}

type PageProps = { params: Promise<{ id: string }> };

export async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getCustomer(id);

  const breadcrumbs = (name: string) => [
    { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Users', href: LIST },
    { type: 'page' as const, label: name },
  ];

  if (!response.success) {
    return (
      <PageContainer title="Customer" header={<PageTitle title="Customer" />} breadcrumbs={breadcrumbs('Customer')}>
        <div className="px-4 pb-24 sm:pb-10 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  if (!response.data) notFound();

  const customer = response.data;
  const { attestation } = response;
  const name = customer.name || customer.email;

  const header = (
    <PageTitle
      title={name}
      tone={customer.hasAccount ? 'ok' : 'muted'}
      state={customer.hasAccount ? 'Has account' : 'No account'}
      meta={<span className="break-all">{customer.email}</span>}
    />
  );

  return (
    <PageContainer title={name} header={header} breadcrumbs={breadcrumbs(name)}>
      <div className="space-y-10 px-4 pb-24 sm:pb-10 md:px-6">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <SectionTitle>Profile</SectionTitle>
            <ListBand>
              <dl className="divide-y divide-border">
                <Row label="Name">{customer.name}</Row>
                <Row label="Email">{customer.email}</Row>
                <Row label="Phone">{customer.phone && <span className="font-mono tabular-nums">{customer.phone}</span>}</Row>
                <Row label="Role">{customer.role?.name}</Row>
                <Row label="Customer groups">{customer.customerGroups.map(group => group.name).join(', ')}</Row>
                <Row label="Joined"><span className="font-mono tabular-nums">{day(customer.createdAt)}</span></Row>
              </dl>
            </ListBand>
          </div>

          <div className="min-w-0">
            <SectionTitle>Age 21+</SectionTitle>
            <ListBand>
              <div className="px-4 py-3">
                {attestation.state === 'attested' && (
                  <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone="ok" />
                    Attested <span className="font-mono tabular-nums">{day(attestation.occurredAt)}</span>
                  </span>
                )}
                {attestation.state === 'none' && (
                  <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone="warn" />
                    No attestation
                  </span>
                )}
                {attestation.state === 'unavailable' && (
                  <span className="flex items-baseline gap-2.5 text-sm text-muted-foreground">
                    <Dot tone="muted" />
                    {attestation.error}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/platform/compliance-ledger?tab=attestations"
                className="flex items-center gap-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-background/60"
              >
                Compliance ledger <ArrowUpRight className="size-3.5" />
              </Link>
            </ListBand>
          </div>
        </section>

        <section>
          <SectionTitle meta={customer.orders.length}>Orders</SectionTitle>
          <ListBand>
            {customer.orders.length === 0 && <Empty>No orders</Empty>}
            {customer.orders.map(order => (
              <Link
                key={order.id}
                href={`/dashboard/platform/orders/${order.id}`}
                className="flex items-baseline justify-between gap-3 px-4 py-3 transition-colors hover:bg-background/60"
              >
                <span className="flex min-w-0 items-baseline gap-2.5">
                  <Dot tone={ORDER_TONES[order.status] || 'muted'} />
                  <span className="font-mono text-sm font-medium tabular-nums text-foreground">#{order.displayId}</span>
                  <span className="truncate text-xs text-muted-foreground">{ORDER_LABELS[order.status] || statusLabel(order.status)}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                  <span className="max-sm:hidden">{day(order.createdAt)}</span>
                  {order.total && <span className="text-sm text-foreground">{order.total}</span>}
                </span>
              </Link>
            ))}
          </ListBand>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle meta={customer.addresses.length}>Addresses</SectionTitle>
            <ListBand>
              {customer.addresses.length === 0 && <Empty>No addresses</Empty>}
              {customer.addresses.map(address => {
                const [first, ...rest] = addressLines(address);
                return (
                  <div key={address.id} className="px-4 py-3">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">{first || 'Address'}</span>
                      {address.isBilling && <span className="shrink-0 text-xs text-muted-foreground">Billing</span>}
                    </span>
                    {rest.map(line => (
                      <span key={line} className="block break-words text-xs text-muted-foreground">{line}</span>
                    ))}
                    {address.phone && <span className="block font-mono text-xs tabular-nums text-muted-foreground">{address.phone}</span>}
                  </div>
                );
              })}
            </ListBand>
          </div>

          <div className="min-w-0">
            <SectionTitle meta={customer.carts.length}>Carts</SectionTitle>
            <ListBand>
              {customer.carts.length === 0 && <Empty>No carts</Empty>}
              {customer.carts.map(cart => (
                <div key={cart.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <Dot tone={cart.status === 'COMPLETED' ? 'ok' : 'info'} />
                    <span className="font-mono text-sm tabular-nums text-foreground">{cart.id.slice(-8)}</span>
                    <span className="text-xs text-muted-foreground">{cart.status === 'COMPLETED' ? 'Ordered' : 'Open'}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                    <span>{cart.lineItemsCount} items</span>
                    {cart.order ? (
                      <Link href={`/dashboard/platform/orders/${cart.order.id}`} className="inline-flex items-center gap-0.5 text-foreground hover:underline underline-offset-4">
                        #{cart.order.displayId} <ArrowUpRight className="size-3" />
                      </Link>
                    ) : (
                      cart.total && <span className="text-foreground">{cart.total}</span>
                    )}
                  </span>
                </div>
              ))}
            </ListBand>
          </div>
        </section>

        {(customer.accounts.length > 0 || customer.invoices.length > 0) && (
          <section className="grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <SectionTitle meta={customer.accounts.length}>Accounts</SectionTitle>
              <ListBand>
                {customer.accounts.length === 0 && <Empty>No accounts</Empty>}
                {customer.accounts.map(account => (
                  <div key={account.id} className="px-4 py-3">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-baseline gap-2.5">
                        <Dot tone={STATUS_TONES[account.status] || 'muted'} />
                        <span className="truncate font-mono text-sm tabular-nums text-foreground">{account.accountNumber}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{statusLabel(account.status)}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-4 pl-[1.125rem] font-mono text-xs tabular-nums text-muted-foreground">
                      {account.formattedTotal && <span>Owed {account.formattedTotal}</span>}
                      {account.formattedCreditLimit && <span>Limit {account.formattedCreditLimit}</span>}
                    </span>
                  </div>
                ))}
              </ListBand>
            </div>

            <div className="min-w-0">
              <SectionTitle meta={customer.invoices.length}>Invoices</SectionTitle>
              <ListBand>
                {customer.invoices.length === 0 && <Empty>No invoices</Empty>}
                {customer.invoices.map(invoice => (
                  <div key={invoice.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="flex min-w-0 items-baseline gap-2.5">
                      <Dot tone={STATUS_TONES[invoice.status] || 'muted'} />
                      <span className="truncate font-mono text-sm tabular-nums text-foreground">{invoice.invoiceNumber}</span>
                      <span className="text-xs text-muted-foreground">{statusLabel(invoice.status)}</span>
                    </span>
                    <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                      <span className="max-sm:hidden">{day(invoice.dueDate || invoice.createdAt)}</span>
                      {invoice.formattedTotal && <span className="text-sm text-foreground">{invoice.formattedTotal}</span>}
                    </span>
                  </div>
                ))}
              </ListBand>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
