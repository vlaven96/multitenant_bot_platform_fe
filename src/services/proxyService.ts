import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

// Function to get the agency ID from localStorage
const getAgencyId = () => {
  return localStorage.getItem("agency_id");
};

export const fetchProxies = async (agencyId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/proxies`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const addProxy = async (agencyId: string, proxyData: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/proxies`,
      { data: proxyData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const deleteProxy = async (agencyId: string, proxyId: string) => {
  if (!agencyId) {
    throw new Error("Agency ID is undefined");
  }
  try {
    const response = await axios.delete(
      `${API_URL}/agencies/${agencyId}/proxies/${proxyId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};
