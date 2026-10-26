"use client";

import React from "react";
import Link from "next/link";
import { GroupRow, type GroupProduct } from "./CatalogGroupTable";

interface ProductCategory {
  id: string;
  title: string;
  handle?: string;
  isActive?: boolean;
  isInternal?: boolean;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  parentCategory?: {
    id: string;
    title: string;
  };
  products?: GroupProduct[];
}

interface ProductCategoryDetailsComponentProps {
  productcategory: ProductCategory;
  list: any;
}

/** One category as a table row; render inside GroupTable with the "Parent" column. */
export function ProductCategoryDetailsComponent({ productcategory }: ProductCategoryDetailsComponentProps) {
  const status = productcategory.isActive
    ? { label: productcategory.isInternal ? "Active, internal" : "Active", tone: "ok" as const }
    : { label: productcategory.isInternal ? "Inactive, internal" : "Inactive", tone: "muted" as const };

  return (
    <GroupRow
      listKey="product-categories"
      id={productcategory.id}
      title={productcategory.title}
      href={`/dashboard/product-categories/${productcategory.id}`}
      handle={productcategory.handle ? `/${productcategory.handle}` : undefined}
      status={status}
      hasExtraColumn
      extra={
        productcategory.parentCategory ? (
          <Link
            href={`/dashboard/product-categories/${productcategory.parentCategory.id}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {productcategory.parentCategory.title}
          </Link>
        ) : undefined
      }
      createdAt={productcategory.createdAt}
      products={productcategory.products || []}
    />
  );
}
