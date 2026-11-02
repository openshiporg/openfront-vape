import { Prisma } from "@prisma/client";

interface GetProductsSortedByPriceArgs {
  countryCode: string;
  limit: number;
  offset: number;
  priceOrder: string;
  collectionId?: string;
  categoryId?: string;
}

export default async function getProductsSortedByPrice(
  _root: unknown,
  { countryCode, limit = 12, offset = 0, priceOrder, collectionId, categoryId }: GetProductsSortedByPriceArgs,
  context: any,
) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) {
    throw new Error("Pagination must use a limit of 1–100 and an offset of 0–100000");
  }
  if (typeof countryCode !== "string" || !/^[a-z]{2}$/i.test(countryCode)) {
    throw new Error("A two-letter country code is required");
  }
  if (!["asc", "desc"].includes(priceOrder)) throw new Error("Invalid price ordering");
  for (const id of [collectionId, categoryId]) {
    if (id !== undefined && id !== null && (typeof id !== "string" || id.length > 200)) {
      throw new Error("Invalid catalog filter");
    }
  }
  const prisma = context.prisma;
  const region = await prisma.region.findFirst({
    where: { countries: { some: { iso2: countryCode.toLowerCase() } } },
    select: { id: true },
  });
  if (!region) return { products: [], count: 0 };

  // This public read deliberately uses Prisma for a price aggregate, but only
  // published products may be selected. Every caller-supplied value is a SQL
  // parameter; only these two server-owned ordering fragments are executable SQL.
  const direction = priceOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const collection = collectionId ? Prisma.sql`AND EXISTS (
    SELECT 1 FROM "_Product_productCollections" relation
    WHERE relation."A" = p."id" AND relation."B" = ${collectionId}
  )` : Prisma.empty;
  const category = categoryId ? Prisma.sql`AND EXISTS (
    SELECT 1 FROM "_Product_productCategories" relation
    WHERE relation."A" = p."id" AND relation."B" = ${categoryId}
  )` : Prisma.empty;
  const from = Prisma.sql`
    FROM "Product" p
    JOIN "ProductVariant" pv ON pv."product" = p."id"
    JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = ${region.id} AND p."status" = 'published'
    ${collection} ${category}`;
  const rows: Array<{ id: string }> = await prisma.$queryRaw(Prisma.sql`
    SELECT p."id", MIN(ma."amount") AS min_price ${from}
    GROUP BY p."id" ORDER BY min_price ${direction}, p."id" ASC
    LIMIT ${limit} OFFSET ${offset}`);
  const counts: Array<{ count: bigint }> = await prisma.$queryRaw(Prisma.sql`
    SELECT COUNT(DISTINCT p."id") AS count ${from}`);
  const products = rows.length ? await prisma.product.findMany({
    where: { id: { in: rows.map(row => row.id) }, status: "published" },
  }) : [];
  const byId = new Map(products.map((product: any) => [product.id, product]));
  return { products: rows.map(row => byId.get(row.id)).filter(Boolean), count: Number(counts[0]?.count ?? 0) };
}
