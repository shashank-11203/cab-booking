import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { razorpayWebhook } from "../controllers/paymentController.js";
import { generateInvoice } from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    razorpayWebhook
);
router.get("/invoice/:rideId", protect, generateInvoice);

export default router;