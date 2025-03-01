import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // Replace with your actual API URL

export const registerAgency = async (name: string, agencyEmail: string) => {
  try {
    console.log(API_URL);
    const response = await axios.post(`${API_URL}/agencies`, {
      name,
      agency_email: agencyEmail,
      admin_role: "ADMIN",
    });
    return response.data;
  } catch (error) {
    console.error("Error registering agency:", error);
    throw error;
  }
};

// New method to fetch all agencies
export const fetchAllAgencies = async () => {
  try {
    const response = await axios.get(`${API_URL}/agencies`, {
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
