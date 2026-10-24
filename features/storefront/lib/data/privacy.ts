"use server";

import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders } from "./cookies";
import { accountActionError } from "../util/openfront-error";

export type PrivacyPreferences = {
  analytics: boolean;
  marketingEmail: boolean;
  recordedAt: string | null;
};

export type PrivacyRequestAction = "access" | "correct" | "delete" | "restrict" | "object";

export type PrivacyRequestRecord = {
  id: string;
  action: string;
  status: string;
  requestedAt: string | null;
};

const PRIVACY_DATA = gql`
  query GetMyPrivacyData {
    getMyPrivacyData
  }
`;

const UPDATE_PREFERENCES = gql`
  mutation UpdatePrivacyPreferences($preferences: JSON!) {
    updatePrivacyPreferences(preferences: $preferences)
  }
`;

const REQUEST_ACTION = gql`
  mutation RequestPrivacyAction($action: String!, $details: String) {
    requestPrivacyAction(action: $action, details: $details) {
      id
      createdAt
      data
    }
  }
`;

function readPreferences(value: any): PrivacyPreferences {
  return {
    analytics: value?.analytics === true,
    marketingEmail: value?.marketingEmail === true,
    recordedAt: typeof value?.recordedAt === "string" ? value.recordedAt : null,
  };
}

export async function getPrivacyPreferences(): Promise<
  { ok: true; preferences: PrivacyPreferences } | { ok: false; error: string }
> {
  try {
    const { getMyPrivacyData } = await openfrontClient.request<{ getMyPrivacyData: any }>(
      PRIVACY_DATA,
      {},
      await getAuthHeaders()
    );
    return { ok: true, preferences: readPreferences(getMyPrivacyData?.user?.userField?.preferences?.privacy) };
  } catch (error) {
    return { ok: false, error: accountActionError(error, "Privacy settings couldn't be loaded.") };
  }
}

export async function savePrivacyPreferences(input: {
  analytics: boolean;
  marketingEmail: boolean;
}): Promise<{ ok: true; preferences: PrivacyPreferences } | { ok: false; error: string }> {
  try {
    const { updatePrivacyPreferences } = await openfrontClient.request<{ updatePrivacyPreferences: any }>(
      UPDATE_PREFERENCES,
      { preferences: { analytics: input.analytics === true, marketingEmail: input.marketingEmail === true } },
      await getAuthHeaders()
    );
    return { ok: true, preferences: readPreferences(updatePrivacyPreferences) };
  } catch (error) {
    return { ok: false, error: accountActionError(error, "Preferences couldn't be saved.") };
  }
}

export async function exportMyPrivacyData(): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  try {
    const { getMyPrivacyData } = await openfrontClient.request<{ getMyPrivacyData: unknown }>(
      PRIVACY_DATA,
      {},
      await getAuthHeaders()
    );
    return { ok: true, data: getMyPrivacyData };
  } catch (error) {
    return { ok: false, error: accountActionError(error, "Your data couldn't be exported.") };
  }
}

export async function submitPrivacyRequest(
  action: PrivacyRequestAction,
  details?: string
): Promise<{ ok: true; request: PrivacyRequestRecord } | { ok: false; error: string }> {
  try {
    const { requestPrivacyAction } = await openfrontClient.request<{ requestPrivacyAction: any }>(
      REQUEST_ACTION,
      { action, details: details?.trim() ? details.trim().slice(0, 2000) : null },
      await getAuthHeaders()
    );
    if (!requestPrivacyAction || typeof requestPrivacyAction !== "object") {
      return { ok: false, error: "Request couldn't be filed." };
    }
    // Field reads on the returned Notification can be null for customers; the request is still filed.
    const data = requestPrivacyAction.data && typeof requestPrivacyAction.data === "object" ? requestPrivacyAction.data : {};
    return {
      ok: true,
      request: {
        id: typeof requestPrivacyAction.id === "string" ? requestPrivacyAction.id : "",
        action: typeof data.action === "string" ? data.action : action,
        status: typeof data.status === "string" ? data.status : "pending_identity_verification",
        requestedAt:
          typeof data.requestedAt === "string"
            ? data.requestedAt
            : typeof requestPrivacyAction.createdAt === "string"
              ? requestPrivacyAction.createdAt
              : null,
      },
    };
  } catch (error) {
    return { ok: false, error: accountActionError(error, "Request couldn't be filed.") };
  }
}
