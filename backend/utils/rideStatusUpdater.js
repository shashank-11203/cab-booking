// utils/rideStatusUpdater.js
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";
import Car from "../models/Car.js";

async function notifyAdmin(title, message) {
  // console.warn("📢 ADMIN ALERT:", title, message);
}

async function isCarAvailableForWindow(
  Model,
  carId,
  targetStart,
  targetEnd,
  excludeRideId
) {
  const conflictingRides = await Model.find({
    _id: { $ne: excludeRideId },
    rideStatus: { $in: ["upcoming", "active"] },
    $or: [
      { assignedCarId: carId },
      { carId: carId },
    ],
  }).lean();

  for (const r of conflictingRides) {
    if (!r.startTime) {
      continue;
    }


    const rStart = new Date(r.startTime);
    const rDuration = Number(r.durationMinutes || 120);
    const rEnd = new Date(rStart.getTime() + rDuration * 60000);

    if (rStart < targetEnd && targetStart < rEnd) {
      return false;
    }
  }

  return true;
}

/* ======================================================
   AUTO-ASSIGN
====================================================== */
async function attemptAutoAssignPreferredCar(Model, ride) {
  if (!ride.carId) return null;

  const start = new Date(ride.startTime);
  const duration = Number(ride.durationMinutes || 120);
  const end = new Date(start.getTime() + duration * 60000);

  const car = await Car.findOne({
    carId: ride.carId,
    isActive: true,
  }).lean();

  if (!car) return null;

  const isFree = await isCarAvailableForWindow(
    Model,
    car.carId,
    start,
    end,
    ride._id
  );

  if (!isFree) return null;

  ride.assignedCarId = car.carId;
  ride.assignedCarName = car.name || `Car-${car.carId}`;
  ride.assignedAt = new Date();

  await ride.save();

  return {
    carId: car.carId,
    name: ride.assignedCarName,
  };
}

/* ======================================================
   PROCESS RIDES
====================================================== */
async function processRides(Model, label) {
  const AUTO_ASSIGN_WINDOW_MS = 2 * 60 * 1000;
  const now = new Date();

  const rides = await Model.find({
    rideStatus: "upcoming",
    startTime: { $lte: now },
  });

  for (const ride of rides) {
    if (!ride) continue;

    if (ride.assignedCarId) {
      ride.rideStatus = "active";
      ride.activatedAt = new Date();
      await ride.save();
      continue;
    }

    const lateness = now.getTime() - new Date(ride.startTime).getTime();

    if (lateness <= AUTO_ASSIGN_WINDOW_MS) {
      const assigned = await attemptAutoAssignPreferredCar(Model, ride);

      if (assigned) {
        ride.rideStatus = "active";
        ride.activatedAt = new Date();
        await ride.save();

        await notifyAdmin(
          `${label} ride auto-assigned`,
          `Ride ${ride._id} auto-assigned car ${assigned.carId}`
        );
      } else {
        ride.awaitingAdminAssignment = true;
        await ride.save();

        await notifyAdmin(
          `${label} ride needs manual assignment`,
          `Ride ${ride._id} preferred car unavailable`
        );
      }
    } else {
      ride.awaitingAdminAssignment = true;
      await ride.save();

      await notifyAdmin(
        `${label} ride missed auto-assign window`,
        `Ride ${ride._id} requires manual assignment`
      );
    }
  }
}

/* ======================================================
   START UPDATER
====================================================== */
export function startRideStatusUpdater() {
  async function runOnce() {
    try {
      await processRides(Ride, "Normal");
      await processRides(CorporateRide, "Corporate");
    } catch (err) {
      console.error("rideStatusUpdater error:", err);
    }
  }

  runOnce();

  setInterval(runOnce, 60 * 1000);
}