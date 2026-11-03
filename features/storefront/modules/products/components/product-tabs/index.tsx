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
    <section className="deneb-facts" aria-labelledby="deneb-facts-title">
      <h2 id="deneb-facts-title">Facts</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default ProductTabs
