import express from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { createCoupon, getAllCoupons, validateCoupon, updateCoupon, deleteCoupon, getCouponRides } from '../controllers/adminCouponController.js';

const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getAllCoupons);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);
router.get("/:id/rides", protect, adminOnly, getCouponRides);
router.post("/validate", protect, validateCoupon);

export default router;