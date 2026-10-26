import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListBand, PageTitle, SectionTitle, Stamp } from '@/features/platform/components/vape-ui';
import {
  CLASSIFICATION_CATEGORY_LABELS,
  PROVIDER_APPROVAL_STATUS_LABELS,
  PROVIDER_PURPOSE_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels';
import { getProviderApproval } from '../actions/provider-approvals';
import { ApprovalActions } from '../components/ApprovalActions';
import { APPROVAL_TONES, boundProvider, day, EDITABLE_APPROVAL_STATUSES, Expiry } from '../components/approval-display';

const LIST = '/dashboard/platform/provider-approvals';

const breadcrumbs = (label: string) => [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'link' as const, label: 'Provider approvals', href: LIST },
  { type: 'page' as const, label },
];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-foreground">{children}</span>
    </div>
  );
}

function Tags({ values, empty = 'None' }: { values: string[]; empty?: string }) {
  if (!values.length) return <p className="px-4 py-3 text-[13px] text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-3">
      {values.map(value => (
        <span key={value} className="rounded-[4px] border border-border bg-background px-2 py-0.5 text-[12px] text-foreground">{value}</span>
      ))}
    </div>
  );
}

export async function ProviderApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await getProviderApproval(id);

  if (!response.success) {
    return (
      <PageContainer title="Provider approval" header={<PageTitle title="Provider approval" />} breadcrumbs={breadcrumbs('Approval')}>
        <div className="px-4 md:px-6 pb-24 sm:pb-10">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  const approval = response.data;
  if (!approval) notFound();

  const now = Date.now();
  const purpose = regulatedLabel(PROVIDER_PURPOSE_LABELS, approval.purpose);
  const title = `${purpose} ${approval.providerCode}`.trim();
  const provider = boundProvider(approval);
  const editable = EDITABLE_APPROVAL_STATUSES.includes(approval.status);
  const header = (
    <PageTitle
      title={title}
      tone={APPROVAL_TONES[approval.status] || 'muted'}
      state={regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, approval.status)}
      meta={<span><span className="font-mono">{approval.approvalReference || approval.providerCode}</span> · {editable ? 'Editable until active' : 'Immutable'}</span>}
    />
  );

  return (
    <PageContainer title={title} header={header} breadcrumbs={breadcrumbs(approval.providerCode || purpose)}>
      <div className="px-4 md:px-6 pb-24 sm:pb-10 space-y-8">
        <ApprovalActions approval={approval} />

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionTitle>Approval</SectionTitle>
            <ListBand>
              <Row label="Purpose">{purpose}</Row>
              <Row label="Provider code"><span className="font-mono">{approval.providerCode}</span></Row>
              {provider && <Row label={provider.label}>{provider.name || 'Not bound'}</Row>}
              <Row label="Merchant profile">
                {approval.profile ? (
                  <Link href={`/dashboard/platform/merchant-profiles/${approval.profile.id}`} className="inline-flex items-baseline gap-0.5 underline-offset-4 hover:underline">
                    {approval.profile.legalName}
                    <ArrowUpRight className="size-3 translate-y-[0.1em] text-muted-foreground" />
                  </Link>
                ) : <span className="text-red-600 dark:text-red-400">None</span>}
              </Row>
              <Row label="Approval reference"><span className="font-mono">{approval.approvalReference}</span></Row>
              <Row label="Evidence">
                {approval.hasEvidence ? <Stamp tone="ok">On file</Stamp> : <Stamp tone="danger">Missing</Stamp>}
              </Row>
            </ListBand>
          </section>

          <section>
            <SectionTitle>Dates</SectionTitle>
            <ListBand>
              <Row label="Effective from"><span className="font-mono">{day(approval.effectiveAt) || 'Not set'}</span></Row>
              <Row label="Expires"><Expiry value={approval.expiresAt} now={now} /></Row>
              <Row label="Validated"><span className="font-mono">{day(approval.validatedAt) || 'Not validated'}</span></Row>
              <Row label="Created"><span className="font-mono">{day(approval.createdAt)}</span></Row>
              <Row label="Updated"><span className="font-mono">{day(approval.updatedAt)}</span></Row>
            </ListBand>
          </section>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section>
            <SectionTitle meta={approval.coveredCategories.length}>Product types</SectionTitle>
            <ListBand>
              <Tags values={approval.coveredCategories.map(value => regulatedLabel(CLASSIFICATION_CATEGORY_LABELS, value))} />
            </ListBand>
          </section>

          <section>
            <SectionTitle meta={approval.coveredJurisdictionCodes.length}>Jurisdictions</SectionTitle>
            <ListBand>
              <Tags values={approval.coveredJurisdictionCodes.map(code => approval.jurisdictionNames[code] ? `${code} ${approval.jurisdictionNames[code]}` : code)} />
            </ListBand>
          </section>

          <section>
            <SectionTitle meta={approval.capabilities.length}>Capabilities</SectionTitle>
            <ListBand>
              <Tags values={approval.capabilities} />
            </ListBand>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
