import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

// Function to fetch tags
export const fetchTags = async (agencyId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/tags`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to add a new tag
export const addTag = async (agencyId: string, tagName: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/tags`,
      { name: tagName },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding tag:", error);
    throw error;
  }
};

// Function to delete a tag
export const deleteTag = async (agencyId: string, tagId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.delete(
      `${API_URL}/agencies/${agencyId}/tags/${tagId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
};
