import Car from "../models/Car.js";
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";

export const getAvailableCars = async (req, res) => {
  try {
    const { category, date, time, durationMinutes } = req.query;

    const BUFFER_MIN = 120;
    const bufferMs = BUFFER_MIN * 60000;
    const durationMs = Number(durationMinutes || 0) * 60000;

    const userStart = new Date(`${date}T${time}`);
    const userEnd = new Date(userStart.getTime() + durationMs);

    const userWindowStart = userStart;
    const userWindowEnd = userEnd;

    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;

    const cars = await Car.find(filter);

    const [normalRides, corporateRides] = await Promise.all([
      Ride.find({ rideStatus: { $in: ["upcoming", "active"] } }),
      CorporateRide.find({ rideStatus: { $in: ["upcoming", "active"] } })
    ]);

    const rides = [...normalRides, ...corporateRides];
    const availableCars = [];

    for (const car of cars) {
      const carRides = rides.filter(r => {
        const effectiveCarId = r.assignedCarId || r.carId;
        return Number(effectiveCarId) === Number(car.carId);
      });

      let isBlocked = false;

      for (const ride of carRides) {
        let rideStart;

        if (ride.startTime) {
          rideStart = new Date(ride.startTime);
        } else if (ride.date && ride.time) {
          rideStart = new Date(`${ride.date}T${ride.time}`);
        } else {
          continue;
        }

        const rideDurationMs =
          Number(ride.durationMinutes || 0) * 60000;

        const rideEnd = new Date(rideStart.getTime() + rideDurationMs);

        const rideWindowStart = new Date(rideStart.getTime() - bufferMs);
        const rideWindowEnd = new Date(rideEnd.getTime() + bufferMs);

        if (
          userWindowStart < rideWindowEnd &&
          userWindowEnd > rideWindowStart
        ) {
          isBlocked = true;
          break;
        }
      }

      if (!isBlocked) {
        availableCars.push(car);
      }
    }

    return res.json({ success: true, cars: availableCars });

  } catch (err) {
    console.error("getAvailableCars error:", err);
    return res.status(500).json({ success: false });
  }
};
