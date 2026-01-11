import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, IndianRupee, LinkIcon, AlertCircle, RefreshCw, Phone, Mail, Building2 } from "lucide-react";
import apiClient from "../../utils/apiClient";

export default function AdminCorporate() {
  const [requests, setRequests] = useState([]);
  const [corpRides, setCorpRides] = useState([]);
  const [requestFilter, setRequestFilter] = useState("pending");
  const [rideFilter, setRideFilter] = useState("all");
  const [loadingReq, setLoadingReq] = useState(true);
  const [loadingRides, setLoadingRides] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualRefresh, setManualRefresh] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchRequests(true);
    fetchCorporateRides(true);

    const interval = setInterval(() => {
      if (!isMounted) return;
      fetchRequests(false);
      fetchCorporateRides(false);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  async function fetchRequests(showLoader = false) {
    try {
      if (showLoader) setLoadingReq(true);

      const res = await apiClient.get("/api/v1/admin/corporate/requests");
      const all = res.data.requests || [];

      setRequests(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("fetch corporate requests", err);
    } finally {
      if (showLoader) setLoadingReq(false);
    }
  }

  async function fetchCorporateRides(showLoader = false) {
    try {
      if (showLoader) setLoadingRides(true);

      const res = await apiClient.get("/api/v1/admin/corporate/rides/pending");
      const fetched = res.data.rides || [];

      setCorpRides(prev => {

        const paidMap = new Map(
          prev
            .filter(r => r.paymentStatus === "paid")
            .map(r => [r._id, r])
        );

        const newMap = new Map(fetched.map(r => [r._id, r]));

        const merged = [
          ...newMap.values(),
          ...[...paidMap.values()].filter(r => !newMap.has(r._id)),
        ];

        return merged.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
      });

    } catch (err) {
      console.error("fetch corporate rides", err);
    } finally {
      if (showLoader) setLoadingRides(false);
    }
  }


  async function handleManualRefresh() {
    setManualRefresh(true);
    await fetchRequests(false);
    await fetchCorporateRides(false);
    setTimeout(() => setManualRefresh(false), 1000);
  }

  async function handleApprove(req) {
    if (!window.confirm("Approve this corporate request?")) return;
    await apiClient.put(`/api/v1/admin/corporate/${req._id}/approve`);
    fetchRequests(false);
  }

  async function handleReject(req) {
    if (!window.confirm("Reject this corporate request?")) return;
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
    if (isGenerating || ride.paymentLink) return;

    try {
      setIsGenerating(true);

      if (!ride.finalFare) {
        alert("Enter final fare first");
        return;
      }

      const res = await apiClient.post("/api/v1/corporate/ride/payment-link", {
        rideId: ride._id,
        amount: Number(ride.finalFare),
      });

      setCorpRides(prev =>
        prev.map(r =>
          r._id === ride._id
            ? {
              ...r,
              paymentLink: res?.data?.paymentLink || "generated",
              paymentStatus: res?.data?.paymentStatus || "unpaid",
              finalFare: ride.finalFare,
            }
            : r
        )
      );

      alert("Payment link generated!");
    } catch (err) {
      console.error("generate payment link", err);
      alert("Failed to generate payment link.");
    } finally {
      setIsGenerating(false);
    }
  }

  const filteredRequests = requests.filter(req => {
    if (requestFilter === "all") return true;
    return req.status === requestFilter;
  });

  const filteredRides = corpRides.filter(ride => {
    if (rideFilter === "all") return true;
    if (rideFilter === "paid") return ride.paymentStatus === "paid";
    return ride.paymentStatus !== "paid";
  });


  return (
    <div className="min-h-screen bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 [[data-theme=dark]_&]:text-gray-100 transition-colors duration-500 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header with Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Corporate Management
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            disabled={manualRefresh}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 [[data-theme=dark]_&]:bg-gray-700 [[data-theme=dark]_&]:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw size={18} className={manualRefresh ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>

        {/* SECTION 1: Corporate Requests */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Corporate Account Requests</h2>

          {/* Request Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" }
            ].map(tab => (
              <motion.button
                key={tab.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRequestFilter(tab.value)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base
                  ${requestFilter === tab.value
                    ? "bg-yellow-400 text-black"
                    : "bg-white [[data-theme=dark]_&]:bg-gray-800 text-gray-700 [[data-theme=dark]_&]:text-gray-300 border border-gray-300 [[data-theme=dark]_&]:border-gray-700"
                  }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {loadingReq ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 mx-auto border-b-4 border-yellow-400 rounded-full"></div>
              <p className="mt-4 text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                {requestFilter === "all" ? "No corporate requests found." : `No ${requestFilter} requests found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => {
                const isPaid = ride.paymentStatus === "paid";
                return (

                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white [[data-theme=dark]_&]:bg-gray-800 border border-gray-200 [[data-theme=dark]_&]:border-gray-700 rounded-xl p-4 sm:p-5 shadow-md"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Building2 className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base sm:text-lg">{req.user?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400">{req.companyName || "N/A"}</p>
                      </div>
                    </div>

                    <div className="text-sm space-y-1 mb-3">
                      <p className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <span className="break-all">{req.phone || req.user?.phone || "N/A"}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-500" />
                        <span className="break-all">{req.user?.email || "N/A"}</span>
                      </p>
                      {req.travelRoute && (
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <span className="break-words">{req.travelRoute}</span>
                        </p>
                      )}
                      {req.message && (
                        <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400 mt-2 break-words">
                          <strong>Message:</strong> {req.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${req.status === "approved" ? "bg-green-100 text-green-700 [[data-theme=dark]_&]:bg-green-900 [[data-theme=dark]_&]:text-green-300" :
                            req.status === "rejected" ? "bg-red-100 text-red-700 [[data-theme=dark]_&]:bg-red-900 [[data-theme=dark]_&]:text-red-300" :
                              "bg-yellow-100 text-yellow-700 [[data-theme=dark]_&]:bg-yellow-900 [[data-theme=dark]_&]:text-yellow-300"
                          }`}
                      >
                        {req.status || "pending"}
                      </span>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            className="bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded-lg text-sm font-semibold transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded-lg text-sm font-semibold transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Corporate Rides */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Corporate Rides & Payment History</h2>

          {/* Ride Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { label: "All", value: "all" },
              { label: "Paid", value: "paid" },
              { label: "Unpaid", value: "unpaid" }
            ]
              .map(tab => (
                <motion.button
                  key={tab.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRideFilter(tab.value)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base
                  ${rideFilter === tab.value
                      ? "bg-yellow-400 text-black"
                      : "bg-white [[data-theme=dark]_&]:bg-gray-800 text-gray-700 [[data-theme=dark]_&]:text-gray-300 border border-gray-300 [[data-theme=dark]_&]:border-gray-700"
                    }`}
                >
                  {tab.label}
                </motion.button>
              ))}
          </div>

          {loadingRides ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 mx-auto border-b-4 border-yellow-400 rounded-full"></div>
              <p className="mt-4 text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading rides...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                {rideFilter === "all" ? "No corporate rides found." : `No ${rideFilter} rides found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRides.map(ride => (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white [[data-theme=dark]_&]:bg-gray-800 border border-gray-200 [[data-theme=dark]_&]:border-gray-700 rounded-xl p-4 sm:p-5 shadow-md"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base break-words">
                        <span className="break-all">{ride.pickupName}</span> → <span className="break-all">{ride.dropName}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 break-all">
                        Ride ID: {ride._id}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm mb-2 break-words">
                    <strong>User:</strong> {ride.userId?.name || ride.user?.name || "N/A"} ({ride.userId?.phone || ride.user?.phone || "N/A"})
                  </p>

                  <div className="text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2 space-y-1">
                    <p>
                      <strong>Expected Fare:</strong> ₹{ride.expectedFare ?? "—"}
                    </p>
                    {ride.finalFare && (
                      <p>
                        <strong>Final Fare:</strong>{" "}
                        <span className="text-yellow-600 font-semibold">₹{ride.finalFare}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm mb-3">
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={`font-semibold ${ride.paymentStatus === "paid"
                        ? "text-green-600"
                        : ride.paymentStatus === "failed"
                          ? "text-red-600"
                          : ride.paymentLink
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                    >
                      {ride.paymentStatus === "paid" ? "Paid ✓" :
                        ride.paymentStatus === "failed" ? "Failed ✗" :
                          ride.paymentLink ? "Link Sent (Unpaid)" : "Unpaid - No Link"}
                    </span>
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    {!ride.paymentLink && ride.paymentStatus !== "paid" && (
                      <>
                        <input
                          type="number"
                          value={ride.finalFare || ""}
                          onChange={e => updateFare(ride._id, e.target.value)}
                          placeholder="Enter Final Fare"
                          className="w-full sm:w-48 rounded-md border border-gray-300 p-2 text-sm text-black [[data-theme=dark]_&]:text-white [[data-theme=dark]_&]:bg-gray-700 [[data-theme=dark]_&]:border-gray-600"
                        />
                        <button
                          onClick={() => generateLink(ride)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-md font-semibold transition flex items-center gap-2 justify-center text-sm
                            ${isGenerating
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-yellow-400 [[data-theme=dark]_&]:text-gray-700 hover:bg-yellow-500 cursor-pointer"
                            }`}
                          disabled={isGenerating}
                        >
                          <IndianRupee size={18} />
                          {isGenerating ? "Generating..." : "Generate Payment"}
                        </button>
                      </>
                    )}

                    {ride.paymentLink && (
                      <a
                        href={ride.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition"
                      >
                        <LinkIcon size={18} />
                        Open Payment Link
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}