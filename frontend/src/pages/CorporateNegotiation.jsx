import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function CorporateNegotiation() {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 7000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRide() {
    try {
      const res = await apiClient.get("/api/v1/corporate/ride/latest", { userId: user._id });
      if (res.data.success) setRide(res.data.ride);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center 
                      bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 
                      [[data-theme=dark]_&]:text-gray-100">
        <div className="text-center px-4">
          <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 mx-auto border-b-4 border-yellow-400 rounded-full mb-4"></div>
          <p className="text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen 
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900
        [[data-theme=dark]_&]:text-gray-100
        transition-colors duration-500
        px-4 sm:px-6 md:px-8 lg:px-10
        py-12 sm:py-16 md:py-20
      "
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4"
        >
          Corporate Ride Status
        </motion.h1>

        {!ride && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 [[data-theme=dark]_&]:text-gray-400 px-4"
          >
            No corporate ride found.
          </motion.p>
        )}

        {ride && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8"
          >
            <div className="bg-white [[data-theme=dark]_&]:bg-gray-800 
                            rounded-xl sm:rounded-2xl 
                            shadow-lg border border-yellow-200 [[data-theme=dark]_&]:border-gray-700
                            p-5 sm:p-6 md:p-8 
                            mb-6 sm:mb-8
                            max-w-2xl mx-auto">

              <p className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 break-words px-2">
                <span className="block sm:inline break-all">{ride.pickupName}</span>
                <span className="text-yellow-500 mx-2 text-xl sm:text-2xl">→</span>
                <span className="block sm:inline break-all">{ride.dropName}</span>
              </p>

              <div className="inline-block px-4 py-2 rounded-full 
                              bg-yellow-100 [[data-theme=dark]_&]:bg-yellow-900/30
                              text-gray-700 [[data-theme=dark]_&]:text-gray-300
                              text-sm sm:text-base">
                <span className="font-semibold">Status:</span>{" "}
                {ride.status === "pending_negotiation" ? "Pending" : "Payment Pending"}
              </div>
            </div>

            {ride.status === "pending_negotiation" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-50 [[data-theme=dark]_&]:bg-yellow-900/20 
                           border-2 border-yellow-300 [[data-theme=dark]_&]:border-yellow-600
                           rounded-xl sm:rounded-2xl 
                           p-5 sm:p-6 md:p-8
                           max-w-xl mx-auto"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="animate-pulse">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-500"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl text-yellow-600 [[data-theme=dark]_&]:text-yellow-400 font-medium text-center px-4">
                    Our team will contact you in shortly...
                  </p>
                </div>
              </motion.div>
            )}

            {ride.status === "link_sent" && ride.paymentLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 sm:gap-6"
              >
                <p className="text-base sm:text-lg text-gray-700 [[data-theme=dark]_&]:text-gray-300 px-4">
                  Your ride has been priced and is ready for payment
                </p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={ride.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-full sm:w-auto
                    px-6 sm:px-8 md:px-10
                    py-3 sm:py-3.5 md:py-4
                    rounded-xl 
                    bg-yellow-400 text-black 
                    font-semibold text-base sm:text-lg
                    shadow-lg hover:shadow-xl
                    transition-all
                    max-w-xs
                    text-center
                  "
                >
                  Pay Now
                </motion.a>
              </motion.div>
            )}

            {ride.status === "paid" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 [[data-theme=dark]_&]:bg-green-900/20 
                           border-2 border-green-300 [[data-theme=dark]_&]:border-green-600
                           rounded-xl sm:rounded-2xl 
                           p-5 sm:p-6 md:p-8
                           max-w-xl mx-auto"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-green-500"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-base sm:text-lg md:text-xl text-green-600 [[data-theme=dark]_&]:text-green-400 font-semibold text-center px-4">
                    Payment completed. Your ride is confirmed ✅
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}