import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // Replace with your actual API URL


export const registerAgencyOld = async (name: string, agencyEmail: string) => {
  try {
    console.log(API_URL);
    const response = await axios.post(`${API_URL}/agencies/`, {
      name,
      agency_email: agencyEmail,
      admin_role: "ADMIN",

    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || "Error registering agency");
    } else {
      throw new Error("Error registering agency");
    }
  }
};

export const registerAgency = async (
  name: string,
  username: string,
  password: string,
  token: string
) => {
  try {
    console.log(API_URL);
    const response = await axios.post(`${API_URL}/agencies/`, {
      agency_name: name,
      username: username,
      password: password,
      token: token,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // Propagate the error response from the server
      throw new Error(error.response.data.detail || "Error registering agency");
    } else {
      throw new Error("Error registering agency");
    }
  }
};

export const inviteAgency = async (email: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/agencies/invite_agency/`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error inviting agency:", error);
    throw error;
  }
};

// New method to fetch all agencies
export const fetchAllAgencies = async () => {
  try {
    const response = await axios.get(`${API_URL}/agencies/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching agencies:", error);
    throw error;
  }
};
