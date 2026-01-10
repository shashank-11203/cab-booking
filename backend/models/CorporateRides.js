import mongoose from "mongoose";

const corporateRideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  pickupName: String,
  pickupLat: Number,
  pickupLon: Number,

  dropName: String,
  dropLat: Number,
  dropLon: Number,

  distanceKm: Number,
  durationMinutes: Number,
  date: String,
  time: String,
  rideType: String,
  passengers: Number,

  rideStatus: {
    type: String,
    enum: ["upcoming", "active", "completed", "cancelled"],
    default: "upcoming",
  },

  startTime: { type: Date, required: true },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid",
  },

  carId: String,
  carName: String,

  expectedFare: Number,
  finalFare: Number,

  paymentLink: String,

  status: {
    type: String,
    enum: ["pending_negotiation", "link_sent", "paid"],
    default: "pending_negotiation"
  },

  refundStatus: {
    type: String,
    enum: ["none", "pending_approval", "rejected", "pending", "processed"],
    default: "none",
  },

  assignedCarId: Number,
  assignedCarName: String,
  assignedAt: Date,
  activatedAt: Date,
  awaitingAdminAssignment: {
    type: Boolean,
    default: false,
  },


  wasModified: { type: Boolean, default: false },
  modificationNote: String,

  extraChargeAmount: Number,
  extraChargeStatus: {
    type: String,
    enum: ["none", "pending", "link_sent", "paid"],
    default: "none",
  },
  extraPaymentLink: String,

}, { timestamps: true });

export default mongoose.model("CorporateRide", corporateRideSchema);