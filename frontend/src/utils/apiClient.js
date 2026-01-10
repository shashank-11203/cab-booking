import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default apiClient;
