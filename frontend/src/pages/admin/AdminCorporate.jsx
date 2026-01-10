import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "../../utils/apiClient";
import { Link } from "react-router-dom";

export default function AdminCorporate() {
  const [requests, setRequests] = useState([]);
  const [corpRides, setCorpRides] = useState([]);

  const [filter, setFilter] = useState("pending");

  const [loadingReq, setLoadingReq] = useState(true);
  const [loadingRides, setLoadingRides] = useState(true);

  const [initialReqLoaded, setInitialReqLoaded] = useState(false);
  const [initialRideLoaded, setInitialRideLoaded] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let intervalId = null;

    const fetchAll = (withLoader = false) => {
      fetchRequests(withLoader);
      fetchPendingRides(withLoader);
    };

    const startPolling = () => {
      if (intervalId) return;

      fetchAll(true); 
      intervalId = setInterval(() => {
        fetchAll(false); 
      }, 8000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [filter]);

  async function fetchRequests(showLoader) {
    try {
      if (showLoader && !initialReqLoaded) setLoadingReq(true);

      const res = await apiClient.get("/api/v1/admin/corporate/requests");
      let all = res.data.requests || [];

      if (filter !== "all") {
        all = all.filter(r => r.status === filter);
      }

      setRequests(all);
      setInitialReqLoaded(true);
    } catch (err) {
      console.error("fetch corporate requests", err);
    } finally {
      if (showLoader && !initialReqLoaded) setLoadingReq(false);
    }
  }

  async function fetchPendingRides(showLoader) {
    try {
      if (showLoader && !initialRideLoaded) setLoadingRides(true);

      const res = await apiClient.get("/api/v1/admin/corporate/rides/pending");
      setCorpRides(res.data.rides || []);
      setInitialRideLoaded(true);
    } catch (err) {
      console.error("fetch corporate rides", err);
    } finally {
      if (showLoader && !initialRideLoaded) setLoadingRides(false);
    }
  }

  async function handleApprove(req) {
    if (!window.confirm("Approve this corporate request?")) return;
    await apiClient.put(`/api/v1/admin/corporate/${req._id}/approve`);
    fetchRequests(false);
  }

  async function handleReject(req) {
    await apiClient.put(`/api/v1/admin/corporate/${req._id}/reject`);
    fetchRequests(false);
  }

  function updateFare(rideId, value) {
    setCorpRides(prev =>
      prev.map(r =>
        r._id === rideId ? { ...r, finalFare: value } : r
      )
    );
  }

  async function generateLink(ride) {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      if (!ride.finalFare) {
        alert("Enter final fare first");
        return;
      }

      await apiClient.post("/api/v1/corporate/ride/payment-link", {
        rideId: ride._id,
        amount: Number(ride.finalFare),
      });

      alert("Payment link generated!");
      fetchPendingRides(false); 
    } catch (err) {
      console.error("generate payment link", err);
      alert("Failed to generate payment link.");
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6">
          Corporate Requests
        </h1>

        {loadingReq ? (
          <p className="py-6 text-center text-sm sm:text-base">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm sm:text-base">No requests found.</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {requests.map(req => (
              <div 
                key={req._id} 
                className="p-3 sm:p-4 md:p-5 bg-white rounded-lg 
                           flex flex-col sm:flex-row justify-between items-start sm:items-center 
                           gap-3 sm:gap-4
                           [[data-theme=dark]_&]:bg-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base md:text-lg truncate">
                    {req.user?.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400 truncate">
                    {req.companyName}
                  </p>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleApprove(req)} 
                      className="flex-1 sm:flex-none bg-green-500 px-3 sm:px-4 py-2 
                                 text-white rounded text-sm sm:text-base
                                 hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(req)} 
                      className="flex-1 sm:flex-none bg-red-500 px-3 sm:px-4 py-2 
                                 text-white rounded text-sm sm:text-base
                                 hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 sm:mt-10 md:mt-12 mb-3 sm:mb-4">
          Corporate Rides Pending Pricing
        </h2>

        {loadingRides ? (
          <p className="py-6 text-center text-sm sm:text-base">Loading rides...</p>
        ) : corpRides.length === 0 ? (
          <p className="text-sm sm:text-base">No rides pending pricing.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {corpRides.map(ride => (
              <div 
                key={ride._id} 
                className="bg-white p-4 sm:p-5 md:p-6 rounded-xl 
                           [[data-theme=dark]_&]:bg-gray-800"
              >
                <div className="space-y-2 mb-4">
                  <p className="text-sm sm:text-base break-words">
                    <b className="font-semibold">User:</b>{" "}
                    {ride?.userId?.name ||
                      ride?.user?.name ||
                      ride?.user?._id?.name ||
                      "N/A"}
                  </p>
                  <p className="text-sm sm:text-base break-words">
                    <b className="font-semibold">Route:</b>{" "}
                    <span className="break-all">{ride.pickupName}</span> → <span className="break-all">{ride.dropName}</span>
                  </p>
                  <p className="text-sm sm:text-base">
                    <b className="font-semibold">Expected Fare:</b> ₹{ride.expectedFare}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="number"
                    value={ride.finalFare || ""}
                    onChange={e => updateFare(ride._id, e.target.value)}
                    placeholder="Final Fare"
                    className="w-full sm:w-48 md:w-56 rounded-md border border-gray-300 
                               p-2 text-sm sm:text-base
                               text-black [[data-theme=dark]_&]:text-white 
                               [[data-theme=dark]_&]:bg-gray-700 [[data-theme=dark]_&]:border-gray-600
                               focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />

                  <button
                    onClick={() => generateLink(ride)}
                    className={`
                      w-full sm:w-auto px-4 py-2 rounded font-semibold transition text-sm sm:text-base
                      ${isGenerating
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-400 [[data-theme=dark]_&]:text-gray-700 hover:bg-yellow-500"}
                    `}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Payment Link"}
                  </button>
                </div>

                {ride.paymentLink && (
                  <p className="mt-3 sm:mt-4">
                    <Link 
                      to={ride.paymentLink} 
                      target="_blank"
                      className="text-blue-600 [[data-theme=dark]_&]:text-blue-400 
                                 hover:underline text-sm sm:text-base break-all"
                    >
                      Open Payment Link
                    </Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}