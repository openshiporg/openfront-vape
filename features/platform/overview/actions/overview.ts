'use server';

import { sessionContext } from '@/features/platform/lib/session-context';

export type Section<T> = { ok: true; value: T } | { ok: false };

export type OverviewOrder = {
  id: string;
  displayId: number;
  email: string;
  createdAt: string;
  total: string | null;
  fulfillmentStatus: { status?: string; remainingQuantity?: number } | null;
};

export type BlockedProduct = {
  id: string;
  title: string;
  variants: Array<{ id: string; label: string; state: string }>;
};

export type ExpiringItem = {
  id: string;
  kind: 'classification' | 'authorization' | 'approval' | 'license';
  title: string;
  detail: string;
  expiresAt: string;
  href: string;
};

export type OverviewData = {
  orders: Section<{ count: number; capped: boolean; latest: OverviewOrder[] }>;
  blocked: Section<{
    count: number;
    capped: boolean;
    products: BlockedProduct[];
    /** Products whose every blocked variant simply has no classification yet; one queue, one fix. */
    unclassified?: { products: number; variants: number };
    /** Products blocked for another reason (pending, rejected, expired classification), first 8. */
    other?: BlockedProduct[];
  }>;
  expiring: Section<ExpiringItem[]>;
  decisions: Section<Record<'allow' | 'deny' | 'manual_review', number>>;
};

const LIMIT = 100;
const DAY = 24 * 60 * 60 * 1000;

async function section<T>(name: string, load: () => Promise<T>): Promise<Section<T>> {
  try {
    return { ok: true, value: await load() };
  } catch (error) {
    const value = error as any;
    console.error(`Overview: ${name} read failed`, { name: value?.name, code: value?.extensions?.code });
    return { ok: false };
  }
}

function isApproved(classification: any, now: number) {
  if (!classification || classification.status !== 'approved') return false;
  const effective = classification.effectiveAt ? new Date(classification.effectiveAt).getTime() : NaN;
  const expires = classification.expiresAt ? new Date(classification.expiresAt).getTime() : NaN;
  return Number.isFinite(effective) && Number.isFinite(expires) && effective <= now && expires > now;
}

export async function getOverview(): Promise<OverviewData | null> {
  const context = await sessionContext();
  if (!context.session?.itemId) return null;
  const query = context.query as any;
  const nowDate = new Date();
  const now = nowDate.getTime();
  const nowIso = nowDate.toISOString();
  const soonIso = new Date(now + 30 * DAY).toISOString();
  const todayIso = `${nowIso.slice(0, 10)}T00:00:00.000Z`;

  const [orders, blocked, expiring, decisions] = await Promise.all([
    section('orders', async () => {
      const rows: Array<{ id: string; fulfillmentStatus: OverviewOrder['fulfillmentStatus'] }> = await query.Order.findMany({
        where: {
          status: { equals: 'pending' },
          canceledAt: { equals: null },
          payments: { some: { status: { in: ['captured', 'authorized'] } } },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: LIMIT,
        query: 'id fulfillmentStatus',
      });
      const open = rows.filter(order => order.fulfillmentStatus?.status !== 'fulfilled');
      const ids = open.slice(0, 5).map(order => order.id);
      const latest: OverviewOrder[] = ids.length
        ? await query.Order.findMany({
            where: { id: { in: ids } },
            orderBy: [{ createdAt: 'desc' }],
            take: 5,
            query: 'id displayId email createdAt total fulfillmentStatus',
          })
        : [];
      return { count: open.length, capped: rows.length === LIMIT, latest };
    }),

    section('products', async () => {
      const rows: any[] = await query.Product.findMany({
        where: { status: { equals: 'draft' }, regulatedCommerceRequired: { equals: true } },
        orderBy: [{ updatedAt: 'desc' }],
        take: LIMIT,
        query: 'id title productVariants(take: 50) { id title sku regulatedClassification { id status effectiveAt expiresAt } }',
      });
      const products: BlockedProduct[] = [];
      for (const product of rows) {
        const variants = (product.productVariants || [])
          .filter((variant: any) => !isApproved(variant.regulatedClassification, now))
          .map((variant: any) => ({
            id: variant.id,
            label: variant.title || variant.sku || variant.id.slice(-6),
            state: variant.regulatedClassification?.status || 'missing',
          }));
        if (variants.length) {
          products.push({ id: product.id, title: product.title, variants });
        }
      }
      const onlyMissing = products.filter(product => product.variants.every(variant => variant.state === 'missing'));
      const other = products.filter(product => product.variants.some(variant => variant.state !== 'missing'));
      return {
        count: products.length,
        capped: rows.length === LIMIT,
        products: products.slice(0, 8),
        unclassified: { products: onlyMissing.length, variants: onlyMissing.reduce((sum, product) => sum + product.variants.length, 0) },
        other: other.slice(0, 8),
      };
    }),

    section('evidence', async () => {
      const window = { gt: nowIso, lte: soonIso };
      const [classifications, authorizations, approvals, licenses] = await Promise.all([
        query.RegulatedProductClassification.findMany({
          where: { status: { equals: 'approved' }, expiresAt: window },
          orderBy: [{ expiresAt: 'asc' }],
          take: LIMIT,
          query: 'id brand expiresAt variant { id title sku product { id title } }',
        }),
        query.ProductAuthorization.findMany({
          where: { status: { equals: 'authorized' }, expiresAt: window },
          orderBy: [{ expiresAt: 'asc' }],
          take: LIMIT,
          query: 'id authority authorizationIdentifier expiresAt classification { variant { product { id title } } }',
        }),
        query.ProviderApproval.findMany({
          where: { status: { equals: 'active' }, expiresAt: window },
          orderBy: [{ expiresAt: 'asc' }],
          take: LIMIT,
          query: 'id purpose providerCode expiresAt',
        }),
        query.MerchantLicense.findMany({
          where: { status: { in: ['active', 'conditioned'] }, expiresAt: window },
          orderBy: [{ expiresAt: 'asc' }],
          take: LIMIT,
          query: 'id licenseType licenseNumber expiresAt profile { id legalName } jurisdiction { code }',
        }),
      ]);
      const items: ExpiringItem[] = [
        ...classifications.map((item: any) => ({
          id: item.id,
          kind: 'classification' as const,
          title: item.variant?.product?.title || item.brand,
          detail: ['Classification', item.variant?.title || item.variant?.sku].filter(Boolean).join(' · '),
          expiresAt: item.expiresAt,
          href: item.variant?.product?.id ? `/dashboard/platform/products/${item.variant.product.id}` : '/dashboard/platform/product-evidence',
        })),
        ...authorizations.map((item: any) => ({
          id: item.id,
          kind: 'authorization' as const,
          title: item.classification?.variant?.product?.title || item.authority,
          detail: ['Authorization', item.authority, item.authorizationIdentifier].filter(Boolean).join(' · '),
          expiresAt: item.expiresAt,
          href: item.classification?.variant?.product?.id
            ? `/dashboard/platform/products/${item.classification.variant.product.id}`
            : '/dashboard/platform/product-evidence',
        })),
        ...approvals.map((item: any) => ({
          id: item.id,
          kind: 'approval' as const,
          title: item.providerCode,
          detail: `Provider approval · ${item.purpose}`,
          expiresAt: item.expiresAt,
          href: '/dashboard/platform/provider-approvals',
        })),
        ...licenses.map((item: any) => ({
          id: item.id,
          kind: 'license' as const,
          title: [item.licenseType, item.jurisdiction?.code].filter(Boolean).join(' · '),
          detail: ['License', item.licenseNumber, item.profile?.legalName].filter(Boolean).join(' · '),
          expiresAt: item.expiresAt,
          href: item.profile?.id ? `/dashboard/platform/merchant-profiles/${item.profile.id}` : '/dashboard/platform/merchant-profiles',
        })),
      ];
      return items.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    }),

    section('decisions', async () => {
      const results = ['allow', 'deny', 'manual_review'] as const;
      const counts = await Promise.all(results.map(result =>
        query.ComplianceDecision.count({ where: { issuedAt: { gte: todayIso }, result: { equals: result } } }),
      ));
      return Object.fromEntries(results.map((result, index) => [result, counts[index]])) as Record<(typeof results)[number], number>;
    }),
  ]);

  return { orders, blocked, expiring, decisions };
}
