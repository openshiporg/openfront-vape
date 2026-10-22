import { StoreSettingsPageClient } from './StoreSettingsPageClient';
import { getStoreSettings } from '../actions';
import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { PageTitle } from '@/features/platform/components/vape-ui';

export default async function StoreSettingsPage() {
  const response = await getStoreSettings();

  return (
    <PageContainer
      title="Store Settings"
      header={<PageTitle title="Store Settings" />}
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
