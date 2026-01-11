import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    IndianRupee,
    Link as LinkIcon,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import apiClient from "../../utils/apiClient";

export default function AdminModifiedRides() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [filter, setFilter] = useState("all");
    const [manualRefresh, setManualRefresh] = useState(false);
    const [generatingRideId, setGeneratingRideId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        fetchModifiedRides(true);

        const interval = setInterval(() => {
            if (!isMounted) return;
            fetchModifiedRides(false);
        }, 20000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    async function fetchModifiedRides(showLoader = false) {
        try {
            if (showLoader) setLoading(true);

            const res = await apiClient.get("/api/v1/admin/rides/modified");

            if (!res.data?.success) return;

            const fetched = (res.data.rides || []).filter(
                r => r.rideStatus !== "cancelled"
            );

            setRides(prev => {

                const paidMap = new Map(
                    prev
                        .filter(r => r.extraChargeStatus === "paid")
                        .map(r => [r._id, r])
                );

                const newMap = new Map(fetched.map(r => [r._id, r]));

                const merged = [
                    ...newMap.values(),
                    ...[...paidMap.values()].filter(r => !newMap.has(r._id)),
                ];

                return merged.sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                );
            });

        } catch (err) {
            console.error("fetchModifiedRides error:", err);
        } finally {
            if (showLoader) setLoading(false);
        }
    }

    async function handleManualRefresh() {
        setManualRefresh(true);
        await fetchModifiedRides(false);
    }

    async function generateExtraPayment(ride) {
        if (generatingRideId === ride._id) return;

        const amount = prompt("Enter extra charge amount (₹):");
        if (!amount || isNaN(amount)) return alert("Invalid amount");

        try {
            setGeneratingRideId(ride._id);
            await apiClient.post(`/api/v1/admin/rides/${ride._id}/extra-payment`, {
                amount: Number(amount)
            });

            alert("Payment link generated!");
            await fetchModifiedRides(false);
        } catch (err) {
            console.error(err);
            alert("Failed to generate payment link");
        } finally {
            setGeneratingRideId(null);
        }
    }

    const filteredRides = rides.filter(ride => {
        if (filter === "all") return true;
        if (filter === "paid") return ride.extraChargeStatus === "paid";
        if (filter === "unpaid") {
            return ride.extraChargeStatus !== "paid" &&
                (ride.extraChargeStatus === "link_sent" ||
                    ride.extraChargeStatus === "pending" ||
                    !ride.extraChargeStatus);
        }
        return true;
    });

    return (
        <div
            className="
        min-h-screen 
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900
        [[data-theme=dark]_&]:text-gray-100
        transition-colors duration-500
        p-3 sm:p-4 md:p-6 lg:p-8
      "
        >
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                    >
                        Modified Rides and Extra Charges
                    </motion.h1>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleManualRefresh}
                        disabled={manualRefresh}
                        className="
                            w-full sm:w-auto
                            px-4 py-2
                            bg-gray-200 hover:bg-gray-300
                            [[data-theme=dark]_&]:bg-gray-700 
                            [[data-theme=dark]_&]:hover:bg-gray-600
                            rounded-lg
                            flex items-center justify-center gap-2
                            disabled:opacity-50
                            text-sm sm:text-base
                        "
                    >
                        <RefreshCw
                            size={18}
                            className={manualRefresh ? "animate-spin" : ""}
                        />
                        Refresh
                    </motion.button>
                </div>

                <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
                    {[
                        { label: "All", value: "all" },
                        { label: "Paid", value: "paid" },
                        { label: "Unpaid", value: "unpaid" }
                    ].map(tab => (
                        <motion.button
                            key={tab.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(tab.value)}
                            className={`
        flex-1 sm:flex-none
        px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base
        ${filter === tab.value
                                    ? "bg-yellow-400 text-black"
                                    : "bg-white [[data-theme=dark]_&]:bg-gray-800 text-gray-700 [[data-theme=dark]_&]:text-gray-300 border border-gray-300 [[data-theme=dark]_&]:border-gray-700"}
      `}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {loading && (
                    <div className="text-center py-12 sm:py-20">
                        <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 mx-auto border-b-4 border-yellow-400 rounded-full"></div>
                        <p className="mt-4 text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            Loading modified rides...
                        </p>
                    </div>
                )}

                {!loading && filteredRides.length === 0 && (
                    <div className="text-center py-12 sm:py-20">
                        <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
                        <p className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
                            {filter === "all"
                                ? "No modified rides found."
                                : `No ${filter} rides found.`
                            }
                        </p>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    {filteredRides.map((ride) => (
                        <motion.div
                            key={ride._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="
                bg-white 
                [[data-theme=dark]_&]:bg-gray-800
                border border-gray-200 
                [[data-theme=dark]_&]:border-gray-700
                rounded-xl
                p-4 sm:p-5 md:p-6
                shadow-md
              "
                        >
                            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
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
                                <strong>User:</strong> {ride.userId?.name} ({ride.userId?.phone})
                            </p>

                            <div className="text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300 mb-2 space-y-1">
                                <p>
                                    <strong>Original Fare:</strong> ₹{ride.finalFare ?? ride.fare ?? "—"}
                                </p>

                                {ride.extraChargeAmount > 0 && (
                                    <p>
                                        <strong>Extra Charge:</strong>{" "}
                                        <span className="text-yellow-600 font-semibold">
                                            ₹{ride.extraChargeAmount}
                                        </span>
                                    </p>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                                <strong>Extra Charge Status:</strong>{" "}
                                <span
                                    className={`font-semibold ${ride.extraChargeStatus === "paid"
                                        ? "text-green-600"
                                        : ride.extraChargeStatus === "link_sent"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {ride.extraChargeStatus || "pending"}
                                </span>
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                                {ride.extraChargeStatus !== "paid" && (
                                    <button
                                        onClick={() => generateExtraPayment(ride)}
                                        disabled={generatingRideId === ride._id}
                                        className={`
    w-full sm:w-auto px-4 py-2 rounded-md font-semibold transition 
    flex items-center gap-2 justify-center 
    text-sm sm:text-base
    ${generatingRideId === ride._id
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-yellow-400 [[data-theme=dark]_&]:text-gray-700 hover:bg-yellow-500"
                                            }
  `}
                                    >
                                        <IndianRupee size={18} />
                                        {generatingRideId === ride._id ? "Generating..." : "Generate Payment"}
                                    </button>

                                )}

                                {ride.extraPaymentLink && (
                                    <a
                                        href={ride.extraPaymentLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="
                      w-full sm:w-auto
                      px-4 py-2
                      bg-blue-500 hover:bg-blue-600
                      text-white font-semibold
                      rounded-lg
                      flex items-center justify-center gap-2
                      text-sm sm:text-base
                      transition
                    "
                                    >
                                        <LinkIcon size={18} />
                                        Open Payment Link
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}