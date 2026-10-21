import { Building2, Package, CircleCheck } from 'lucide-react';

export interface StoreTemplate {
  name: string;
  description: string;
  icon: React.ReactNode;
  regions: string[];
  paymentProviders: string[];
  shipping: string[];
  categories: string[];
  collections: string[];
  products: string[];
  displayNames: {
    store: string[];
    regions: string[];
    paymentProviders: string[];
    shipping: string[];
    categories: string[];
    collections: string[];
    products: string[];
  };
}

export const STORE_TEMPLATES: Record<'full' | 'minimal' | 'custom', StoreTemplate> = {
  full: {
    name: 'Complete Setup',
    description:
      'Start with a fully configured store including shipping options, collections, and a rich product catalog.',
    icon: <Building2 className="h-5 w-5" />,
    regions: ['us'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
    categories: ['devices', 'e-liquids', 'pods-coils', 'accessories'],
    collections: ['starter-kits', 'new-arrivals', 'best-sellers'],
    products: [
      'nova-pod-kit',
      'stratus-starter-kit',
      'apex-80w-box-mod',
      'classic-tobacco-e-liquid',
      'cool-menthol-e-liquid',
      'tobacco-reserve-nicotine-salt',
      'nova-replacement-pods',
      'apex-mesh-coils',
      'device-carry-case',
      'usb-c-charging-cable',
    ],
    displayNames: {
      store: ['Cloud Nine Vapor'],
      regions: ['United States (USD)'],
      paymentProviders: ['Manual Payment'],
      shipping: ['Standard Shipping', 'Express Shipping', 'Return Shipping'],
      categories: ['Devices', 'E-Liquids', 'Pods & Coils', 'Accessories'],
      collections: ['Starter Kits', 'New Arrivals', 'Best Sellers'],
      products: [
        'Nova Pod Kit',
        'Stratus Starter Kit',
        'Apex 80W Box Mod',
        'Classic Tobacco E-Liquid',
        'Cool Menthol E-Liquid',
        'Tobacco Reserve Nicotine Salt',
        'Nova Replacement Pods (2-Pack)',
        'Apex Mesh Coils (5-Pack)',
        'Device Carry Case',
        'USB-C Charging Cable',
      ],
    },
  },
  minimal: {
    name: 'Basic Setup',
    description:
      'Start with just the essentials - one region, one payment method, and basic products.',
    icon: <Package className="h-5 w-5" />,
    regions: ['us'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['devices'],
    collections: ['starter-kits'],
    products: ['nova-pod-kit'],
    displayNames: {
      store: ['Cloud Nine Vapor'],
      regions: ['United States (USD)'],
      paymentProviders: ['Manual Payment'],
      shipping: ['Standard Shipping'],
      categories: ['Devices'],
      collections: ['Starter Kits'],
      products: ['Nova Pod Kit'],
    },
  },
  custom: {
    name: 'Custom Setup',
    description:
      'Customize your setup with your own JSON templates for each section.',
    icon: <CircleCheck className="h-5 w-5" />,
    regions: ['us'],
    paymentProviders: ['pp_system_default'],
    shipping: ['Standard Shipping'],
    categories: ['devices'],
    collections: ['starter-kits'],
    products: ['nova-pod-kit'],
    displayNames: {
      store: ['Cloud Nine Vapor'],
      regions: ['United States (USD)'],
      paymentProviders: ['Manual Payment'],
      shipping: ['Standard Shipping'],
      categories: ['Devices'],
      collections: ['Starter Kits'],
      products: ['Nova Pod Kit'],
    },
  },
};

export interface SectionDefinition {
  id: number;
  type: string;
  label: string;
  getItemsFn: (template: 'full' | 'minimal' | 'custom') => string[];
  jsonKey: 'store' | 'regions' | 'paymentProviders' | 'shipping_options' | 'categories' | 'collections' | 'products';
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: 1,
    type: 'store',
    label: 'Store Information',
    getItemsFn: () => ['Cloud Nine Vapor'],
    jsonKey: 'store' as const,
  },
  {
    id: 2,
    type: 'regions',
    label: 'Regions & Countries',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.regions,
    jsonKey: 'regions' as const,
  },
  {
    id: 3,
    type: 'paymentProviders',
    label: 'Payment Providers',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.paymentProviders,
    jsonKey: 'paymentProviders' as const,
  },
  {
    id: 4,
    type: 'shipping',
    label: 'Shipping Options',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.shipping,
    jsonKey: 'shipping_options' as const,
  },
  {
    id: 5,
    type: 'categories',
    label: 'Product Categories',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.categories,
    jsonKey: 'categories' as const,
  },
  {
    id: 6,
    type: 'collections',
    label: 'Collections',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.collections,
    jsonKey: 'collections' as const,
  },
  {
    id: 7,
    type: 'products',
    label: 'Products',
    getItemsFn: (template) => STORE_TEMPLATES[template].displayNames.products,
    jsonKey: 'products' as const,
  },
];