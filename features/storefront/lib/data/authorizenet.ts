"use server";
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders, getCartId } from "./cookies";
import { updateTag as revalidateTag } from "next/cache";

export async function authorizeCardPaymentSession(sessionId: string, opaqueData: { dataDescriptor: string; dataValue: string }) {
  const cartId = await getCartId(); if (!cartId) throw new Error("Your bag is empty.");
  const mutation = gql`mutation AuthorizeCard($cartId: ID!, $sessionId: ID!, $opaqueData: JSON!) { authorizeCardPaymentSession(cartId: $cartId, sessionId: $sessionId, opaqueData: $opaqueData) }`;
  const result = await openfrontClient.request(mutation, { cartId, sessionId, opaqueData }, await getAuthHeaders());
  revalidateTag("cart"); return result;
}
