import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dot, ListBand, PageTitle, SectionTitle, Stamp } from '@/features/platform/components/vape-ui';
import {
  AUTHORIZATION_STATUS_LABELS,
  AUTHORIZATION_TYPE_LABELS,
  JURISDICTION_LEVEL_LABELS,
  JURISDICTION_STATUS_LABELS,
  RULE_SET_STATUS_LABELS,
  RULE_TYPE_LABELS,
  regulatedLabel,
} from '@/features/keystone/regulated/labels';
import { getJurisdiction } from '../actions/jurisdictions';
import { JURISDICTION_TONES, RULE_SET_TONES, formatDay, ruleSetInForce } from '../lib/shared';
import { JurisdictionSheetButton } from '../components/JurisdictionSheet';
import { RuleSetSheetButton } from '../components/RuleSetSheet';
import { JurisdictionStatusActions, RuleSetActions } from '../components/StatusActions';

const BASE = '/dashboard/platform/jurisdictions';
const linkClass = 'inline-flex items-center gap-1 underline-offset-4 hover:underline';

type PageProps = { params: Promise<{ id: string }> };

const USABLE_LICENSE = new Set(['active', 'conditioned']);

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 gap-1.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 text-sm text-muted-foreground">{children}</div>;
}

export async function JurisdictionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getJurisdiction(id);
  const breadcrumbs = [
    { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Jurisdictions', href: BASE },
    { type: 'page' as const, label: response.success && response.data ? response.data.code : 'Jurisdiction' },
  ];

  if (!response.success) {
    return (
      <PageContainer title="Jurisdiction" header={<PageTitle title="Jurisdiction" />} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 pb-24 sm:pb-10">
          <Alert variant="destructive"><AlertDescription>{response.error}</AlertDescription></Alert>
        </div>
      </PageContainer>
    );
  }
  const jurisdiction = response.data;
  if (!jurisdiction) notFound();

  const now = Date.now();
  const active = jurisdiction.ruleSets.filter(set => set.status === 'active');
  const inForceId = active.length === 1 && ruleSetInForce(active[0], now) ? active[0].id : null;

  const header = (
    <PageTitle
      title={jurisdiction.name}
      tone={JURISDICTION_TONES[jurisdiction.status] || 'muted'}
      state={regulatedLabel(JURISDICTION_STATUS_LABELS, jurisdiction.status)}
      meta={
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-foreground">{jurisdiction.code}</span>
          <span>{regulatedLabel(JURISDICTION_LEVEL_LABELS, jurisdiction.level)}</span>
          {jurisdiction.parent && (
            <Link href={`${BASE}/${jurisdiction.parent.id}`} className={linkClass}>
              in <span className="font-mono">{jurisdiction.parent.code}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          )}
        </span>
      }
    />
  );

  const policyState = active.length > 1
    ? { tone: 'danger' as const, label: `${active.length} active rule sets` }
    : inForceId
      ? { tone: 'ok' as const, label: 'Policy in force' }
      : active.length === 1
        ? { tone: 'warn' as const, label: 'Active policy out of dates' }
        : { tone: 'muted' as const, label: 'No policy in force' };

  return (
    <PageContainer title={jurisdiction.name} header={header} breadcrumbs={breadcrumbs}>
      <div className="space-y-10 px-4 pb-24 sm:pb-10 md:px-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-start gap-2">
            <JurisdictionSheetButton jurisdiction={jurisdiction} variant="outline" className="h-9 rounded-[4px] px-4 text-[13px]">
              Edit
            </JurisdictionSheetButton>
            <JurisdictionStatusActions id={jurisdiction.id} status={jurisdiction.status} />
          </div>
          <Stamp tone={policyState.tone} serial={jurisdiction.code}>{policyState.label}</Stamp>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-3 border-b border-foreground/15 pb-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Rule sets <span className="ml-1 text-[13px] font-normal tabular-nums text-muted-foreground">{jurisdiction.ruleSets.length}</span>
            </h2>
            <RuleSetSheetButton jurisdictionId={jurisdiction.id} mode="create" variant="default" className="h-9 rounded-[4px] px-4 text-[13px]">
              New rule set
            </RuleSetSheetButton>
          </div>
          <ListBand>
            {jurisdiction.ruleSets.length === 0 && <Empty>No rule sets</Empty>}
            {jurisdiction.ruleSets.map(set => {
              const types = Array.from(new Set(set.rules.map((rule: any) => rule?.type).filter(Boolean)));
              return (
                <div key={set.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm font-medium text-foreground">
                      <span className="break-words">{set.packName}</span>
                      <Stamp tone={RULE_SET_TONES[set.status] || 'muted'} serial={`v${set.version}`}>{regulatedLabel(RULE_SET_STATUS_LABELS, set.status)}</Stamp>
                      {set.id === inForceId && <Stamp tone="ok">In force</Stamp>}
                    </div>
                    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                      <Meta label="Effective"><span className="font-mono tabular-nums">{formatDay(set.effectiveAt) || 'None'} to {formatDay(set.expiresAt) || 'None'}</span></Meta>
                      <Meta label="Approved">
                        {set.approvedAt ? <span className="font-mono tabular-nums">{formatDay(set.approvedAt)}</span> : 'No'}
                        {set.reviewer && <span className="text-muted-foreground"> by {set.reviewer}</span>}
                      </Meta>
                      <Meta label="Signature">{set.hasSignature ? 'On file' : 'None'}</Meta>
                      <Meta label="Hash"><span className="font-mono" title={set.policyHash}>{set.policyHash.slice(0, 12)}</span></Meta>
                    </dl>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {set.rules.length} {set.rules.length === 1 ? 'rule' : 'rules'}
                      {types.length > 0 && `: ${types.map(type => RULE_TYPE_LABELS[type as string] || String(type)).join(', ')}`}
                    </p>
                  </div>
                  <div>
                    <RuleSetActions jurisdictionId={jurisdiction.id} ruleSet={set} />
                  </div>
                </div>
              );
            })}
          </ListBand>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle meta={jurisdiction.authoritySources.length}>Authority sources</SectionTitle>
            <ListBand>
              {jurisdiction.authoritySources.length === 0 && <Empty>No authority sources</Empty>}
              {jurisdiction.authoritySources.map((source, index) => (
                <div key={index} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
                  <span className="min-w-0 break-words text-foreground">{source.title || source.url}</span>
                  {source.url && /^https?:\/\//i.test(source.url) && (
                    <a href={source.url} target="_blank" rel="noreferrer noopener" className={`${linkClass} shrink-0 text-xs font-medium text-foreground`}>
                      Open
                      <ArrowUpRight className="size-3" />
                    </a>
                  )}
                </div>
              ))}
            </ListBand>
          </div>
          <div>
            <SectionTitle>Details</SectionTitle>
            <ListBand>
              <dl className="grid gap-2 px-4 py-3 text-sm">
                <Meta label="Code"><span className="font-mono">{jurisdiction.code}</span></Meta>
                <Meta label="Level">{regulatedLabel(JURISDICTION_LEVEL_LABELS, jurisdiction.level)}</Meta>
                <Meta label="Postal scope">
                  {jurisdiction.postalScope.length ? <span className="font-mono">{jurisdiction.postalScope.join(', ')}</span> : 'None'}
                </Meta>
                <Meta label="Created">{formatDay(jurisdiction.createdAt)}</Meta>
                <Meta label="Updated">{formatDay(jurisdiction.updatedAt)}</Meta>
              </dl>
              {jurisdiction.children.length > 0 && (
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">Contains</span>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {jurisdiction.children.map(child => (
                      <Link key={child.id} href={`${BASE}/${child.id}`} className={`${linkClass} text-sm text-foreground`}>
                        <Dot tone={JURISDICTION_TONES[child.status] || 'muted'} />
                        <span className="font-mono">{child.code}</span>
                        <span className="text-xs text-muted-foreground">{regulatedLabel(JURISDICTION_STATUS_LABELS, child.status)}</span>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </ListBand>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle meta={jurisdiction.licenses.length}>Merchant licenses</SectionTitle>
            <ListBand>
              {jurisdiction.licenses.length === 0 && <Empty>No licenses</Empty>}
              {jurisdiction.licenses.map(license => (
                <div key={license.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="inline-flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <span className="break-words">{license.licenseType}</span>
                      <Stamp tone={USABLE_LICENSE.has(license.status) ? 'ok' : license.status === 'draft' ? 'muted' : 'warn'} serial={license.licenseNumber}>
                        {regulatedLabel({}, license.status)}
                      </Stamp>
                    </span>
                    {license.profile && (
                      <Link href={`/dashboard/platform/merchant-profiles/${license.profile.id}`} className={`${linkClass} text-xs font-medium text-foreground`}>
                        {license.profile.legalName}
                        <ArrowUpRight className="size-3" />
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {license.issuingAuthority}
                    {license.expiresAt && <> · expires <span className="font-mono">{formatDay(license.expiresAt)}</span></>}
                  </p>
                </div>
              ))}
            </ListBand>
          </div>
          <div>
            <SectionTitle meta={jurisdiction.authorizations.length}>Product authorizations</SectionTitle>
            <ListBand>
              {jurisdiction.authorizations.length === 0 && <Empty>No authorizations</Empty>}
              {jurisdiction.authorizations.map(authorization => (
                <div key={authorization.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="inline-flex min-w-0 items-baseline gap-2.5 text-sm font-medium text-foreground">
                      <span className="break-words">{regulatedLabel(AUTHORIZATION_TYPE_LABELS, authorization.authorizationType)}</span>
                      <Stamp tone={authorization.status === 'authorized' ? 'ok' : authorization.status === 'pending' ? 'muted' : 'warn'} serial={authorization.authorizationIdentifier}>
                        {regulatedLabel(AUTHORIZATION_STATUS_LABELS, authorization.status)}
                      </Stamp>
                    </span>
                    {authorization.product && (
                      <Link href={`/dashboard/platform/products/${authorization.product.id}`} className={`${linkClass} text-xs font-medium text-foreground`}>
                        {authorization.product.title}
                        <ArrowUpRight className="size-3" />
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {authorization.authority}
                    {authorization.expiresAt && <> · expires <span className="font-mono">{formatDay(authorization.expiresAt)}</span></>}
                  </p>
                </div>
              ))}
            </ListBand>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
