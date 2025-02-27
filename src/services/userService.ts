import axios from "axios";
import { clearAuthData } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

// Function to get the agency ID from localStorage
const getAgencyId = () => {
  return localStorage.getItem("agency_id");
};

export const fetchUsers = async (
  agencyId: string,
  isActive?: boolean,
  username?: string
) => {
  try {
    const params: any = {};
    if (isActive !== undefined) params.is_active = isActive;
    if (username) params.username = username;

    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/admin/users`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params,
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

export const toggleUserActiveStatus = async (
  agencyId: string,
  userId: number,
  isActive: boolean
) => {
  return await axios.patch(
    `${API_URL}/agencies/${agencyId}/users/${userId}`,
    { is_active: !isActive },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
};

export const fetchUserDetails = async (agencyId: string, userId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/users/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

export const deleteUser = async (agencyId: string, userId: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/agencies/${agencyId}/admin/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const inviteUser = async (agencyId: string, email: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/invite`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
};
