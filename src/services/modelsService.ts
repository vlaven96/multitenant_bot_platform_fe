import axios from "axios";
import { clearAuthData } from "./authService";

// Define the Model interface
interface Model {
  id: string;
  name: string;
  onlyfans_url: string;
}
const API_URL = import.meta.env.VITE_API_URL;
// Function to fetch models from the server
export const fetchModels = async (): Promise<Model[]> => {
  try {
    const response = await axios.get<Model[]>(`${API_URL}/models`, {
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

// Function to add a new model to the server
export const addModel = async (model: Model): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/models`,
      { name: model.name, onlyfans_url: model.onlyfans_url },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error adding model:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to update a model on the server
export const updateModel = async (model: Model): Promise<void> => {
  try {
    await axios.put(
      `${API_URL}/models/${model.id}`,
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

// Function to delete a model from the server
export const deleteModel = async (model: Model): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/models/${model.id}`, {
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
