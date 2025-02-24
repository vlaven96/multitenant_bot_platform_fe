import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;
// Function to fetch overall statistics
export const fetchOverallStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching overall statistics:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchStatusStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics/statuses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching status statistics:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchAverageTimesBySource = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/statistics/average-times-by-source`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching average times by source:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchExecutionCountsBySource = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/statistics/execution-counts-by-source`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching execution counts by source:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchGroupedByModelStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics/grouped-by-model`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching grouped statistics by model:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchTopSnapchatAccounts = async (
  weightRejectingRate: number = 0.3,
  weightConversationRate: number = 0.4,
  weightConversionRate: number = 0.3
) => {
  try {
    const response = await axios.get(
      `${API_URL}/statistics/accounts_with_score`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          weight_rejecting_rate: weightRejectingRate,
          weight_conversation_rate: weightConversationRate,
          weight_conversion_rate: weightConversionRate,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching top Snapchat accounts:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchDailyAccountStats = async (days: number = 7) => {
  try {
    const response = await axios.get(`${API_URL}/statistics/daily-stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      params: {
        days,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching daily account stats:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const fetchDailyChatbotRuns = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics/daily-chatbot-runs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching daily chatbot runs:", error);
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
