import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
    
    referenceType: { 
        type: String, 
        enum: ["Ride", "CorporateRide"],
        default: "Ride"
    },
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'referenceType'
    },
    
    paymentType: {
        type: String,
        enum: ["initial_payment", "extra_charge", "corporate_payment"],
        default: "initial_payment"
    },
    
    amount: { type: Number, required: true },
    rawAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { 
        type: String, 
        enum: ["pending", "paid", "failed", "authorized", "captured"], 
        default: "pending" 
    },
    
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    razorpayPaymentLinkId: { type: String },
    
    rideDetails: {
        type: mongoose.Schema.Types.Mixed
    },
    
    parentPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment"
    },
    
    metadata: {
        isExtraCharge: { type: Boolean, default: false },
        extraChargeReason: String,
        isCorporate: { type: Boolean, default: false },
    },
    
    refundId: String,
    refundStatus: {
        type: String,
        enum: ["none", "pending", "processed"],
        default: "none"
    },
    refundAmount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

paymentSchema.index({ referenceType: 1, referenceId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ razorpayPaymentLinkId: 1 });

export default mongoose.model("Payment", paymentSchema);