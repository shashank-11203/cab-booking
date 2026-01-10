import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

import {
    getAllCars,
    addCar,
    deleteCar,
    toggleCarActive,
    checkAvailability,
    updateCar
} from "../controllers/adminCarControllers.js";

const router = express.Router();

router.get("/cars", protect, adminOnly, getAllCars);
router.post("/cars", protect, adminOnly, addCar);
router.delete("/cars/:id", protect, adminOnly, deleteCar);
router.put("/cars/:id", protect, adminOnly, updateCar);
router.put("/cars/:id/toggle", protect, adminOnly, toggleCarActive);
router.get("/cars/availability", protect, adminOnly, checkAvailability);

export default router;