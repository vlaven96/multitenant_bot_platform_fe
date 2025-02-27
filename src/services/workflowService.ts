import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchWorkflows = async (agencyId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/workflows`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching workflows:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const createWorkflow = async (agencyId: string, workflow: any) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/workflows`,
      workflow,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating workflow:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const updateWorkflow = async (
  agencyId: string,
  workflowId: string,
  workflowData: any
) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.put(
      `${API_URL}/agencies/${agencyId}/workflows/${workflowId}`,
      workflowData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating workflow:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const deleteWorkflow = async (agencyId: string, workflowId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.delete(
      `${API_URL}/agencies/${agencyId}/workflows/${workflowId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting workflow:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const updateWorkflowStatus = async (
  agencyId: string,
  workflowId: number,
  status_update: string
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/agencies/${agencyId}/workflows/${workflowId}/status`,
      { status_update },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating workflow status:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchWorkflowsSimplified = async (agencyId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/workflows/simplified`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching simplified workflows:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchAssociatedAccounts = async (agencyId: string, workflowId: number) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/workflows/${workflowId}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data.map(
      (item: {
        snapchat_account: { id: number; username: string; status: string };
        last_executed_step: number;
      }) => ({
        id: item.snapchat_account.id,
        username: item.snapchat_account.username,
        status: item.snapchat_account.status,
        lastExecutedStep: item.last_executed_step,
      })
    );
  } catch (error: any) {
    console.error("Error fetching associated accounts:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const addWorkflow = async (agencyId: string, workflowData: any) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/workflows`,
      workflowData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding workflow:", error);
    throw error;
  }
};
