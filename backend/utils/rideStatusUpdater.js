import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";
import Car from "../models/Car.js";

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
    if (!r.startTime) continue;

    const rStart = new Date(r.startTime);
    const rDuration = Number(r.durationMinutes || 120);
    const rEnd = new Date(rStart.getTime() + rDuration * 60000);

    if (rStart < targetEnd && targetStart < rEnd) {
      return false;
    }
  }

  return true;
}

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
      } else {
        ride.awaitingAdminAssignment = true;
        await ride.save();
      }
    } else {
      ride.awaitingAdminAssignment = true;
      await ride.save();
    }
  }
}

// ✅ Export this function to be called on-demand
export async function updateRideStatuses() {
  try {
    await processRides(Ride, "Normal");
    await processRides(CorporateRide, "Corporate");
  } catch (err) {
    console.error("updateRideStatuses error:", err);
  }
}