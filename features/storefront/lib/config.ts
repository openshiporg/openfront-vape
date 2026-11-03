/**
 * GraphQL client for storefront
 * Uses dynamic endpoint resolution like the dashboard
 */

import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { getServerGraphQLTarget } from './getBaseUrl';

class OpenfrontClient {
  // One client per request: the loopback target signs the CURRENT visitor's address, so a client
  // (or its signature source) must never be shared across visitors.
  private async getClient(sourceHeaders?: { get(name: string): string | null } | null): Promise<GraphQLClient> {
    const { endpoint, fetch: internalFetch } = await getServerGraphQLTarget(sourceHeaders);
    return new GraphQLClient(endpoint, {
      credentials: 'include',
      headers: {
        'Connection': 'keep-alive',
      },
      timeout: 120000,
      ...(internalFetch ? { fetch: internalFetch } : {}),
    });
  }

  async request<T = any, V extends Variables = Variables>(
    document: RequestDocument,
    variables?: V,
    requestHeaders?: HeadersInit,
    /** The incoming request, when `next/headers` is unavailable (middleware). */
    sourceHeaders?: { get(name: string): string | null } | null
  ): Promise<T> {
    const client = await this.getClient(sourceHeaders);
    return await client.request(document, variables, requestHeaders);
  }
}

export const openfrontClient = new OpenfrontClient();
