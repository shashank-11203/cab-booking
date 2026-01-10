import Car from "../models/Car.js";
import Ride from "../models/Ride.js";
import CorporateRide from "../models/CorporateRides.js";

/* -----------------------------------------------------------
   GET ALL CARS
------------------------------------------------------------ */
export const getAllCars = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};
    if (category && category !== "all") filter.category = category;

    const cars = await Car.find(filter).sort({ carId: 1 });

    res.json({
      success: true,
      cars,
      count: cars.length,
    });
  } catch (err) {
    console.error("getAllCars Error", err);
    res.status(500).json({ success: false });
  }
};

/* -----------------------------------------------------------
   ADD CAR
------------------------------------------------------------ */
export const addCar = async (req, res) => {
  try {
    const {
      carId,
      name,
      registrationNumber,
      category,
      seats,
      images,
      pricing,
    } = req.body;

    const exists = await Car.findOne({
      $or: [{ carId }, { registrationNumber }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Car with this ID or registration already exists",
      });
    }

    const car = await Car.create({
      carId,
      name,
      registrationNumber,
      category,
      seats,
      images: images || [],
      pricing: {
        localPrice: pricing.localPrice,
        outstationPrice: pricing.outstationPrice,
        oneWayPrice: pricing.oneWayPrice,
        airportPrice: pricing.airportPrice || pricing.oneWayPrice,
      },
    });

    res.json({ success: true, car });
  } catch (err) {
    console.error("addCar Error", err);
    res.status(500).json({ success: false });
  }
};


/* -----------------------------------------------------------
   DELETE CAR
------------------------------------------------------------ */
export const deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;

    const normalRide = await Ride.findOne({
      rideStatus: { $in: ["active", "upcoming"] },
      $or: [
        { assignedCarId: carId },
        { assignedCarId: { $exists: false }, carId },
      ],
    });

    const corporateRide = await CorporateRide.findOne({
      rideStatus: { $in: ["active", "upcoming"] },
      $or: [{ carId }],
    });

    if (normalRide || corporateRide) {
      return res.status(400).json({
        success: false,
        message: "Car is assigned to a ride and cannot be deleted.",
      });
    }

    await Car.findOneAndDelete({ carId });

    res.json({ success: true, message: "Car deleted" });
  } catch (err) {
    console.error("deleteCar Error", err);
    res.status(500).json({ success: false });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const cars = await Car.find({});

    const [normalRides, corporateRides] = await Promise.all([
      Ride.find({ rideStatus: { $in: ["upcoming", "active"] } }),
      CorporateRide.find({ rideStatus: { $in: ["upcoming", "active"] } }),
    ]);

    const rides = [...normalRides, ...corporateRides];
    const availability = {};

    for (const car of cars) {
      const carRides = rides.filter(r => {
        const effectiveCarId = r.assignedCarId || r.carId;
        return Number(effectiveCarId) === Number(car.carId);
      });

      const activeRide = carRides.find(
        r => r.rideStatus === "active" && r.startTime
      );

      const upcomingRides = carRides
        .filter(r => r.rideStatus === "upcoming" && r.startTime)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .map(r => {
          return {
            rideId: r._id,
            date: r.date,
            time: r.time,
            startTime: r.startTime,
            pickupName: r.pickupName,
            dropName: r.dropName,
          };
        });

      let status = "available";
      let currentRide = null;

      if (activeRide) {
        status = "on_ride";
        currentRide = {
          rideId: activeRide._id,
          pickupName: activeRide.pickupName,
          dropName: activeRide.dropName,
        };
      } else if (upcomingRides.length) {
        status = "booked_future";
      }

      availability[car.carId] = {
        status,
        currentRide,
        upcomingRides,
      };
    }

    res.json({ success: true, availability });
  } catch (err) {
    console.error("checkAvailability Error:", err);
    res.status(500).json({ success: false });
  }
};

export const toggleCarActive = async (req, res) => {
  try {
    const carId = req.params.id;

    const car = await Car.findOne({ carId });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const normalRide = await Ride.findOne({
      rideStatus: { $in: ["upcoming", "active"] },
      $or: [
        { assignedCarId: carId },
        { assignedCarId: { $exists: false }, carId },
      ],
    });

    const corporateRide = await CorporateRide.findOne({
      rideStatus: { $in: ["upcoming", "active"] },
      carId,
    });

    if (car.isActive && (normalRide || corporateRide)) {
      return res.status(400).json({
        success: false,
        message: "Car has assigned rides and cannot be deactivated.",
      });
    }

    car.isActive = !car.isActive;
    await car.save();

    res.json({
      success: true,
      message: `Car is now ${car.isActive ? "Active" : "Inactive"}`,
      car,
    });
  } catch (err) {
    console.error("toggleCarActive Error", err);
    res.status(500).json({ success: false });
  }
};

// adminCarControllers.js
export const updateCar = async (req, res) => {
  try {
    const carId = req.params.id;

    const {
      name,
      category,
      registrationNumber,
      seats,
      images,
      isActive,
      pricing,
    } = req.body;

    const car = await Car.findOne({ carId });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (name !== undefined) car.name = name;
    if (category !== undefined) car.category = category;
    if (registrationNumber !== undefined) car.registrationNumber = registrationNumber;
    if (seats !== undefined) car.seats = seats;
    if (images !== undefined) car.images = images;
    if (isActive !== undefined) car.isActive = isActive;

    if (pricing) {
      if (!car.pricing) car.pricing = {};

      if (pricing.localPrice !== undefined)
        car.pricing.localPrice = pricing.localPrice;

      if (pricing.outstationPrice !== undefined)
        car.pricing.outstationPrice = pricing.outstationPrice;

      if (pricing.oneWayPrice !== undefined)
        car.pricing.oneWayPrice = pricing.oneWayPrice;

      if (pricing.airportPrice !== undefined)
        car.pricing.airportPrice = pricing.airportPrice;
    }

    await car.save();

    res.json({ success: true, message: "Car updated successfully", car });
  } catch (err) {
    console.error("updateCar Error", err);
    res.status(500).json({ success: false });
  }
};