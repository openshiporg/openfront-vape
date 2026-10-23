import type { ReactNode } from 'react';

export interface VariantRegion {
  id?: string;
  code: string;
  name: string;
  locale?: string | null;
  taxRate?: number | null;
  currency: { code: string; symbol?: string; symbolNative?: string };
}
export interface VariantImage {
  id: string;
  image?: { url?: string | null } | null;
  imagePath?: string | null;
  altText?: string | null;
}
export interface VariantPrice {
  id: string;
  amount: number;
  compareAmount?: number | null;
  region?: { code: string } | null;
  currency?: { code: string } | null;
}
export interface VariantRecord {
  id: string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  ean?: string | null;
  upc?: string | null;
  material?: string | null;
  inventoryQuantity?: number | null;
  manageInventory?: boolean | null;
  primaryImage?: VariantImage | null;
  prices?: VariantPrice[];
  productOptionValues: Array<{ id?: string; value: string; productOption: { id?: string; title: string } }>;
}
export interface PriceSaveData {
  amount: number;
  compareAmount: number | null;
  regionCode: string;
  currencyCode: string;
  priceId?: string;
}
export interface PriceFormProps {
  region: VariantRegion;
  initialPrice?: VariantPrice;
  onSave(data: PriceSaveData): void;
  onCancel(): void;
}
export interface OptionChip { option: string; value: string; label: string }
export interface BaseVariantCardProps {
  variant: VariantRecord;
  regions?: VariantRegion[];
  renderOptionValue?: (option: OptionChip) => ReactNode;
}
export interface VariantCardProps extends BaseVariantCardProps {
  onUpdate?: (variant: VariantRecord) => void;
  onDelete?: (variant: VariantRecord) => void;
  showActions?: boolean;
  onAddPrice?: (variantId: string, price: PriceSaveData) => void;
  selectedFilters?: string[];
  onOptionFilter?: (option: string, value: string) => void;
  productImages?: VariantImage[];
}
export interface PendingVariantCardProps extends BaseVariantCardProps {
  onUpdate(variant: VariantRecord): void;
  onDelete?: (variant: VariantRecord) => void;
}
export interface VariantDriftCardProps {
  variantsToCreate: VariantRecord[];
  variantsToDelete: VariantRecord[];
  unchangedVariants: VariantRecord[];
  onRemoveFromCreate(variantId: string): void;
  onRemoveFromDelete(variantId: string): void;
  onSaveChanges(variants: VariantRecord[]): void;
  regions?: VariantRegion[];
}
