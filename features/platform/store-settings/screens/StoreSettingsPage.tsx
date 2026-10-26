import { StoreSettingsPageClient } from './StoreSettingsPageClient';
import { getStoreSettings } from '../actions';
import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { PageTitle } from '@/features/platform/components/vape-ui';
import { missingStoreInfo } from '../lib/store-info';

export default async function StoreSettingsPage() {
  const response = await getStoreSettings();
  const missing = response.success && response.data ? missingStoreInfo(response.data.metadata) : null;

  return (
    <PageContainer
      title="Store Settings"
      header={
        <PageTitle
          title="Store settings"
          tone={missing === null ? undefined : missing.length ? 'warn' : 'ok'}
          state={missing === null ? undefined : missing.length ? `${missing.length} required blank` : 'Complete'}
          meta={missing && missing.length ? 'Required before the store can sell' : undefined}
        />
      }
      breadcrumbs={[
        { type: 'link', label: 'Dashboard', href: '/' },
        { type: 'page', label: 'Platform' },
        { type: 'page', label: 'Store Settings' },
      ]}
    >
      <StoreSettingsPageClient
        initialData={response.success ? response.data : null}
        initialError={response.success ? null : (response.error ?? null)}
      />
    </PageContainer>
  );
}
