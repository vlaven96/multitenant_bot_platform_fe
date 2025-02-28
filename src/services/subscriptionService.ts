import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchSubscription = async (agencyId: string) => {
  try {
    const response = await axios.get(`${API_URL}/agencies/${agencyId}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}; 