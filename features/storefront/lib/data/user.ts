"use server";
// Existing action call sites retain their local name; Next 16 immediate action invalidation is updateTag.
import { updateTag, revalidatePath } from "next/cache";
import { accountActionError } from "../util/openfront-error";
import { normalizeProvince, US_STATE_REQUIRED_ERROR } from "../util/us-states";

function revalidateTag(tag: string) {
  updateTag(tag);
  // graphql-request does not attach Next cache tags; invalidate the viewed tree too.
  if (tag === "customer") revalidatePath("/[countryCode]/account", "layout");
}
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { redirect } from "next/navigation";
import {
  getAuthHeaders,
  removeAuthToken,
  removeCartId,
  setAuthToken,
  setCartId,
} from "@/features/storefront/lib/data/cookies";
import {
  CreateCustomerData,
  UpdateCustomerData,
  AddShippingAddressData,
  UpdateShippingAddressData,
} from "../../types/storefront";
import { cache } from "react";

export async function getUser() {
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
              tokenGeneratedAt
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
              addresses(orderBy: [{ isBilling: desc }]) {
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
                isBilling
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

export async function authenticate({ email, password }: { email: string, password: string }) {
  const headers = await getAuthHeaders();
  const { authenticateUserWithPassword } = await openfrontClient.request(
    gql`
      mutation Authenticate($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            item {
              id
            }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    { email, password },
    headers
  );

  if (
    authenticateUserWithPassword.__typename ===
    "UserAuthenticationWithPasswordFailure"
  ) {
    throw new Error(authenticateUserWithPassword.message);
  }

  return true;
}

export const getUserWithOrders = cache(async function () {
  // Parallel account slots are rendered together. Do not invoke the protected
  // orders resolver for the unauthenticated login slot.
  const user = await getUser();
  if (!user?.id) return null;

  const headers = await getAuthHeaders();
  const { orders } = await openfrontClient.request(
    gql`
      query GetCustomerOrders {
        orders: getCustomerOrders
      }
    `,
    {},
    headers
  );

  return { ...user, orders };
});

export async function createCustomer(data: CreateCustomerData) {
  const headers = await getAuthHeaders();
  const { createUser } = await openfrontClient.request(
    gql`
      mutation CreateUser($data: UserCreateInput!) {
        createUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return createUser;
}

export async function updateCustomer(data: UpdateCustomerData) {
  const headers = await getAuthHeaders();
  const { updateUser } = await openfrontClient.request(
    gql`
      mutation UpdateUser($data: UserUpdateInput!) {
        updateUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return updateUser;
}

export async function addShippingAddress(data: AddShippingAddressData) {
  const headers = await getAuthHeaders();
  const { addShippingAddress } = await openfrontClient.request(
    gql`
      mutation AddShippingAddress($data: ShippingAddressCreateInput!) {
        addShippingAddress(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return addShippingAddress;
}

export async function updateShippingAddress(addressId: string, data: UpdateShippingAddressData) {
  const headers = await getAuthHeaders();
  const { updateShippingAddress } = await openfrontClient.request(
    gql`
      mutation UpdateShippingAddress(
        $addressId: ID!
        $data: ShippingAddressUpdateInput!
      ) {
        updateShippingAddress(addressId: $addressId, data: $data) {
          id
        }
      }
    `,
    {
      addressId,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return updateShippingAddress;
}

export async function deleteShippingAddress(addressId: string) {
  const headers = await getAuthHeaders();
  const { deleteShippingAddress } = await openfrontClient.request(
    gql`
      mutation DeleteShippingAddress($addressId: ID!) {
        deleteShippingAddress(addressId: $addressId) {
          id
        }
      }
    `,
    {
      addressId,
    },
    headers
  );

  return deleteShippingAddress;
}

export const getUserAddresses = cache(async function () {
  const headers = await getAuthHeaders();
  const { authenticatedItem } = await openfrontClient.request(
    gql`
      query GetUserAddresses {
        authenticatedItem {
          ... on User {
            id
            email
            firstName
            lastName
            phone
            billingAddress {
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
              }
              phone
            }
            addresses {
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
});

// Records the sign-up "I am 21 or older" attestation as a compliance event.
// A failure is logged without user data and never blocks the sign-up.
async function recordAgeAttestation(userId: string) {
  try {
    const { createHash } = await import("node:crypto");
    const { keystoneContext } = await import("@/features/keystone/context");
    const occurredAt = new Date();
    const attestedAt = occurredAt.toISOString();
    const statement = "I am 21 or older";
    const evidenceDigest = createHash("sha256")
      .update(JSON.stringify({ userId, attestedAt, statement }))
      .digest("hex");
    await keystoneContext.sudo().prisma.complianceEvent.create({
      data: {
        eventType: "AGE_ATTESTED_21",
        resourceType: "User",
        resourceId: userId,
        actorId: userId,
        evidenceDigest,
        data: { attestedAt, statement },
        occurredAt,
      },
    });
  } catch (error) {
    console.error("Age attestation record failed", error instanceof Error ? error.name : "unknown");
  }
}

export async function signUp(_currentState: any, formData: FormData) {
  if (formData.get("age_21") !== "on") {
    return "Confirm you are 21 or older.";
  }

  const customer = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("first_name"),
    lastName: formData.get("last_name"),
    phone: formData.get("phone"),
  };

  try {
    // First create the user
    const { createUser } = await openfrontClient.request(
      gql`
        mutation CreateUser($data: UserCreateInput!) {
          createUser(data: $data) {
            id
            email
          }
        }
      `,
      {
        data: {
          email: customer.email,
          password: customer.password,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
        },
      }
    );

    if (!createUser?.id) {
      return "Failed to create account";
    }

    await recordAgeAttestation(createUser.id);

    // Then authenticate them
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation SignIn($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item {
                id
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
              __typename
            }
          }
        }
      `,
      {
        email: customer.email,
        password: customer.password,
      }
    );

    // Check for authentication failure
    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      return authenticateUserWithPassword.message;
    }

    // Only set auth token if authentication was successful
    if (authenticateUserWithPassword.sessionToken) {
      await setAuthToken(authenticateUserWithPassword.sessionToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      revalidateTag("customer");
      return null; // Success case returns null (no error)
    }

    return "An unexpected error occurred during sign up";
  } catch (error) {
    // Never log ClientError: its request contains the registration password.
    // Handle specific error cases
    if (error instanceof Error && error.message.includes("Unique constraint failed on the fields: (`email`)")) {
      return "An account with this email already exists";
    }
    return accountActionError(error);
  }
}

export async function login(_currentState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const headers = await getAuthHeaders();
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation AuthenticateUser($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item {
                id
                email
                activeCartId
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
              __typename
            }
          }
        }
      `,
      { email, password },
      headers
    );

    // Check for authentication failure
    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      return "Email or password is incorrect.";
    }

    // Only set auth token and cart if authentication was successful
    if (authenticateUserWithPassword.sessionToken) {
      // Set the auth token
      await setAuthToken(authenticateUserWithPassword.sessionToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Set the cart ID if it exists
      const activeCartId = authenticateUserWithPassword.item?.activeCartId;
      if (activeCartId) {
        await setCartId(activeCartId, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      revalidateTag("customer");
      return null; // Success case returns null (no error)
    }

    return "An unexpected error occurred";
  } catch (error) {
    // Never log ClientError: its request contains the sign-in password.
    return accountActionError(error);
  }
}

export async function signOut(countryCode: string) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation EndSession {
          endSession
        }
      `,
      {},
      headers
    );

    // A signed-in cart proof cannot authorize the now-anonymous browser. Clear
    // it with the session; login will restore the user's active cart proof.
    await removeAuthToken();
    await removeCartId();
    revalidateTag("auth");
    revalidateTag("customer");
  } catch {
    throw new Error("Unable to sign out");
  }
  // Next redirects are control flow, not failures to log or swallow.
  redirect(`/${countryCode}/account`);
}

export async function updateCustomerEmail(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            email
          }
        }
      `,
      {
        data: {
          email: formData.get("email"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: accountActionError(error) };
  }
}

export async function updateCustomerName(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            name
          }
        }
      `,
      {
        data: {
          name: formData.get("firstName") + " " + formData.get("lastName"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: accountActionError(error) };
  }
}

export async function updateCustomerPassword(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdatePassword(
          $oldPassword: String!
          $newPassword: String!
          $confirmPassword: String!
        ) {
          updateActiveUserPassword(
            oldPassword: $oldPassword
            newPassword: $newPassword
            confirmPassword: $confirmPassword
          ) {
            id
          }
        }
      `,
      {
        oldPassword: formData.get("oldPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
      },
      headers
    );

    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    const message = accountActionError(error, "Failed to update password");
    return { success: false, error: message };
  }
}

export async function updateCustomerPhone(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            phone
          }
        }
      `,
      {
        data: {
          phone: formData.get("phone"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: accountActionError(error) };
  }
}

function addressFormFields(formData: FormData): Record<string, string> {
  return Object.fromEntries(["first_name", "last_name", "company", "address_1", "address_2", "city", "province", "postal_code", "country_code", "phone"].map(key => {
    const value = formData.get(key);
    return [key, typeof value === "string" ? value : ""];
  }));
}

export async function createCustomerAddress(prevState: any, formData: FormData) {
  try {
    const province = normalizeProvince(formData.get("country_code"), formData.get("province"));
    if (province === null) {
      return { success: false, error: US_STATE_REQUIRED_ERROR, fields: addressFormFields(formData) };
    }
    const headers = await getAuthHeaders();
    const addressData = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      company: formData.get("company"),
      address1: formData.get("address_1"),
      address2: formData.get("address_2"),
      city: formData.get("city"),
      province,
      postalCode: formData.get("postal_code"),
      country: {
        connect: {
          iso2: formData.get("country_code")
        }
      },
      phone: formData.get("phone"),
      isBilling: formData.get("is_billing") === "true"
    };

    await openfrontClient.request(
      gql`
        mutation CreateAddress($data: AddressCreateInput!) {
          createActiveUserAddress(data: $data) {
            id
            addresses {
              id
              isBilling
            }
          }
        }
      `,
      {
        data: addressData
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: accountActionError(error), fields: addressFormFields(formData) };
  }
}

export async function updateCustomerAddress(prevState: any, formData: FormData) {
  try {
    const province = normalizeProvince(formData.get("country_code"), formData.get("province"));
    if (province === null) {
      return { success: false, error: US_STATE_REQUIRED_ERROR, fields: addressFormFields(formData), addressId: prevState.addressId };
    }
    const headers = await getAuthHeaders();
    const addressData = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      company: formData.get("company"),
      address1: formData.get("address_1"),
      address2: formData.get("address_2"),
      city: formData.get("city"),
      province,
      postalCode: formData.get("postal_code"),
      country: { connect: { iso2: formData.get("country_code") } },
      phone: formData.get("phone"),
      isBilling: formData.get("is_billing") === "true"
    };

    await openfrontClient.request(
      gql`
        mutation UpdateAddress($where: AddressWhereUniqueInput!, $data: AddressUpdateInput!) {
          updateActiveUserAddress(where: $where, data: $data) {
            id
            addresses {
              id
              isBilling
            }
          }
        }
      `,
      {
        where: { id: prevState.addressId },
        data: addressData
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null, addressId: prevState.addressId };
  } catch (error) {
    return { success: false, error: accountActionError(error), fields: addressFormFields(formData), addressId: prevState.addressId };
  }
}

export async function deleteCustomerShippingAddress(addressId: string) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation DeleteAddress($where: AddressWhereUniqueInput!) {
          deleteActiveUserAddress(where: $where) {
            id
          }
        }
      `,
      {
        where: { id: addressId }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: accountActionError(error) };
  }
}

export type PasswordResetState = { status: "idle" | "sent" | "reset" | "error"; error?: string | null }

// Always reports "sent" so the form never reveals whether an account exists.
export async function requestPasswordReset(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = formData.get("email")
  if (typeof email !== "string" || !email.trim()) {
    return { status: "error", error: "Enter your email." }
  }
  try {
    await openfrontClient.request(
      gql`
        mutation SendPasswordResetLink($email: String!) {
          sendUserPasswordResetLink(email: $email)
        }
      `,
      { email: email.trim() }
    )
  } catch {
    // Never log ClientError: its request contains the email. Report the same state.
    console.error("Password reset link request failed")
  }
  return { status: "sent", error: null }
}

export async function redeemPasswordReset(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = formData.get("email")
  const token = formData.get("token")
  const password = formData.get("password")
  if (typeof email !== "string" || !email.trim() || typeof token !== "string" || !token) {
    return { status: "error", error: "This reset link is invalid. Request a new one." }
  }
  if (typeof password !== "string" || password.length < 10) {
    return { status: "error", error: "Password must be at least 10 characters." }
  }
  try {
    const { redeemUserPasswordResetToken } = await openfrontClient.request(
      gql`
        mutation RedeemPasswordReset($email: String!, $token: String!, $password: String!) {
          redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
            code
            message
          }
        }
      `,
      { email: email.trim(), token, password }
    )
    if (redeemUserPasswordResetToken?.code === "TOKEN_EXPIRED") {
      return { status: "error", error: "This reset link has expired. Request a new one." }
    }
    if (redeemUserPasswordResetToken?.code) {
      return { status: "error", error: "This reset link is invalid or already used. Request a new one." }
    }
    return { status: "reset", error: null }
  } catch (error) {
    // Never log ClientError: its request contains the token and password.
    const message = accountActionError(error, "Unable to reset the password. Please try again.")
    if (/common|invalid/i.test(message)) {
      return { status: "error", error: "Choose a less common password of at least 10 characters." }
    }
    return { status: "error", error: message }
  }
}
