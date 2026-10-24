import { PageContainer } from '@/features/dashboard/components/PageContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTitle } from '@/features/platform/components/vape-ui';
import { getProductEvidence } from '../actions/evidence';
import { ProductEvidenceClient } from '../components/ProductEvidenceClient';

const breadcrumbs = [
  { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
  { type: 'page' as const, label: 'Platform' },
  { type: 'page' as const, label: 'Product evidence' },
];

export async function ProductEvidencePage() {
  const response = await getProductEvidence();

  if (!response.success) {
    return (
      <PageContainer title="Product evidence" header={<PageTitle title="Product evidence" />} breadcrumbs={breadcrumbs}>
        <div className="px-4 md:px-6 pb-24 sm:pb-10">
          <Alert variant="destructive">
            <AlertDescription>{response.error}</AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  const { classifications, unclassified } = response.data;
  const approved = classifications.filter(item => item.status === 'approved' && item.federal === 'current').length;
  const header = (
    <PageTitle
      title="Product evidence"
      tone={unclassified.length ? 'warn' : approved ? 'ok' : 'muted'}
      state={unclassified.length ? `${unclassified.length} unclassified` : `${approved} sellable`}
      meta={`${classifications.length} classifications`}
    />
  );

  return (
    <PageContainer title="Product evidence" header={header} breadcrumbs={breadcrumbs}>
      <div className="pb-24 sm:pb-10">
        <ProductEvidenceClient data={response.data} />
      </div>
    </PageContainer>
  );
}
