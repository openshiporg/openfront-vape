"use server";

import { cookies } from "next/headers";
import { updateTag as revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders, getCartId, setCartId, removeCartId, setAuthToken } from "./cookies";
import { redirect } from "next/navigation";
import { getUser } from "./user";
import { normalizeProvince, US_STATE_REQUIRED_ERROR } from "../util/us-states";
import type { AddressCreateInput } from ".keystone/types";
import { requireUpdatedCartAddresses } from "./cart-address-update-result";
import { requireUpdatedCartRegion } from "./cart-region-update-result";
import { requireConfirmedCartLineItemUpdate } from "./cart-line-item-update-result";
import {
  requireUniqueCartRegionId,
  shippingCountryAllowedInCartRegion,
  submittedShippingAddressMatchesSaved,
} from "./address-update-validation";
import { requireConfirmedShippingSelection } from "./shipping-update-result";
import { checkoutErrorMessage } from "./compliance";

const CART_QUERY = gql`
  query GetCart($cartId: ID!) {
    activeCart(cartId: $cartId)
  }
`;

export async function retrieveCart() {
  const cartId = await getCartId();
  if (!cartId) return null;

  let activeCart: any;
  try {
    ({ activeCart } = await openfrontClient.request(
      CART_QUERY,
      { cartId },
      await getAuthHeaders()
    ));
  } catch {
    // Expired, signed-out, or otherwise unauthorized proofs are stale browser
    // state, not a storefront-wide rendering failure.
    await removeCartId();
    return null;
  }

  if (!activeCart) {
    // A completed, expired or foreign cart reference starts a fresh cart.
    await removeCartId();
    return null;
  }

  // Transform line items to match CartDropdown interface
  const transformedCart = {
    ...activeCart,
    lineItems: activeCart.lineItems?.map((item: any) => ({
      ...item,
      created_at: item.createdAt || item.created_at,
      variantTitle: item.productVariant?.title,
    })) || [],
  };

  return transformedCart;
}

export async function retrieveCartById(cartId: string) {
  if (!cartId) return null;

  const { activeCart } = await openfrontClient.request(
    CART_QUERY,
    { cartId },
    await getAuthHeaders()
  );

  return activeCart;
}

export async function getCart(cartId: string) {
  const GET_CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId)
    }
  `;

  const headers = await getAuthHeaders();
  const { activeCart } = await openfrontClient.request(
    GET_CART_QUERY,
    { cartId },
    headers
  );

  return activeCart;
}

export async function createCart(data: Record<string, any> = {}) {
  const CREATE_CART_MUTATION = gql`
    mutation CreateCart($data: CartCreateInput!) {
      createCart(data: $data) {
        id
        email
        type
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            product {
              thumbnail
              title
            }
            prices {
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(CREATE_CART_MUTATION, { data }, headers);
}

export async function addItem({ cartId, variantId, quantity }: { cartId: string, variantId: string, quantity: number }) {
  const ADD_ITEM_MUTATION = gql`
    mutation AddItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            create: [
              {
                productVariant: { connect: { id: $variantId } }
                quantity: $quantity
              }
            ]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    ADD_ITEM_MUTATION,
    {
      cartId,
      data: {
        lineItems: {
          create: [
            {
              productVariant: { connect: { id: variantId } },
              quantity,
            },
          ],
        },
      },
    },
    headers
  );
}

export async function updateItem({ cartId, lineId, quantity }: { cartId: string, lineId: string, quantity: number }) {
  const UPDATE_ITEM_MUTATION = gql`
    mutation UpdateItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            update: [{ where: { id: $lineId }, data: { quantity: $quantity } }]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    UPDATE_ITEM_MUTATION,
    {
      cartId,
      data: {
        lineItems: {
          update: [{ where: { id: lineId }, data: { quantity } }],
        },
      },
    },
    headers
  );
}

export async function removeItem({ cartId, lineId }: { cartId: string, lineId: string }) {
  const REMOVE_ITEM_MUTATION = gql`
    mutation RemoveItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: { lineItems: { delete: [{ id: $lineId }] } }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    REMOVE_ITEM_MUTATION,
    {
      cartId,
      data: { lineItems: { delete: [{ id: lineId }] } },
    },
    headers
  );
}

export async function updateCartItems(cartId: string, lineItems: any) {
  const UPDATE_CART_ITEMS_MUTATION = gql`
    mutation UpdateCartItems($id: ID!, $data: CartUpdateInput!) {
      updateCart(where: { id: $id }, data: { lineItems: $data }) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    UPDATE_CART_ITEMS_MUTATION,
    {
      id: cartId,
      data: { lineItems },
    },
    headers
  );
}

export async function deleteDiscount(cartId: string, code: string) {
  const DELETE_DISCOUNT_MUTATION = gql`
    mutation DeleteDiscount($cartId: ID!, $code: String!) {
      removeCartDiscount(where: { id: $cartId, code: $code }) {
        id
        discounts {
          id
          code
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    DELETE_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function createPaymentSessions(cartId: string | null) {
  if (!cartId) return null;

  return openfrontClient.request(
    gql`
      mutation CreatePaymentSessions($cartId: ID!) {
        createActiveCartPaymentSessions(cartId: $cartId) {
          id
          paymentSessions {
            id
            paymentProvider {
              id
              code
            }
          }
        }
      }
    `,
    { cartId },
    await getAuthHeaders()
  );
}

export async function setPaymentSession({ cartId, providerId }: { cartId: string, providerId: string }) {
  const SET_PAYMENT_SESSION_MUTATION = gql`
    mutation SetPaymentSession($cartId: ID!, $providerId: ID!) {
      setCartPaymentSession(where: { id: $cartId }, providerId: $providerId) {
        id
        paymentSessions {
          id
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    SET_PAYMENT_SESSION_MUTATION,
    {
      cartId,
      providerId,
    },
    headers
  );
}

export async function completeCart(cartId: string) {
  const COMPLETE_CART_MUTATION = gql`
    mutation CompleteCart($cartId: ID!) {
      completeCart(where: { id: $cartId }) {
        id
        status
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(COMPLETE_CART_MUTATION, { cartId }, headers);
}

export async function addShippingMethod({ cartId, shippingMethodId }: { cartId: string, shippingMethodId: string }) {
  const ADD_SHIPPING_METHOD_MUTATION = gql`
    mutation AddShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
      addCartShippingMethod(
        where: { id: $cartId }
        shippingMethodId: $shippingMethodId
      ) {
        id
        shippingMethods {
          id
          name
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    ADD_SHIPPING_METHOD_MUTATION,
    {
      cartId,
      shippingMethodId,
    },
    headers
  );
}

export async function addDiscountToCart(cartId: string | null, code: string) {
  if (!cartId) return null;

  const ADD_DISCOUNT_MUTATION = gql`
    mutation AddDiscountToActiveCart($cartId: ID!, $code: String!) {
      addDiscountToActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
          discountRule {
            type
            value
          }
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    ADD_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function removeDiscountFromCart(cartId: string | null, code: string) {
  if (!cartId) return null;

  const REMOVE_DISCOUNT_MUTATION = gql`
    mutation RemoveDiscountFromActiveCart($cartId: ID!, $code: String!) {
      removeDiscountFromActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
        }
      }
    }
  `;

  const headers = await getAuthHeaders();
  return openfrontClient.request(
    REMOVE_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function getOrSetCart(countryCode: string) {
  let cartId = await getCartId();
  let cart = null;
  const headers = await getAuthHeaders();

  // Try to get cart if we have an ID
  if (cartId) {
    try {
      const result = await openfrontClient.request(CART_QUERY, { cartId }, headers);
      cart = result?.activeCart;

      // If cart doesn't exist in DB, remove the cookie
      if (!cart) {
        await removeCartId();
        cartId = undefined;
      }
    } catch (error: unknown) {
      // If there's an error (like invalid ID), remove the cookie
      console.error("Error retrieving cart:", error instanceof Error ? error.message : String(error));
      await removeCartId();
      cartId = undefined;
    }
  }

  // Get region ID for country code
  const { regions } = await openfrontClient.request(
    gql`
      query GetRegion($code: String!) {
        regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
          id
        }
      }
    `,
    { code: countryCode },
    headers
  );

  const regionId = requireUniqueCartRegionId(regions);

  // If no cart exists or was invalid, create one
  if (!cart) {
    const { createCart: newCart } = await openfrontClient.request(
      gql`
        mutation CreateCart($data: CartCreateInput!) {
          createCart(data: $data) {
            id
            region {
              id
            }
          }
        }
      `,
      {
        data: {
          region: { connect: { id: regionId } }
        }
      },
      headers
    );

    cart = newCart;
    await setCartId(cart.id);
    revalidateTag("cart");
  }
  // If cart exists but region changed, update it
  else if (cart.region?.id !== regionId) {
    const regionUpdateResult = await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            region { id }
          }
        }
      `,
      {
        cartId: cart.id,
        data: {
          region: { connect: { id: regionId } }
        }
      },
      headers
    );
    requireUpdatedCartRegion(regionUpdateResult, { cartId: cart.id, regionId });

    const refreshedResult = await openfrontClient.request(CART_QUERY, { cartId: cart.id }, await getAuthHeaders());
    const refreshedCart = refreshedResult?.activeCart;
    if (refreshedCart?.id !== cart.id || refreshedCart?.region?.id !== regionId) {
      throw new Error("Unable to confirm the cart region update");
    }
    cart = refreshedCart;
    revalidateTag("cart");
  }

  return cart;
}

export async function addToCart({ variantId, quantity, countryCode }: { variantId: string, quantity: number, countryCode: string }) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart");
  }

  const cart = await getOrSetCart(countryCode);
  if (!cart) {
    throw new Error("Error retrieving or creating cart");
  }

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            lineItems {
              id
              quantity
            }
          }
        }
      `,
      {
        cartId: cart.id,
        data: {
          lineItems: {
            create: [
              {
                productVariant: { connect: { id: variantId } },
                quantity,
              },
            ],
          },
        },
      },
      await getAuthHeaders()
    );
    revalidateTag("cart");
  } catch (error) {
    console.error("Error adding to cart:", error instanceof Error ? error.message : String(error));
    return error instanceof Error ? error.message : String(error);
  }
}

export async function updateLineItem({ lineId, quantity }: { lineId: string, quantity: number }) {
  const cartId = await getCartId();
  if (!cartId) return "No cartId cookie found";

  try {
    const result = await openfrontClient.request(
      gql`
        mutation UpdateLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
          updateActiveCartLineItem(
            cartId: $cartId
            lineId: $lineId
            quantity: $quantity
          ) {
            id
            lineItems {
              id
              quantity
              title
              unitPrice
              originalPrice
              total
              productVariant {
                id
                title
                product {
                  id
                  title
                  thumbnail
                  handle
                }
              }
            }
          }
        }
      `,
      {
        cartId,
        lineId,
        quantity,
      },
      await getAuthHeaders()
    );
    requireConfirmedCartLineItemUpdate(result, { cartId, lineId, quantity });

    revalidateTag("cart");
  } catch (error) {
    revalidateTag("cart");
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error updating line item:", message);
    return message || "Unable to confirm the cart quantity update";
  }
}

export async function deleteLineItem(lineId: string) {
  const cartId = await getCartId();
  if (!cartId) return "No cart ID found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            lineItems {
              id
            }
          }
        }
      `,
      {
        cartId,
        data: {
          lineItems: {
            disconnect: [{ id: lineId }],
          },
        },
      },
      await getAuthHeaders()
    );

    revalidateTag("cart");
  } catch (error) {
    console.error("Error deleting line item:", error instanceof Error ? error.message : String(error));
    return error instanceof Error ? error.message : String(error);
  }
}

export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId();

  // Always revalidate regions and products, and redirect - even without a cart
  revalidateTag("regions");
  revalidateTag("products");

  // Only update cart if it exists
  if (cartId) {
    try {
      const { regions } = await openfrontClient.request(
        gql`
          query GetRegion($code: String!) {
            regions(
              where: { countries: { some: { iso2: { equals: $code } } } }
            ) {
              id
            }
          }
        `,
        { code: countryCode }
      );

      const regionId = regions[0]?.id;
      if (!regionId) {
        throw new Error(`No region found for country: ${countryCode}`);
      }

      await openfrontClient.request(
        gql`
          mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
            updateActiveCart(cartId: $cartId, data: $data) {
              id
            }
          }
        `,
        {
          cartId,
          data: {
            region: { connect: { id: regionId } },
          },
        },
        await getAuthHeaders()
      );

      revalidateTag("cart");
    } catch (error) {
      console.error("Error updating region:", error);
      throw error;
    }
  }

  redirect(`/${countryCode}${currentPath}`);
}

export async function updateCart(data: Record<string, any>) {
  const cartId = await getCartId();
  if (!cartId) return "No cart ID found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
          }
        }
      `,
      {
        cartId,
        data,
      },
      await getAuthHeaders()
    );

    revalidateTag("cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

export async function cartUpdate(data: Record<string, any>) {
  const cartId = await getCartId();

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(data);
    revalidateTag("cart");
  } catch (error) {
    console.error("Error in cartUpdate:", error instanceof Error ? error.message : String(error));
    return error instanceof Error ? error.message : String(error);
  }
}

export async function applyDiscount(code: string) {
  const cartId = await getCartId();

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart({ discounts: [{ code }] }).then(() => {
      revalidateTag("cart");
      revalidateTag("checkout");
    });
  } catch (error) {
    throw error;
  }
}

export async function applyGiftCard(code: string) {
  const cartId = await getCartId();

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart({ giftCards: [{ code }] }).then(() => {
      revalidateTag("cart");
      revalidateTag("checkout");
    });
  } catch (error) {
    throw error;
  }
}

function discountErrorMessage(error: any, fallback: string) {
  // Check for originalError message first (Keystone wraps errors with "Unexpected error")
  if (error?.response?.errors?.[0]?.extensions?.originalError?.message) {
    return error.response.errors[0].extensions.originalError.message;
  }
  // GraphQL errors from graphql-request come as ClientError with response.errors
  if (error?.response?.errors?.[0]?.message && error.response.errors[0].message !== "Unexpected error.") {
    return error.response.errors[0].message;
  }
  return error instanceof Error ? error.message : fallback;
}

export async function removeDiscount(code: string) {
  const cartId = await getCartId();

  if (!cartId) return "No cartId cookie found";

  try {
    await removeDiscountFromCart(cartId, code);
    revalidateTag("cart");
    return null;
  } catch (error: any) {
    return discountErrorMessage(error, "Failed to remove discount code");
  }
}

export async function removeGiftCard(code: string) {
  const cartId = await getCartId();

  if (!cartId) return "No cartId cookie found";

  try {
    await Promise.resolve().then(() => {
      revalidateTag("cart");
    });
  } catch (error) {
    throw error;
  }
}

export async function submitDiscountForm(prevState: any, formData: FormData) {
  const cartId = await getCartId();
  const code = formData.get("code") as string;

  if (!code) {
    return "Code is required";
  }

  if (!cartId) {
    return "No cart found";
  }

  try {
    await addDiscountToCart(cartId, code);
    revalidateTag("cart");
    return null;
  } catch (error: any) {
    return discountErrorMessage(error, "Failed to apply discount code");
  }
}

export async function submitGiftCard(code: string) {
  const cartId = await getCartId();
  if (!cartId) return "No cartId cookie found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            giftCards {
              id
              code
              balance
            }
          }
        }
      `,
      {
        cartId,
        data: {
          giftCards: {
            connect: [{ code }],
          },
        },
      },
      await getAuthHeaders()
    );

    revalidateTag("cart");
  } catch (error) {
    console.error("Error submitting gift card:", error instanceof Error ? error.message : String(error));
    return error instanceof Error ? error.message : String(error);
  }
}

const UPDATE_CART_MUTATION = gql`
  mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
    updateActiveCart(cartId: $cartId, data: $data) {
      id
      region { id countries { iso2 } }
      shippingAddress {
        id
        firstName
        lastName
        address1
        city
        country {
          id
          iso2
          displayName
        }
      }
      billingAddress {
        id
        firstName
        lastName
        address1
        city
        country {
          id
          iso2
          displayName
        }
      }
    }
  }
`;

export async function setAddresses(currentState: any, formData: FormData) {
  if (!formData) return "No form data received";

  const cartId = await getCartId();
  if (!cartId) return { message: "No cartId cookie found" };

  let cartRegionCountries: unknown;
  try {
    const { activeCart } = await openfrontClient.request(
      gql`
        query CartAddressRegion($cartId: ID!) {
          activeCart(cartId: $cartId)
        }
      `,
      { cartId },
      await getAuthHeaders()
    );
    if (activeCart?.id !== cartId || !activeCart.region?.id || !Array.isArray(activeCart.region.countries)) {
      return "Unable to confirm the shipping region. Please try again.";
    }
    cartRegionCountries = activeCart.region.countries.map((country: any) => country?.iso2);
  } catch {
    return "Unable to confirm the shipping region. Please try again.";
  }

  const selectedAddressId = formData.get("selectedAddressId");
  const sameAsBilling = formData.get("same_as_billing") === "on";
  const email = formData.get("email");

  const data: {
    email: FormDataEntryValue | null
    shippingAddress?: { connect: { id: any } }
    billingAddress?: { connect: { id: any } }
  } = { email }

  // Resolve a saved-address selection from server-owned account data, never from the hidden form flag.
  const user = await getUser();
  let addressOwnerId = user?.id;
  const submittedShippingAddress = {
    firstName: formData.get("shippingAddress.firstName"),
    lastName: formData.get("shippingAddress.lastName"),
    company: formData.get("shippingAddress.company"),
    address1: formData.get("shippingAddress.address1"),
    city: formData.get("shippingAddress.city"),
    province: formData.get("shippingAddress.province"),
    postalCode: formData.get("shippingAddress.postalCode"),
    phone: formData.get("shippingAddress.phone"),
    countryCode: formData.get("shippingAddress.countryCode"),
  };
  const selectedAddress = typeof selectedAddressId === "string" && selectedAddressId
    ? user?.addresses?.find((address: any) => address.id === selectedAddressId)
    : undefined;
  if (selectedAddressId && !selectedAddress) {
    return "The selected address is unavailable. Please choose or enter an address.";
  }
  const reuseSelectedAddress = Boolean(
    selectedAddress && submittedShippingAddressMatchesSaved(selectedAddress, submittedShippingAddress),
  );
  const shippingCountryCode = reuseSelectedAddress
    ? selectedAddress?.country?.iso2
    : submittedShippingAddress.countryCode;
  if (
    typeof shippingCountryCode !== "string" ||
    !shippingCountryAllowedInCartRegion(cartRegionCountries, shippingCountryCode)
  ) {
    return "Please choose a shipping address in the selected region.";
  }

  // US addresses carry the two-letter state code the compliance engine matches on.
  const shippingProvince = reuseSelectedAddress
    ? null
    : normalizeProvince(shippingCountryCode, submittedShippingAddress.province);
  if (!reuseSelectedAddress && shippingProvince === null) return US_STATE_REQUIRED_ERROR;
  const billingProvince = sameAsBilling
    ? null
    : normalizeProvince(formData.get("billingAddress.countryCode"), formData.get("billingAddress.province"));
  if (!sameAsBilling && !reuseSelectedAddress && billingProvince === null) return US_STATE_REQUIRED_ERROR;

  // Reuse a saved address only when its server-owned fields still match the submission.
  if (reuseSelectedAddress && selectedAddress) {
    data.shippingAddress = {
      connect: { id: selectedAddressId },
    };

    if (sameAsBilling) {
      data.billingAddress = {
        connect: { id: selectedAddressId },
      };
    }
  } else {
    // Either no address was selected or fields were modified - create new address
    const shippingAddress: {
      firstName: FormDataEntryValue | null;
      lastName: FormDataEntryValue | null;
      address1: FormDataEntryValue | null;
      address2: string;
      company: FormDataEntryValue | null;
      postalCode: FormDataEntryValue | null;
      city: FormDataEntryValue | null;
      province: FormDataEntryValue | null;
      phone: FormDataEntryValue | null;
      country: {
        connect: {
          iso2: FormDataEntryValue | null;
        };
      };
      user?: any;
    } = {
      firstName: formData.get("shippingAddress.firstName"),
      lastName: formData.get("shippingAddress.lastName"),
      address1: formData.get("shippingAddress.address1"),
      address2: "",
      company: formData.get("shippingAddress.company"),
      postalCode: formData.get("shippingAddress.postalCode"),
      city: formData.get("shippingAddress.city"),
      province: shippingProvince,
      phone: formData.get("shippingAddress.phone"),
      country: {
        connect: {
          iso2: formData.get("shippingAddress.countryCode"),
        },
      },
    };

    // If user is authenticated, create address with user connection
    if (user) {
      shippingAddress.user = { connect: { id: user.id } };
    } else {
      // For guest users, create user first, sign them in, then connect to address
      try {
        const randomPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const { createUser: guestUser } = await openfrontClient.request(
          gql`
            mutation CreateGuestUser($data: UserCreateInput!) {
              createUser(data: $data) {
                id
                email
                hasAccount
              }
            }
          `,
          {
            data: {
              email,
              hasAccount: false,
              name: `${formData.get("shippingAddress.firstName")} ${formData.get("shippingAddress.lastName")}`,
              password: randomPassword,
            }
          }
        );

        addressOwnerId = guestUser.id;

        // Sign in the guest user to get a session
        const { authenticateUserWithPassword } = await openfrontClient.request(
          gql`
            mutation AuthenticateGuestUser($email: String!, $password: String!) {
              authenticateUserWithPassword(email: $email, password: $password) {
                ... on UserAuthenticationWithPasswordSuccess {
                  sessionToken
                  item {
                    id
                    email
                  }
                }
                ... on UserAuthenticationWithPasswordFailure {
                  message
                  __typename
                }
              }
            }
          `,
          { email, password: randomPassword }
        );

        if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
          throw new Error("Authentication failed. Please try again or contact support.");
        }

        // Set the auth token for the guest user session
        if (authenticateUserWithPassword.sessionToken) {
          await setAuthToken(authenticateUserWithPassword.sessionToken);
          revalidateTag("customer");
          revalidateTag("auth");
        }
        shippingAddress.user = { connect: { id: addressOwnerId } };
      } catch (error) {
        console.error("Guest account setup failed");

        // Check if this is a unique constraint error (user already exists)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStr = JSON.stringify(error).toLowerCase();

        if (errorMessage.includes('Unique constraint') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            errorMessage.toLowerCase().includes('unique') ||
            errorStr.includes('unique constraint') ||
            errorStr.includes('duplicate') ||
            errorStr.includes('email_unique') ||
            (error as any)?.code === 'P2002') {
          return "This email address already has an account. Please use a different email or sign in to continue with your order.";
        }

        return "Unable to prepare checkout. Please try again.";
      }
    }

    // Create shipping address first
    try {
      const { createAddress: newShippingAddress } =
        await openfrontClient.request(
          gql`
            mutation CreateAddress($data: AddressCreateInput!) {
              createAddress(data: $data) {
                id
                user {
                  id
                }
                country {
                  id
                  iso2
                  displayName
                }
              }
            }
          `,
          {
            data: shippingAddress,
          },
          await getAuthHeaders()
        );

      data.shippingAddress = {
        connect: { id: newShippingAddress.id },
      };

      if (sameAsBilling) {
        data.billingAddress = {
          connect: { id: newShippingAddress.id },
        };
      } else {
        const billingText = (key: string) => {
          const value = formData.get(`billingAddress.${key}`);
          return typeof value === "string" ? value : "";
        };
        const billingAddress: AddressCreateInput = {
          firstName: billingText("firstName"),
          lastName: billingText("lastName"),
          address1: billingText("address1"),
          address2: "",
          company: billingText("company"),
          postalCode: billingText("postalCode"),
          city: billingText("city"),
          province: billingProvince ?? "",
          phone: billingText("phone"),
          country: { connect: { iso2: billingText("countryCode") } },
          ...(addressOwnerId ? { user: { connect: { id: addressOwnerId } } } : {}),
        };

        const { createAddress: newBillingAddress } =
          await openfrontClient.request(
            gql`
              mutation CreateAddress($data: AddressCreateInput!) {
                createAddress(data: $data) {
                  id
                  user {
                    id
                  }
                  country {
                    id
                    iso2
                    displayName
                  }
                }
              }
            `,
            {
              data: billingAddress,
            },
            await getAuthHeaders()
          );

        data.billingAddress = {
          connect: { id: newBillingAddress.id },
        };
      }
    } catch {
      console.error("Address creation failed");
      return "Unable to save the address. Please review and try again.";
    }
  }

  let confirmedCountryCode = "";
  try {
    // Always get fresh auth headers since we may have just set a guest user token
    const authHeaders = await getAuthHeaders();

    const cartUpdateResult = await openfrontClient.request(
      UPDATE_CART_MUTATION,
      {
        cartId,
        data,
      },
      authHeaders
    );
    confirmedCountryCode = requireUpdatedCartAddresses(cartUpdateResult, {
      cartId,
      shippingAddressId: data.shippingAddress?.connect.id,
      shippingCountryCode,
      ...(data.billingAddress ? { billingAddressId: data.billingAddress.connect.id } : {}),
    });

    revalidateTag("cart");
    revalidateTag("customer");
    revalidateTag("auth");
  } catch {
    console.error("Cart address update failed");
    return "Unable to update the cart addresses. Please review and try again.";
  }
  // Return only the country confirmed by the cart/address mutation response.
  return { success: true, countryCode: confirmedCountryCode };
}

export async function setShippingMethod(shippingOptionId: string) {
  const cartId = await getCartId();

  if (!cartId) throw new Error("No cartId cookie found");

  try {
    const result = await openfrontClient.request(
      gql`
        mutation AddShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
          addActiveCartShippingMethod(
            cartId: $cartId
            shippingMethodId: $shippingMethodId
          ) {
            id
            shippingMethods {
              id
              price
              shippingOption {
                id
                name
              }
            }
          }
        }
      `,
      {
        cartId,
        shippingMethodId: shippingOptionId,
      },
      await getAuthHeaders()
    );
    requireConfirmedShippingSelection(result, { cartId, shippingOptionId });

    revalidateTag("cart");
  } catch (error) {
    throw error;
  }
}

export async function setPaymentMethod(providerId: string) {
  const cartId = await getCartId();

  if (!cartId) throw new Error("No cartId cookie found");

  try {
    const cart = await setPaymentSession({ cartId, providerId });
    revalidateTag("cart");
    return cart;
  } catch (error) {
    throw error;
  }
}

export async function placeOrder(paymentSessionId?: string) {
  const cartId = await getCartId();
  if (!cartId) throw new Error("No cartId cookie found");

  try {
    const { completeActiveCart } = await openfrontClient.request(
      gql`
        mutation CompleteActiveCart($cartId: ID!, $paymentSessionId: ID) {
          completeActiveCart(cartId: $cartId, paymentSessionId: $paymentSessionId)
        }
      `,
      {
        cartId,
        paymentSessionId,
      },
      await getAuthHeaders()
    );

    if (completeActiveCart?.id) {
      // Remove cart cookie after successful order
      await removeCartId();
      revalidateTag("cart");

      // Return redirect info for client-side redirect
      const countryCode = completeActiveCart.shippingAddress?.country?.iso2?.toLowerCase();
      if (!countryCode) {
        throw new Error("No country code found in completed order");
      }

      // Add secretKey to URL if it exists (for non-logged-in users)
      const secretKeyParam = completeActiveCart.secretKey ?
        `?secretKey=${completeActiveCart.secretKey}` : '';

      return {
        success: true,
        redirectTo: `/${countryCode}/order/confirmed/${completeActiveCart.id}${secretKeyParam}`
      };
    }

    return completeActiveCart;
  } catch (error) {
    // Regulated denials and payment failures come back as customer lines, not raw GraphQL text.
    return { success: false as const, error: await checkoutErrorMessage(error) };
  }
}
