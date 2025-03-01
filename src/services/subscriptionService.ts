import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

export const fetchSubscription = async (agencyId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/agencies/${agencyId}/subscriptions`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

export const createSubscription = async (
  agencyId: string,
  data: { daysAvailable: string; numberOfSloths: string; price: string }
) => {
  try {
    const response = await axios.post(
      `${API_URL}/agencies/${agencyId}/subscriptions`,
      {
        days_available: parseInt(data.daysAvailable, 10),
        number_of_sloths: parseInt(data.numberOfSloths, 10),
        price: parseFloat(data.price),
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

export const updateSubscription = async (
  agencyId: string,
  data: { numberOfSloths: string; status?: string; endDate?: string }
) => {
  try {
    const response = await axios.put(
      `${API_URL}/agencies/${agencyId}/subscriptions`,
      {
        number_of_sloths: parseInt(data.numberOfSloths, 10),
        status: data.status,
        turned_off_at: data.endDate,
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

export const renewSubscription = async (
  agencyId: string,
  data: { daysAvailable: string; numberOfSloths: string; price: string }
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/agencies/${agencyId}/subscriptions/renew`,
      {
        days_available: parseInt(data.daysAvailable, 10),
        number_of_sloths: parseInt(data.numberOfSloths, 10),
        price: parseFloat(data.price),
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};
