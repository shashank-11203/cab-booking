import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  initCorporateRide,
  generateCorporatePaymentLink,
  verifyCorporatePayment,
} from "../controllers/corporateRideController.js";

const router = express.Router();

router.post("/ride/init", protect, initCorporateRide);
router.post("/ride/payment-link", protect, adminOnly, generateCorporatePaymentLink);
router.post("/payment/verify", verifyCorporatePayment);

export default router;