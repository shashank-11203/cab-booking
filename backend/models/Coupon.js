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

        maxUsage: {
            type: Number,
            default: null,
        },

        usedCount: {
            type: Number,
            default: 0,
        },

        validFrom: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },


        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    }, { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);