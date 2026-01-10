import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AutocompleteInput from "../components/AutocompleteInput";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { calculateDistance, validateLocation } from "../utils/bookingApiClient";

const rideTypes = [
  { key: "outstation", label: "Outstation" },
  { key: "local", label: "Local" },
  { key: "oneway", label: "One-way" },
  { key: "airport", label: "Airport" },
];

const BookingForm = ({ onShowCabs }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");
  const [rideType, setRideType] = useState("outstation");
  const [airportDirection, setAirportDirection] = useState("");

  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const [time, setTime] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [showTimes, setShowTimes] = useState(false);
  const timeRef = useRef(null);
  const [hasShownCabs, setHasShownCabs] = useState(false);

  useEffect(() => {
    function handleClick(e) {
      if (timeRef.current && !timeRef.current.contains(e.target)) {
        setShowTimes(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    const fetchDistance = async () => {
      if (!pickup || !drop) return;

      setCalculating(true);
      setDistanceKm(null);
      setDurationMinutes(null);

      try {
        const res = await calculateDistance({
          pickupLat: pickup.lat,
          pickupLon: pickup.lon,
          dropLat: drop.lat,
          dropLon: drop.lon,
        });

        if (res.data?.success) {
          setDistanceKm(res.data.distanceKm);
          setDurationMinutes(res.data.durationMinutes);
        }
      } catch (err) {
        if (err.code !== "ERR_CANCELED") console.error("Distance Error", err);
      }

      setCalculating(false);
    };

    fetchDistance();
  }, [pickup, drop]);

  const validateBookingTime = (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) return { valid: false, message: "Please select both date and time" };

    const now = new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(year, month - 1, day, hours, minutes);

    if (bookingDateTime <= now) {
      return { valid: false, message: "Booking time must be in the future" };
    }

    return { valid: true, message: "" };
  };

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

  const ready = useMemo(
    () => pickup && drop && date && time && rideType,
    [pickup, drop, date, time, rideType]
  );

  const today = new Date();

  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() + 6);

  const minDate = today.toISOString().split("T")[0];
  const maxDate = sixMonths.toISOString().split("T")[0];

  useEffect(() => {
    if (hasShownCabs && pickup && drop && date && time && rideType && distanceKm !== null) {
      onShowCabs({
        pickup,
        drop,
        date,
        time,
        tripType: rideType,
        distanceKm,
        durationMinutes,
      });
    }
  }, [pickup, drop, date, time, rideType, distanceKm, durationMinutes, hasShownCabs]);

  const handleShowCabs = () => {
    if (!user) {
      return toast.error("Please log in to book a ride.");
    }
    if (!pickup) return toast.error("Select a valid pickup location");
    if (!drop) return toast.error("Select a valid drop location");
    if (pickup.lat === drop.lat && pickup.lon === drop.lon)
      return toast.error("Pickup and drop cannot be the same");

    const isPickupAirport =
      pickup.name.toLowerCase().includes("airport") ||
      pickup.name.toLowerCase().includes("terminal");

    const isDropAirport =
      drop.name.toLowerCase().includes("airport") ||
      drop.name.toLowerCase().includes("terminal");

    if (rideType === "airport") {
      if (!isPickupAirport && !isDropAirport)
        return toast.error("For airport rides, either pickup OR drop must be an airport.");

      if (isPickupAirport && isDropAirport)
        return toast.error("Airport rides cannot have both pickup and drop as airports.");
    }
    const { valid, message } = validateBookingTime(date, time);
    if (!valid) return toast.error(message);

    setHasShownCabs(true);
    onShowCabs({
      pickup,
      drop,
      date,
      time,
      tripType: rideType,
      distanceKm,
      durationMinutes,
    });
  };

  return (
    <section className="max-w-6xl mx-auto 
                        px-4 sm:px-6 md:px-8 lg:px-10
                        py-4 sm:py-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-white/90 
          [[data-theme=dark]_&]:bg-gray-800/70
          border border-yellow-200/40 
          [[data-theme=dark]_&]:border-yellow-300/20
          rounded-xl sm:rounded-2xl 
          shadow-lg 
          p-5 sm:p-6 md:p-8
          backdrop-blur-md 
          transition-colors duration-300
        "
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 
                       mb-4 sm:mb-6">
          Book Your Ride
        </h3>

        <div className="mt-4 sm:mt-6">
          <label className="block text-sm sm:text-base mb-2 font-medium 
                            text-gray-800 [[data-theme=dark]_&]:text-gray-200">
            Ride Type
          </label>

          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {rideTypes.map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setRideType(r.key);
                  setAirportDirection("");

                  if (!hasShownCabs) {
                    setPickup(null);
                    setDrop(null);
                  }
                }}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl 
                  border transition-all cursor-pointer
                  text-sm sm:text-base
                  ${rideType === r.key
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "text-gray-700 [[data-theme=dark]_&]:text-gray-200 border-gray-400/40"
                  }
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {rideType === "airport" && (
            <div>
              <label className="block text-sm sm:text-base mb-2 font-medium 
                                text-gray-800 [[data-theme=dark]_&]:text-gray-200">
                Select Pickup / Drop
              </label>

              <select
                value={airportDirection}
                onChange={(e) => {
                  setAirportDirection(e.target.value);
                  setPickup(null);
                  setDrop(null);
                }}
                className="w-full p-2.5 sm:p-3 rounded-lg border 
                           border-gray-300 
                           [[data-theme=dark]_&]:border-gray-700 
                           bg-transparent 
                           text-gray-900 
                           [[data-theme=dark]_&]:text-gray-100
                           focus:ring-2 focus:ring-yellow-400 outline-none
                           text-sm sm:text-base"
              >
                <option value="" className="bg-white text-black [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:text-white">
                  Select Pickup / Drop
                </option>
                <option value="pickup-airport" className="bg-white text-black [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:text-white">
                  Pickup From Airport
                </option>
                <option value="drop-airport" className="bg-white text-black [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:text-white">
                  Drop To Airport
                </option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base mb-2 font-medium 
                              text-gray-800 [[data-theme=dark]_&]:text-gray-200">
              Pickup
            </label>

            <AutocompleteInput
              rideType={rideType}
              field="pickup"
              airportDirection={airportDirection}
              onChange={(val) => setPickupText(val)}
              onSelect={async (p) => {
                if (p.custom) {
                  const { data } = await validateLocation({ text: p.name });
                  if (!data.success) return toast.error("Invalid custom location");
                  setPickup({
                    name: data.formattedName,
                    lat: data.lat,
                    lon: data.lon,
                  });
                  return;
                }
                setPickup(p);
              }}
              placeholder="Enter pickup"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base mb-2 font-medium 
                              text-gray-800 [[data-theme=dark]_&]:text-gray-200">
              Drop
            </label>

            <AutocompleteInput
              rideType={rideType}
              field="drop"
              airportDirection={airportDirection}
              onChange={(val) => setDropText(val)}
              onSelect={async (p) => {
                if (p.custom) {
                  const { data } = await validateLocation({ text: p.name });
                  if (!data.success) return toast.error("Invalid custom location");
                  setDrop({
                    name: data.formattedName,
                    lat: data.lat,
                    lon: data.lon,
                  });
                  return;
                }
                setDrop(p);
              }}
              placeholder="Enter drop"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div>
            <label className="block text-sm sm:text-base mb-2 font-medium 
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
          </div>

          <div className="relative" ref={timeRef}>
            <label className="block text-sm sm:text-base mb-2 font-medium 
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
                placeholder:text-xs sm:placeholder:text-sm
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
        </div>

        {pickup && drop && (
          <div
            className="
              mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border 
              border-yellow-300/40 
              bg-yellow-50/50 
              [[data-theme=dark]_&]:bg-gray-700/40 
              [[data-theme=dark]_&]:border-yellow-200/20
            "
          >
            {calculating && (
              <p className="text-gray-700 [[data-theme=dark]_&]:text-gray-200 text-xs sm:text-sm">
                Calculating distance...
              </p>
            )}

            {!calculating && distanceKm !== null && (
              <div>
                <p className="text-gray-800 [[data-theme=dark]_&]:text-gray-100 font-semibold text-sm sm:text-base">
                  Distance: <span className="text-yellow-500">{distanceKm} km</span>
                </p>
              </div>
            )}

            {!calculating && distanceKm === null && (
              <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-300 text-xs sm:text-sm">
                Distance not available yet.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <button
            onClick={handleShowCabs}
            disabled={!ready}
            className={`
              w-full sm:w-auto
              px-5 sm:px-6 py-2.5 sm:py-3 
              rounded-full font-semibold transition-all
              text-sm sm:text-base
              ${ready
                ? "bg-yellow-400 text-black hover:shadow-[0_0_18px_rgba(250,204,21,0.45)] cursor-pointer"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }
            `}
          >
            Show Cabs
          </button>

          <button
            onClick={() => {
              setPickup(null);
              setDrop(null);
              setPickupText("");
              setDropText("");
              setAirportDirection("");
              setRideType("outstation");
              setDate(new Date().toISOString().slice(0, 10));
              setTime("");
              setTimeInput("");
              setHasShownCabs(false);
              setDistanceKm(null);
              setDurationMinutes(null);
            }}
            className="
              w-full sm:w-auto
              px-4 sm:px-5 py-2 sm:py-2.5
              rounded-lg border 
              border-gray-400/40 
              text-gray-800 
              [[data-theme=dark]_&]:text-gray-200 
              [[data-theme=dark]_&]:border-gray-600 
              hover:bg-yellow-100 
              [[data-theme=dark]_&]:hover:bg-gray-700 
              transition-all cursor-pointer
              text-sm sm:text-base
            "
          >
            Reset
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default BookingForm;