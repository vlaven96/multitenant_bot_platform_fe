import axios from "axios";
import { clearAuthData } from "./authService";
const API_URL = import.meta.env.VITE_API_URL;
// Function to fetch all tags from the /tags endpoint
export const fetchTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/tags`, {
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
