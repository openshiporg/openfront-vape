import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';

import { buttonClass, PageTitle } from '@/features/platform/components/vape-ui';
import { AddApprovalButton } from '@/features/platform/compliance-center/components/ProviderApprovalSheet';
import { getProviderApprovals } from '../actions/provider-approvals';
import { ProviderApprovalList } from '../components/ProviderApprovalList';
import { approvalInForce, REQUIRED_PROVIDER_PURPOSES } from '../components/approval-display';

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
  const now = Date.now();
  const missingPurposes = REQUIRED_PROVIDER_PURPOSES.filter(purpose => !approvals.some(item => item.purpose === purpose && approvalInForce(item, now)));
  const missing = missingPurposes.length;
  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageTitle
        title="Provider approvals"
        tone={missing ? 'danger' : 'ok'}
        state={missing ? `${missing} required missing` : 'All required in force'}
        meta={`${approvals.length} approvals`}
      />
      <AddApprovalButton purpose={missingPurposes[0] || 'identity'} className={`${buttonClass.base} ${buttonClass.primary} h-10`}>
        <Plus />
        Add approval
      </AddApprovalButton>
    </div>
  );

  return (
    <PageContainer title="Provider approvals" header={header} breadcrumbs={breadcrumbs}>
      <div className="pb-24 sm:pb-10">
        <ProviderApprovalList approvals={approvals} />
      </div>
    </PageContainer>
  );
}
