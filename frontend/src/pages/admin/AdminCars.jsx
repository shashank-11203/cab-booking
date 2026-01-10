import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Power,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Car,
} from "lucide-react";
import apiClient from "../../utils/apiClient";
import { useTheme } from "../../context/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";

const placeholderImg =
  "https://res.cloudinary.com/demo/image/upload/w_800,h_500,c_fill,q_auto,f_auto/sample.jpg";

export default function AdminCars() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCar, setSelectedCar] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const location = useLocation();
  const { search, state } = location;
  const params = new URLSearchParams(search);
  const assignRide = params.get("assignRide");
  const preferredCar = params.get("preferredCar");
  const rideDetails = state?.rideDetails || null;
  const navigate = useNavigate();

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = time24 => {
    if (!time24) return "";
    const [hr, mn] = time24.split(":");
    const h = parseInt(hr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${mn} ${ampm}`;
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    return `${formatDate(dateStr)}, ${formatTime(timeStr)}`;
  };

  // Fetch cars initially and when filter changes
  useEffect(() => {
    fetchCars();
  }, [filter, refreshKey]);

  // Polling for availability updates (only when tab is active)
  useEffect(() => {
    let intervalId = null;

    const fetchAvailability = async () => {
      try {
        const res = await apiClient.get("/api/v1/admin/cars/availability");

        if (res.data?.success && res.data.availability) {
          const updates = res.data.availability;

          // Update cars with new availability
          setCars(prev =>
            prev.map(car => {
              const newAvailability = updates[car._id] ?? updates[car.carId];

              // Only update if availability actually changed
              if (newAvailability !== undefined && newAvailability !== car.availability) {
                console.log(`Car ${car.name} availability changed: ${car.availability} → ${newAvailability}`);
                return { ...car, availability: newAvailability };
              }

              return car;
            })
          );
        }
      } catch (err) {
        console.error("Availability update error:", err);
      }
    };

    const startPolling = () => {
      // Clear any existing interval
      if (intervalId) clearInterval(intervalId);

      // Fetch immediately
      fetchAvailability();

      // Then poll every 60 seconds
      intervalId = setInterval(fetchAvailability, 60000);
      console.log("✅ Polling started");
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("⏸️ Polling stopped");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Tab visible - starting polling");
        startPolling();
      } else {
        console.log("🙈 Tab hidden - stopping polling");
        stopPolling();
      }
    };

    // Start polling if tab is currently visible
    if (document.visibilityState === "visible") {
      startPolling();
    }

    // Listen for tab visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cars.length]); // Re-run if cars array changes

  async function fetchCars() {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/v1/admin/cars", {
        params: { category: filter === "all" ? undefined : filter },
      });

      const carsWithAvail = res.data.cars || [];
      console.log("📦 Fetched cars:", carsWithAvail.length);
      setCars(carsWithAvail);
    } catch (err) {
      console.error("fetchCars error:", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCars() {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/v1/admin/cars", {
        params: { category: filter === "all" ? "all" : filter },
      });
      const carsWithAvail = res.data.cars || [];
      setCars(carsWithAvail);
    } catch (err) {
      console.error("fetchCars:", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(carId) {
    if (!window.confirm("Delete this car permanently?")) return;
    try {
      await apiClient.delete(`/api/v1/admin/cars/${carId}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("delete:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  }

  async function handleToggle(carId) {
    try {
      await apiClient.put(`/api/v1/admin/cars/${carId}/toggle`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("toggle:", err);
      alert(err?.response?.data?.message || "Toggle failed");
    }
  }

  async function handleAssignCar(carId) {
    if (!assignRide) return;

    if (!window.confirm(`Assign car #${carId} to this ride?`)) return;

    try {
      const res = await apiClient.put(`/api/v1/admin/rides/${assignRide}/assign-car`, {
        carId,
      });

      if (!res.data.success) {
        alert(res.data.message || "Failed to assign car");
        return;
      }

      alert(res.data.message || "Car assigned successfully");
      navigate("/admin/rides");
    } catch (err) {
      console.error("assign car:", err);
      alert(err?.response?.data?.message || "Failed to assign car");
    }
  }

  function availabilityBadge(availability) {
    if (!availability)
      return { text: "Unknown", icon: AlertCircle, color: "gray" };

    if (availability.status === "on_ride")
      return { text: "On Ride", icon: CheckCircle, color: "green" };

    if (availability.status === "booked_future") {
      const upcoming = availability.upcomingRides || [];
      const first = upcoming[0];
      let label = "Booked";

      if (first) {
        const now = new Date();
        const rideDateTime = new Date(`${first.date}T${first.time || "00:00"}`);
        const diffMs = rideDateTime.getTime() - now.getTime();

        if (diffMs > 0) {
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          label = `Booked (in ${diffDays}d)`;
        }
      }

      return {
        text: label,
        icon: Clock,
        color: "amber",
      };
    }

    return { text: "Available", icon: CheckCircle, color: "blue" };
  }

  const filterButtons = [
    { value: "all", label: "All Cars" },
    { value: "suv", label: "SUV" },
    { value: "sedan", label: "Sedan" },
    { value: "hatchback", label: "Hatchback" },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 p-1 sm:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white mb-2">
                Fleet Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                Manage your vehicle fleet with real-time availability tracking
              </p>

              {assignRide && rideDetails && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 [[data-theme=dark]_&]:bg-blue-900/20 border border-blue-200 [[data-theme=dark]_&]:border-blue-800 text-xs sm:text-sm text-gray-800 [[data-theme=dark]_&]:text-gray-100 space-y-1">
                  <p className="font-semibold">
                    Assigning car for Ride #{rideDetails.id.slice(-6).toUpperCase()}
                  </p>
                  <p>
                    <span className="font-medium">Route:</span>{" "}
                    {rideDetails.pickupName} → {rideDetails.dropName}
                  </p>
                  <p>
                    <span className="font-medium">Date &amp; Time:</span>{" "}
                    {formatDateTime(rideDetails.date, rideDetails.time)}
                  </p>
                  <p>
                    <span className="font-medium">Preferred Car:</span>{" "}
                    {rideDetails.preferredCarName || "N/A"}{" "}
                    {rideDetails.preferredCarId && (
                      <span className="opacity-70">
                        (ID: {rideDetails.preferredCarId})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {assignRide && !rideDetails && (
                <p className="mt-2 text-xs sm:text-sm font-medium text-blue-600 [[data-theme=dark]_&]:text-blue-400">
                  Assigning car for Ride ID: <span className="font-bold">{assignRide}</span>
                  {preferredCar && (
                    <>
                      {" "}
                      • Preferred car ID:{" "}
                      <span className="font-bold">{preferredCar}</span>
                    </>
                  )}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setModalMode("add");
                setSelectedCar(null);
                setIsCarModalOpen(true);
              }}

              className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add New Car</span>
              <span className="sm:hidden">Add Car</span>
            </motion.button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {filterButtons.map(btn => (
              <motion.button
                key={btn.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(btn.value)}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${filter === btn.value
                  ? "bg-yellow-400 text-black shadow-md"
                  : "bg-white [[data-theme=dark]_&]:bg-gray-800 text-gray-700 [[data-theme=dark]_&]:text-gray-300 border border-gray-200 [[data-theme=dark]_&]:border-gray-700 hover:border-yellow-400"
                  }`}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4" />
              <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading fleet...</p>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
              No Cars Found
            </h3>
            <p className="text-gray-500 [[data-theme=dark]_&]:text-gray-400">
              Add your first car to get started
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 sm:gap-5 lg:gap-6"
          >

            {cars.map((car, index) => {
              const availability = car.availability || null;
              const badge = availabilityBadge(availability);
              const Icon = badge.icon;
              const isPreferred =
                preferredCar && String(car.carId) === String(preferredCar);

              const currentRide = availability?.currentRide || null;
              const upcomingRides = availability?.upcomingRides || [];

              return (
                <motion.div
                  key={car.carId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`
    relative group rounded-2xl border shadow-sm transition-all
    bg-white [[data-theme=dark]_&]:bg-gray-800
    border-gray-200 [[data-theme=dark]_&]:border-gray-700
    hover:shadow-xl

    ${isPreferred
                      ? `
        border-2 border-yellow-400
        bg-yellow-100 [[data-theme=dark]_&]:bg-yellow-800/30
        shadow-[0_0_0_2px_rgba(250,204,21,0.3)]
      `
                      : ""
                    }
  `}
                >

                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">

                    <div className="relative w-full sm:w-48 md:w-56 lg:w-64 h-40 sm:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 [[data-theme=dark]_&]:bg-gray-700">
                      <img
                        src={(car.images && car.images[0]) || placeholderImg}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={e => (e.currentTarget.src = placeholderImg)}
                      />

                      {isPreferred && (
                        <div className="
    absolute top-3 left-3 z-20
    px-3 py-1 rounded-full text-xs font-bold
    bg-yellow-400 text-black
    shadow-lg
    flex items-center gap-1
    animate-pulse
  ">
                          User Preferred Car
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <span
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color === "green"
                            ? "bg-green-500 text-white"
                            : badge.color === "amber"
                              ? "bg-amber-500 text-white"
                              : badge.color === "blue"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                        >
                          <Icon size={12} />
                          {badge.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">

                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                            {car.name}
                          </h3>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${car.isActive
                              ? "bg-emerald-500 text-white"
                              : "bg-red-500 text-white"
                              }`}
                          >
                            {car.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 mt-1">
                          {car.registrationNumber} • {car.category.toUpperCase()} • {car.seats || "-"} Seats
                        </p>

                        {car.pricing && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Local</p>
                              <p className="font-semibold">₹{car.pricing.localPrice}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Outstation</p>
                              <p className="font-semibold">₹{car.pricing.outstationPrice}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">One Way</p>
                              <p className="font-semibold">₹{car.pricing.oneWayPrice}</p>
                            </div>
                            {car.pricing.airportPrice && (
                              <div>
                                <p className="text-gray-500">Airport</p>
                                <p className="font-semibold">₹{car.pricing.airportPrice}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {assignRide && (
                          <button
                            onClick={() => handleAssignCar(car.carId)}
                            className="px-4 py-2 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                          >
                            <Car size={14} /> Assign
                          </button>
                        )}

                        <button
                          onClick={() => handleToggle(car.carId)}
                          className="px-4 py-2 text-sm rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black flex items-center gap-2"
                        >
                          <Power size={14} />
                          {car.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => {
                            setModalMode("edit");
                            setSelectedCar(car);
                            setIsCarModalOpen(true);
                          }}
                          className="px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Update
                        </button>


                        <button
                          onClick={() => handleDelete(car.carId)}
                          className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {upcomingRides.length > 0 && (
                    <div className="mt-4 rounded-xl border border-amber-200 [[data-theme=dark]_&]:border-amber-700 bg-amber-50 [[data-theme=dark]_&]:bg-amber-900/20 overflow-hidden m-5">

                      <div className="flex items-center justify-between px-4 py-2 border-b border-amber-200 [[data-theme=dark]_&]:border-amber-700">
                        <p className="text-sm font-semibold text-amber-800 [[data-theme=dark]_&]:text-amber-300">
                          Upcoming Rides
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 [[data-theme=dark]_&]:bg-amber-700 [[data-theme=dark]_&]:text-amber-100">
                          {upcomingRides.length}
                        </span>
                      </div>

                      <div className="divide-y divide-amber-200 [[data-theme=dark]_&]:divide-amber-700">
                        {upcomingRides.map((ride, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 text-sm text-gray-800 [[data-theme=dark]_&]:text-gray-200"
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 text-amber-600 [[data-theme=dark]_&]:text-amber-400">📍</span>
                              <p className="font-medium leading-snug">
                                {ride.pickupName}
                                <span className="mx-1 opacity-60">→</span>
                                {ride.dropName}
                              </p>
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                              <span>🕒</span>
                              <span>{formatDateTime(ride.date, ride.time)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>

              );

            })}
          </motion.div>
        )}

        <AnimatePresence>
          {isCarModalOpen && (
            <AddCarModal
              mode={modalMode}
              car={selectedCar}
              onClose={() => {
                setIsCarModalOpen(false);
                setSelectedCar(null);
                setRefreshKey(k => k + 1);
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function AddCarModal({ onClose, mode = "add", car = null }) {
  const overlayRef = useRef(null);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (isEdit && car) {
      setForm({
        carId: car.carId,
        name: car.name || "",
        registrationNumber: car.registrationNumber || "",
        category: car.category || "sedan",
        seats: car.seats || "",
        images: car.images || [],

        localPrice: car.pricing?.localPrice || "",
        outstationPrice: car.pricing?.outstationPrice || "",
        oneWayPrice: car.pricing?.oneWayPrice || "",
        airportPrice: car.pricing?.airportPrice || "",
      });
    }
  }, [isEdit, car]);

  const [form, setForm] = useState({
    carId: "",
    name: "",
    registrationNumber: "",
    category: "sedan",
    seats: "",
    localPrice: "",
    outstationPrice: "",
    oneWayPrice: "",
    airportPrice: "",
    images: [],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    function handleClick(e) {
      if (overlayRef.current && overlayRef.current === e.target) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function uploadToCloudinary(file) {
    const sigRes = await apiClient.get("/api/v1/cloudinary/signature");
    const { timestamp, signature, cloudName, apiKey, folder } = sigRes.data;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", timestamp);
    fd.append("signature", signature);
    if (folder) fd.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await uploadRes.json();
    if (!data?.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: files.length });
      const urls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading image ${i + 1}/${files.length}:`, file.name);
        setUploadProgress({ current: i + 1, total: files.length });

        const url = await uploadToCloudinary(file);
        urls.push(url);
        console.log(`Image ${i + 1} uploaded successfully:`, url);
      }

      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls],
      }));

      console.log("All images uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message || "Check Cloudinary settings"}`);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }

  function removeImage(index) {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.carId ||
      !form.name ||
      !form.registrationNumber ||
      !form.localPrice ||
      !form.outstationPrice ||
      !form.oneWayPrice
    ) {
      return alert("Please fill all required fields.");
    }

    try {
      const payload = {
        carId: Number(form.carId),
        name: form.name,
        registrationNumber: form.registrationNumber,
        category: form.category,
        images: form.images,
        pricing: {
          localPrice: Number(form.localPrice),
          outstationPrice: Number(form.outstationPrice),
          oneWayPrice: Number(form.oneWayPrice),
        },
      };

      if (form.seats) {
        payload.seats = Number(form.seats);
      }

      if (form.airportPrice) {
        payload.pricing.airportPrice = Number(form.airportPrice);
      }

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      if (isEdit) {
        await apiClient.put(`/api/v1/admin/cars/${form.carId}`, payload);
        alert("Car updated successfully!");
      } else {
        await apiClient.post("/api/v1/admin/cars", payload);
        alert("Car added successfully!");
      }

      onClose();
    } catch (err) {
      console.error("add car error:", err);
      console.error("error response:", err?.response?.data);
      alert(err?.response?.data?.message || "Add car failed");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      ref={overlayRef}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.25 }}
        className="w-full max-w-3xl bg-white [[data-theme=dark]_&]:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 [[data-theme=dark]_&]:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 [[data-theme=dark]_&]:text-white">
            {isEdit ? "Update Car" : "Add New Car"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-800"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                Car ID *
              </label>
              <input
                name="carId"
                type="number"
                value={form.carId}
                onChange={onChange}
                placeholder="Unique numeric ID"
                className={`${isEdit ? "bg-gray-200 cursor-not-allowed" : ""
                  }w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                Registration Number *
              </label>
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={onChange}
                placeholder="e.g. GJ01AB1234"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
              Car Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. Swift Dzire"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                Seats
              </label>
              <input
                name="seats"
                type="number"
                value={form.seats}
                onChange={onChange}
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 [[data-theme=dark]_&]:border-gray-700 pt-4">
            <h3 className="text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-white mb-4">
              Pricing Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                  Local Price (₹) *
                </label>
                <input
                  name="localPrice"
                  type="number"
                  value={form.localPrice}
                  onChange={onChange}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                  Outstation Price (₹) *
                </label>
                <input
                  name="outstationPrice"
                  type="number"
                  value={form.outstationPrice}
                  onChange={onChange}
                  placeholder="e.g. 1200"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                  One Way Price (₹) *
                </label>
                <input
                  name="oneWayPrice"
                  type="number"
                  value={form.oneWayPrice}
                  onChange={onChange}
                  placeholder="e.g. 800"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                  Airport Price (₹)
                </label>
                <input
                  name="airportPrice"
                  type="number"
                  value={form.airportPrice}
                  onChange={onChange}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 [[data-theme=dark]_&]:border-gray-600 bg-white [[data-theme=dark]_&]:bg-gray-700 text-gray-900 [[data-theme=dark]_&]:text-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 [[data-theme=dark]_&]:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
              Upload Images
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="car-images"
                disabled={uploading}
              />
              <label
                htmlFor="car-images"
                className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-gray-50 [[data-theme=dark]_&]:bg-gray-700/50 ${uploading
                  ? "border-yellow-400 cursor-not-allowed"
                  : "border-gray-300 [[data-theme=dark]_&]:border-gray-600 hover:border-yellow-400"
                  }`}
              >
                <Upload size={20} className={uploading ? "text-yellow-500 animate-pulse" : "text-gray-500"} />
                <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                  {uploading
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                    : "Click to upload images"}
                </span>
              </label>
            </div>

            {uploading && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 [[data-theme=dark]_&]:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-center text-gray-600 [[data-theme=dark]_&]:text-gray-400 mt-1">
                  Uploading {uploadProgress.current} of {uploadProgress.total} images...
                </p>
              </div>
            )}

            {form.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
                  Uploaded Images ({form.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`Car ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 [[data-theme=dark]_&]:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 [[data-theme=dark]_&]:border-gray-700">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium border border-gray-300 [[data-theme=dark]_&]:border-gray-600 text-gray-700 [[data-theme=dark]_&]:text-gray-300 hover:bg-gray-50 [[data-theme=dark]_&]:hover:bg-gray-700 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={uploading}
              className="flex-1 px-6 py-3 rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading..."
                : isEdit
                  ? "Update Car"
                  : "Add Car"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}