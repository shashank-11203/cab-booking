import CorporateRide from "../models/CorporateRides.js";
import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";
import { createPaymentRecord } from "../utils/paymentHelper.js";
import { makeUTCStartTime } from "../utils/dateUtils.js";

export const initCorporateRide = async (req, res) => {
  try {
    const { rideDetails } = req.body;

    const startTime = makeUTCStartTime(
      rideDetails.date,
      rideDetails.time
    );

    const ride = await CorporateRide.create({
      userId: req.user._id,

      pickupName: rideDetails.pickup.name,
      pickupLat: rideDetails.pickup.lat,
      pickupLon: rideDetails.pickup.lon,

      dropName: rideDetails.drop.name,
      dropLat: rideDetails.drop.lat,
      dropLon: rideDetails.drop.lon,

      startTime: startTime,
      distanceKm: rideDetails.distanceKm,
      durationMinutes: rideDetails.durationMinutes,
      date: rideDetails.date,
      time: rideDetails.time,
      rideType: rideDetails.rideType,
      passengers: rideDetails.passengers,

      carId: rideDetails.carId,
      carName: rideDetails.carName,

      expectedFare: rideDetails.expectedFare
    });

    return res.json({ success: true, ride });
  } catch (err) {
    console.error("init corporate ride error:", err);
    return res.status(500).json({ success: false });
  }
};

export const verifyCorporatePayment = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    if (event === "payment.captured" && payment.notes.type === "corporate") {
      const rideId = payment.notes.rideId;

      await CorporateRide.findByIdAndUpdate(rideId, {
        status: "paid"
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("corporate webhook error:", err);
    return res.status(500).json({ success: false });
  }
};

export const generateCorporatePaymentLink = async (req, res) => {
  try {
    const { rideId, amount } = req.body;

    if (!rideId || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const ride = await CorporateRide.findById(rideId).populate("userId", "name email phone");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",

      customer: {
        name: ride.userId.name,
        email: ride.userId.email,
        contact: ride.userId.phone
      },

      notes: {
        type: "corporate",
        corporateRideId: ride._id.toString()
      },

      notify: { sms: true, email: true },
      reminder_enable: true,

      description: `Corporate Ride Payment - ${ride._id}`,
      callback_url: `${process.env.FRONTEND_URL}/bookings`,
    });

    await createPaymentRecord({
      userId: ride.userId._id,
      referenceType: "CorporateRide",
      referenceId: ride._id,
      paymentType: "corporate_payment",
      amount: amount,
      rawAmount: amount,
      razorpayPaymentLinkId: paymentLink.id,
      rideData: ride,
      metadata: {
        isExtraCharge: false,
        isCorporate: true
      }
    });

    ride.finalFare = Number(amount);
    ride.paymentLink = paymentLink.short_url;
    ride.status = "link_sent";
    await ride.save();

    return res.json({ success: true, paymentLink });
  } catch (err) {
    console.error("Generate payment link error:", err);
    return res.status(500).json({ success: false, message: "Server error generating link" });
  }
};

export const getPendingCorporateRides = async (req, res) => {
  try {
    const rides = await CorporateRide.find({
      paymentStatus: { $in: ["unpaid", "payment_pending", "paid"] }
    })
      .populate("userId", "name phone email")
      .sort({ updatedAt: -1 });

    res.json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
