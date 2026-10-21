"use server";

import { gql } from "graphql-request";
import { getProductByHandle } from "./data/products";
import { listRegions } from "./data/regions";
import { openfrontClient } from "./config";
import { getCartId, getAuthHeaders } from "./data/cookies";

// Simplified data functions for server-side prefetching

export async function fetchProducts(params: {
  categoryId?: string;
  collectionId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  countryCode?: string;
} = {}) {
  const { categoryId, collectionId, limit = 12, offset = 0, search, countryCode } = params;

  const PRODUCTS_QUERY = gql`
    query GetProducts($take: Int!, $skip: Int!, $where: ProductWhereInput) {
      products(take: $take, skip: $skip, where: $where, orderBy: { createdAt: desc }) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          sku
          prices {
            id
            amount
            currency {
              code
            }
          }
        }
      }
      productsCount(where: $where)
    }
  `;

  const whereClause: Record<string, unknown> = {};
  if (search?.trim()) whereClause.title = { contains: search.trim().slice(0, 80), mode: 'insensitive' };
  if (countryCode) {
    if (!/^[a-z]{2}$/i.test(countryCode)) return { products: [], count: 0 };
    whereClause.productVariants = { some: { prices: { some: { region: { countries: { some: { iso2: { equals: countryCode.toLowerCase() } } } } } } } };
  }

  if (categoryId) {
    whereClause.productCategories = {
      some: { id: { equals: categoryId } }
    };
  }

  if (collectionId) {
    whereClause.productCollections = {
      some: { id: { equals: collectionId } }
    };
  }

  try {
    const { products, productsCount } = await openfrontClient.request(
      PRODUCTS_QUERY,
      {
        take: Number.isSafeInteger(limit) ? Math.min(100, Math.max(1, limit)) : 12,
        skip: Number.isSafeInteger(offset) ? Math.max(0, offset) : 0,
        where: whereClause
      }
    );

    return {
      products: products || [],
      count: productsCount || 0
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], count: 0 };
  }
}

export async function fetchProductByHandle(handle: string, countryCode?: string) {
  const { regions } = await listRegions();
  const region = countryCode ? regions?.find((item: { countries?: Array<{ iso2: string }> }) => item.countries?.some(country => country.iso2 === countryCode.toLowerCase())) : regions?.[0];
  if (!region) return null;
  return getProductByHandle({ handle, regionId: region.id });
}

export async function fetchCart() {
  try {
    const cartId = await getCartId();
    if (!cartId) return null;

    const CART_QUERY = gql`
      query GetCart($cartId: ID!) {
        activeCart(cartId: $cartId)
      }
    `;

    const { activeCart } = await openfrontClient.request(
      CART_QUERY,
      { cartId },
      await getAuthHeaders()
    );

    return activeCart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function fetchUser() {
  try {
    const headers = await getAuthHeaders();
    const { authenticatedItem } = await openfrontClient.request(
      gql`
        query GetAuthenticatedItem {
          authenticatedItem {
            ... on User {
              id
              email
              firstName
              lastName
              phone
              billingAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                country {
                  id
                  iso2
                  name
                }
                phone
              }
            }
          }
        }
      `,
      {},
      headers
    );
    return authenticatedItem;
  } catch (error) {
    return null;
  }
}

export async function fetchCollections() {
  const COLLECTIONS_QUERY = gql`
    query GetCollections {
      productCollections {
        id
        title
        handle
      }
    }
  `;

  try {
    const { productCollections } = await openfrontClient.request(COLLECTIONS_QUERY);
    return productCollections || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function fetchCategories() {
  const CATEGORIES_QUERY = gql`
    query GetCategories {
      productCategories {
        id
        title
        handle
        isActive
      }
    }
  `;

  try {
    const { productCategories } = await openfrontClient.request(CATEGORIES_QUERY);
    return productCategories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
