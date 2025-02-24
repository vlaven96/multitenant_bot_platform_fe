import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const executeOperation = async (params: {
  userIds: number[];
  operationType: string;
  startingDelay?: number;
  requests?: number;
  batches?: number;
  batchDelay?: number;
  quickAddPages?: number;
  username?: string;
  usersSentInRequest?: number;
  argoTokens?: boolean;
  accountsNumber?: number;
  targetLeadNumber?: number;
  weightRejectingRate?: number;
  weightConversationRate?: number;
  weightConversionRate?: number;
  max_rejection_rate?: number;
  min_conversation_rate?: number;
  min_conversion_rate?: number;

}) => {
  try {
    const payload = {
      type: params.operationType.toUpperCase(),
      configuration: {
        batch_delay: params.batchDelay,
        batches: params.batches,
        starting_delay: params.startingDelay,
        requests: params.requests,
        username: params.username,
        max_quick_add_pages: params.quickAddPages,
        users_sent_in_request: params.usersSentInRequest,
        argo_tokens: params.argoTokens,
        accounts_number: params.accountsNumber,
        target_lead_number: params.targetLeadNumber,
        weight_rejecting_rate: params.weightRejectingRate,
        weight_conversation_rate: params.weightConversationRate,
        weight_conversion_rate: params.weightConversionRate,
        max_rejection_rate: params.max_rejection_rate,
        min_conversation_rate: params.min_conversation_rate,
        min_conversion_rate: params.min_conversion_rate,
      },
      accounts: params.userIds,
    };

    const response = await axios.post(`${API_URL}/executions`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Execution error:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchExecutions = async (
  offset: number,
  limit: number,
  username?: string,
  status?: string,
  executionType?: string,
  jobId?: number
) => {
  try {
    const params: any = { offset, limit };
    if (username) params.username = username;
    if (status) params.status = status;
    if (executionType) params.execution_type = executionType;
    if (jobId) params.job_id = jobId;

    const response = await axios.get(`${API_URL}/executions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching executions:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchExecutionDetails = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/executions/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch execution details:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchExecutionDetailsByAccount = async (
  id: string,
  limit: number,
  offset: number,
  executionType?: string
) => {
  try {
    const params: any = { limit, offset };
    if (executionType && executionType !== "")
      params.execution_type = executionType;

    const response = await axios.get(
      `${API_URL}/executions/by_snapchat_account/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching execution details by account:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
