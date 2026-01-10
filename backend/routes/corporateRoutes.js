import express from "express";
import { createCorporateRequest, sendCorporateWhatsapp, getMyCorporateRides, getLatestCorporateRide } from "../controllers/corporateController.js";
import { protect, corporateOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/inquiry", sendCorporateWhatsapp);
router.post("/request", protect, createCorporateRequest);
router.get("/rides/my", protect, corporateOnly, getMyCorporateRides);
router.get("/ride/latest", protect, corporateOnly, getLatestCorporateRide)

export default router;