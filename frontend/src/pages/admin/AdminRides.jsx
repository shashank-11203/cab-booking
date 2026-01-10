import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Car,
  User,
  MapPin,
  Calendar,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import apiClient from "../../utils/apiClient";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function AdminRides() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [allRides, setAllRides] = useState([]);

  const filterRef = useRef(filter);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    fetchRides(true);
  }, [filter]);

  useEffect(() => {
    let intervalId = null;
    let isMounted = true;

    async function fetchAndFilter(showLoader = false) {
      try {
        if (showLoader) setLoading(true);

        const res = await apiClient.get("/api/v1/admin/rides");
        const all = res.data.rides || [];

        if (!isMounted) return;

        setAllRides(all);

        const currentFilter = filterRef.current;

        if (currentFilter === "all") {
          setRides(all);
        } else if (currentFilter === "active") {
          setRides(all.filter(r => getRideDisplayStatus(r) === "active"));
        } else {
          setRides(all.filter(r => r.rideStatus === currentFilter));
        }
      } catch (err) {
        console.error("Admin rides polling error:", err);
      } finally {
        if (showLoader) setLoading(false);
      }
    }

    function startPolling(initial = false) {
      if (intervalId) return;

      fetchAndFilter(initial);
      intervalId = setInterval(fetchAndFilter, 15000);
    }

    function stopPolling() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling(true);
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling(true);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function fetchRides(showLoading = true) {
    try {
      if (showLoading) setLoading(true);

      const res = await apiClient.get("/api/v1/admin/rides");
      const all = res.data.rides || [];
      setAllRides(all);

      if (filter === "all") {
        setRides(all);
      } else if (filter === "active") {
        setRides(all.filter(r => getRideDisplayStatus(r) === "active"));
      } else {
        setRides(all.filter(r => r.rideStatus === filter));
      }
    } catch (err) {
      console.error("fetchRides error", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function refundBadge(status) {
    switch (status) {
      case "pending_approval":
        return { label: "Awaiting Admin Approval", color: "text-yellow-600" };
      case "pending":
        return { label: "Refund Processing (Razorpay)", color: "text-blue-600" };
      case "processed":
        return { label: "Refund Completed", color: "text-green-600" };
      case "rejected":
        return { label: "Refund Rejected", color: "text-red-600" };
      default:
        return { label: "No Refund", color: "text-gray-500" };
    }
  }

  async function handleMarkCompleted(rideId) {
    if (!window.confirm("Mark this ride as completed?")) return;

    try {
      await apiClient.put(`/api/v1/admin/rides/${rideId}/complete`);
      fetchRides(false);
    } catch (err) {
      console.error(err);
      alert("Failed to mark ride completed.");
    }
  }

  function handleAssignDriver(ride) {
    const rideId = ride._id;
    const preferredCarId = ride.carId || "";

    navigate(`/admin/cars?assignRide=${rideId}&preferredCar=${preferredCarId}`, {
      state: {
        rideDetails: {
          id: ride._id,
          pickupName: ride.pickupName,
          dropName: ride.dropName,
          date: ride.date,
          time: ride.time,
          preferredCarId,
          preferredCarName: ride.carName,
        },
      },
    });
  }

  const getRideDisplayStatus = ride => {
    const now = new Date();
    const rideDateTime = new Date(`${ride.date}T${ride.time}`);

    if (ride.rideStatus === "upcoming" && rideDateTime <= now) {
      return "active";
    }

    return ride.rideStatus;
  };

  const badge = status => {
    switch (status) {
      case "upcoming":
        return {
          label: "Upcoming",
          bg: "bg-blue-100 [[data-theme=dark]_&]:bg-blue-900/30",
          text: "text-blue-800 [[data-theme=dark]_&]:text-blue-300",
          icon: Clock,
        };
      case "active":
        return {
          label: "Active",
          bg: "bg-green-100 [[data-theme=dark]_&]:bg-green-900/30",
          text: "text-green-800 [[data-theme=dark]_&]:text-green-300",
          icon: Activity,
        };
      case "completed":
        return {
          label: "Completed",
          bg: "bg-gray-100 [[data-theme=dark]_&]:bg-gray-700",
          text: "text-gray-800 [[data-theme=dark]_&]:text-gray-300",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bg: "bg-red-100 [[data-theme=dark]_&]:bg-red-900/30",
          text: "text-red-800 [[data-theme=dark]_&]:text-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: "Unknown",
          bg: "bg-gray-100 [[data-theme=dark]_&]:bg-gray-700",
          text: "text-gray-800 [[data-theme=dark]_&]:text-gray-300",
          icon: AlertCircle,
        };
    }
  };

  const formatTime = time24 => {
    if (!time24) return "";
    const [hr, mn] = time24.split(":");
    const h = parseInt(hr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${mn} ${ampm}`;
  };

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  function getTimeUntilRide(dateStr, timeStr) {
    const rideDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const diffMs = rideDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return "Starting soon";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours === 0) return `In ${mins} min`;
    if (mins === 0) return `In ${hours} hr`;
    return `In ${hours} hr ${mins} min`;
  }

  const filterButtons = [
    { value: "all", label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const stats = {
    all: allRides.length,
    upcoming: allRides.filter(r => r.rideStatus === "upcoming").length,
    active: allRides.filter(r => getRideDisplayStatus(r) === "active").length,
    completed: allRides.filter(r => r.rideStatus === "completed").length,
    cancelled: allRides.filter(r => r.rideStatus === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 p-2 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white mb-2">
                Ride Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                Track bookings, assign cars and manage ride lifecycle
              </p>
            </div>
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
                {btn.value !== "all" && (
                  <span className="ml-2 text-xs opacity-70">({stats[btn.value]})</span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4" />
              <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading rides...</p>
            </div>
          </div>
        ) : rides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2">
              No Rides Found
            </h3>
            <p className="text-gray-500 [[data-theme=dark]_&]:text-gray-400">
              No rides match the selected filter
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {rides.map((ride, index) => {
              const displayStatus = getRideDisplayStatus(ride);
              const b = badge(displayStatus);
              const StatusIcon = b.icon;
              const hasAssignedCar = Boolean(ride.assignedCarId || ride.assignedCarName);
              const refundInfo = refundBadge(ride.refundStatus);

              return (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white [[data-theme=dark]_&]:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 [[data-theme=dark]_&]:border-gray-700"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${displayStatus === "active"
                        ? "bg-green-500"
                        : displayStatus === "upcoming"
                          ? "bg-blue-500"
                          : displayStatus === "completed"
                            ? "bg-gray-500"
                            : "bg-red-500"
                      }`}
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${b.bg} ${b.text} text-xs font-semibold mb-2`}
                        >
                          <StatusIcon size={14} />
                          {b.label}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                          Ride #{ride._id.slice(-6).toUpperCase()}
                        </h3>
                      </div>

                      {ride.rideStatus === "upcoming" && (
                        <div className="text-right">
                          <div className="px-3 py-1 rounded-lg bg-yellow-50 [[data-theme=dark]_&]:bg-yellow-900/20 border border-yellow-200 [[data-theme=dark]_&]:border-yellow-800">
                            <p className="text-xs font-semibold text-yellow-800 [[data-theme=dark]_&]:text-yellow-300">
                              {getTimeUntilRide(ride.date, ride.time)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-green-100 [[data-theme=dark]_&]:bg-green-900/20">
                          <MapPin className="text-green-600 [[data-theme=dark]_&]:text-green-400" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">
                            Pickup
                          </p>
                          <p className="text-sm font-semibold text-gray-900 [[data-theme=dark]_&]:text-white">
                            {ride.pickupName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowRight className="text-gray-400" size={20} />
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-red-100 [[data-theme=dark]_&]:bg-red-900/20">
                          <MapPin className="text-red-600 [[data-theme=dark]_&]:text-red-400" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">
                            Drop
                          </p>
                          <p className="text-sm font-semibold text-gray-900 [[data-theme=dark]_&]:text-white">
                            {ride.dropName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 [[data-theme=dark]_&]:bg-gray-700/50">
                        <Calendar className="text-gray-600 [[data-theme=dark]_&]:text-gray-400" size={16} />
                        <span className="text-sm text-gray-900 [[data-theme=dark]_&]:text-white font-medium">
                          {formatDate(ride.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 [[data-theme=dark]_&]:bg-gray-700/50">
                        <Clock className="text-gray-600 [[data-theme=dark]_&]:text-gray-400" size={16} />
                        <span className="text-sm text-gray-900 [[data-theme=dark]_&]:text-white font-medium">
                          {formatTime(ride.time)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-600 [[data-theme=dark]_&]:text-gray-400" size={16} />
                          <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            Customer
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 [[data-theme=dark]_&]:text-white">
                          {ride.userId?.name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="text-gray-600 [[data-theme=dark]_&]:text-gray-400" size={16} />
                          <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            Preferred Car
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 [[data-theme=dark]_&]:text-blue-400">
                          {ride.carName || "N/A"}
                        </span>
                      </div>

                      {hasAssignedCar && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Car className="text-green-600 [[data-theme=dark]_&]:text-green-400" size={16} />
                            <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                              Assigned Car
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-green-600 [[data-theme=dark]_&]:text-green-400">
                            {ride.assignedCarName}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                          Fare
                        </span>
                        <span className="text-sm font-bold text-yellow-600 [[data-theme=dark]_&]:text-yellow-400">
                          ₹{ride.finalFare ?? ride.fare ?? "-"}
                        </span>
                      </div>
                    </div>

                    {ride.rideStatus === "cancelled" && (
                      <div className="mt-2 mb-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                          Refund
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold ${refundInfo.color}`}>
                          {refundInfo.label}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {ride.rideStatus === "upcoming" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAssignDriver(ride)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          <Car size={16} />
                          {hasAssignedCar ? "Change Car" : "Assign Car"}
                        </motion.button>
                      )}

                      {displayStatus === "active" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMarkCompleted(ride._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle size={16} />
                          Mark Completed
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}