import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getAdminRides,
  assignCarToRide,
  markRideCompleted,
  getCancelRequests,
  getExtraChargeRides,
  generateExtraChargePaymentLink,
  getModifiedRides
} from "../controllers/adminRideController.js";
import { approveRefund, rejectRefund } from "../controllers/rideController.js";



const router = express.Router();

router.get("/", protect, adminOnly, getAdminRides);
router.put("/:rideId/assign-car", protect, adminOnly, assignCarToRide);
router.put("/:rideId/complete", protect, adminOnly, markRideCompleted);
router.get("/cancel-requests", protect, adminOnly, getCancelRequests);
router.put("/:rideId/refund/approve", protect, adminOnly, approveRefund);
router.put("/:rideId/refund/reject", protect, adminOnly, rejectRefund);
router.get("/extra-charge", protect, adminOnly, getExtraChargeRides);
router.post("/:rideId/extra-payment", protect, adminOnly, generateExtraChargePaymentLink);
router.get("/modified", protect, adminOnly, getModifiedRides);

export default router;