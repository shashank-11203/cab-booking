import express from "express";
import { getAvailableCars } from "../controllers/carPublicController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/available", protect, getAvailableCars);

export default router;