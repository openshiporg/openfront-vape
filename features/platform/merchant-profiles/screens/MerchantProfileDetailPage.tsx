import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Plus } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonClass, ListBand, PageTitle, SectionTitle, Stamp } from '@/features/platform/components/vape-ui';
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
import { profileChecks } from '../lib/completeness';
import { ProfileSheet } from '../components/ProfileSheet';
import { LicenseSheet } from '../components/LicenseSheet';
import { KillSwitchControl, ProfileStatusActions } from '../components/ProfileActions';

const LIST = '/dashboard/platform/merchant-profiles';
const EDITABLE = ['draft', 'review'];

const secondaryButton = `${buttonClass.base} ${buttonClass.outline}`;

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
  const checks = profileChecks({
    status: profile.status,
    killSwitch: profile.killSwitch,
    pactRegistered: input.pactRegistered,
    hasOrigin: Boolean(profile.origin),
    categoryCount: input.enabledCategories.length,
    launchCount: profile.launchJurisdictions.length,
    effectiveAt: input.effectiveAt ? `${input.effectiveAt}T00:00:00Z` : null,
    expiresAt: input.expiresAt ? `${input.expiresAt}T00:00:00Z` : null,
  });
  const missing = checks.filter(check => !check.ok);

  const header = (
    <PageTitle
      title={input.legalName}
      tone={PROFILE_STATUS_TONES[profile.status] || 'muted'}
      state={MERCHANT_PROFILE_STATUS_LABELS[profile.status] || profile.status}
      meta={`${profile.killSwitch ? 'Sales stopped' : 'Sales on'} · ${missing.length ? `${missing.length} of ${checks.length} checks missing` : 'Ready for sales'}`}
    />
  );

  return (
    <PageContainer title={input.legalName} header={header} breadcrumbs={breadcrumbs(input.legalName)}>
      <div className="space-y-10 px-4 pb-24 sm:pb-10 md:px-6">
        <section>
          <SectionTitle meta={`${checks.length - missing.length} of ${checks.length}`}>Completeness</SectionTitle>
          <ListBand>
            <ul className="-mb-px grid sm:grid-cols-2 lg:grid-cols-4">
              {[...missing, ...checks.filter(check => check.ok)].map(check => (
                <li key={check.key} className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-4 py-2 text-sm">
                  <span className="text-foreground">{check.label}</span>
                  <Stamp tone={check.ok ? 'ok' : profile.status === 'active' ? 'danger' : 'warn'}>{check.ok ? 'Done' : check.missing}</Stamp>
                </li>
              ))}
            </ul>
          </ListBand>
        </section>

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
                <Stamp tone={profile.killSwitch ? 'danger' : 'ok'}>{profile.killSwitch ? 'Sales stopped' : 'Sales on'}</Stamp>
                <KillSwitchControl id={profile.id} killSwitch={profile.killSwitch} canKill={profile.canKill} />
              </div>
            </ListBand>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-3 border-b border-foreground/15 pb-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Licences <span className="ml-1 text-[13px] font-normal tabular-nums text-muted-foreground">{profile.licenses.length}</span>
            </h2>
            {profile.canManage && (
              <LicenseSheet profileId={profile.id} canManage={profile.canManage} className={`${buttonClass.base} ${buttonClass.outline}`}>
                <Plus />
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
                className="block w-full px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">{license.licenseType}</span>
                  <Stamp tone={LICENSE_STATUS_TONES[license.status] || 'muted'} serial={license.licenseNumber}>
                    {MERCHANT_LICENSE_STATUS_LABELS[license.status] || license.status}
                  </Stamp>
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
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
                className="group block px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">{regulatedLabel(PROVIDER_PURPOSE_LABELS, approval.purpose)}</span>
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <Stamp tone={APPROVAL_STATUS_TONES[approval.status] || 'muted'} serial={approval.providerCode}>
                      {regulatedLabel(PROVIDER_APPROVAL_STATUS_LABELS, approval.status)}
                    </Stamp>
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </span>
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
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
