"use client";

import { PageContainer } from "../../../dashboard/components/PageContainer";
import { SystemTabs, TabType } from "../components/SystemTabs";

interface SystemPageClientProps {
  list: any;
  initialTab: TabType;
}

export function SystemPageClient({
  list,
  initialTab,
}: SystemPageClientProps) {

  return (
    <PageContainer
      header={<>
        <h1 className="text-2xl font-semibold">System Configuration</h1>
        <p className="text-sm text-muted-foreground">Manage system settings, store configuration, and payment providers</p>
      </>}
    >
      <SystemTabs
        initialTab={initialTab}
        list={list}
      />
    </PageContainer>
  );
}