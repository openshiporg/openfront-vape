import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTitle } from '@/features/platform/components/vape-ui';
import { getProviderApprovals } from '../actions/provider-approvals';
import { ProviderApprovalList } from '../components/ProviderApprovalList';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Provider approvals' },
];

export async function ProviderApprovalListPage() {
  const response = await getProviderApprovals();

  if (!response.success) {
    return (
      <PageContainer title="Provider approvals" header={<PageTitle title="Provider approvals" />} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 pb-24 sm:pb-10">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  const approvals = response.data;
  const active = approvals.filter(item => item.status === 'active').length;
  const header = (
    <PageTitle
      title="Provider approvals"
      tone={active ? 'ok' : 'warn'}
      state={`${active} active`}
      meta={`${approvals.length} approvals`}
    />
  );

  return (
    <PageContainer title="Provider approvals" header={header} breadcrumbs={breadcrumbs}>
      <div className="pb-24 sm:pb-10">
        <ProviderApprovalList approvals={approvals} />
      </div>
    </PageContainer>
  );
}
