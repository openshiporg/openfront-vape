"use client";

import { StatusFilter, type DotTone } from "./vape-ui";

const COLOR_TONES: Record<string, DotTone> = {
  emerald: "ok", green: "ok", zinc: "muted", gray: "muted", slate: "muted",
  red: "danger", rose: "danger", orange: "warn", amber: "warn", yellow: "warn", blue: "info",
};

const defaultStatusConfig: Record<string, { label: string; tone: DotTone }> = {
  pending: { label: "Pending", tone: "info" },
  requires_action: { label: "Requires Action", tone: "warn" },
  completed: { label: "Completed", tone: "ok" },
  archived: { label: "Archived", tone: "muted" },
  canceled: { label: "Canceled", tone: "danger" },
};

interface StatusTabsProps {
  statusCounts: Record<string, number | undefined>;
  statusConfig?: Record<string, { label: string; color?: string }>;
  entityName?: string;
}

export function StatusTabs({ statusCounts, statusConfig }: StatusTabsProps) {
  const config: Record<string, { label: string; tone?: DotTone }> = statusConfig
    ? Object.fromEntries(
        Object.entries(statusConfig).map(([value, c]) => [value, { label: c.label, tone: COLOR_TONES[c.color || ""] || "muted" }])
      )
    : defaultStatusConfig;

  return (
    <StatusFilter
      allCount={statusCounts.all}
      statuses={Object.entries(config).map(([value, c]) => ({
        value,
        label: c.label,
        count: statusCounts[value],
        tone: c.tone,
      }))}
    />
  );
}
