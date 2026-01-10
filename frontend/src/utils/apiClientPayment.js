import apiClient from "../utils/apiClient";

export const createOrderApi = async ({ amount, userId, rideDetails }) => {
  return await apiClient.post("/api/v1/payment/create-order", {
    amount,
    userId,
    rideDetails,
  });
};

export const verifyPaymentApi = async (payload) => {
  return await apiClient.post("/api/v1/payment/verify", payload);
};
