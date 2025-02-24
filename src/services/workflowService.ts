import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchWorkflows = async () => {
  try {
    const response = await axios.get(`${API_URL}/workflows`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching workflows:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const createWorkflow = async (workflow: any) => {
  try {
    const response = await axios.post(`${API_URL}/workflows`, workflow, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating workflow:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const updateWorkflow = async (id: string, workflow: any) => {
  try {
    const response = await axios.put(`${API_URL}/workflows/${id}`, workflow, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating workflow:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const deleteWorkflow = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/workflows/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
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
  workflowId: number,
  status_update: string
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/workflows/${workflowId}/status`,
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

export const fetchWorkflowsSimplified = async () => {
  try {
    const response = await axios.get(`${API_URL}/workflows/simplified`, {
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

export const fetchAssociatedAccounts = async (workflowId: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/workflows/${workflowId}/accounts`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data.map((item: { snapchat_account: { id: number; username: string; status: string }, last_executed_step: number }) => ({
      id: item.snapchat_account.id,
      username: item.snapchat_account.username,
      status: item.snapchat_account.status,
      lastExecutedStep: item.last_executed_step
    }));
  } catch (error: any) {
    console.error("Error fetching associated accounts:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
