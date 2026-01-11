import { useEffect, useState } from "react";
import { getUserRidesApi, cancelRideApi } from "../utils/apiClientRide";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { openGoogleMaps } from "../utils/track";

const Bookings = () => {
  const { user } = useAuth();

  const [normalRides, setNormalRides] = useState([]);
  const [corporateRides, setCorporateRides] = useState([]);
  const [payingId, setPayingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user) return;

    const userId = user?._id || user?.id;
    if (!userId) return;

    let intervalId = null;

    const fetchAll = () => {
      if (user.role === "user" || user.role === "admin") {
        fetchNormalRides(userId);
      }

      if (user.role === "corporate") {
        fetchCorporateRides();
      }
    };

    fetchAll();

    const startPolling = () => {
      if (intervalId) return;

      intervalId = setInterval(() => {
        fetchAll();
      }, 15000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAll();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    if (document.visibilityState === "visible") {
      startPolling();
    }

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  const fetchNormalRides = async (userId) => {
    try {
      const res = await getUserRidesApi(userId);
      if (res.data.success) {
        setNormalRides(res.data.rides || []);
      }
    } catch (err) {
      console.error("Fetch normal rides error:", err);
    }
  };

  const fetchCorporateRides = async (userId) => {
    try {
      const res = await apiClient.get("/api/v1/corporate/rides/my");
      if (res.data.success) {
        console.log(res.data);
        setCorporateRides(res.data.rides || []);
      }
    } catch (err) {
      console.error("Fetch corporate rides error:", err);
    }
  };

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hr, mn] = time24.split(":");
    const hour = parseInt(hr);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${mn} ${ampm}`;
  };

  const formatDMY = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const canModify = (ride) => {
    return ride.rideStatus === "upcoming" || ride.rideStatus === "active";
  };

  const canCancel = (ride) => {
    return ride.rideStatus === "upcoming";
  };

  const getStatusBadge = (ride) => {
    let statusText = "";
    let bgColor = "";
    let textColor = "";
    let borderColor = "";

    if (ride._type === "corporate") {
      if (ride.status === "pending_negotiation") {
        statusText = "Negotiation";
        bgColor = "#fef9c3";
        textColor = "#854d0e";
        borderColor = "#facc15";
      } else if (ride.status === "link_sent") {
        statusText = "Payment Pending";
        bgColor = "#e0f2fe";
        textColor = "#075985";
        borderColor = "#38bdf8";
      } else if (ride.status === "paid") {
        statusText = "Paid";
        bgColor = "#dcfce7";
        textColor = "#166534";
        borderColor = "#86efac";
      }
    } else {
      if (ride.rideStatus === "cancelled") {
        statusText = "Cancelled";
        bgColor = "#fee2e2";
        textColor = "#b91c1c";
        borderColor = "#fca5a5";
      } else if (ride.rideStatus === "completed") {
        statusText = "Completed";
        bgColor = "#e5e7eb";
        textColor = "#374151";
        borderColor = "#d1d5db";
      } else if (ride.rideStatus === "active") {
        statusText = "Active";
        bgColor = "#d1fae5";
        textColor = "#065f46";
        borderColor = "#6ee7b7";
      } else if (ride.rideStatus === "upcoming") {
        statusText = "Upcoming";
        bgColor = "#dbeafe";
        textColor = "#1e40af";
        borderColor = "#93c5fd";
      } else {
        statusText = "Pending";
        bgColor = "#fef9c3";
        textColor = "#854d0e";
        borderColor = "#facc15";
      }
    }

    return { statusText, bgColor, textColor, borderColor };
  };

  const cancelRide = async (id) => {
    try {
      const res = await cancelRideApi(id);
      if (res.data.success) {
        toast.success(res.data.message);
        const userId = user?._id || user?.id;
        fetchNormalRides(userId);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Cancel failed");
    }
  };


  const allRides = [
    ...normalRides.map((r) => ({ ...r, _type: "normal" })),
    ...corporateRides.map((r) => ({ ...r, _type: "corporate" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getBaseFare = (ride) => {
    return ride.finalFare ?? ride.fare ?? 0;
  };

  const getExtraCharge = (ride) => {
    return ride.extraChargeAmount && ride.extraChargeStatus === "paid"
      ? ride.extraChargeAmount
      : 0;
  };

  const getTotalFare = (ride) => {
    return getBaseFare(ride) + getExtraCharge(ride);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 [[data-theme=dark]_&]:from-gray-950 [[data-theme=dark]_&]:via-gray-900 [[data-theme=dark]_&]:to-gray-950 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 md:py-10 lg:py-12">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8 sm:mb-10 md:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 [[data-theme=dark]_&]:text-gray-100 mb-2">
          My Bookings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
          Manage and track all your rides in one place
        </p>
      </motion.div>

      {/* Empty State */}
      {allRides.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-100 [[data-theme=dark]_&]:bg-gray-800 flex items-center justify-center">
            <span className="text-5xl">🚕</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 [[data-theme=dark]_&]:text-gray-200 mb-2">
            No bookings yet
          </h2>
          <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400">
            Your ride bookings will appear here once you make a reservation
          </p>
        </motion.div>
      )}

      {/* Bookings Grid */}
      <div className="max-w-7xl mx-auto grid gap-4 sm:gap-5 md:gap-6">
        {allRides.map((ride, index) => {
          const { statusText, bgColor, textColor, borderColor } = getStatusBadge(ride);
          const canModifyRide = canModify(ride);
          const canCancelRide = canCancel(ride);

          return (
            <motion.div
              key={ride._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/80 [[data-theme=dark]_&]:bg-gray-800/80 backdrop-blur-sm border border-gray-200 [[data-theme=dark]_&]:border-gray-700 rounded-3xl shadow-lg hover:shadow-2xl [[data-theme=dark]_&]:shadow-gray-900/50 transition-all duration-300 overflow-hidden"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-400/5 [[data-theme=dark]_&]:from-yellow-500/10 [[data-theme=dark]_&]:to-orange-500/10 pointer-events-none" />

              <div className="relative p-5 sm:p-6 md:p-7 lg:p-8">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-2 font-mono">
                      ID: <span className="font-semibold text-gray-700 [[data-theme=dark]_&]:text-gray-300">{ride._id}</span>
                    </p>
                    <span
                      className="inline-block px-4 py-1.5 text-xs sm:text-sm rounded-full font-semibold border-2 shadow-sm"
                      style={{ backgroundColor: bgColor, color: textColor, borderColor }}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                  {/* Left Section - Route & Details */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Route */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-yellow-400 via-amber-400 to-orange-400 [[data-theme=dark]_&]:from-yellow-500 [[data-theme=dark]_&]:via-amber-500 [[data-theme=dark]_&]:to-orange-500 rounded-full" />

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-3 h-3 rounded-full bg-yellow-500 [[data-theme=dark]_&]:bg-yellow-400 ring-4 ring-yellow-100 [[data-theme=dark]_&]:ring-yellow-900/50 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Pickup</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 break-words leading-tight">
                              {ride.pickupName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-3 h-3 rounded-full bg-orange-500 [[data-theme=dark]_&]:bg-orange-400 ring-4 ring-orange-100 [[data-theme=dark]_&]:ring-orange-900/50 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Dropoff</p>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 break-words leading-tight">
                              {ride.dropName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                      <div className="bg-gray-50 [[data-theme=dark]_&]:bg-gray-900/50 rounded-2xl p-3 sm:p-4">
                        <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Date</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100">
                          {formatDMY(ride.date)}
                        </p>
                      </div>

                      <div className="bg-gray-50 [[data-theme=dark]_&]:bg-gray-900/50 rounded-2xl p-3 sm:p-4">
                        <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Time</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100">
                          {formatTime(ride.time)}
                        </p>
                      </div>

                      <div className="bg-gray-50 [[data-theme=dark]_&]:bg-gray-900/50 rounded-2xl p-3 sm:p-4">
                        <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Passengers</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100">
                          {ride.passengers || 1}
                        </p>
                      </div>

                      <div className="bg-gray-50 [[data-theme=dark]_&]:bg-gray-900/50 rounded-2xl p-3 sm:p-4">
                        <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mb-1">Vehicle</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 truncate">
                          {ride.carName || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Pricing & Actions */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Pricing Card */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 [[data-theme=dark]_&]:from-yellow-900/20 [[data-theme=dark]_&]:to-amber-900/20 rounded-2xl p-4 sm:p-5 border border-yellow-200 [[data-theme=dark]_&]:border-yellow-800/50">
                      <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400 mb-2">
                        Total Amount
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 [[data-theme=dark]_&]:from-yellow-400 [[data-theme=dark]_&]:to-orange-400 bg-clip-text text-transparent">
                        ₹{ride._type === "corporate" ? ride.finalFare || ride.expectedFare || "Pending" : getTotalFare(ride)}
                      </p>

                      {ride._type !== "corporate" && ride.extraChargeAmount > 0 && (
                        <div className="mt-3 pt-3 border-t border-yellow-200 [[data-theme=dark]_&]:border-yellow-800/30 space-y-1 text-xs sm:text-sm">
                          <div className="flex justify-between text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            <span>Base Fare</span>
                            <span className="font-semibold">₹{getBaseFare(ride)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            <span>Extra Charge</span>
                            <span className="font-semibold">
                              ₹{ride.extraChargeAmount}
                              <span className="ml-1 text-xs">
                                {ride.extraChargeStatus === "paid" ? "✓" : "⏳"}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Messages */}
                    {ride.rideStatus === "active" && (
                      <div className="bg-blue-50 [[data-theme=dark]_&]:bg-blue-900/20 border border-blue-200 [[data-theme=dark]_&]:border-blue-800/50 rounded-xl p-3 text-xs sm:text-sm text-blue-700 [[data-theme=dark]_&]:text-blue-300">
                        🚗 Your ride is currently in progress
                      </div>
                    )}

                    {ride.rideStatus === "completed" && (
                      <div className="bg-green-50 [[data-theme=dark]_&]:bg-green-900/20 border border-green-200 [[data-theme=dark]_&]:border-green-800/50 rounded-xl p-3 text-xs sm:text-sm text-green-700 [[data-theme=dark]_&]:text-green-300">
                        ✓ This ride has been completed
                      </div>
                    )}

                    {ride._type === "corporate" && ride.status === "pending_negotiation" && (
                      <div className="bg-yellow-50 [[data-theme=dark]_&]:bg-yellow-900/20 border border-yellow-200 [[data-theme=dark]_&]:border-yellow-800/50 rounded-xl p-3 text-xs sm:text-sm text-yellow-700 [[data-theme=dark]_&]:text-yellow-300">
                        ⏳ Waiting for admin pricing approval
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {["upcoming", "active"].includes(ride.rideStatus) && (
                        <button
                          onClick={() => openGoogleMaps(ride.pickupName, ride.dropName)}
                          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 [[data-theme=dark]_&]:from-blue-600 [[data-theme=dark]_&]:to-blue-700 [[data-theme=dark]_&]:hover:from-blue-700 [[data-theme=dark]_&]:hover:to-blue-800 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          Track on Google Maps
                        </button>
                      )}

                      {ride._type === "corporate" && ride.status === "link_sent" && (
                        <Link
                          to={ride.paymentLink}
                          target="_blank"
                          className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 [[data-theme=dark]_&]:from-yellow-500 [[data-theme=dark]_&]:to-amber-500 [[data-theme=dark]_&]:hover:from-yellow-600 [[data-theme=dark]_&]:hover:to-amber-600 text-gray-900 [[data-theme=dark]_&]:text-gray-900 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          Pay Now →
                        </Link>
                      )}

                      {ride.paymentStatus === "paid" && ride._type !== "corporate" && (
                        <Link
                          to={`${import.meta.env.VITE_BACKEND_URL}/api/v1/payment/invoice/${ride._id}`}
                          reloadDocument
                          className="block w-full text-center px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 [[data-theme=dark]_&]:bg-gray-700 [[data-theme=dark]_&]:hover:bg-gray-600 text-gray-900 [[data-theme=dark]_&]:text-gray-100 text-sm font-semibold transition-all"
                        >
                          📄 Download Invoice
                        </Link>
                      )}

                      {["pending", "link_sent"].includes(ride.extraChargeStatus) &&
                        ride.extraPaymentLink &&
                        ride.rideStatus !== "cancelled" && (
                          <Link
                            to={ride.extraPaymentLink}
                            target="_blank"
                            onClick={() => setPayingId(ride._id)}
                            className={`block w-full text-center px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-all ${payingId === ride._id
                                ? "bg-gray-300 [[data-theme=dark]_&]:bg-gray-600 text-gray-600 [[data-theme=dark]_&]:text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 [[data-theme=dark]_&]:from-orange-500 [[data-theme=dark]_&]:to-red-500 text-white shadow-md hover:shadow-lg"
                              }`}
                            style={{ pointerEvents: payingId === ride._id ? "none" : "auto" }}
                          >
                            {payingId === ride._id
                              ? "Redirecting..."
                              : `Pay Extra Charge ₹${ride.extraChargeAmount}`}
                          </Link>
                        )}

                      {ride.extraChargeStatus === "paid" && (
                        <div className="bg-green-50 [[data-theme=dark]_&]:bg-green-900/20 border border-green-200 [[data-theme=dark]_&]:border-green-800/50 rounded-xl p-3 text-xs sm:text-sm text-green-700 [[data-theme=dark]_&]:text-green-300 text-center font-semibold">
                          ✓ Extra charge paid
                        </div>
                      )}

                      {(canModifyRide || canCancelRide) && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          {canModifyRide && (
                            <button
                              onClick={() => navigate(`/modify/${ride._id}`)}
                              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 [[data-theme=dark]_&]:from-yellow-500 [[data-theme=dark]_&]:to-amber-500 [[data-theme=dark]_&]:hover:from-yellow-600 [[data-theme=dark]_&]:hover:to-amber-600 text-gray-900 [[data-theme=dark]_&]:text-gray-900 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              Modify Ride
                            </button>
                          )}

                          {canCancelRide && (
                            <button
                              onClick={() => cancelRide(ride._id)}
                              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 [[data-theme=dark]_&]:from-red-600 [[data-theme=dark]_&]:to-red-700 [[data-theme=dark]_&]:hover:from-red-700 [[data-theme=dark]_&]:hover:to-red-800 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              Cancel Ride
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Bookings;