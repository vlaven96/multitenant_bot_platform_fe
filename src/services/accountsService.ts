import axios from "axios";
import { handleApiError } from "./apiUtils";
import { clearAuthData } from "./authService";
import qs from "qs";

const API_URL = import.meta.env.VITE_API_URL;

interface SnapchatAccountStats {
  total_conversations: number;
  chatbot_conversations: number;
  conversations_charged: number;
  cta_conversations: number;
  cta_shared_links: number;
  conversions_from_cta_links: number;
  total_conversions: number;
  quick_ads_sent: number;
  total_executions: number;
  successful_executions: number;
  message: string;
  success: boolean;
}

interface AccountExecution {
  type: string;
  start_time: string;
}

interface StatusChange {
  new_status: string;
  changed_at: string;
}

interface SnapchatAccountTimelineStatistics {
  creation_date: string;
  ingestion_date: string;
  account_executions: AccountExecution[];
  status_changes: StatusChange[];
}

export const fetchAccounts = async (
  navigate: Function,
  username?: string,
  creationDateFrom?: string,
  creationDateTo?: string,
  hasProxy?: boolean,
  hasDevice?: boolean,
  hasCookies?: boolean,
  statuses?: string[],
  includeExecutions?: boolean
) => {
  try {
    const params: any = {};
    if (username !== undefined) params.username = username;
    if (creationDateFrom !== undefined)
      params.creation_date_from = creationDateFrom;
    if (creationDateTo !== undefined) params.creation_date_to = creationDateTo;
    if (hasProxy !== undefined) params.has_proxy = hasProxy;
    if (hasDevice !== undefined) params.has_device = hasDevice;
    if (hasCookies !== undefined) params.has_cookies = hasCookies;
    if (statuses !== undefined && statuses.length > 0)
      params.statuses = statuses;
    if (includeExecutions !== undefined)
      params.include_executions = includeExecutions;
    const response = await axios.get(`${API_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: "repeat" });
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, navigate);
  }
};

export const addAccount = async (accountData: {
  data: string;
  model_id?: number | null;
  chatbot_id?: number | null;
  source?: string;
  workflow_id?: number | null;
  trigger_execution?: boolean;
  pattern?: string | null;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/accounts`,
      {
        payload: {
          data: accountData.data,
        },
        account_source: accountData.source,
        model_id: accountData.model_id,
        chatbot_id: accountData.chatbot_id,
        workflow_id: accountData.workflow_id,
        trigger_execution: accountData.trigger_execution,
        pattern: accountData.pattern,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const terminateAccount = async (accountId: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/accounts/${accountId}`,
      { status: "TERMINATED" },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to terminate account:", error);
    throw error;
  }
};

export const fetchAccountForEdit = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/accounts/${id}/edit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch account details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
};

export const updateAccount = async (
  id: string,
  data: {
    model_id: number | null;
    chatbot_id: number | null;
    status: string | null;
    proxy_id: number | null;
    workflow_id: number | null;
    tags: string[];
  }
) => {
  try {
    const response = await axios.patch(`${API_URL}/accounts/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update account:", error);
    throw error;
  }
};

export const fetchAccountDetails = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
};

export const fetchStatuses = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts/statuses/list`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching statuses:", error);
    throw error;
  }
};

export const fetchTerminationCandidates = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/accounts/candidates-for-termination`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching termination candidates:", error);
    throw error;
  }
};

export const terminateMultipleAccounts = async (accountIds: string[]) => {
  try {
    const response = await axios.patch(
      `${API_URL}/accounts/terminate`,
      accountIds,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error terminating accounts:", error);
    throw error;
  }
};

export const fetchSources = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts/sources/list`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sources:", error);
    throw error;
  }
};

export const fetchAccountStatistics = async (
  accountId: string
): Promise<SnapchatAccountStats> => {
  try {
    const response = await axios.get(
      `${API_URL}/accounts/${accountId}/statistics`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAccountTimelineStatistics = async (
  accountId: string
): Promise<SnapchatAccountTimelineStatistics> => {
  try {
    const response = await axios.get(
      `${API_URL}/accounts/${accountId}/timeline-statistics`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export async function bulkUpdateAccounts(payload: {
  account_ids: number[];
  status?: string;
  tags_to_add?: string[];
  tags_to_remove?: string[];
  model_id?: number;
  chat_bot_id?: number;
}) {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  };
  // Adjust the API endpoint / method as needed
  const { data } = await axios.patch(
    `${API_URL}/accounts/bulk-update`,
    payload,
    { headers }
  );
  return data;
}
