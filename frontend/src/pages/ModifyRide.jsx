import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AutocompleteInput from "../components/AutocompleteInput";

const ModifyRide = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);

    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);

    const [pickupText, setPickupText] = useState("");
    const [dropText, setDropText] = useState("");

    const [date, setDate] = useState("");
    const [passengers, setPassengers] = useState(1);

    const [time, setTime] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [showTimes, setShowTimes] = useState(false);
    const timeRef = useRef(null);

    const generateTimes = () => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m of ["00"]) {
                let hour12 = h % 12 || 12;
                let ampm = h < 12 ? "AM" : "PM";
                let label = `${hour12.toString().padStart(2, "0")}:${m} ${ampm}`;
                let value = `${h.toString().padStart(2, "0")}:${m}`;
                options.push({ label, value });
            }
        }
        return options;
    };
    const timeOptions = generateTimes();

    const format24To12 = (time24) => {
        if (!time24) return "";
        const [hr, mn] = time24.split(":");
        const hour = parseInt(hr);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${mn} ${ampm}`;
    };

    const format12To24 = (time12) => {
        if (!time12) return "";

        const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return "";

        let hour = parseInt(match[1]);
        const min = match[2];
        const ampm = match[3].toUpperCase();

        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;

        return `${hour.toString().padStart(2, "0")}:${min}`;
    };

    const handleTimeInputChange = (e) => {
        const value = e.target.value;
        setTimeInput(value);

        const time24 = format12To24(value);
        if (time24) {
            setTime(time24);
        }
    };

    const handleTimeSelect = (value) => {
        setTime(value);
        setTimeInput(format24To12(value));
        setShowTimes(false);
    };

    useEffect(() => {
        if (time && !timeInput) {
            setTimeInput(format24To12(time));
        }
    }, [time]);

    const today = new Date();

    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    const minDate = today.toISOString().split("T")[0];
    const maxDate = sixMonths.toISOString().split("T")[0];

    useEffect(() => {
        function handleClick(e) {
            if (timeRef.current && !timeRef.current.contains(e.target)) {
                setShowTimes(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        const loadRide = async () => {
            try {
                const res = await apiClient.get(`/api/v1/rides/${rideId}/modify`);

                if (res.data.success) {
                    const r = res.data.ride;
                    setRide(r);
                    setPickup({
                        name: r.pickupName,
                        lat: r.pickupLat,
                        lon: r.pickupLon
                    });
                    setPickupText(r.pickupName);

                    setDrop({
                        name: r.dropName,
                        lat: r.dropLat,
                        lon: r.dropLon
                    });
                    setDropText(r.dropName);

                    setDate(r.date);
                    setTime(r.time);
                    setTimeInput(format24To12(r.time));

                    setPassengers(r.passengers || 1);
                }
                else {
                    toast.error("Unable to load ride");
                }
            } catch (err) {
                toast.error("Unable to load ride");
            } finally {
                setLoading(false);
            }
        };

        loadRide();
    }, [rideId]);

    const handleSave = async () => {
        if (!pickup || !drop) {
            toast.error("Please select both pickup and drop locations");
            return;
        }

        if (!date || !time) {
            toast.error("Please select date and time");
            return;
        }

        try {
            const res = await apiClient.put(`/api/v1/rides/update/${rideId}`, {
                pickup: {
                    name: pickup.name,
                    lat: pickup.lat,
                    lng: pickup.lon
                },
                drop: {
                    name: drop.name,
                    lat: drop.lat,
                    lng: drop.lon
                },
                date,
                time,
                passengers: parseInt(passengers),
            });

            if (res.data.success) {
                toast.success("Ride updated successfully!");
                navigate("/bookings");
            } else {
                toast.error(res.data.message || "Could not update ride");
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Could not update ride");
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex justify-center items-center 
                            bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900
                            px-4">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 mx-auto border-b-4 border-yellow-400 rounded-full mb-4"></div>
                    <p className="text-base sm:text-xl text-gray-500 [[data-theme=dark]_&]:text-gray-400">
                        Loading...
                    </p>
                </div>
            </div>
        );

    return (
        <div
            className="
                min-h-screen 
                bg-yellow-50 
                [[data-theme=dark]_&]:bg-gray-900 
                transition-colors duration-500
                px-4 sm:px-6 md:px-8 lg:px-10
                py-8 sm:py-10 md:py-12
            "
        >
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-yellow-500 mb-6 sm:mb-8"
            >
                Modify Your Ride
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                    max-w-3xl mx-auto 
                    p-5 sm:p-6 md:p-8 
                    rounded-xl sm:rounded-2xl
                    bg-white [[data-theme=dark]_&]:bg-gray-800
                    border border-yellow-300/40
                    [[data-theme=dark]_&]:border-yellow-300/10
                    shadow-lg
                "
            >
                <p className="text-xs sm:text-sm text-blue-400 [[data-theme=dark]_&]:text-blue-300 mb-4 sm:mb-6">
                    *Modifying locations will be charged extra. If any location is updated, our team will contact you for pricing
                </p>

                <label className="block mb-2 my-3 font-medium text-sm sm:text-base
                                  text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                    Pickup Location
                </label>

                <AutocompleteInput
                    value={pickup}
                    onChange={setPickupText}
                    onSelect={(loc) => setPickup(loc)}
                    placeholder="Modify pickup"
                    rideType={ride.rideType}
                    field="pickup"
                    airportDirection=""
                />

                <label className="block mb-2 my-3 font-medium text-sm sm:text-base
                                  text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                    Drop Location
                </label>

                <AutocompleteInput
                    value={drop}
                    onChange={setDropText}
                    onSelect={(loc) => setDrop(loc)}
                    placeholder="Modify drop"
                    rideType={ride.rideType}
                    field="drop"
                    airportDirection=""
                />

                <label className="block mb-2 my-3 font-medium text-sm sm:text-base
                                  text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                    Date
                </label>
                <div
                    onClick={() => document.getElementById("rideDate").showPicker()}
                    className="
                        w-full p-2.5 sm:p-3 rounded-lg border cursor-pointer
                        border-gray-300 
                        [[data-theme=dark]_&]:border-gray-700
                        bg-transparent 
                        [[data-theme=dark]_&]:text-white
                    "
                >
                    <input
                        id="rideDate"
                        type="date"
                        value={date}
                        min={minDate}
                        max={maxDate}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-transparent outline-none cursor-pointer text-sm sm:text-base"
                    />
                </div>

                <div className="relative" ref={timeRef}>
                    <label className="block mb-2 my-3 font-medium text-sm sm:text-base
                                      text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                        Time
                    </label>

                    <input
                        type="text"
                        value={timeInput}
                        onChange={handleTimeInputChange}
                        onFocus={() => setShowTimes(true)}
                        placeholder="Select or type time (e.g. 02:30 PM)"
                        className="
                            w-full p-2.5 sm:p-3 rounded-lg border
                            border-gray-300
                            [[data-theme=dark]_&]:border-gray-700
                            bg-white
                            [[data-theme=dark]_&]:bg-gray-800
                            text-gray-900
                            [[data-theme=dark]_&]:text-gray-100
                            focus:ring-2 focus:ring-yellow-400
                            outline-none
                            cursor-pointer
                            text-sm sm:text-base
                        "
                    />

                    {showTimes && (
                        <ul
                            className="
                                absolute z-50 w-full mt-2 bg-white 
                                [[data-theme=dark]_&]:bg-gray-800
                                rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-auto
                                border border-gray-200
                                [[data-theme=dark]_&]:border-gray-700
                            "
                        >
                            {timeOptions.map((t) => (
                                <li
                                    key={t.value}
                                    className={`
                                        p-2.5 sm:p-3 cursor-pointer text-gray-900
                                        [[data-theme=dark]_&]:text-gray-100
                                        hover:bg-yellow-100
                                        [[data-theme=dark]_&]:hover:bg-gray-700
                                        transition-colors
                                        text-sm sm:text-base
                                        ${time === t.value ? 'bg-yellow-50 [[data-theme=dark]_&]:bg-gray-700' : ''}
                                    `}
                                    onClick={() => handleTimeSelect(t.value)}
                                >
                                    {t.label}
                                </li>
                            ))}
                        </ul>
                    )}

                    {timeInput && !format12To24(timeInput) && (
                        <p className="text-xs text-red-500 mt-1">
                            Please enter time in format: HH:MM AM/PM (e.g., 02:30 PM)
                        </p>
                    )}
                </div>

                <label className="block mb-2 my-3 font-medium text-sm sm:text-base
                                  text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                    Passengers
                </label>
                <input
                    type="number"
                    min="1"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="
                        w-full p-2.5 sm:p-3 mb-4 sm:mb-6 rounded-lg bg-transparent border 
                        border-gray-400 [[data-theme=dark]_&]:border-gray-600
                        [[data-theme=dark]_&]:text-white
                        text-sm sm:text-base
                    "
                />

                <button
                    onClick={handleSave}
                    className="
                        w-full mt-3 sm:mt-4 
                        py-2.5 sm:py-3 
                        rounded-xl 
                        bg-yellow-400 text-black font-semibold
                        hover:bg-yellow-500 transition cursor-pointer
                        text-sm sm:text-base
                    "
                >
                    Save Changes
                </button>
            </motion.div>
        </div>
    );
};

export default ModifyRide;