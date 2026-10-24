import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Plus } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, SectionTitle } from '@/features/platform/components/vape-ui';
import {
  CLASSIFICATION_CATEGORY_LABELS,
  MERCHANT_LICENSE_STATUS_LABELS,
  MERCHANT_PROFILE_STATUS_LABELS,
  PROVIDER_APPROVAL_STATUS_LABELS,
  PROVIDER_PURPOSE_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels';
import { getProfile } from '../actions/profiles';
import { APPROVAL_STATUS_TONES, LICENSE_STATUS_TONES, PROFILE_STATUS_TONES, day } from '../lib/status';
import { ProfileSheet } from '../components/ProfileSheet';
import { LicenseSheet } from '../components/LicenseSheet';
import { KillSwitchControl, ProfileStatusActions } from '../components/ProfileActions';

const LIST = '/dashboard/platform/merchant-profiles';
const EDITABLE = ['draft', 'review'];

const secondaryButton =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-background px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.08)] hover:bg-background/80 dark:bg-zinc-800';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children || <span className="text-muted-foreground">None</span>}</dd>
    </div>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export async function MerchantProfileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getProfile(id);

  const breadcrumbs = (name: string) => [
    { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Merchant authority', href: LIST },
    { type: 'page' as const, label: name },
  ];

  if (!response.success) {
    return (
      <PageContainer title="Merchant profile" header={<PageTitle title="Merchant profile" />} breadcrumbs={breadcrumbs('Profile')}>
        <div className="px-4 pb-24 sm:pb-10 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  if (!response.data) notFound();

  const profile = response.data;
  const { input } = profile;
  const editable = EDITABLE.includes(profile.status);

  const header = (
    <PageTitle
      title={input.legalName}
      tone={PROFILE_STATUS_TONES[profile.status] || 'muted'}
      state={MERCHANT_PROFILE_STATUS_LABELS[profile.status] || profile.status}
      meta={profile.killSwitch ? 'Sales stopped' : 'Sales on'}
    />
  );

  return (
    <PageContainer title={input.legalName} header={header} breadcrumbs={breadcrumbs(input.legalName)}>
      <div className="space-y-10 px-4 pb-24 sm:pb-10 md:px-6">
        {profile.canManage && (
          <div className="flex flex-wrap items-start gap-2">
            {editable && (
              <ProfileSheet profileId={profile.id} initial={input} hasPactEvidence={profile.hasPactEvidence} className={secondaryButton}>
                Edit
              </ProfileSheet>
            )}
            <ProfileStatusActions id={profile.id} status={profile.status} canManage={profile.canManage} />
          </div>
        )}

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <div>
              <SectionTitle meta={editable ? undefined : 'Read only'}>Merchant</SectionTitle>
              <ListBand>
                <dl className="divide-y divide-border">
                  <Row label="Legal name">{input.legalName}</Row>
                  <Row label="Compliance owner">{input.complianceOwner}</Row>
                  <Row label="Escalation contacts">
                    {input.escalationContacts && <span className="whitespace-pre-line">{input.escalationContacts}</span>}
                  </Row>
                  <Row label="Counsel approval">{input.counselApprovalReference}</Row>
                  <Row label="Insurance">{input.insuranceReference}</Row>
                </dl>
              </ListBand>
            </div>

            <div>
              <SectionTitle>Scope</SectionTitle>
              <ListBand>
                <dl className="divide-y divide-border">
                  <Row label="Product types">
                    {input.enabledCategories.length > 0 && input.enabledCategories.map(value => regulatedLabel(CLASSIFICATION_CATEGORY_LABELS, value)).join(', ')}
                  </Row>
                  <Row label="Origin">{profile.origin && `${profile.origin.code} ${profile.origin.name}`}</Row>
                  <Row label="Launch jurisdictions">
                    {profile.launchJurisdictions.length > 0 && profile.launchJurisdictions.map(item => `${item.code} ${item.name}`).join(', ')}
                  </Row>
                </dl>
              </ListBand>
            </div>

            <div>
              <SectionTitle>PACT Act and dates</SectionTitle>
              <ListBand>
                <dl className="divide-y divide-border">
                  <Row label="PACT">{input.pactRegistered ? 'Registered' : 'Not registered'}</Row>
                  <Row label="Registration reference">{input.pactRegistrationReference && <span className="font-mono">{input.pactRegistrationReference}</span>}</Row>
                  <Row label="Evidence">{profile.hasPactEvidence ? 'On file' : 'No file'}</Row>
                  <Row label="Effective from">{input.effectiveAt && <span className="font-mono tabular-nums">{input.effectiveAt}</span>}</Row>
                  <Row label="Expires">{input.expiresAt && <span className="font-mono tabular-nums">{input.expiresAt}</span>}</Row>
                </dl>
              </ListBand>
            </div>
          </div>

          <div>
            <SectionTitle>Kill switch</SectionTitle>
            <ListBand>
              <div className="space-y-4 px-4 py-4">
                <span className="flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                  <Dot tone={profile.killSwitch ? 'danger' : 'ok'} />
                  {profile.killSwitch ? 'Sales stopped' : 'Sales on'}
                </span>
                <KillSwitchControl id={profile.id} killSwitch={profile.killSwitch} canKill={profile.canKill} />
              </div>
            </ListBand>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Licences <span className="ml-1 font-mono text-xs font-normal tabular-nums text-muted-foreground">{profile.licenses.length}</span>
            </h2>
            {profile.canManage && (
              <LicenseSheet profileId={profile.id} canManage={profile.canManage} className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline">
                <Plus className="size-3.5" />
                Add licence
              </LicenseSheet>
            )}
          </div>
          <ListBand>
            {profile.licenses.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">No licences</div>}
            {profile.licenses.map(license => (
              <LicenseSheet
                key={license.id}
                profileId={profile.id}
                license={license}
                canManage={profile.canManage}
                className="block w-full px-4 py-3 text-left transition-colors hover:bg-background/60"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone={LICENSE_STATUS_TONES[license.status] || 'muted'} />
                    <span className="truncate">{license.licenseType}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{MERCHANT_LICENSE_STATUS_LABELS[license.status] || license.status}</span>
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 pl-[1.125rem] text-xs">
                  <span className="font-mono text-foreground">{license.licenseNumber}</span>
                  <span className="text-muted-foreground">{license.jurisdiction || 'No jurisdiction'}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{license.effectiveAt || 'None'} to {license.expiresAt || 'None'}</span>
                </span>
              </LicenseSheet>
            ))}
          </ListBand>
        </section>

        <section>
          <SectionTitle meta={profile.approvals.length}>Provider approvals</SectionTitle>
          <ListBand>
            {profile.approvals.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">No provider approvals</div>}
            {profile.approvals.map(approval => (
              <Link
                key={approval.id}
                href={`/dashboard/platform/provider-approvals/${approval.id}`}
                className="group block px-4 py-3 transition-colors hover:bg-background/60"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone={APPROVAL_STATUS_TONES[approval.status] || 'muted'} />
                    <span className="truncate">{regulatedLabel(PROVIDER_PURPOSE_LABELS, approval.purpose)}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-baseline gap-2 text-xs text-muted-foreground">
                    {regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, approval.status)}
                    <ArrowUpRight className="size-3.5 self-center transition-colors group-hover:text-foreground" />
                  </span>
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 pl-[1.125rem] text-xs">
                  <span className="font-mono text-foreground">{approval.providerCode}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{day(approval.effectiveAt) || 'None'} to {day(approval.expiresAt) || 'None'}</span>
                </span>
              </Link>
            ))}
          </ListBand>
        </section>
      </div>
    </PageContainer>
  );
}

export default MerchantProfileDetailPage;
