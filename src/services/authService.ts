import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL + "/auth";

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    const { access_token, token_type, role, agency_id } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", role);
    localStorage.setItem("agency_id", agency_id.toString());
    return { access_token, token_type, role, agency_id };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      if (status === 403 && data.detail === "User account is inactive") {
        toast.error(
          "Login failed: User account is inactive. Please contact an admin to enable your account.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    }
    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  await axios.post(`${API_URL}/register`, { username, email, password });
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("role");
  localStorage.removeItem("agency_id");
};

export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("role");
  localStorage.removeItem("agency_id");

  window.location.href = "/login";
};

export const completeRegistration = async (
  token: string,
  userData: { username: string; password: string }
) => {
  try {
    const response = await axios.post(`${API_URL}/complete-registration`, {
      token,
      ...userData,
    });
    return response.data;
  } catch (error) {
    console.error("Error completing registration:", error);
    throw error;
  }
};
