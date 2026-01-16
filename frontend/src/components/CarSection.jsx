import { useState, useEffect } from "react";
import CarCard from "./CarCard";
import PriceSummary from "./PriceSummary";
import apiClient from "../utils/apiClient";

const CarsSection = ({ tripData, onBookCar }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    const formatTime = (time24) => {
        if (!time24) return "";
        const [hr, mn] = time24.split(":");
        const hour = parseInt(hr, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${mn} ${ampm}`;
    };

    useEffect(() => {
        fetchAvailableCars();
    }, [tripData]);

    async function fetchAvailableCars() {
        try {
            setLoading(true);
            const res = await apiClient.get("/api/v1/cars/available", {
                params: {
                    date: tripData.date,
                    time: tripData.time,
                    durationMinutes: tripData.durationMinutes,
                    category: tripData.category || "all",
                },
            });

            setCars(res.data.cars || []);
        } catch (err) {
            console.error("error fetching cars", err);
        } finally {
            setLoading(false);
        }
    }

    const calculateFare = (car) => {
        const pricing = car.pricing || {};
        const distance = Number(tripData?.distanceKm || 0);

        let baseFare = 0;
        let appliedPriceType = "local";

        if (distance > 300) {
            baseFare = Number(pricing.outstationPrice) || 0;
            appliedPriceType = "outstation";
        }
        else {
            if (tripData.tripType === "local") {
                baseFare = Number(pricing.localPrice) || 0;
                appliedPriceType = "local";
            }
            else if (tripData.tripType === "oneway") {
                baseFare = Number(pricing.oneWayPrice) || 0;
                appliedPriceType = "oneway";
            }
            else if (tripData.tripType === "airport") {
                baseFare = Number(pricing.airportPrice || pricing.oneWayPrice) || 0;
                appliedPriceType = "airport";
            }
            else if (tripData.tripType === "outstation") {
                baseFare = Number(pricing.outstationPrice) || 0;
                appliedPriceType = "outstation";
            }
        }

        const gst = Math.round(baseFare * 0.18);
        const serviceCharge = Math.round(baseFare * 0.05);
        const total = baseFare + gst + serviceCharge;

        console.log(`Car: ${car.name}, TripType: ${tripData.tripType}, Distance: ${distance}km, AppliedType: ${appliedPriceType}, BaseFare: ${baseFare}`);

        return {
            baseFare,
            gst,
            serviceCharge,
            total,
            appliedPriceType,
        };
    };

    return (
        <section
            className="
                max-w-7xl 2xl:max-w-screen-2xl mx-auto
                px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14
                py-6 sm:py-8 md:py-10 lg:py-12 
                mt-6 sm:mt-8
                bg-white [[data-theme=dark]_&]:bg-gray-900
                transition-colors duration-500 
                rounded-xl sm:rounded-2xl
            "
        >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 
                           mb-4 sm:mb-6">
                Available Cabs
            </h2>

            <div
                className="
                    mb-6 sm:mb-8 
                    p-4 sm:p-5 md:p-6
                    rounded-xl
                    bg-yellow-50 [[data-theme=dark]_&]:bg-gray-800
                    border border-yellow-200/40 [[data-theme=dark]_&]:border-yellow-200/10
                "
            >
                <div className="space-y-2">
                    <p className="text-sm sm:text-base text-gray-800 [[data-theme=dark]_&]:text-gray-200 break-words">
                        <strong>From:</strong> {tripData.pickup.name}
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 [[data-theme=dark]_&]:text-gray-200 break-words">
                        <strong>To:</strong> {tripData.drop.name}
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                        <strong>Date:</strong> {formatDate(tripData.date)} —{" "}
                        <strong>Time:</strong> {formatTime(tripData.time)}
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                        <strong>Trip Type:</strong> {tripData.tripType?.toUpperCase()} —{" "}
                        <strong>Distance:</strong> {tripData.distanceKm} km
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto border-b-4 border-yellow-400 rounded-full mb-4"></div>
                        <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            Finding available cabs...
                        </p>
                    </div>
                </div>
            )}

            {!loading && cars.length === 0 && (
                <div
                    className="
                        max-w-3xl mx-auto 
                        mt-8 sm:mt-10 md:mt-12 
                        p-6 sm:p-8 md:p-10
                        rounded-xl sm:rounded-2xl 
                        text-center
                        bg-yellow-50 [[data-theme=dark]_&]:bg-gray-800
                        border border-yellow-300/40 [[data-theme=dark]_&]:border-yellow-400/20
                        shadow-lg
                    "
                >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold 
                                   text-yellow-600 [[data-theme=dark]_&]:text-yellow-400">
                        High Demand Right Now
                    </h2>

                    <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl 
                                  text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                        All our cars are currently booked due to heavy demand.
                    </p>

                    <p className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl font-bold 
                                  text-yellow-600 [[data-theme=dark]_&]:text-yellow-400">
                        📞 Contact Support: 98254 27572
                    </p>
                </div>
            )}

            {!loading && cars.length > 0 && (
                <div
                    className="
                        grid grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-3
                        2xl:grid-cols-4
                        gap-4 sm:gap-6 md:gap-8
                    "
                >
                    {cars.map((car) => {
                        const fare = calculateFare(car);

                        return (
                            <CarCard
                                key={car._id || car.carId}
                                car={car}
                                distance={tripData?.distanceKm}
                                finalPrice={fare.total}
                                appliedPriceType={fare.appliedPriceType}
                                onBook={() => onBookCar({ ...car, ...fare })}
                                onShowSummary={() => setSelectedCar({ ...car, ...fare })}
                            />
                        );
                    })}
                </div>
            )}

            {selectedCar && (
                <PriceSummary
                    car={selectedCar}
                    distance={tripData?.distanceKm}
                    onClose={() => setSelectedCar(null)}
                />
            )}
        </section>
    );
};

export default CarsSection;