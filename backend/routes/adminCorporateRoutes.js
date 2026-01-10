import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { getCorporateRequests, getCorporateUsers, updateCorporateRequest } from "../controllers/corporateController.js";
import { getPendingCorporateRides } from "../controllers/corporateRideController.js";

const router = express.Router();

router.get("/requests", protect, adminOnly, getCorporateRequests);
router.put("/:requestId/reject", protect, adminOnly, updateCorporateRequest);
router.put("/:requestId/approve", protect, adminOnly, updateCorporateRequest);
router.get("/users", protect, adminOnly, getCorporateUsers);
router.get("/rides/pending", protect, adminOnly, getPendingCorporateRides);

export default router;