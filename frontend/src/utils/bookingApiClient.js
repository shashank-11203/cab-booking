import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const calculateDistance = async ({ pickupLat, pickupLon, dropLat, dropLon }) => {
  return await apiClient.get("/api/v1/distance/calculate", {
    params: {
      pickupLat,
      pickupLon,
      dropLat,
      dropLon,
    },
  });
};

export const validateLocation = async ({ text }) => {
  return await apiClient.post("/api/v1/location/validate", { text });
};