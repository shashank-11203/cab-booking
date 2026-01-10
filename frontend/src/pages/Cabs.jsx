// src/pages/Cabs.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";

const useQuery = () => new URLSearchParams(useLocation().search);

const Cabs = () => {
  const { theme } = useTheme();
  const q = useQuery();
  const navigate = useNavigate();

  const pickupName = q.get("pickupName");
  const pickupLat = q.get("pickupLat");
  const pickupLon = q.get("pickupLon");
  const dropName = q.get("dropName");
  const dropLat = q.get("dropLat");
  const dropLon = q.get("dropLon");
  const rideType = q.get("rideType");
  const date = q.get("date");
  const time = q.get("time");

  useEffect(() => {
    if (!pickupLat || !dropLat) {
      toast.error("Missing location data. Please search again.");
      navigate("/");
    }
  }, []);

  const distanceKm = useMemo(() => {
    if (!pickupLat || !pickupLon || !dropLat || !dropLon) return null;
    const lat1 = parseFloat(pickupLat);
    const lon1 = parseFloat(pickupLon);
    const lat2 = parseFloat(dropLat);
    const lon2 = parseFloat(dropLon);
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  }, [pickupLat, pickupLon, dropLat, dropLon]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-yellow-50 text-gray-900"} p-6`}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Available Cabs</h2>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <p className="mb-2">
            <strong>From:</strong> {pickupName}
          </p>
          <p className="mb-2">
            <strong>To:</strong> {dropName}
          </p>
          <p className="mb-2">
            <strong>Ride type:</strong> {rideType}
          </p>
          <p className="mb-2">
            <strong>Date & time:</strong> {date} {time}
          </p>

          {distanceKm ? (
            <p className="mb-4"><strong>Approx distance:</strong> {distanceKm} km</p>
          ) : (
            <p className="mb-4 text-sm text-gray-500">Distance unavailable (missing coords)</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Hatchback", "Sedan", "SUV", "Tempo"].map((type) => (
              <div key={type} className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{type}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Seats: {type === "Tempo" ? "9+" : "4"}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{Math.max(199, Math.round((distanceKm || 5) * (type === "SUV" ? 18 : type === "Sedan" ? 14 : type === "Tempo" ? 25 : 10)))}</div>
                    <div className="text-sm text-gray-500">Est fare</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 rounded-lg bg-yellow-400">Book</button>
                  <button className="px-3 py-2 rounded-lg border">Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Cabs;