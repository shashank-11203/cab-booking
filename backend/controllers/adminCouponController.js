import Coupon from "../models/Coupon.js";
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";

export const createCoupon = async (req, res) => {
    try {
        const { name, code } = req.body;

        const discount = parseInt(code.slice(-2));
        if (isNaN(discount) || discount < 1 || discount > 99) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon code format",
            });
        }

        const coupon = await Coupon.create({
            name,
            code,
            discountPercent: discount,
            createdBy: req.user._id,
        });

        res.json({ success: true, coupon });
    } catch (err) {
        console.error("create coupon error", err);
        res.status(500).json({ success: false });
    }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().lean();

    const couponsWithStats = await Promise.all(
      coupons.map(async (c) => {
        const rides = await Ride.find({ "coupon.code": c.code });

        const totalDiscountAmount = rides.reduce(
          (sum, r) => sum + Number(r.coupon?.discountAmount || 0),
          0
        );

        return {
          ...c,
          totalDiscountAmount,
          usedCount: rides.length,
        };
      })
    );

    res.json({ success: true, coupons: couponsWithStats });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({ success: true, coupon });
    } catch (err) {
        console.error("update coupon error", err);
        res.status(500).json({ success: false });
    }
};

export const deleteCoupon = async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};

export const getCouponRides = async (req, res) => {
    try {
        
        const code = req.params.id;

        const rides = await Ride.find({ "coupon.code": code });
        const corporateRides = await CorporateRide.find({ "coupon.code": code });

        const all = [...rides, ...corporateRides];

        const totalDiscount = all.reduce(
            (sum, r) => sum + (r.coupon?.discountAmount || 0),
            0
        );

        const totalRevenue = all.reduce(
            (sum, r) => sum + (r.finalFare || r.fare || 0),
            0
        );

        res.json({
            success: true,
            totalRides: all.length,
            totalDiscount,
            totalRevenue,
            rides: all,
        });
    } catch (err) {
        console.error("fetch coupon rides error", err);
        res.status(500).json({ success: false });
    }
};


export const validateCoupon = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
        });

        if (!coupon) {
            return res.json({
                success: false,
                message: "Invalid or inactive coupon",
            });
        }

        const now = new Date();

        if (coupon.validFrom && coupon.validFrom > now) {
            return res.json({
                success: false,
                message: "Coupon not active yet",
            });
        }

        if (coupon.validTill && coupon.validTill < now) {
            return res.json({
                success: false,
                message: "Coupon expired",
            });
        }

        if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
            return res.json({
                success: false,
                message: "Coupon usage limit reached",
            });
        }

        const discountAmount = Math.round(
            (totalAmount * coupon.discountPercent) / 100
        );

        return res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                discountAmount,
            },
        });
    } catch (err) {
        console.error("coupon validation failed", err);
        res.status(500).json({ success: false });
    }
};