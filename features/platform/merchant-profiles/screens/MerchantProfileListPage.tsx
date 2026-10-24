import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, StatusFilter } from '@/features/platform/components/vape-ui';
import { MERCHANT_PROFILE_STATUS_LABELS } from '@/features/keystone/regulated/labels';
import { listProfiles } from '../actions/profiles';
import { PROFILE_STATUS_TONES, day } from '../lib/status';
import { ProfileSheet } from '../components/ProfileSheet';
import { ProfileEmpty, ProfileSearch } from '../components/ProfileSearch';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Merchant authority' },
];

function statusParam(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return 'all';
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    const first = Array.isArray(parsed) ? parsed[0] : null;
    return (typeof first === 'object' ? first?.value : first) || 'all';
  } catch {
    return 'all';
  }
}

type PageProps = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export async function MerchantProfileListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = statusParam(params['!status_matches']);
  const search = (Array.isArray(params.search) ? params.search[0] : params.search) || '';
  const response = await listProfiles(status, search);

  if (!response.success) {
    return (
      <PageContainer title="Merchant authority" header={<PageTitle title="Merchant authority" />} breadcrumbs={breadcrumbs}>
        <div className="px-4 pb-24 sm:pb-10 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  const { profiles, counts, total, canManage } = response.data;
  const activeCount = counts.active || 0;
  const header = (
    <PageTitle
      title="Merchant authority"
      tone={activeCount ? 'ok' : 'muted'}
      state={`${activeCount} active`}
    />
  );

  return (
    <PageContainer title="Merchant authority" header={header} breadcrumbs={breadcrumbs}>
      <StatusFilter
        className="px-4 py-0 md:px-6"
        allCount={total}
        statuses={Object.entries(MERCHANT_PROFILE_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
          count: counts[value] || 0,
          tone: PROFILE_STATUS_TONES[value],
        }))}
      />
      <div className="space-y-4 px-4 pb-24 sm:pb-10 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ProfileSearch key={search} />
          {canManage && (
            <ProfileSheet className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              New profile
            </ProfileSheet>
          )}
        </div>

        {profiles.length === 0 ? (
          <ProfileEmpty filtered={status !== 'all' || Boolean(search)} />
        ) : (
          <ListBand>
            {profiles.map(profile => (
              <Link
                key={profile.id}
                href={`/dashboard/platform/merchant-profiles/${profile.id}`}
                className="group block px-4 py-3 transition-colors hover:bg-background/60"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                    <Dot tone={PROFILE_STATUS_TONES[profile.status] || 'muted'} />
                    <span className="truncate">{profile.legalName}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-baseline gap-2 text-xs text-muted-foreground">
                    {MERCHANT_PROFILE_STATUS_LABELS[profile.status] || profile.status}
                    <ArrowUpRight className="size-3.5 self-center transition-colors group-hover:text-foreground" />
                  </span>
                </div>
                <dl className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 pl-[1.125rem] text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <dt className="text-muted-foreground">Sales</dt>
                    <dd className={profile.killSwitch ? 'text-red-600 dark:text-red-400' : 'text-foreground'}>
                      {profile.killSwitch ? 'Stopped' : 'On'}
                    </dd>
                  </div>
                  <div className="flex gap-1.5"><dt className="text-muted-foreground">PACT</dt><dd className="text-foreground">{profile.pactRegistered ? 'Registered' : 'Not registered'}</dd></div>
                  <div className="flex gap-1.5"><dt className="text-muted-foreground">Origin</dt><dd className="font-mono text-foreground">{profile.origin || 'None'}</dd></div>
                  <div className="flex gap-1.5"><dt className="text-muted-foreground">Launch</dt><dd className="font-mono tabular-nums text-foreground">{profile.launchCount}</dd></div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Effective</dt>
                    <dd className="font-mono tabular-nums text-foreground">
                      {day(profile.effectiveAt) || 'None'} to {day(profile.expiresAt) || 'None'}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </ListBand>
        )}
      </div>
    </PageContainer>
  );
}

export default MerchantProfileListPage;
