import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const sendEmailOtp = async ({ email }) => {
  return await apiClient.post("/api/v1/auth/send-email-otp", { email });
};

export const verifyEmailOtp = async ({ email, otp }) => {
  return await apiClient.post("/api/v1/auth/verify-email-otp", {
    email,
    otp,
  });
};

export const getMe = async () => apiClient.get("/api/v1/auth/me");

export const updateProfileApi = async (data) => 
  apiClient.put("/api/v1/auth/update-profile", data);

export const logoutUser = async () => apiClient.post("/api/v1/auth/logout");