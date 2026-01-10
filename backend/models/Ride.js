import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pickupName: String,
    pickupLat: Number,
    pickupLon: Number,

    dropName: String,
    dropLat: Number,
    dropLon: Number,

    distanceKm: Number,
    durationMinutes: Number,
    fare: Number,
    finalFare: {
        type: Number,
        // required: true,
    },

    rideType: {
        type: String,
        enum: ["outstation", "local", "oneway", "airport"],
        required: true,
    },

    date: String,
    time: String,

    assignedCarId: { type: Number, default: null },
    assignedCarName: { type: String, default: null },
    activatedAt: Date,
    awaitingAdminAssignment: {
        type: Boolean,
        default: false,
    },

    startTime: { type: Date, required: true },

    rideStatus: {
        type: String,
        enum: ["upcoming", "active", "completed", "cancelled"],
        default: "upcoming",
    },

    refundStatus: {
        type: String,
        enum: ["none", "pending_approval", "rejected", "pending", "processed"],
        default: "none",
    },

    refundAmount: {
        type: Number,
        default: 0,
    },

    passengers: {
        type: Number,
        default: 1
    },

    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "failed"],
        default: "unpaid",
    },

    carName: String,
    carId: Number,

    coupon: {
        code: String,
        discountPercent: Number,
        discountAmount: Number,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    wasModified: {
        type: Boolean,
        default: false
    },

    modificationNote: {
        type: String,
        default: ""
    },

    extraChargeAmount: {
        type: Number,
        default: 0,
    },

    extraChargeReason: {
        type: String,
        default: "",
    },

    extraChargeStatus: {
        type: String,
        enum: ["none", "pending", "link_sent", "paid"],
        default: "none",
    },

    extraPaymentLink: {
        type: String,
        default: "",
    },

    extraChargeRazorpayPaymentId: {
        type: String,
        default: "",
    },
},
    { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);