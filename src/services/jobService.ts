import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchJobs = async (agencyId: string, statusFilters: string[] = ["ACTIVE", "STOPPED"]) => {
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/jobs/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params: {
        status_filters: statusFilters,
      },
      paramsSerializer: (params) => {
        return Object.entries(params)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value
                .map((v) => `${key}=${encodeURIComponent(v)}`)
                .join("&");
            }
            return `${key}=${encodeURIComponent(value)}`;
          })
          .join("&");
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const createJob = async (agencyId: string, jobData: {
  name: string;
  statuses: string[];
  tags?: string[];
  type: string;
  cron_expression: string;
  configuration: Record<string, any>;
  status?: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/agencies/${agencyId}/jobs/`, jobData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating job:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const deleteJob = async (agencyId: string, jobId: number) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.delete(`${API_URL}/agencies/${agencyId}/jobs/${jobId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error deleting job:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const updateJobStatus = async (agencyId: string, jobId: number, status_update: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/agencies/${agencyId}/jobs/${jobId}/status/`,
      { status_update },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating job status:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const updateJob = async (
  agencyId: string,
  jobId: number,
  jobData: {
    name: string;
    statuses: string[];
    tags?: string[];
    type: string;
    cron_expression: string;
    configuration: Record<string, any>;
    first_execution_time?: string | null;
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/agencies/${agencyId}/jobs/${jobId}/`, jobData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating job:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchSimplifiedJobs = async (agencyId: string) => {
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/jobs/simplified/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching simplified jobs:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchAssociatedUsernames = async (agencyId: string, jobId: number) => {
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/jobs/${jobId}/accounts/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data.map((account: { id: number, username: string, status: string }) => ({
      id: account.id,
      username: account.username,
      status: account.status
    }));
  } catch (error: any) {
    console.error("Error fetching associated usernames:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
