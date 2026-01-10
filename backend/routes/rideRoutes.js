import express from "express";
import { cancelRide, createRide, getUserRides, updateRide, getSingleRide, approveRefund, rejectRefund, getRideForModify } from "../controllers/rideController.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", protect, createRide);
router.get("/:rideId", protect, getSingleRide);
router.get("/user/:userId", protect, getUserRides);
router.put("/update/:rideId", protect, updateRide);
router.put("/cancel/:rideId", protect, cancelRide);
router.put("/refund/approve/:rideId", protect, adminOnly, approveRefund);
router.put("/refund/reject/:rideId", protect, adminOnly, rejectRefund);
router.get("/:rideId/modify", protect, getRideForModify);

export default router;