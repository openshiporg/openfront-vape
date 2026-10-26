"use client";

import React from "react";
import { GroupRow, type GroupProduct } from "../../product-categories/components/CatalogGroupTable";

interface Collection {
  id: string;
  title: string;
  handle: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  products?: GroupProduct[];
}

interface CollectionDetailsComponentProps {
  collection: Collection;
  list: any;
}

/** One collection as a table row; render inside GroupTable. */
export function CollectionDetailsComponent({ collection }: CollectionDetailsComponentProps) {
  const products = collection.products || [];
  const published = products.some((product) => product.status === "published");
  const status = products.length === 0
    ? { label: "Empty", tone: "muted" as const }
    : published
      ? { label: "Selling", tone: "ok" as const }
      : { label: "Nothing published", tone: "warn" as const };

  return (
    <GroupRow
      listKey="product-collections"
      id={collection.id}
      title={collection.title}
      href={`/dashboard/product-collections/${collection.id}`}
      handle={collection.handle}
      status={status}
      createdAt={collection.createdAt}
      products={products}
    />
  );
}
