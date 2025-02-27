import axios from "axios";
import { clearAuthData } from "./authService";

// Define the Chatbot interface
export interface Chatbot {
  id: string;
  type: string;
  token: string;
}
const API_URL = import.meta.env.VITE_API_URL;

// Function to fetch chatbots from the server
export const fetchChatbots = async (agencyId: string): Promise<Chatbot[]> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get<Chatbot[]>(`${API_URL}/agencies/${agencyId}/chatbots`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching chatbots:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to add a new chatbot to the server
export const addChatbot = async (agencyId: string, chatbotData: any): Promise<void> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    await axios.post(
      `${API_URL}/agencies/${agencyId}/chatbots`,
      chatbotData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error adding chatbot:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to update an existing chatbot on the server
export const updateChatbot = async (agencyId: string, chatbot: Chatbot): Promise<void> => {
  try {
    await axios.put(
      `${API_URL}/agencies/${agencyId}/chatbots/${chatbot.id}`,
      { type: chatbot.type, token: chatbot.token },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error updating chatbot:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

// Function to delete a chatbot from the server
export const deleteChatbot = async (agencyId: string, chatbotId: string): Promise<void> => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    await axios.delete(`${API_URL}/agencies/${agencyId}/chatbots/${chatbotId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  } catch (error: any) {
    console.error("Error deleting chatbot:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
