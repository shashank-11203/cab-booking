import { useEffect, useState } from "react";
import { getUserRidesApi, cancelRideApi } from "../utils/apiClientRide";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

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


  return (
    <div className="
      min-h-screen 
      bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900
      px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12
      py-4 sm:py-6 md:py-8 lg:py-10
    ">

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-4 sm:mb-6 text-center"
      >
        My Bookings
      </motion.h2>

      {allRides.length === 0 && (
        <p className="text-center text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300">
          No bookings found.
        </p>
      )}

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {allRides.map((ride) => {
          const { statusText, bgColor, textColor, borderColor } = getStatusBadge(ride);
          const canModifyRide = canModify(ride);
          const canCancelRide = canCancel(ride);

          return (
            <motion.div
              key={ride._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl 
                         bg-white [[data-theme=dark]_&]:bg-gray-800 
                         border border-yellow-300/40 shadow-lg 
                         flex flex-col lg:flex-row lg:justify-between gap-4 sm:gap-5"
            >
              <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 break-all">
                  Booking ID: <span className="font-semibold">{ride._id}</span>
                </p>

                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 break-words">
                    {ride.pickupName}
                  </p>
                  <p className="text-yellow-500 text-lg sm:text-xl font-bold">↓</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 break-words">
                    {ride.dropName}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                  <p>
                    <span className="font-semibold">Date:</span> {formatDMY(ride.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span> {formatTime(ride.time)}
                  </p>
                  <p>
                    <span className="font-semibold">Passengers:</span> {ride.passengers || 1}
                  </p>
                  <p className="break-words">
                    <span className="font-semibold">Car:</span> {ride.carName || "Not Assigned"}
                  </p>
                  <p className="col-span-1 sm:col-span-2 text-base sm:text-lg font-bold text-yellow-600 [[data-theme=dark]_&]:text-yellow-400">
                    <span className="font-semibold">Total Paid:</span> ₹
                    {ride._type === "corporate"
                      ? ride.finalFare || ride.expectedFare || "Pending"
                      : ride.finalFare || ride.fare || "N/A"}
                  </p>

                  {ride.rideStatus === "cancelled" && ride.refundStatus && (
                    <p className="text-red-500 text-xs sm:text-sm col-span-1 sm:col-span-2">
                      <span className="font-semibold">Refund:</span>{" "}
                      {ride.refundStatus === "pending_approval"
                        ? "Waiting for admin approval"
                        : ride.refundStatus === "rejected"
                          ? "Rejected by admin"
                          : ride.refundStatus === "pending"
                            ? "Refund Initiated"
                            : ride.refundStatus === "processed"
                              ? "Refund Completed"
                              : "No Refund"}
                    </p>
                  )}
                </div>

                {ride._type === "corporate" && ride.status === "link_sent" && (
                  <Link
                    to={ride.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm sm:text-base text-yellow-600 [[data-theme=dark]_&]:text-yellow-400 font-semibold hover:underline"
                  >
                    Pay Now →
                  </Link>
                )}

                {ride._type === "corporate" && ride.status === "pending_negotiation" && (
                  <p className="text-yellow-600 [[data-theme=dark]_&]:text-yellow-400 text-xs sm:text-sm">
                    Waiting for admin pricing approval
                  </p>
                )}

                {ride.rideStatus === "active" && (
                  <p className="text-xs sm:text-sm text-green-600 [[data-theme=dark]_&]:text-green-400 font-medium">
                    Your ride is currently in progress
                  </p>
                )}
                {ride.rideStatus === "completed" && (
                  <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400 font-medium">
                    This ride has been completed
                  </p>
                )}

                {ride.paymentStatus === "paid" && ride._type !== "corporate" && (
                  <Link
                    to={`${import.meta.env.VITE_BACKEND_URL}/api/v1/payment/invoice/${ride._id}`}
                    reloadDocument
                    className="mt-2 inline-block text-xs sm:text-sm text-blue-600 hover:underline [[data-theme=dark]_&]:text-yellow-300"
                  >
                    📄 Download Invoice
                  </Link>
                )}
              </div>

              <div className="flex flex-col items-start lg:items-end gap-2 sm:gap-3 mt-2 lg:mt-0 w-full lg:w-auto lg:min-w-[200px]">
                <span
                  className="px-3 py-1 text-xs sm:text-sm rounded-full font-semibold border self-start lg:self-end"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor: borderColor,
                  }}
                >
                  {statusText}
                </span>

                {(canModifyRide || canCancelRide) && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    {canCancelRide && (
                      <button
                        onClick={() => cancelRide(ride._id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm sm:text-base text-white cursor-pointer bg-red-500 hover:bg-red-600 transition-colors font-medium"
                      >
                        Cancel Ride
                      </button>
                    )}

                    {canModifyRide && (
                      <button
                        onClick={() => navigate(`/modify/${ride._id}`)}
                        className="w-full sm:w-auto px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 cursor-pointer transition-colors font-semibold text-sm sm:text-base"
                      >
                        Modify Ride
                      </button>
                    )}
                  </div>
                )}

                {["pending", "link_sent"].includes(ride.extraChargeStatus) && ride.extraPaymentLink && ride.rideStatus !== "cancelled" && (
                  <Link
                    to={ride.extraPaymentLink}
                    target="_blank"
                    onClick={() => setPayingId(ride._id)}
                    className={`w-full lg:w-auto px-4 py-2 rounded-lg font-semibold text-center text-sm sm:text-base
                      ${payingId === ride._id
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-yellow-400 hover:bg-yellow-500"}
                    `}
                    style={{ pointerEvents: payingId === ride._id ? "none" : "auto" }}
                  >
                    {payingId === ride._id
                      ? "Redirecting..."
                      : `Pay Extra Charge ₹${ride.extraChargeAmount}`}
                  </Link>
                )}

                {ride.extraChargeStatus === "paid" && (
                  <p className="text-green-600 text-xs sm:text-sm mt-2">
                    Extra charge paid ✔
                  </p>
                )}

                {!canModifyRide && !canCancelRide && ride.rideStatus === "completed" && (
                  <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 italic lg:text-right">
                    Ride completed
                  </p>
                )}

                {!canModifyRide && !canCancelRide && ride.rideStatus === "cancelled" && (
                  <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 italic lg:text-right">
                    Ride cancelled
                  </p>
                )}

                {ride.rideStatus === "active" && !canCancelRide && (
                  <p className="text-xs text-amber-600 [[data-theme=dark]_&]:text-amber-400 italic lg:text-right">
                    Active rides cannot be cancelled
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Bookings;