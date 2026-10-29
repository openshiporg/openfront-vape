import { GraphQLClient, gql } from 'graphql-request';
import { startOnboarding, completeOnboarding } from '../actions/onboarding';
import { SECTION_DEFINITIONS } from '../config/templates';
import { TemplateType, OnboardingStep } from './useOnboardingState';
import { VAPE_LOGO_COLOR, VAPE_LOGO_ICON } from '@/features/storefront/lib/vape-brand';

const GRAPHQL_ENDPOINT = '/api/graphql';

interface OnboardingApiProps {
  selectedTemplate: TemplateType;
  currentJsonData: any;
  completedItems: Record<string, string[]>;
  setProgress: (message: string) => void;
  setItemLoading: (type: string, item: string) => void;
  setItemCompleted: (type: string, item: string) => void;
  setItemError: (type: string, item: string, errorMessage: string) => void;
  setStep: (step: OnboardingStep) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetOnboardingState: () => void;
  setSummary?: (summary: OnboardingSummary) => void;
}

export type OnboardingSummaryKey = 'regions' | 'paymentProviders' | 'shipping' | 'categories' | 'collections' | 'products';

export interface OnboardingSummary {
  storeExisted: boolean;
  created: Record<OnboardingSummaryKey, number>;
  existing: Record<OnboardingSummaryKey, number>;
  skippedForCompliance: OnboardingSummaryKey[];
}

type IdMap = Record<string, string>;

// What the store already has, keyed the same way the seed refers to it.
// Onboarding only creates what is missing from these maps.
interface ExistingRecords {
  storeId: string;
  storeName: string;
  hasMerchantProfile: boolean;
  salesBlocked: boolean;
  currencies: IdMap;
  countries: Record<string, { id: string; regionId: string | null }>;
  paymentProviders: IdMap;
  fulfillmentProviders: IdMap;
  regionsByCode: IdMap;
  regionsByName: IdMap;
  categoriesByHandle: IdMap;
  categoriesByTitle: IdMap;
  collectionsByHandle: IdMap;
  collectionsByTitle: IdMap;
  productsByHandle: IdMap;
  productsByTitle: IdMap;
  shippingOptionKeys: Set<string>;
}

const key = (value: unknown) => String(value ?? '').trim().toLowerCase();

const toMap = (items: Array<Record<string, any>> | null | undefined, field: string): IdMap => {
  const map: IdMap = {};
  for (const item of items || []) {
    const k = key(item[field]);
    if (k && item.id) map[k] = item.id;
  }
  return map;
};

// A seed region is kept when its code or name exists, or when one of its
// countries already belongs to a region (connecting it would move it).
const findExistingRegionId = (region: any, existing: ExistingRecords): string | undefined => {
  const countries: Array<{ iso2: string }> = region?.countries || [];
  const assignedRegionId = countries
    .map((c) => existing.countries[key(c.iso2)]?.regionId)
    .find(Boolean);
  return (
    existing.regionsByCode[key(region?.code)] ||
    existing.regionsByName[key(region?.name)] ||
    assignedRegionId ||
    undefined
  );
};

export type OnboardingPlanKey = 'store' | OnboardingSummaryKey;

export interface OnboardingPlanSection {
  // Item labels this run would create, matching the progress item names.
  add: string[];
  // Item labels that already exist and are kept.
  existing: string[];
  // Not created because the existing store cannot sell yet.
  skipped: boolean;
  // Not created for another reason, shown instead of "Already set up".
  skipReason?: string;
}

export interface OnboardingPlan {
  storeExisted: boolean;
  sections: Record<OnboardingPlanKey, OnboardingPlanSection>;
  nothingToAdd: boolean;
}

const regionLabel = (r: any) => `${r?.name || 'Unknown'} (${(r?.currencyCode || 'USD').toUpperCase()})`;

const emptyCounts = (): Record<OnboardingSummaryKey, number> => ({
  regions: 0,
  paymentProviders: 0,
  shipping: 0,
  categories: 0,
  collections: 0,
  products: 0,
});

export function useOnboardingApi({
  selectedTemplate,
  currentJsonData,
  completedItems,
  setProgress,
  setItemLoading,
  setItemCompleted,
  setItemError,
  setStep,
  setError,
  setIsLoading,
  resetOnboardingState,
  setSummary,
}: OnboardingApiProps) {
  let summary: OnboardingSummary = {
    storeExisted: false,
    created: emptyCounts(),
    existing: emptyCounts(),
    skippedForCompliance: [],
  };

  const runOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    resetOnboardingState();
    setStep('progress');
    setProgress('Starting onboarding...');

    // Mark onboarding as started
    try {
      await startOnboarding();
    } catch (error) {
      console.error('Error marking onboarding as started:', error);
    }

    try {
      const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: { 'Content-Type': 'application/json' },
      });

      summary = {
        storeExisted: false,
        created: emptyCounts(),
        existing: emptyCounts(),
        skippedForCompliance: [],
      };

      setProgress('Checking existing store data...');
      const existing = await loadExisting(client, currentJsonData);
      summary.storeExisted = Boolean(existing.storeId);

      // An existing store that cannot sell (regulated, fail-closed) does not get
      // a manual payment method or unclassified seed products added to it.
      const skipRegulatedSeed = summary.storeExisted && existing.salesBlocked;

      const storeId = await createStore(client, currentJsonData, existing);
      if (!existing.hasMerchantProfile) {
        await createMerchantProfile(client, storeId, existing.storeName || currentJsonData.store?.name);
      }
      const currencyIds = await createCurrencies(client, currentJsonData, existing);
      const countryIds = await createCountries(client, currentJsonData, existing);
      const paymentProviderIds = skipRegulatedSeed
        ? skipPaymentProviders(currentJsonData, existing)
        : await createPaymentProviders(client, currentJsonData, existing);
      const fulfillmentProviderIds = await createFulfillmentProvider(client, currentJsonData, existing);
      const { createdRegions, regionIds } = await createRegions(client, currentJsonData, existing, currencyIds, paymentProviderIds, fulfillmentProviderIds, countryIds);
      await createShippingOptions(client, currentJsonData, existing, fulfillmentProviderIds, createdRegions);
      const categoryIds = await createCategories(client, currentJsonData, existing);
      const collectionIds = await createCollections(client, currentJsonData, existing);
      if (skipRegulatedSeed) {
        summary.skippedForCompliance.push('products');
      } else {
        await createProducts(client, currentJsonData, existing, categoryIds, collectionIds, currencyIds, regionIds);
      }

      setSummary?.(summary);
      setProgress('Onboarding complete!');

      // Mark onboarding as completed
      try {
        await completeOnboarding();
      } catch (error) {
        console.error('Error marking onboarding as completed:', error);
      }

      setStep('done');
    } catch (e: any) {
      handleOnboardingError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const canManageCompliance = async (client: GraphQLClient) => {
    try {
      const viewer = (await client.request(gql`
        query OnboardingViewerRole {
          authenticatedItem {
            ... on User {
              role {
                canManageCompliance
              }
            }
          }
        }
      `)) as { authenticatedItem: { role?: { canManageCompliance?: boolean | null } | null } | null };
      return Boolean(viewer.authenticatedItem?.role?.canManageCompliance);
    } catch {
      return false;
    }
  };

  // Read-only: what runOnboarding would create for the current data, using
  // the same existing-records and readiness checks. Creates nothing.
  const planOnboarding = async (): Promise<OnboardingPlan> => {
    const data = currentJsonData || {};
    const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: { 'Content-Type': 'application/json' },
    });
    const existing = await loadExisting(client, data);
    const storeExisted = Boolean(existing.storeId);
    const skipRegulatedSeed = storeExisted && existing.salesBlocked;

    const section = (): OnboardingPlanSection => ({ add: [], existing: [], skipped: false });
    const sections: Record<OnboardingPlanKey, OnboardingPlanSection> = {
      store: section(),
      regions: section(),
      paymentProviders: section(),
      shipping: section(),
      categories: section(),
      collections: section(),
      products: section(),
    };

    if (storeExisted) {
      sections.store.existing.push(existing.storeName || 'Store');
    } else {
      sections.store.add.push(data.store?.name || 'Cloud Nine Vapor');
    }
    if (!existing.hasMerchantProfile && (await canManageCompliance(client))) {
      sections.store.add.push('Compliance profile (draft)');
    }

    const createdRegionCodes: string[] = [];
    for (const region of data.regions || []) {
      if (findExistingRegionId(region, existing)) {
        sections.regions.existing.push(regionLabel(region));
      } else {
        sections.regions.add.push(regionLabel(region));
        createdRegionCodes.push(String(region.code));
      }
    }

    for (const provider of data.paymentProviders || []) {
      const name = provider.name || 'Unknown Provider';
      if (existing.paymentProviders[key(provider.code)]) sections.paymentProviders.existing.push(name);
      else if (!skipRegulatedSeed) sections.paymentProviders.add.push(name);
    }
    sections.paymentProviders.skipped = skipRegulatedSeed && (data.paymentProviders || []).length > 0;

    // Options are only added to regions this run creates
    for (const option of data.shipping_options || []) {
      const name = option.name || 'Unknown Shipping';
      const willCreate = createdRegionCodes.some(
        (code) => !existing.shippingOptionKeys.has(key(`${option.name}-${code}`))
      );
      const alreadyThere = createdRegionCodes.length > 0 && !willCreate;
      if (willCreate) sections.shipping.add.push(name);
      else if (alreadyThere) sections.shipping.existing.push(name);
    }
    if (!createdRegionCodes.length && (data.shipping_options || []).length > 0) {
      sections.shipping.skipReason = 'Skipped, region already exists';
    }

    for (const category of data.categories || []) {
      const name = category.title || category.name || 'Unknown Category';
      const found = existing.categoriesByHandle[key(category.handle)] || existing.categoriesByTitle[key(name)];
      (found ? sections.categories.existing : sections.categories.add).push(name);
    }

    for (const collection of data.collections || []) {
      const name = collection.title || 'Unknown Collection';
      const found = existing.collectionsByHandle[key(collection.handle)] || existing.collectionsByTitle[key(name)];
      (found ? sections.collections.existing : sections.collections.add).push(name);
    }

    for (const product of data.products || []) {
      const name = product.title || 'Unknown Product';
      const found = existing.productsByHandle[key(product.handle)] || existing.productsByTitle[key(name)];
      if (found) sections.products.existing.push(name);
      else if (!skipRegulatedSeed) sections.products.add.push(name);
    }
    sections.products.skipped = skipRegulatedSeed && (data.products || []).length > 0;

    const nothingToAdd = Object.values(sections).every((s) => s.add.length === 0);
    return { storeExisted, sections, nothingToAdd };
  };

  const loadExisting = async (client: GraphQLClient, data: any): Promise<ExistingRecords> => {
    const handles = (items: any[] | undefined, field: string) =>
      (items || []).map((item) => item?.[field]).filter((v): v is string => typeof v === 'string' && v !== '');

    const productHandles = handles(data.products, 'handle');
    const productTitles = handles(data.products, 'title');

    const result = (await client.request(
      gql`
        query OnboardingExisting($productHandles: [String!], $productTitles: [String!]) {
          stores(take: 1) {
            id
            name
          }
          currencies {
            id
            code
          }
          countries {
            id
            iso2
            region {
              id
            }
          }
          paymentProviders {
            id
            code
          }
          fulfillmentProviders {
            id
            code
          }
          regions {
            id
            code
            name
          }
          productCategories {
            id
            handle
            title
          }
          productCollections {
            id
            handle
            title
          }
          products(
            where: {
              OR: [
                { handle: { in: $productHandles, mode: insensitive } }
                { title: { in: $productTitles, mode: insensitive } }
              ]
            }
          ) {
            id
            handle
            title
          }
          shippingOptions {
            id
            uniqueKey
          }
        }
      `,
      { productHandles, productTitles }
    )) as any;

    const store = result.stores?.[0] || null;

    let hasMerchantProfile = false;
    let salesBlocked = false;
    if (store?.id) {
      try {
        const profiles = (await client.request(
          gql`
            query OnboardingMerchantProfiles($storeId: ID!) {
              regulatedMerchantProfilesCount(where: { store: { id: { equals: $storeId } } })
            }
          `,
          { storeId: store.id }
        )) as { regulatedMerchantProfilesCount: number | null };
        hasMerchantProfile = (profiles.regulatedMerchantProfilesCount || 0) > 0;
      } catch {
        // Without compliance access the profile step is skipped anyway.
        hasMerchantProfile = true;
      }

      try {
        const readiness = (await client.request(gql`
          query OnboardingReadiness {
            regulatedCommerceReadiness
          }
        `)) as { regulatedCommerceReadiness?: { launchReady?: boolean } | null };
        salesBlocked = readiness.regulatedCommerceReadiness?.launchReady !== true;
      } catch {
        // Unknown readiness on an existing store is treated as fail-closed.
        salesBlocked = true;
      }
    }

    const countries: ExistingRecords['countries'] = {};
    for (const country of result.countries || []) {
      const k = key(country.iso2);
      if (k) countries[k] = { id: country.id, regionId: country.region?.id || null };
    }

    return {
      storeId: store?.id || '',
      storeName: store?.name || '',
      hasMerchantProfile,
      salesBlocked,
      currencies: toMap(result.currencies, 'code'),
      countries,
      paymentProviders: toMap(result.paymentProviders, 'code'),
      fulfillmentProviders: toMap(result.fulfillmentProviders, 'code'),
      regionsByCode: toMap(result.regions, 'code'),
      regionsByName: toMap(result.regions, 'name'),
      categoriesByHandle: toMap(result.productCategories, 'handle'),
      categoriesByTitle: toMap(result.productCategories, 'title'),
      collectionsByHandle: toMap(result.productCollections, 'handle'),
      collectionsByTitle: toMap(result.productCollections, 'title'),
      productsByHandle: toMap(result.products, 'handle'),
      productsByTitle: toMap(result.products, 'title'),
      shippingOptionKeys: new Set((result.shippingOptions || []).map((o: any) => key(o.uniqueKey)).filter(Boolean)),
    };
  };

  const createStore = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    // A store that already exists keeps its name and settings.
    if (existing.storeId) {
      setItemCompleted('store', existing.storeName || 'Store');
      return existing.storeId;
    }

    setProgress('Creating store...');

    // Merge seed data over the defaults so normal onboarding receives its
    // logo and hue even when seed.json already defines a store object.
    const storeData = {
      name: 'Cloud Nine Vapor',
      defaultCurrencyCode: 'usd',
      homepageTitle: 'Vape devices, e-liquids and accessories',
      homepageDescription: 'Adults 21+ only. Shop devices, e-liquids and accessories.',
      logoIcon: VAPE_LOGO_ICON,
      logoColor: VAPE_LOGO_COLOR,
      ...(data.store || {}),
    };

    // Set the store as loading
    setItemLoading('store', storeData.name);

    let createdStoreId = '';
    try {
      const storeMutation = gql`
        mutation CreateStore($data: StoreCreateInput!) {
          createStore(data: $data) {
            id
            name
          }
        }
      `;

      const storeResult = (await client.request(storeMutation, {
        data: storeData,
      })) as { createStore: { id: string } };
      createdStoreId = storeResult.createStore.id;

      // Mark store as completed
      setItemCompleted('store', storeData.name);
      return createdStoreId;
    } catch (error: any) {
      console.error('Error creating store:', error);
      // Continue with onboarding even if store creation fails
      return '';
    }
  };

  // Draft compliance profile for the new store. It stays in draft with the
  // kill switch on until the merchant records their licences and approvals in
  // Compliance Center. Skipped when the user cannot manage compliance.
  const createMerchantProfile = async (client: GraphQLClient, storeId: string, legalName?: string) => {
    if (!storeId) return;

    try {
      const viewer = (await client.request(gql`
        query OnboardingViewer {
          authenticatedItem {
            ... on User {
              name
              email
              role {
                canManageCompliance
              }
            }
          }
        }
      `)) as {
        authenticatedItem: {
          name?: string | null;
          email?: string | null;
          role?: { canManageCompliance?: boolean | null } | null;
        } | null;
      };
      const user = viewer.authenticatedItem;
      if (!user?.role?.canManageCompliance) return;

      setProgress('Creating compliance profile...');

      const profileMutation = gql`
        mutation CreateRegulatedMerchantProfile($data: RegulatedMerchantProfileCreateInput!) {
          createRegulatedMerchantProfile(data: $data) {
            id
          }
        }
      `;
      await client.request(profileMutation, {
        data: {
          store: { connect: { id: storeId } },
          legalName: legalName || 'Cloud Nine Vapor',
          complianceOwner: user.name || user.email,
          status: 'draft',
          killSwitch: true,
          pactRegistered: false,
        },
      });
    } catch (error: any) {
      console.error('Error creating compliance profile:', error);
      // Continue with onboarding; the profile can be created in Compliance Center
    }
  };

  const formatItemError = (itemError: any) => {
    if (itemError?.response?.errors) {
      return itemError.response.errors
        .map((err: any) => err.message || JSON.stringify(err))
        .join('\n');
    }
    return itemError?.message || 'Unknown error';
  };

  const createCurrencies = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    setProgress('Creating currencies...');
    const currencyIds: IdMap = {};

    for (const region of data.regions || []) {
      const code = key(region.currencyCode);
      if (!code || currencyIds[code]) continue;
      if (existing.currencies[code]) {
        currencyIds[code] = existing.currencies[code];
        continue;
      }
      // A kept region keeps its own currency; nothing is created for it.
      if (findExistingRegionId(region, existing)) continue;

      const regionName = `${region.name || 'Unknown'} (${(region.currencyCode || 'USD').toUpperCase()})`;
      setItemLoading('regions', regionName);

      try {
        const mutation = gql`
          mutation CreateCurrency($data: CurrencyCreateInput!) {
            createCurrency(data: $data) {
              id
              code
            }
          }
        `;
        const result = (await client.request(mutation, {
          data: {
            code: region.currencyCode,
            symbol: region.currencySymbol,
            symbolNative: region.currencySymbol,
            name: region.currencyName,
          },
        })) as { createCurrency: { id: string } };
        currencyIds[code] = result.createCurrency.id;
        setItemCompleted('regions', regionName);
      } catch (itemError: any) {
        setItemError('regions', regionName, formatItemError(itemError));
        console.error(`Error creating currency for ${region.name}:`, itemError);
      }
    }

    return currencyIds;
  };

  const createCountries = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    setProgress('Creating countries...');
    const countryIds: IdMap = {};

    for (const region of data.regions || []) {
      // A kept region keeps its own countries; nothing is created for it.
      const regionKept = Boolean(findExistingRegionId(region, existing));
      for (const country of region.countries || []) {
        const iso2 = key(country.iso2);
        if (!iso2 || countryIds[iso2]) continue;
        if (existing.countries[iso2]) {
          countryIds[iso2] = existing.countries[iso2].id;
          continue;
        }
        if (regionKept) continue;

        const mutation = gql`
          mutation CreateCountry($data: CountryCreateInput!) {
            createCountry(data: $data) {
              id
              iso2
            }
          }
        `;
        const result = (await client.request(mutation, {
          data: country,
        })) as { createCountry: { id: string } };
        countryIds[iso2] = result.createCountry.id;
      }
    }

    return countryIds;
  };

  // Fail-closed store: reuse providers that already exist, create none.
  const skipPaymentProviders = (data: any, existing: ExistingRecords) => {
    const paymentProviderIds: IdMap = {};
    for (const provider of data.paymentProviders || []) {
      const code = key(provider.code);
      if (existing.paymentProviders[code]) {
        paymentProviderIds[code] = existing.paymentProviders[code];
        summary.existing.paymentProviders += 1;
      }
    }
    summary.skippedForCompliance.push('paymentProviders');
    return paymentProviderIds;
  };

  const createPaymentProviders = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    setProgress('Creating payment providers...');
    const paymentProviderIds: IdMap = {};

    for (const provider of data.paymentProviders || []) {
      const providerName = provider.name || 'Unknown Provider';
      const code = key(provider.code);
      if (existing.paymentProviders[code]) {
        paymentProviderIds[code] = existing.paymentProviders[code];
        summary.existing.paymentProviders += 1;
        setItemCompleted('paymentProviders', providerName);
        continue;
      }

      setItemLoading('paymentProviders', providerName);

      const mutation = gql`
        mutation CreatePaymentProvider($data: PaymentProviderCreateInput!) {
          createPaymentProvider(data: $data) {
            id
            code
          }
        }
      `;
      const result = (await client.request(mutation, { data: provider })) as {
        createPaymentProvider: { id: string };
      };
      paymentProviderIds[code] = result.createPaymentProvider.id;
      summary.created.paymentProviders += 1;

      setItemCompleted('paymentProviders', providerName);
    }

    return paymentProviderIds;
  };

  const createFulfillmentProvider = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    const fulfillmentProviderIds: IdMap = {};

    if (existing.fulfillmentProviders['fp_manual']) {
      fulfillmentProviderIds['fp_manual'] = existing.fulfillmentProviders['fp_manual'];
      return fulfillmentProviderIds;
    }
    // Only new regions and their shipping options use it.
    const anyNewRegion = (data.regions || []).some((region: any) => !findExistingRegionId(region, existing));
    if (!anyNewRegion) return fulfillmentProviderIds;

    setProgress('Creating fulfillment provider...');

    const fulfillmentMutation = gql`
      mutation CreateFulfillmentProvider($data: FulfillmentProviderCreateInput!) {
        createFulfillmentProvider(data: $data) {
          id
          code
        }
      }
    `;
    const fulfillmentResult = (await client.request(fulfillmentMutation, {
      data: {
        code: 'fp_manual',
        name: 'Manual Fulfillment',
        isInstalled: true,
      },
    })) as { createFulfillmentProvider: { id: string } };
    fulfillmentProviderIds['fp_manual'] = fulfillmentResult.createFulfillmentProvider.id;

    return fulfillmentProviderIds;
  };

  const createRegions = async (
    client: GraphQLClient,
    data: any,
    existing: ExistingRecords,
    currencyIds: IdMap,
    paymentProviderIds: IdMap,
    fulfillmentProviderIds: IdMap,
    countryIds: IdMap
  ) => {
    setProgress('Creating regions...');
    // createdRegions: regions made by this run (they get seed shipping options).
    // regionIds: every seed region code mapped to a usable region, for prices.
    const createdRegions: IdMap = {};
    const regionIds: IdMap = {};

    for (const region of data.regions || []) {
      const code = key(region.code);
      const countries: Array<{ iso2: string }> = region.countries || [];

      const existingRegionId = findExistingRegionId(region, existing);
      if (existingRegionId) {
        regionIds[code] = existingRegionId;
        summary.existing.regions += 1;
        continue;
      }

      const currencyId = currencyIds[key(region.currencyCode)];
      if (!currencyId) continue;

      const filteredPaymentProviders = (region.paymentProviders?.connect || [])
        .map((p: any) => paymentProviderIds[key(p.code)])
        .filter(Boolean)
        .map((id: string) => ({ id }));
      const filteredFulfillmentProviders = (region.fulfillmentProviders?.connect || [])
        .map((p: any) => fulfillmentProviderIds[key(p.code)])
        .filter(Boolean)
        .map((id: string) => ({ id }));
      const countriesToConnect = countries
        .map((c) => countryIds[key(c.iso2)])
        .filter(Boolean)
        .map((id: string) => ({ id }));

      const mutation = gql`
        mutation CreateRegion($data: RegionCreateInput!) {
          createRegion(data: $data) {
            id
            code
          }
        }
      `;
      const result = (await client.request(mutation, {
        data: {
          code: region.code,
          name: region.name,
          currency: {
            connect: { id: currencyId },
          },
          taxRate: region.taxRate,
          paymentProviders: filteredPaymentProviders.length > 0
            ? { connect: filteredPaymentProviders }
            : undefined,
          fulfillmentProviders: filteredFulfillmentProviders.length > 0
            ? { connect: filteredFulfillmentProviders }
            : undefined,
          countries: countriesToConnect.length > 0
            ? { connect: countriesToConnect }
            : undefined,
        },
      })) as { createRegion: { id: string } };
      createdRegions[code] = result.createRegion.id;
      regionIds[code] = result.createRegion.id;
      summary.created.regions += 1;
    }

    return { createdRegions, regionIds };
  };

  const createShippingOptions = async (
    client: GraphQLClient,
    data: any,
    existing: ExistingRecords,
    fulfillmentProviderIds: IdMap,
    createdRegions: IdMap
  ) => {
    setProgress('Creating shipping options...');

    for (const option of data.shipping_options || []) {
      const shippingName = option.name || 'Unknown Shipping';
      let created = 0;

      // Existing regions keep their own shipping setup.
      for (const region of data.regions || []) {
        const regionId = createdRegions[key(region.code)];
        const uniqueKey = `${option.name}-${region.code}`;
        if (!regionId || existing.shippingOptionKeys.has(key(uniqueKey))) continue;

        if (created === 0) setItemLoading('shipping', shippingName);

        const mutation = gql`
          mutation CreateShippingOption($data: ShippingOptionCreateInput!) {
            createShippingOption(data: $data) {
              id
            }
          }
        `;
        await client.request(mutation, {
          data: {
            name: option.name,
            priceType: option.priceType,
            amount: option.amount,
            isReturn: option.isReturn || false,
            uniqueKey,
            fulfillmentProvider: {
              connect: { id: fulfillmentProviderIds['fp_manual'] },
            },
            region: { connect: { id: regionId } },
          },
        });
        created += 1;
      }

      if (created > 0) summary.created.shipping += 1;
      else summary.existing.shipping += 1;
      setItemCompleted('shipping', shippingName);
    }
  };

  const createCategories = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    setProgress('Creating categories...');
    const categoryIds: IdMap = {};

    for (const category of data.categories || []) {
      const categoryName = category.title || category.name || 'Unknown Category';
      const handle = key(category.handle);
      const existingId = existing.categoriesByHandle[handle] || existing.categoriesByTitle[key(categoryName)];
      if (existingId) {
        categoryIds[handle] = existingId;
        summary.existing.categories += 1;
        setItemCompleted('categories', categoryName);
        continue;
      }

      setItemLoading('categories', categoryName);

      const mutation = gql`
        mutation CreateProductCategory($data: ProductCategoryCreateInput!) {
          createProductCategory(data: $data) {
            id
            handle
          }
        }
      `;
      const result = (await client.request(mutation, {
        data: {
          title: category.name, // map to title
          handle: category.handle,
          isActive: category.isActive,
        },
      })) as { createProductCategory: { id: string } };
      categoryIds[handle] = result.createProductCategory.id;
      summary.created.categories += 1;

      setItemCompleted('categories', categoryName);
    }

    return categoryIds;
  };

  const createCollections = async (client: GraphQLClient, data: any, existing: ExistingRecords) => {
    setProgress('Creating collections...');
    const collectionIds: IdMap = {};

    for (const collection of data.collections || []) {
      const collectionName = collection.title || 'Unknown Collection';
      const handle = key(collection.handle);
      const existingId = existing.collectionsByHandle[handle] || existing.collectionsByTitle[key(collectionName)];
      if (existingId) {
        collectionIds[handle] = existingId;
        summary.existing.collections += 1;
        setItemCompleted('collections', collectionName);
        continue;
      }

      setItemLoading('collections', collectionName);

      const mutation = gql`
        mutation CreateProductCollection($data: ProductCollectionCreateInput!) {
          createProductCollection(data: $data) {
            id
            handle
          }
        }
      `;
      const result = (await client.request(mutation, {
        data: collection,
      })) as { createProductCollection: { id: string } };
      collectionIds[handle] = result.createProductCollection.id;
      summary.created.collections += 1;

      setItemCompleted('collections', collectionName);
    }

    return collectionIds;
  };

  const createProducts = async (
    client: GraphQLClient,
    data: any,
    existing: ExistingRecords,
    categoryIds: IdMap,
    collectionIds: IdMap,
    currencyIds: IdMap,
    regionIds: IdMap
  ) => {
    setProgress('Creating products and variants...');

    for (const product of data.products || []) {
      const productName = product.title || 'Unknown Product';
      if (existing.productsByHandle[key(product.handle)] || existing.productsByTitle[key(productName)]) {
        summary.existing.products += 1;
        setItemCompleted('products', productName);
        continue;
      }

      setItemLoading('products', productName);

      const { variants, productCollections, productCategories, subtitle, ...productInput } = product;

      // Only connect the collections that exist for this product, by id
      const collectionsToConnect = (productCollections?.connect || [])
        .map((c: { handle: string }) => collectionIds[key(c.handle)])
        .filter(Boolean)
        .map((id: string) => ({ id }));

      // Only connect the categories that exist for this product, by id
      const categoriesToConnect = (productCategories?.connect || [])
        .map((c: { handle: string }) => categoryIds[key(c.handle)])
        .filter(Boolean)
        .map((id: string) => ({ id }));

      // Remove variants and connect collections/categories by id, omit subtitle if null/empty
      const productData = {
        ...productInput,
        ...(typeof subtitle === 'string' && subtitle.trim() !== '' ? { subtitle } : {}),
        productCollections: collectionsToConnect.length > 0 ? { connect: collectionsToConnect } : undefined,
        productCategories: categoriesToConnect.length > 0 ? { connect: categoriesToConnect } : undefined,
      };

      // Create product
      const productMutation = gql`
        mutation CreateProduct($data: ProductCreateInput!) {
          createProduct(data: $data) {
            id
            productOptions {
              id
              title
              productOptionValues {
                id
                value
              }
            }
          }
        }
      `;
      const productResult = await client.request(productMutation, { data: productData });

      // Create variants for this product
      for (const variant of variants || []) {
        const variantMutation = gql`
          mutation CreateProductVariant($data: ProductVariantCreateInput!) {
            createProductVariant(data: $data) {
              id
              title
            }
          }
        `;
        const allOptionValues = (productResult as any).createProduct.productOptions.flatMap(
          (opt: any) => opt.productOptionValues
        );
        const matchingIds = (variant.options || [])
          .map((opt: any) =>
            allOptionValues.find((v: any) => v.value === opt.value)?.id
          )
          .filter(Boolean)
          .map((id: string) => ({ id }));

        // Only create prices where both currency and region exist
        const validPrices = (variant.prices || []).filter(
          (price: { currencyCode: string; regionCode: string }) =>
            currencyIds[key(price.currencyCode)] && regionIds[key(price.regionCode)]
        );
        const prices = {
          create: validPrices.map((price: { currencyCode: string; regionCode: string; amount: number }) => ({
            amount: price.amount,
            currency: { connect: { id: currencyIds[key(price.currencyCode)] } },
            region: { connect: { id: regionIds[key(price.regionCode)] } },
          })),
        };

        await client.request(variantMutation, {
          data: {
            title: variant.title,
            inventoryQuantity: variant.inventoryQuantity,
            manageInventory: variant.manageInventory,
            product: { connect: { id: (productResult as any).createProduct.id } },
            productOptionValues: { connect: matchingIds },
            prices,
          },
        });
      }

      summary.created.products += 1;
      setItemCompleted('products', productName);
    }
  };

  const handleOnboardingError = (e: any) => {
    // Format the error message for better readability
    let errorMessage = e.message || 'Unknown error';

    // Check if it's a GraphQL error with response data
    if (e.response?.errors) {
      // Format GraphQL errors in a more readable way
      errorMessage = e.response.errors
        .map((err: any) => {
          // Check for Prisma errors which have a specific structure
          if (err.message && err.message.includes('Prisma error')) {
            try {
              // For Prisma errors, simplify the message to just show the constraint failure
              if (err.message.includes('Unique constraint failed')) {
                return 'Unique constraint failed - this item already exists.';
              }

              // Try to extract and format the Prisma error details
              const match = err.message.match(/\{[\s\S]*\}/);
              if (match) {
                const errorObj = JSON.parse(match[0]);
                // Return a simplified error message
                return `Prisma error: ${errorObj.message || 'Unknown Prisma error'}`;
              }
            } catch (parseError) {
              // If parsing fails, just return the original message
            }
          }

          // Extract the most useful parts of the error
          if (err.message) {
            // Clean up the message by removing JSON-like structures
            return err.message.replace(/\{[\s\S]*\}/g, '[Error details omitted]');
          }

          // Last resort - stringify but limit length
          const stringified = JSON.stringify(err, null, 2);
          return stringified.length > 500
            ? stringified.substring(0, 500) + '...'
            : stringified;
        })
        .join('\n\n');
    }

    setError(errorMessage);
    console.error('Error during onboarding:', e);

    // Mark incomplete onboarding items according to their actual operation results
    const newItemErrors: Record<string, Record<string, string>> = {};

    // Find the first section with non-completed items
    for (const section of SECTION_DEFINITIONS) {
      const sectionType = section.type;
      const sectionItems = section.getItemsFn(selectedTemplate);
      const completedSectionItems = completedItems[sectionType] || [];

      // Find the first non-completed item
      const failedItem = sectionItems.find(
        (item) => !completedSectionItems.includes(item)
      );

      if (failedItem) {
        // Mark only this item as failed
        setItemError(sectionType, failedItem, errorMessage);
        break;
      }
    }
  };

  return { runOnboarding, planOnboarding };
}