import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const searchLocations = ({
  query,
  rideType,
  airportDirection,
  field,
  signal,
}) =>
  apiClient.get("/api/v1/location/search", {
    params: { q: query, rideType, airportDirection, field },
    signal,
  });