// Product facts: real fields only, plus the store's age and delivery terms.

type Measurement = {
  type: string;
  value: string | number;
  unit: string;
};

type ProductForTabs = {
  id: string;
  material?: string | null;
  originCountry?: string | null;
  productType?: { value: string } | null;
  productVariants?: { id: string; sku?: string | null; measurements?: Measurement[] | null }[] | null;
  productCollections?: { title?: string | null }[] | null;
  productCategories?: { title?: string | null }[] | null;
};

type ProductTabsProps = {
  product: ProductForTabs | any;
};

const ProductTabs = ({ product }: ProductTabsProps) => {
  const variant = product.productVariants?.[0]
  const measurement = (type: string) => variant?.measurements?.find((m: Measurement) => m.type === type)
  const weight = measurement("weight")
  const length = measurement("length")
  const width = measurement("width")
  const height = measurement("height")

  const rows: [string, string][] = []
  if (product.productCategories?.[0]?.title) rows.push(["Category", product.productCategories[0].title])
  if (product.productCollections?.length) {
    rows.push(["Collection", product.productCollections.map((c: any) => c.title).filter(Boolean).join(", ")])
  }
  if (product.productType?.value) rows.push(["Type", product.productType.value])
  if (product.material) rows.push(["Material", product.material])
  if (product.originCountry) rows.push(["Origin", product.originCountry])
  if (weight) rows.push(["Weight", `${weight.value} ${weight.unit}`])
  if (length && width && height) {
    rows.push(["Dimensions", `${length.value} × ${width.value} × ${height.value} ${height.unit}`])
  }
  rows.push(["Age", "21+ only"])
  rows.push(["Delivery", "Adult signature may be required"])
  rows.push(["Returns", "See the store's returns policy"])

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-medium text-vp-ink">Facts</h2>
      <dl className="vp-band divide-y divide-vp-line px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 py-3">
            <dt className="text-[13px] text-vp-ink-2">{label}</dt>
            <dd className="text-right text-[14px] text-vp-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default ProductTabs
