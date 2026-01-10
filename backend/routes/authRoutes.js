import express from "express";
import {
  sendEmailOtpController,
  verifyEmailOtpController,
  logoutController,
  getMeController,
  updateProfileController
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send-email-otp", sendEmailOtpController);
router.post("/verify-email-otp", verifyEmailOtpController);
router.put("/update-profile", protect, updateProfileController);
router.get("/me", protect, getMeController);
router.post("/logout", protect, logoutController);

export default router;