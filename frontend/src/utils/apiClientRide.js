import apiClient from "../utils/apiClient";

export const getUserRidesApi = async (userId) => {
  return await apiClient.get(`/api/v1/rides/user/${userId}`);
};

export const cancelRideApi = async (rideId) => {
  return await apiClient.put(`/api/v1/rides/cancel/${rideId}`);
};
