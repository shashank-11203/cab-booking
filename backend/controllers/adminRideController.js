// adminRideController.js
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";
import Car from "../models/Car.js";
import { razorpay } from "../utils/razorpay.js";
import moment from "moment";
import Payment from "../models/Payment.js";
import { createPaymentRecord } from "../utils/paymentHelper.js";

/* -----------------------------------------------------------
   AUTO UPDATE upcoming → active
------------------------------------------------------------ */

// async function updateStatuses() {
//   const now = new Date();

//   /* ===========================
//      NORMAL RIDES
//   ============================ */
//   await Ride.updateMany(
//     {
//       rideStatus: "upcoming",
//       startTime: { $lte: now }
//     },
//     {
//       $set: {
//         rideStatus: "active",
//         activatedAt: now
//       }
//     }
//   );

//   /* ===========================
//      CORPORATE RIDES
//   ============================ */
//   await CorporateRide.updateMany(
//     {
//       rideStatus: "upcoming",
//       startTime: { $lte: now }
//     },
//     {
//       $set: {
//         rideStatus: "active",
//         activatedAt: now
//       }
//     }
//   );
// }


/* -----------------------------------------------------------
   GET RIDES
------------------------------------------------------------ */
export const getAdminRides = async (req, res) => {
  try {
    const normalRides = await Ride.find({})
      .populate("userId", "name email phone role")
      .lean();

    const corporateRides = await CorporateRide.find({})
      .populate("userId", "name email phone role")
      .lean();

    const merged = [
      ...normalRides.map(r => ({
        ...r,
        _source: "normal",
        displayFare: r.fare,
        displayStatus: r.rideStatus
      })),
      ...corporateRides.map(r => ({
        ...r,
        _source: "corporate",
        displayFare: r.finalFare || r.expectedFare,
        displayStatus: r.rideStatus
      }))
    ];

    res.json({ success: true, rides: merged });

  } catch (err) {
    console.error("getAdminRides Error", err);
    res.status(500).json({ success: false });
  }
};


/* -----------------------------------------------------------
   ASSIGN CAR
   - carId & carName: User's preferred car (set at booking)
   - assignedCarId & assignedCarName: Actually assigned car by admin
------------------------------------------------------------ */
export const assignCarToRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { carId } = req.body;

    /* =========================
       FIND RIDE (NORMAL / CORPORATE)
    ========================= */
    let ride = await Ride.findById(rideId);
    let RideModel = Ride;

    if (!ride) {
      ride = await CorporateRide.findById(rideId);
      RideModel = CorporateRide;
    }

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    /* =========================
       FIND CAR
    ========================= */
    const car = await Car.findOne({ carId });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!car.isActive) {
      return res.json({
        success: false,
        message: "Car is inactive",
      });
    }

    /* =========================
       ASSIGN CAR (ADMIN OVERRIDE)
    ========================= */
    ride.assignedCarId = car.carId;
    ride.assignedCarName = car.name;
    ride.assignedAt = new Date();

    await ride.save();

    return res.json({
      success: true,
      message: "Car assigned successfully",
      ride,
    });

  } catch (err) {
    console.error("assignCarToRide error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* -----------------------------------------------------------
   MARK RIDE COMPLETED
------------------------------------------------------------ */
export const markRideCompleted = async (req, res) => {
  try {
    const { rideId } = req.params;

    let ride = await Ride.findById(rideId);
    let modelType = "normal";

    if (!ride) {
      ride = await CorporateRide.findById(rideId);
      modelType = "corporate";
    }

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // ✅ Mark completed
    ride.rideStatus = "completed";

    // Optional: keep paymentStatus consistent
    if (modelType === "corporate" && ride.status === "paid") {
      ride.paymentStatus = "paid";
    }

    await ride.save();

    return res.json({
      success: true,
      message: `Ride marked completed (${modelType})`,
      rideId: ride._id,
      type: modelType,
    });
  } catch (err) {
    console.error("MarkRideCompleted Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* -----------------------------------------------------------
   CANCEL REQUESTS (unchanged)
------------------------------------------------------------ */
export const getCancelRequests = async (req, res) => {
  try {
    const normal = await Ride.find({
      refundStatus: "pending_approval",
    }).populate("userId");

    const corporate = await CorporateRide.find({
      refundStatus: "pending_approval",
    }).populate("userId");

    // Tag type for frontend/admin
    const requests = [
      ...normal.map(r => ({ ...r.toObject(), _type: "normal" })),
      ...corporate.map(r => ({ ...r.toObject(), _type: "corporate" })),
    ];

    res.json({ success: true, requests });
  } catch (err) {
    console.error("cancelReq Error", err);
    res.status(500).json({ success: false });
  }
};


export const getExtraChargeRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      extraChargeStatus: "pending"
    }).populate("userId", "name phone email");

    res.json({ success: true, rides });
  } catch (err) {
    console.error("fetch extra charge rides error:", err);
    res.status(500).json({ success: false });
  }
};

export const generateExtraChargePaymentLink = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    let ride = await Ride.findById(rideId).populate(
      "userId",
      "name email phone"
    );
    let rideModel = "normal";

    if (!ride) {
      ride = await CorporateRide.findById(rideId).populate(
        "userId",
        "name email phone"
      );
      rideModel = "corporate";
    }

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      customer: {
        name: ride.userId.name,
        email: ride.userId.email,
        contact: ride.userId.phone
      },
      description: `Extra charge for ride ${ride._id}`,
      notify: { sms: true, email: true },

      notes: {
        purpose: "extra_charge",
        type: "extra_charge",
        rideId: ride._id.toString(),
        rideModel: rideModel,
      },

      callback_url: `${process.env.FRONTEND_URL}/bookings`
    });

    await createPaymentRecord({
      userId: ride.userId._id,
      referenceType: rideModel === "corporate" ? "CorporateRide" : "Ride",
      referenceId: ride._id,
      paymentType: "extra_charge",
      amount: amount,
      rawAmount: Math.round(amount * 100),
      razorpayPaymentLinkId: paymentLink.id,
      rideData: {
        pickupName: ride.pickupName,
        pickupLat: ride.pickupLat,
        pickupLon: ride.pickupLon,
        dropName: ride.dropName,
        dropLat: ride.dropLat,
        dropLon: ride.dropLon,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        rideType: ride.rideType,
        date: ride.date,
        time: ride.time,
        carName: ride.carName || ride.assignedCarName,
        carId: ride.carId || ride.assignedCarId,
        passengers: ride.passengers,
        fare: ride.fare || ride.expectedFare,
        finalFare: ride.finalFare,
        extraChargeAmount: amount,
        extraChargeReason: req.body.reason || "Additional charges",
        coupon: ride.coupon || null
      },
      metadata: {
        isExtraCharge: true,
        isCorporate: rideModel === "corporate",
        paymentLinkUrl: paymentLink.short_url
      }
    });

    ride.extraChargeAmount = amount;
    ride.extraPaymentLink = paymentLink.short_url;
    ride.extraChargeStatus = "link_sent";
    await ride.save();

    console.log("✅ Extra charge payment link created and Payment record saved");

    return res.json({
      success: true,
      paymentLink: paymentLink.short_url
    });
  } catch (err) {
    console.error("generate extra charge error:", err);
    return res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getModifiedRides = async (req, res) => {
  try {
    const normal = await Ride.find({
      wasModified: true,
      rideStatus: { $ne: "cancelled" }
    })
      .populate("userId", "name phone")
      .sort({ updatedAt: -1 });

    const corporate = await CorporateRide.find({
      wasModified: true,
      rideStatus: { $ne: "cancelled" }
    })
      .populate("userId", "name phone")
      .sort({ updatedAt: -1 });

    const rides = [
      ...normal.map(r => ({ ...r.toObject(), _type: "normal" })),
      ...corporate.map(r => ({ ...r.toObject(), _type: "corporate" }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ success: true, rides });

  } catch (err) {
    console.error("get modified ride error:", err);
    res.status(500).json({ success: false });
  }
};