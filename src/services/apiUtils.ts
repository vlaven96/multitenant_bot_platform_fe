export const handleApiError = (error: any, navigate: Function) => {
  if (error.response && error.response.status === 401) {
    console.error("Unauthorized access - redirecting to login.");
    navigate("/login"); // Use navigate function passed as an argument
  } else {
    console.error("API error:", error);
    throw error;
  }
};
