import axios from "axios";
import { clearAuthData } from "./authService";

// Define the Model interface
interface Model {
  id: string;
  name: string;
  onlyfans_url: string;
}
const API_URL = import.meta.env.VITE_API_URL;

// Function to fetch models
export const fetchModels = async (agencyId: string): Promise<Model[]> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/models`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching models:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to add a new model
export const addModel = async (
  agencyId: string,
  modelData: any
): Promise<void> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    await axios.post(`${API_URL}/agencies/${agencyId}/models`, modelData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  } catch (error: any) {
    console.error("Error adding model:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to update a model
export const updateModel = async (
  agencyId: string,
  model: Model
): Promise<void> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    await axios.put(
      `${API_URL}/agencies/${agencyId}/models/${model.id}`,
      { name: model.name, onlyfans_url: model.onlyfans_url },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error updating model:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to delete a model
export const deleteModel = async (
  agencyId: string,
  modelId: string
): Promise<void> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    await axios.delete(`${API_URL}/agencies/${agencyId}/models/${modelId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  } catch (error: any) {
    console.error("Error deleting model:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
