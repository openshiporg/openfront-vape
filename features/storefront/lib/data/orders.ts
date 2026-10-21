"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"
import { cache } from "react"

export const retrieveOrder = cache(async function(id: string, secretKey?: string | null) {
  try {
    const query = gql`
      query GetCustomerOrder($id: ID!, $secretKey: String) {
        getCustomerOrder(orderId: $id, secretKey: $secretKey)
      }
    `;

    const { getCustomerOrder } = await openfrontClient.request(
      query,
      { id, secretKey },
      await getAuthHeaders()
    );

    return getCustomerOrder;
  } catch (error) {
    console.error("Error retrieving order:", error);
    return null;
  }
});

export const listCustomerOrders = cache(async function(limit: number = 10, offset: number = 0) {
  try {
    const { getCustomerOrders } = await openfrontClient.request(
      gql`
        query GetCustomerOrders($limit: Int, $offset: Int) {
          getCustomerOrders(limit: $limit, offset: $offset)
        }
      `,
      { limit, offset },
      await getAuthHeaders()
    );

    return getCustomerOrders;
  } catch (error) {
    console.error("Error listing orders:", error);
    return null;
  }
});

const TRANSFER_UNAVAILABLE_ERROR = "Order transfers are not available.";

export async function acceptTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  void id;
  void token;
  return { success: false, error: TRANSFER_UNAVAILABLE_ERROR };
}

export async function declineTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  void id;
  void token;
  return { success: false, error: TRANSFER_UNAVAILABLE_ERROR };
}

export async function createTransferRequest(
  prevState: { success: boolean; error: string | null; order?: { id: string; email: string } | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null; order?: { id: string; email: string } | null }> {
  void prevState;
  void formData;
  return { success: false, error: TRANSFER_UNAVAILABLE_ERROR, order: null };
}
