import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, SectionTitle } from '@/features/platform/components/vape-ui';
import { getComplianceReadiness } from '../actions/getReadiness';
import { MerchantSafetyActions } from '../components/MerchantSafetyActions';

const resources = [
  ['Merchant authority', 'Profiles, licenses, PACT, kill switch', '/dashboard/regulated-merchant-profiles'],
  ['Jurisdictions & policies', 'Authority sources and rule sets', '/dashboard/jurisdictions'],
  ['Product evidence', 'Classifications and authorizations', '/dashboard/regulated-product-classifications'],
  ['Provider approvals', 'Identity, registry, tax, payment, carrier', '/dashboard/provider-approvals'],
  ['Decision ledger', 'Decisions and events', '/dashboard/compliance-decisions'],
  ['Reports', 'Report runs and receipts', '/dashboard/compliance-report-runs'],
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
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load compliance records: {response.error}
            </AlertDescription>
          </Alert>
          <Link
            href="/dashboard/platform/compliance"
            className="inline-flex h-9 items-center rounded-full bg-muted px-4 text-sm font-medium text-foreground"
          >
            Retry
          </Link>
        </div>
      </PageContainer>
    );
  }

  const readiness = response.data;
  const header = (
    <PageTitle
      title="Compliance Center"
      tone={readiness.launchReady ? 'ok' : 'danger'}
      state={readiness.launchReady ? 'Sales enabled' : 'Sales disabled'}
      meta={readiness.transactionMode ? `Mode: ${label(readiness.transactionMode)}` : undefined}
    />
  );

  const counts = [
    ['Profiles', readiness.profiles.length],
    ['Policies', readiness.activeRuleSets.length],
    ['Classifications', readiness.approvedClassifications.length],
    ['Approvals', readiness.activeProviderApprovals.length],
  ] as const;

  return (
    <PageContainer title="Compliance Center" header={header} breadcrumbs={breadcrumbs}>
      <div className="px-4 md:px-6 pb-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <SectionTitle meta={readiness.blockers.length}>Blockers</SectionTitle>
            <ListBand>
              {readiness.blockers.length ? readiness.blockers.map(blocker => (
                <div key={blocker} className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
                  <Dot tone="warn" />
                  {label(blocker)}
                </div>
              )) : (
                <div className="flex items-baseline gap-2.5 px-4 py-3 text-sm text-foreground">
                  <Dot tone="ok" />
                  All checks pass
                </div>
              )}
            </ListBand>
            {readiness.claimBoundary && (
              <p className="mt-3 text-xs text-muted-foreground">{readiness.claimBoundary}</p>
            )}
          </div>
          <div>
            <SectionTitle>Records in force</SectionTitle>
            <ListBand className="grid grid-cols-2 divide-y-0">
              {counts.map(([name, value], index) => (
                <div
                  key={name}
                  className={`px-4 py-3 ${index % 2 === 0 ? 'border-r border-border' : ''} ${index < 2 ? 'border-b border-border' : ''}`}
                >
                  <span className="block text-xs text-muted-foreground">{name}</span>
                  <span className="mt-1 block font-mono text-2xl font-medium tabular-nums text-foreground">{value}</span>
                </div>
              ))}
            </ListBand>
          </div>
        </section>

        <section>
          <SectionTitle meta={readiness.profiles.length}>Safety controls</SectionTitle>
          <ListBand>
            {readiness.profiles.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No merchant profiles</div>
            )}
            {readiness.profiles.map(profile => (
              <div key={profile.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{profile.legalName}</h3>
                    <span className="inline-flex items-baseline gap-1.5 text-xs text-muted-foreground">
                      <Dot tone={profile.killSwitch ? 'danger' : 'ok'} />
                      {profile.killSwitch ? 'Kill switch on' : 'Kill switch off'}
                    </span>
                  </div>
                  <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    <div className="flex gap-1.5"><dt className="text-muted-foreground">Status</dt><dd className="text-foreground">{label(profile.status)}</dd></div>
                    <div className="flex gap-1.5"><dt className="text-muted-foreground">PACT</dt><dd className="text-foreground">{profile.pactRegistered ? 'Registered' : 'Not registered'}</dd></div>
                  </dl>
                </div>
                <MerchantSafetyActions profileId={profile.id} canStop={readiness.canStop} canExport={readiness.canExport} />
              </div>
            ))}
          </ListBand>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle meta={readiness.integrationStates.filter(i => i.status === 'recorded_active').length + ' / ' + readiness.integrationStates.length}>
              Providers
            </SectionTitle>
            <ListBand>
              {readiness.integrationStates.map(integration => {
                const active = integration.status === 'recorded_active';
                return (
                  <div key={integration.purpose} className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <span className="inline-flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <Dot tone={active ? 'ok' : 'muted'} />
                      {label(integration.purpose)}
                    </span>
                    <span className="text-xs text-muted-foreground">{active ? 'Active' : 'Not configured'}</span>
                  </div>
                );
              })}
            </ListBand>
          </div>

          <div>
            <SectionTitle meta={readiness.reportRuns?.length || 0}>Recent reports</SectionTitle>
            <ListBand>
              {(readiness.reportRuns || []).length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">No report runs</div>
              )}
              {(readiness.reportRuns || []).slice(0, 6).map(run => (
                <div key={run.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="inline-flex items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone={reportTone(run.status)} />
                    {label(run.reportType)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {label(run.status)}
                    {run.generatedAt && (
                      <span className="ml-2 font-mono tabular-nums">{new Date(run.generatedAt).toISOString().slice(0, 10)}</span>
                    )}
                  </span>
                </div>
              ))}
            </ListBand>
          </div>
        </section>

        <section>
          <SectionTitle>Records</SectionTitle>
          <ListBand className="sm:grid sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3">
            {resources.map(([title, description, href]) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start justify-between gap-4 border-border px-4 py-4 transition-colors hover:bg-background/60 max-sm:border-b max-sm:last:border-b-0 sm:border-b sm:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0"
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">{title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
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
