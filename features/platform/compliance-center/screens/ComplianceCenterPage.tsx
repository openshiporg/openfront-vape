import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, CheckCircle2, CircleSlash2 } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getComplianceReadiness } from '../actions/getReadiness';
import { MerchantSafetyActions } from '../components/MerchantSafetyActions';

const resources = [
  ['Merchant authority', 'Profiles, licenses, PACT registration, owner and kill switch', '/dashboard/regulated-merchant-profiles'],
  ['Jurisdictions & policies', 'Authority sources and rule sets', '/dashboard/jurisdictions'],
  ['Product evidence', 'Variant classifications and product authorizations', '/dashboard/regulated-product-classifications'],
  ['Provider approvals', 'Identity, registry, tax, payment and carrier approvals', '/dashboard/provider-approvals'],
  ['Decision ledger', 'Compliance decisions and events', '/dashboard/compliance-decisions'],
  ['Reports', 'Report runs and submission receipts', '/dashboard/compliance-report-runs'],
] as const;

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Compliance Center' },
];

const header = (
  <div>
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
      Compliance Center
    </h1>
    <p className="text-muted-foreground">
      Merchant authority, policies, product evidence and reports.
    </p>
  </div>
);

function label(code: string) {
  return code.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
}

export async function ComplianceCenterPage() {
  const response = await getComplianceReadiness();

  if (!response.success) {
    return (
      <PageContainer title="Compliance Center" header={header} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load compliance records: {response.error}
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/dashboard/platform/compliance">Retry</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const readiness = response.data;

  return (
    <PageContainer title="Compliance Center" header={header} breadcrumbs={breadcrumbs}>
      <div className="px-4 md:px-6 pb-8 space-y-8">
        <Card className={readiness.launchReady ? 'border-emerald-500/40' : 'border-amber-500/40'}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {readiness.launchReady ? <CheckCircle2 className="size-5 text-emerald-600" /> : <CircleSlash2 className="size-5 text-amber-600" />}
              Launch status
              <Badge variant={readiness.launchReady ? 'default' : 'destructive'} className="w-fit">
                {readiness.launchReady ? 'Sales enabled' : 'Sales disabled'}
              </Badge>
            </CardTitle>
            <CardDescription>{readiness.claimBoundary}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="space-y-2">
              {readiness.blockers.length ? readiness.blockers.map(blocker => (
                <div key={blocker} className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /> {label(blocker)}
                </div>
              )) : <p className="text-sm text-emerald-700">All checks pass.</p>}
            </div>
            <dl className="grid grid-cols-2 gap-3 rounded-md border p-4 text-sm">
              <div><dt className="text-muted-foreground">Profiles</dt><dd className="text-xl font-semibold">{readiness.profiles.length}</dd></div>
              <div><dt className="text-muted-foreground">Policies</dt><dd className="text-xl font-semibold">{readiness.activeRuleSets.length}</dd></div>
              <div><dt className="text-muted-foreground">Classifications</dt><dd className="text-xl font-semibold">{readiness.approvedClassifications.length}</dd></div>
              <div><dt className="text-muted-foreground">Approvals</dt><dd className="text-xl font-semibold">{readiness.activeProviderApprovals.length}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Safety controls</h2>
          {readiness.profiles.length === 0 && <p className="rounded-lg border p-4 text-sm text-muted-foreground">No merchant profiles yet.</p>}
          {readiness.profiles.map(profile => (
            <Card key={profile.id}>
              <CardHeader>
                <CardTitle className="text-base">{profile.legalName}</CardTitle>
                <CardDescription>{label(profile.status)} · Kill switch {profile.killSwitch ? 'on' : 'off'}</CardDescription>
              </CardHeader>
              <CardContent>
                <MerchantSafetyActions profileId={profile.id} canStop={readiness.canStop} canExport={readiness.canExport} />
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Provider status</h2>
          <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {readiness.integrationStates.map(integration => (
              <div key={integration.purpose} className="bg-background p-4">
                <p className="text-sm font-medium">{label(integration.purpose)}</p>
                <p className={`mt-2 text-xs ${integration.status === 'recorded_active' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {integration.status === 'recorded_active' ? 'Active' : 'Not configured'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Records</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map(([title, description, href]) => (
              <Card key={href}>
                <CardHeader><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
                <CardContent><Button asChild variant="outline" size="sm"><Link href={href}>Open <ArrowUpRight className="ml-2 size-4" /></Link></Button></CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

export default ComplianceCenterPage;
