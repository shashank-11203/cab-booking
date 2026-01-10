import express from "express";
import { calculateDistance } from "../controllers/distanceController.js";

const router = express.Router();

router.get("/calculate", calculateDistance);

export default router;