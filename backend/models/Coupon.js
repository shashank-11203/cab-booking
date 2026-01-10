// models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 99,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
            default: null, // ✅ null means no expiry
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        totalDiscountAmount: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiresAt: 1 });

couponSchema.methods.isValid = function() {
    if (!this.isActive) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
};

export default mongoose.model("Coupon", couponSchema);