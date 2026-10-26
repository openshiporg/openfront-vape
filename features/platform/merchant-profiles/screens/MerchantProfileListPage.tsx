import Link from 'next/link';
import { Plus } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonClass, DataTable, ListBand, PageTitle, SectionTitle, Stamp, StatusFilter, Td, Th, Tr } from '@/features/platform/components/vape-ui';
import { MERCHANT_PROFILE_STATUS_LABELS } from '@/features/keystone/regulated/labels';
import { listProfiles } from '../actions/profiles';
import { PROFILE_STATUS_TONES, day } from '../lib/status';
import { profileChecks } from '../lib/completeness';
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
  const now = Date.now();
  const checked = profiles
    .filter(profile => profile.status !== 'revoked')
    .map(profile => {
      const checks = profileChecks({ ...profile, hasOrigin: Boolean(profile.origin) }, now);
      return { profile, checks, missing: checks.filter(check => !check.ok) };
    })
    // Active profiles that fail the gate block sales outright; then the closest to ready
    .sort((a, b) =>
      Number(b.profile.status === 'active') - Number(a.profile.status === 'active') ||
      a.missing.length - b.missing.length);
  const ready = checked.filter(entry => entry.missing.length === 0).length;

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageTitle
        title="Merchant authority"
        tone={ready === 1 ? 'ok' : ready > 1 ? 'danger' : activeCount ? 'warn' : 'muted'}
        state={ready === 1 ? 'Profile ready' : ready > 1 ? `${ready} ready profiles` : 'No ready profile'}
        meta={`${activeCount} active of ${total}`}
      />
      {canManage && (
        <ProfileSheet className={`${buttonClass.base} ${buttonClass.primary} h-10`}>
          <Plus />
          New profile
        </ProfileSheet>
      )}
    </div>
  );

  return (
    <PageContainer title="Merchant authority" header={header} breadcrumbs={breadcrumbs}>
      <div className="space-y-8 px-4 pb-24 sm:pb-10 md:px-6">
        <section>
          <SectionTitle meta={ready > 1 ? 'Sales need exactly one ready profile' : undefined}>Profile completeness</SectionTitle>
          {checked.length === 0 ? (
            <ListBand>
              <div className="px-4 py-3 text-[13px] text-muted-foreground">
                No merchant profile. Add one with a legal name, PACT registration, origin, product types and a launch jurisdiction, then activate it.
              </div>
            </ListBand>
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Profile</Th>
                  <Th>Completeness</Th>
                  <Th priority={2}>Missing</Th>
                  <Th align="right"><span className="sr-only">Fix</span></Th>
                </tr>
              </thead>
              <tbody>
                {checked.map(({ profile, checks, missing }) => (
                  <Tr key={profile.id}>
                    <Td className="max-w-[16rem]">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-foreground">{profile.legalName}</span>
                        <span className="text-[12px] text-muted-foreground">{MERCHANT_PROFILE_STATUS_LABELS[profile.status] || profile.status}</span>
                      </span>
                    </Td>
                    <Td>
                      <Stamp tone={missing.length === 0 ? 'ok' : profile.status === 'active' ? 'danger' : 'warn'} serial={`${checks.length - missing.length}/${checks.length}`}>
                        {missing.length === 0 ? 'Ready' : 'Incomplete'}
                      </Stamp>
                    </Td>
                    <Td priority={2} className="text-[12px] text-muted-foreground">
                      {missing.length ? missing.map(check => check.missing).join(', ') : 'Nothing'}
                    </Td>
                    <Td align="right">
                      <Link href={`/dashboard/platform/merchant-profiles/${profile.id}`} className={`${buttonClass.base} ${buttonClass.outline}`}>
                        {missing.length ? 'Fix' : 'Open'}
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle meta={profiles.length}>All profiles</SectionTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <StatusFilter
              className="min-w-0 p-0 md:px-0"
              allCount={total}
              statuses={Object.entries(MERCHANT_PROFILE_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
                count: counts[value] || 0,
                tone: PROFILE_STATUS_TONES[value],
              }))}
            />
            <ProfileSearch key={search} />
          </div>

          {profiles.length === 0 ? (
            <ProfileEmpty filtered={status !== 'all' || Boolean(search)} />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <Th>Profile</Th>
                  <Th>Status</Th>
                  <Th>Sales</Th>
                  <Th priority={2}>PACT</Th>
                  <Th priority={3}>Origin</Th>
                  <Th align="right" priority={3}>Launch</Th>
                  <Th priority={2}>Effective</Th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(profile => (
                  <Tr key={profile.id}>
                    <Td className="max-w-[16rem]">
                      <Link
                        href={`/dashboard/platform/merchant-profiles/${profile.id}`}
                        className="flex min-h-10 min-w-0 flex-col justify-center underline-offset-4 hover:underline md:min-h-0"
                      >
                        <span className="truncate font-medium text-foreground">{profile.legalName}</span>
                        {profile.complianceOwner && <span className="truncate text-[12px] text-muted-foreground">{profile.complianceOwner}</span>}
                      </Link>
                    </Td>
                    <Td>
                      <Stamp tone={PROFILE_STATUS_TONES[profile.status] || 'muted'}>
                        {MERCHANT_PROFILE_STATUS_LABELS[profile.status] || profile.status}
                      </Stamp>
                    </Td>
                    <Td>
                      <Stamp tone={profile.killSwitch ? 'danger' : 'ok'}>{profile.killSwitch ? 'Stopped' : 'On'}</Stamp>
                    </Td>
                    <Td priority={2} className="whitespace-nowrap text-muted-foreground">{profile.pactRegistered ? 'Registered' : 'Not registered'}</Td>
                    <Td priority={3} className="font-mono text-[12px] text-muted-foreground">{profile.origin || 'None'}</Td>
                    <Td align="right" priority={3}>{profile.launchCount}</Td>
                    <Td priority={2} className="whitespace-nowrap font-mono text-[12px] text-muted-foreground">
                      {day(profile.effectiveAt) || 'None'} to {day(profile.expiresAt) || 'None'}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

export default MerchantProfileListPage;
