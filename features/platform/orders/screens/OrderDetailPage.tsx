import { PageBreadcrumbs } from '@/features/dashboard/components/PageBreadcrumbs';
import { OrderPageClient } from './OrderPageClient';
import { getOrder } from '@/features/platform/orders/actions';
import { OrderComplianceSection } from '../components/OrderComplianceSection';
import { PickupOrderActions } from '../components/PickupOrderActions';

interface OrderPageParams {
  params: Promise<{
    id: string;
  }>;
}

export async function OrderDetailPage({ params }: OrderPageParams) {
  const resolvedParams = await params;
  const itemId = resolvedParams.id;

  const response = await getOrder(itemId);

  if (!response.success) {
    // Handle error case - Log and re-throw
    console.error('Error fetching order:', response.error);
    throw new Error(`Failed to fetch order ${itemId}: ${response.error}`);
  }

  const order = response.data?.order; // Extract order from data

  if (!order) {
    // Handle case where request succeeded but order wasn't found
    // Using notFound() is generally preferred in Next.js pages
    // You might need to import it: import { notFound } from "next/navigation";
    // notFound();
    // Or throw an error as before:
    throw new Error(`Order not found: ${itemId}`);
  }

  // Extract UI configuration
  // Store pickup: every shipping method is the pickup option (see regulated/pickup.ts).
  const methods: any[] = order.shippingMethods || [];
  const isPickup = methods.length > 0 && methods.every((method: any) => method?.shippingOption?.data?.pickup === true);

  const uiConfig = {
    hideDelete: false,
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: 'link', label: 'Dashboard', href: '' },
          { type: 'page', label: 'Platform' },
          { type: 'link', label: 'Orders', href: '/platform/orders' },
          { type: 'page', label: `#${order.displayId || order.id}` },
        ]}
      />
      <OrderPageClient
        order={order}
        isPickup={isPickup}
        id={itemId}
        listKey="orders"
        fieldModes={{}}
        fieldPositions={{}}
        uiConfig={uiConfig}
        compliance={
          <>
            <PickupOrderActions
              orderId={order.id}
              status={order.status}
              isPickup={isPickup}
              payAtPickupPending={Boolean(order.payments?.some((payment: any) => payment.status === 'pending'))}
              paid={Boolean(order.payments?.some((payment: any) => payment.status === 'captured'))}
              handedOver={order.status === 'completed'}
            />
            <OrderComplianceSection orderId={order.id} />
          </>
        }
      />
    </>
  );
} 