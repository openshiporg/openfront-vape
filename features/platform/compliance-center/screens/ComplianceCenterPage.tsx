import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { DataTable, ListBand, PageTitle, SectionTitle, Stamp, Td, Th, Tr, buttonClass } from '@/features/platform/components/vape-ui';
import { getComplianceReadiness } from '../actions/getReadiness';
import { MerchantSafetyActions } from '../components/MerchantSafetyActions';
import { LaunchSteps, ReleaseBar, fixClass } from '../components/ReleaseBar';
import { PROFILES_PATH, launchSteps } from '../lib/blockers';
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient';
import { missingStoreInfo } from '@/features/platform/store-settings/lib/store-info';

const resources = [
  ['Merchant authority', 'Profiles, licenses, PACT, kill switch', '/dashboard/platform/merchant-profiles'],
  ['Jurisdictions & policies', 'Authority sources and rule sets', '/dashboard/platform/jurisdictions'],
  ['Product evidence', 'Classifications and authorizations', '/dashboard/platform/product-evidence'],
  ['Provider approvals', 'Identity, registry, tax, payment, carrier', '/dashboard/platform/provider-approvals'],
  ['Decision ledger', 'Decisions and events', '/dashboard/platform/compliance-ledger'],
  ['Reports', 'Report runs and receipts', '/dashboard/platform/compliance-reports'],
] as const;

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Compliance Center' },
];

function label(code: string) {
  return code.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function reportTone(status: string) {
  const value = status.toLowerCase();
  if (['submitted', 'accepted', 'completed', 'generated'].includes(value)) return 'ok' as const;
  if (['failed', 'rejected', 'error'].includes(value)) return 'danger' as const;
  return 'muted' as const;
}

export async function ComplianceCenterPage() {
  const response = await getComplianceReadiness();

  if (!response.success) {
    return (
      <PageContainer title="Compliance Center" header={<PageTitle title="Compliance Center" />} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 space-y-4">
          <ReleaseBar ready={null} steps={[]} profiles={[]} canStop={false} />
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load compliance records: {response.error}
            </AlertDescription>
          </Alert>
          <Link href="/dashboard/platform/compliance" className={cn(buttonClass.base, buttonClass.outline)}>
            Retry
          </Link>
        </div>
      </PageContainer>
    );
  }

  const readiness = response.data;
  const storeResponse = await keystoneClient<{ stores: Array<{ metadata: unknown }> }>(`query ComplianceStoreInfo { stores(take: 1) { metadata } }`);
  const missingInfo = storeResponse.success ? missingStoreInfo(storeResponse.data.stores[0]?.metadata) : [];
  const steps = launchSteps(readiness.blockers, { missingInfo, profiles: readiness.profiles });
  const now = Date.now();
  const profilesInForce = readiness.profiles.filter(profile =>
    profile.status === 'active' &&
    (!profile.effectiveAt || new Date(profile.effectiveAt).getTime() <= now) &&
    (!profile.expiresAt || new Date(profile.expiresAt).getTime() > now));
  const header = (
    <PageTitle
      title="Compliance Center"
      meta={readiness.launchReady ? 'Release gate open' : `${steps.length} ${steps.length === 1 ? 'blocker' : 'blockers'} before sales open`}
    />
  );

  const counts = [
    ['Profiles in force', profilesInForce.length],
    ['Active policies', readiness.activeRuleSets.length],
    ['Approved classifications', readiness.approvedClassifications.length],
    ['Active approvals', readiness.activeProviderApprovals.length],
  ] as const;
  const activeProviders = readiness.integrationStates.filter(integration => integration.status === 'recorded_active').length;
  const reports = (readiness.reportRuns || []).slice(0, 6);

  return (
    <PageContainer title="Compliance Center" header={header} breadcrumbs={breadcrumbs}>
      <div className="px-4 md:px-6 pb-24 sm:pb-10 space-y-8">
        <ReleaseBar
          ready={readiness.launchReady}
          steps={steps}
          profiles={readiness.profiles}
          canStop={readiness.canStop}
          mode={readiness.transactionMode ? label(readiness.transactionMode) : undefined}
        />

        <section>
          <SectionTitle meta={steps.length}>Launch steps</SectionTitle>
          <LaunchSteps steps={steps} />
          {readiness.claimBoundary && (
            <p className="mt-2 text-[12px] text-muted-foreground">{readiness.claimBoundary}</p>
          )}
        </section>

        {/* Missing providers already appear as launch steps with their Add approval fix; this line only counts them. */}
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
          <span className="font-medium text-foreground">Providers</span>
          <span className="font-mono tabular-nums text-muted-foreground">
            {activeProviders}/{readiness.integrationStates.length}
          </span>
          <span className="text-muted-foreground">in force</span>
          <Link
            href="/dashboard/platform/provider-approvals"
            className="inline-flex items-baseline gap-0.5 font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 max-sm:min-h-10 max-sm:items-center"
          >
            Provider approvals
            <ArrowUpRight className="size-3.5 shrink-0 translate-y-[0.1em]" />
          </Link>
        </p>

        <section>
          <div className="min-w-0">
            <SectionTitle meta={readiness.reportRuns?.length ?? 0}>Recent reports</SectionTitle>
            {reports.length === 0 ? (
              <ListBand><div className="px-4 py-3 text-[13px] text-muted-foreground">No report runs</div></ListBand>
            ) : (
              <DataTable>
                <thead>
                  <tr>
                    <Th>Report</Th>
                    <Th>Status</Th>
                    <Th priority={2} align="right">Generated</Th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(run => (
                    <Tr key={run.id}>
                      <Td>
                        <Link href={`/dashboard/platform/compliance-reports/${run.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                          {label(run.reportType)}
                        </Link>
                      </Td>
                      <Td><Stamp tone={reportTone(run.status)}>{label(run.status)}</Stamp></Td>
                      <Td priority={2} align="right" className="font-mono text-[12px]">
                        {run.generatedAt ? new Date(run.generatedAt).toISOString().slice(0, 10) : ''}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </div>
        </section>

        <section>
          <SectionTitle meta={readiness.profiles.length}>Merchant profiles</SectionTitle>
          {readiness.profiles.length === 0 ? (
            <ListBand>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-[13px] text-muted-foreground">
                No merchant profiles
                <Link href={PROFILES_PATH} className={fixClass}>Merchant profiles<ArrowUpRight /></Link>
              </div>
            </ListBand>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Profile</Th>
                  <Th>Status</Th>
                  <Th priority={2}>PACT</Th>
                  <Th priority={2}>Kill switch</Th>
                  <Th align="right"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {readiness.profiles.map(profile => (
                  <Tr key={profile.id}>
                    <Td className="min-w-0">
                      <Link href={`${PROFILES_PATH}/${profile.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                        {profile.legalName}
                      </Link>
                    </Td>
                    <Td><Stamp tone={profile.status === 'active' ? 'ok' : profile.status === 'suspended' || profile.status === 'revoked' ? 'danger' : 'muted'}>{label(profile.status)}</Stamp></Td>
                    <Td priority={2}><Stamp tone={profile.pactRegistered ? 'ok' : 'warn'}>{profile.pactRegistered ? 'Registered' : 'Not registered'}</Stamp></Td>
                    <Td priority={2}><Stamp tone={profile.killSwitch ? 'danger' : 'ok'}>{profile.killSwitch ? 'On' : 'Off'}</Stamp></Td>
                    <Td align="right">
                      {/* The kill switch lives in the release bar; this row keeps the evidence export */}
                      <MerchantSafetyActions profileId={profile.id} killSwitch={profile.killSwitch} canStop={false} canExport={readiness.canExport} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </section>

        <section>
          <SectionTitle>Records in force</SectionTitle>
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
            {counts.map(([name, value]) => (
              <div key={name} className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">{name}</dt>
                <dd className="font-mono tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionTitle>Records</SectionTitle>
          <ListBand className="sm:grid sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3">
            {resources.map(([title, description, href]) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start justify-between gap-4 border-border px-4 py-3 transition-colors hover:bg-muted/40 max-sm:border-b max-sm:last:border-b-0 sm:border-b sm:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0"
              >
                <span>
                  <span className="block text-[14px] font-medium text-foreground">{title}</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">{description}</span>
                </span>
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </ListBand>
        </section>
      </div>
    </PageContainer>
  );
}

export default ComplianceCenterPage;
