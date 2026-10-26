import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Stamp } from '@/features/platform/components/vape-ui';
import { PROFILES_PATH, type Blocker, type BlockerProfile } from '../lib/blockers';
import { KillSwitchControl } from './MerchantSafetyActions';
import { AddApprovalButton } from './ProviderApprovalSheet';

export const fixClass =
  'inline-flex min-h-8 shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground max-sm:min-h-10 [&_svg]:size-3.5';

/** The profiles whose kill switch decides selling: stopped or active ones, else whatever exists. */
function switchProfiles(profiles: BlockerProfile[]) {
  const relevant = profiles.filter(profile => profile.killSwitch || profile.status === 'active');
  return (relevant.length ? relevant : profiles).slice(0, 3);
}

/**
 * Full-width release bar: whether the shop can sell, why, and the kill switch with its action.
 * `ready` null means the release state could not be read.
 */
export function ReleaseBar({
  ready,
  steps,
  profiles,
  canStop,
  mode,
}: {
  ready: boolean | null;
  steps: Blocker[];
  profiles: BlockerProfile[];
  canStop: boolean;
  mode?: string;
}) {
  const state = ready === null ? 'Sales status unavailable' : ready ? 'Sales enabled' : 'Sales disabled';
  const tone = ready === null ? 'muted' : ready ? 'ok' : 'danger';
  const reason =
    ready === null
      ? 'Unable to load the release gate.'
      : ready
        ? 'All launch checks pass.'
        : steps.length
          ? `${steps[0].title}${steps[0].severity.word === 'Stopped' ? '' : ` ${steps[0].severity.word.toLowerCase()}`}${steps.length > 1 ? `, and ${steps.length - 1} more ${steps.length === 2 ? 'blocker' : 'blockers'}` : ''}.`
          : 'The release gate is closed.';
  const switches = switchProfiles(profiles);

  return (
    <section aria-label="Release state" className="grid gap-4 rounded-md border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Stamp tone={tone} className="min-h-9 self-start px-3 text-[16px] sm:self-auto">{state}</Stamp>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-foreground">{reason}</p>
          {mode && <p className="text-[12px] text-muted-foreground">Mode: {mode}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        {ready !== null && switches.length === 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-medium text-muted-foreground">Kill switch</span>
            <Stamp tone="muted">No merchant profile</Stamp>
            <Link href={PROFILES_PATH} className={fixClass}>
              Merchant profiles
              <ArrowUpRight />
            </Link>
          </div>
        )}
        {switches.map(profile => (
          <div key={profile.id} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[12px] font-medium text-muted-foreground">Kill switch</span>
            <Stamp tone={profile.killSwitch ? 'danger' : 'ok'}>{profile.killSwitch ? 'On' : 'Off'}</Stamp>
            <Link href={`${PROFILES_PATH}/${profile.id}`} className="min-w-0 max-w-[14rem] truncate text-[13px] text-foreground underline-offset-4 hover:underline">
              {profile.legalName}
            </Link>
            <KillSwitchControl profileId={profile.id} killSwitch={profile.killSwitch} canStop={canStop} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Blockers as ordered launch steps, each with its own fix. */
export function LaunchSteps({ steps, limit }: { steps: Blocker[]; limit?: number }) {
  const shown = limit ? steps.slice(0, limit) : steps;
  if (steps.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border bg-card px-4 py-3 text-[13px] text-foreground">
        <Stamp tone="ok">Cleared</Stamp>
        All launch checks pass
      </div>
    );
  }
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-md border bg-card">
      {shown.map((step, index) => (
        <li key={step.code} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[1.5rem_6.5rem_minmax(0,1fr)_auto] sm:items-center">
          <span className="pt-0.5 font-mono text-[12px] tabular-nums text-muted-foreground sm:pt-0">{index + 1}</span>
          <span className="max-sm:col-start-2 max-sm:row-start-2">
            <Stamp tone={step.severity.tone}>{step.severity.word}</Stamp>
          </span>
          <span className="min-w-0 max-sm:col-start-2 max-sm:row-start-1">
            <span className="block text-[14px] font-medium text-foreground">{step.title}</span>
            {step.detail && <span className="block text-[12px] text-muted-foreground">{step.detail}</span>}
          </span>
          <span className="max-sm:col-start-2 sm:justify-self-end">
            {step.purpose ? (
              <AddApprovalButton purpose={step.purpose} className={fixClass}>
                {step.action}
              </AddApprovalButton>
            ) : (
              <Link href={step.href} className={fixClass}>
                {step.action}
                <ArrowUpRight />
              </Link>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
