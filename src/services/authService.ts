import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL + '/auth';

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    const { access_token, is_admin } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('is_admin', JSON.stringify(is_admin));
    return { access_token, is_admin };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      if (status === 403 && data.detail === "User account is inactive") {
        toast.error('Login failed: User account is inactive. Please contact an admin to enable your account.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } 
    } 
    throw error;
  }
};

export const register = async (username: string, email: string, password: string) => {
  await axios.post(`${API_URL}/register`, { username, email, password });
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('is_admin');
};

export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('is_admin');
 
  window.location.href = '/login';
};
