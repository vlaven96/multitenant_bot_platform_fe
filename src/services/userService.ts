import axios from 'axios';
import { clearAuthData } from './authService';

const API_URL = import.meta.env.VITE_API_URL+ '/admin';

export const fetchUsers = async (isActive?: boolean, username?: string) => {
  try {
    const params: any = {};
    if (isActive !== undefined) params.is_active = isActive;
    if (username) params.username = username;

    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      clearAuthData();
    }
    throw error;
  }
};

export const toggleUserActiveStatus = async (userId: number, isActive: boolean) => {
  return await axios.patch(`${API_URL}/users/${userId}`, { is_active: !isActive }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
};
 