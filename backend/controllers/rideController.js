import { razorpay } from "../utils/razorpay.js";
import mongoose from "mongoose";
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";
import moment from "moment";
import { makeUTCStartTime } from "../utils/dateUtils.js";

export const createRide = async (req, res) => {
  try {
    const startTime = makeUTCStartTime(
      rideDetails.date,
      rideDetails.time
    );

    const ride = await Ride.create({
      userId: req.body.userId,
      pickupName: req.body.pickup.name,
      pickupLat: req.body.pickup.lat,
      pickupLon: req.body.pickup.lon,

      dropName: req.body.drop.name,
      dropLat: req.body.drop.lat,
      dropLon: req.body.drop.lon,

      distanceKm: req.body.distanceKm,
      durationMinutes: req.body.durationMinutes,
      fare: req.body.fare,
      rideType: req.body.rideType,
      date: req.body.date,
      time: req.body.time,
      startTime: startTime,
      passengers: req.body.passengers,
      carName: req.body.carName,
      carId: req.body.carId,

      rideStatus: "upcoming",
      paymentStatus: "unpaid"
    });

    res.json({ success: true, rideId: ride._id });

  } catch (err) {
    console.log("Ride Create Error:", err);
    res.json({ success: false, message: "Unable to create ride" });
  }
};

export const getUserRides = async (req, res) => {
  try {
    const userId = req.user._id;

    const rides = await Ride.find({ userId })
      .sort({ createdAt: -1 });

    return res.json({ success: true, rides });
  } catch (err) {
    console.error("getUserRides error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const updateRide = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false });
    }

    const { rideId } = req.params;
    const { pickup, drop, date, time, passengers } = req.body;

    const RideModel =
      req.user.role === "corporate" ? CorporateRide : Ride;

    const ride = await RideModel.findById(rideId)
      .populate("userId", "name phone");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    let routeChanged = false;
    let scheduleChanged = false;

    if (pickup && pickup.name !== ride.pickupName) {
      routeChanged = true;
      ride.pickupName = pickup.name;
      ride.pickupLat = pickup.lat;
      ride.pickupLon = pickup.lng || pickup.lon;
    }

    if (drop && drop.name !== ride.dropName) {
      routeChanged = true;
      ride.dropName = drop.name;
      ride.dropLat = drop.lat;
      ride.dropLon = drop.lng || drop.lon;
    }

    if (date && date !== ride.date) {
      scheduleChanged = true;
      ride.date = date;
    }

    if (time && time !== ride.time) {
      scheduleChanged = true;
      ride.time = time;
    }

    if (passengers) {
      ride.passengers = passengers;
    }

    if (scheduleChanged) {
      ride.startTime = makeUTCStartTime(ride.date, ride.time);

      if (ride.rideStatus === "active" && ride.startTime > new Date()) {
        ride.rideStatus = "upcoming";
        ride.activatedAt = null;
      }
    }

    if (routeChanged) {
      ride.wasModified = true;
      ride.extraChargeStatus = "pending";
      ride.extraChargeAmount = null;
      ride.extraPaymentLink = null;
    }

    await ride.save();

    return res.json({ success: true, ride });

  } catch (err) {
    console.error("Update Ride Error:", err);
    res.status(500).json({ success: false });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const RideModel =
      req.user.role === "corporate"
        ? CorporateRide
        : Ride;

    const ride = await RideModel.findById(req.params.rideId);
    if (!ride) {
      return res.json({ success: false, message: "Ride not found" });
    }

    if (ride.rideStatus === "cancelled") {
      return res.json({
        success: false,
        message: "Ride already cancelled",
      });
    }

    ride.rideStatus = "cancelled";

    ride.refundStatus = "pending_approval";

    await ride.save();

    return res.json({
      success: true,
      message: "Ride cancelled. Refund request sent to admin for review.",
    });
  } catch (err) {
    console.error("Cancel ride error:", err);
    return res.json({
      success: false,
      message: "Could not cancel ride",
    });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    const { rideId } = req.params;

    let ride = await Ride.findById(rideId);
    let modelType = "normal";

    if (!ride) {
      ride = await CorporateRide.findById(rideId);
      modelType = "corporate";
    }

    if (!ride) {
      return res.json({ success: false, message: "Ride not found" });
    }

    if (ride.refundStatus !== "pending_approval") {
      return res.json({
        success: false,
        message: "Refund cannot be rejected at this stage",
      });
    }

    ride.refundStatus = "rejected";
    await ride.save();

    return res.json({
      success: true,
      message: `Refund request rejected (${modelType})`,
    });
  } catch (err) {
    console.log("Reject Refund Error:", err);
    return res.json({ success: false, message: "Could not reject refund" });
  }
};

export const approveRefund = async (req, res) => {
  try {
    const { rideId } = req.params;

    let ride = await Ride.findById(rideId);
    let modelType = "normal";

    if (!ride) {
      ride = await CorporateRide.findById(rideId);
      modelType = "corporate";
    }

    if (!ride) {
      return res.json({ success: false, message: "Ride not found" });
    }

    if (ride.refundStatus !== "pending_approval") {
      return res.json({
        success: false,
        message: "Refund not awaiting approval",
      });
    }

    ride.refundStatus = "pending";
    await ride.save();

    return res.json({
      success: true,
      message: `Refund approved by admin.`,
    });
  } catch (err) {
    console.error("Approve Refund Error:", err);
    return res.json({ success: false, message: "Approval failed" });
  }
};

export const getSingleRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    return res.json({ success: true, ride });
  } catch (err) {
    console.error("Get Ride Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRideForModify = async (req, res) => {
  try {
    const { rideId } = req.params;

    let ride = null;

    if (req.user.role === "corporate") {
      ride = await CorporateRide.findById(rideId);
    } else {
      ride = await Ride.findById(rideId);
    }

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    return res.json({ success: true, ride });

  } catch (err) {
    console.error("getRideForModify error:", err);
    return res.status(500).json({ success: false });
  }
};