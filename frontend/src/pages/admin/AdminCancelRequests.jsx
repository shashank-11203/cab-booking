import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../utils/apiClient";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminCancelRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests(showLoading = true) {
    try {
      if (showLoading) setLoading(true);

      const res = await apiClient.get("/api/v1/admin/rides/cancel-requests");
      const newData = res.data.requests || [];

      setRequests(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    } catch (err) {
      console.error("fetchRequests error:", err);
      setRequests([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      const res = await apiClient.put(
        `/api/v1/admin/rides/${id}/refund/approve`
      );
      alert(res.data.message || "Refund approved");
      fetchRequests(false);
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  }

  async function handleReject(id) {
    try {
      const res = await apiClient.put(
        `/api/v1/admin/rides/${id}/refund/reject`
      );
      alert(res.data.message || "Request rejected");
      fetchRequests(false);
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  }

  useEffect(() => {
    let intervalId = null;

    const startPolling = () => {
      fetchRequests(false);

      if (intervalId) return;

      intervalId = setInterval(() => {
        fetchRequests(false);
      }, 15000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    fetchRequests(true);

    startPolling();

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  function formatTime(time24) {
    if (!time24) return "";
    const [hr, min] = time24.split(":");
    const h = parseInt(hr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${min} ${ampm}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }


  return (
    <div
      className="
        min-h-screen 
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900 
        transition-colors duration-500
        px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10
      "
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 [[data-theme=dark]_&]:text-yellow-300 text-center sm:text-left">
            Cancel Requests
          </h2>

          <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
            <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300 text-center sm:text-left">
              Review and approve or reject refund requests from users.
            </p>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-white [[data-theme=dark]_&]:bg-gray-800 border border-yellow-300/40 [[data-theme=dark]_&]:border-yellow-300/20 text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-200">
                Pending requests:{" "}
                <span className="font-semibold text-yellow-600 [[data-theme=dark]_&]:text-yellow-400">
                  {requests.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300">
                Loading requests...
              </p>
            </div>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="flex justify-center py-10">
            <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300 text-center">
              No pending cancel requests at the moment.
            </p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              xl:grid-cols-3 
              gap-4 sm:gap-5 lg:gap-6
            "
          >
            {requests.map(req => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  flex flex-col h-full
                  p-4 sm:p-5 rounded-2xl 
                  bg-white 
                  [[data-theme=dark]_&]:bg-gray-800 
                  border border-yellow-300/40
                  [[data-theme=dark]_&]:border-yellow-300/10
                  shadow-md sm:shadow-lg
                  bg-gradient-to-r from-yellow-100 to-white 
                  [[data-theme=dark]_&]:from-gray-700 
                  [[data-theme=dark]_&]:to-gray-800
                "
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="text-[11px] sm:text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 break-all">
                      Ride ID:{" "}
                      <span className="font-semibold">
                        {req._id.slice(-8).toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-300 flex items-center gap-1.5">
                      <Clock size={14} /> Refund approval pending
                    </p>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-yellow-400/90 text-black text-[11px] sm:text-xs font-semibold">
                    Pending
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 truncate">
                    {req.pickupName}
                  </p>
                  <p className="text-yellow-500 font-bold text-lg leading-none text-center my-1">
                    ↓
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 [[data-theme=dark]_&]:text-gray-100 truncate">
                    {req.dropName}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 sm:gap-x-4 text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-4">
                  <p>
                    <span className="font-semibold">Date: </span>
                    {formatDate(req.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Time: </span>
                    {formatTime(req.time)}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold">User: </span>
                    {req.userId?.name || "Unknown"}
                  </p>
                  <p>
                    <span className="font-semibold">Fare: </span>₹{req.fare ?? req.finalFare ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Payment: </span>
                    {req.paymentStatus}
                  </p>
                  <p>
                    <span className="font-semibold">Refund Status: </span>
                    {(req.refundStatus) ? "pending approval" : ""}
                  </p>
                </div>

                <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="
                      flex-1
                      px-3 py-2.5 sm:py-3 rounded-lg
                      bg-green-500 hover:bg-green-600 text-white font-semibold
                      text-xs sm:text-sm
                      shadow-md cursor-pointer flex items-center justify-center gap-2
                    "
                  >
                    <CheckCircle size={18} /> Approve Refund
                  </button>

                  <button
                    onClick={() => handleReject(req._id)}
                    className="
                      flex-1
                      px-3 py-2.5 sm:py-3 rounded-lg
                      bg-red-500 hover:bg-red-600 text-white font-semibold
                      text-xs sm:text-sm
                      shadow-md cursor-pointer flex items-center justify-center gap-2
                    "
                  >
                    <XCircle size={18} /> Reject Request
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}