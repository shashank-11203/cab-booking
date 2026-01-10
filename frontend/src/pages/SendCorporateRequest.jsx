import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SendCorporateRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [travelRoute, setTravelRoute] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isProfileComplete = user?.name?.trim() && user?.phone?.trim();

    if (!isProfileComplete) {
      toast.info("Please complete your profile first");
      navigate("/profile?redirectTo=corporate-request");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) return toast.error("Enter your company name");
    if (!travelRoute.trim()) return toast.error("Enter your travel route");

    try {
      setLoading(true);

      const res = await apiClient.post("/api/v1/corporate/request", {
        userId: user?._id,
        companyName,
        travelRoute,
        message,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setCompanyName("");
        setTravelRoute("");
        setMessage("");
        navigate("/");
      } else {
        toast.error(res.data.message);
        setCompanyName("");
        setTravelRoute("");
        setMessage("");
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.name?.trim() || !user?.phone?.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center 
                      bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900
                      px-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 mx-auto border-b-4 border-yellow-400 rounded-full mb-4"></div>
          <div className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-400">
            Redirecting to profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 
                    px-4 sm:px-6 md:px-8
                    py-8 sm:py-10 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white [[data-theme=dark]_&]:bg-gray-800 
                   p-5 sm:p-6 md:p-8 
                   rounded-xl sm:rounded-2xl 
                   shadow-xl 
                   max-w-lg w-full"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold 
                       text-gray-900 [[data-theme=dark]_&]:text-gray-100 
                       mb-4 sm:mb-6 
                       text-center">
          Corporate Account Request
        </h2>

        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1.5 text-sm sm:text-base font-medium
                              text-gray-700 [[data-theme=dark]_&]:text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-lg 
                         bg-gray-100 
                         [[data-theme=dark]_&]:bg-gray-700 
                         border border-gray-300 
                         [[data-theme=dark]_&]:border-gray-600
                         [[data-theme=dark]_&]:text-gray-50
                         focus:ring-2 focus:ring-yellow-400 outline-none
                         text-sm sm:text-base
                         placeholder:text-sm sm:placeholder:text-base"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm sm:text-base font-medium
                              text-gray-700 [[data-theme=dark]_&]:text-gray-300">
              Travel Route
            </label>
            <input
              type="text"
              placeholder="e.g. Bhuj → Ahmedabad"
              value={travelRoute}
              onChange={(e) => setTravelRoute(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-lg 
                         bg-gray-100 
                         [[data-theme=dark]_&]:bg-gray-700 
                         border border-gray-300 
                         [[data-theme=dark]_&]:border-gray-600
                         [[data-theme=dark]_&]:text-gray-50
                         focus:ring-2 focus:ring-yellow-400 outline-none
                         text-sm sm:text-base
                         placeholder:text-sm sm:placeholder:text-base"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm sm:text-base font-medium
                              text-gray-700 [[data-theme=dark]_&]:text-gray-300">
              Message <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Additional details or requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-lg 
                         bg-gray-100 
                         h-24 sm:h-28
                         [[data-theme=dark]_&]:bg-gray-700 
                         border border-gray-300 
                         [[data-theme=dark]_&]:border-gray-600
                         [[data-theme=dark]_&]:text-gray-50
                         focus:ring-2 focus:ring-yellow-400 outline-none
                         resize-none
                         text-sm sm:text-base
                         placeholder:text-sm sm:placeholder:text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full 
                       py-2.5 sm:py-3 
                       bg-yellow-400 hover:bg-yellow-500 
                       text-black font-semibold 
                       rounded-lg shadow-lg
                       transition-all cursor-pointer 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
                       text-sm sm:text-base
                       mt-2 sm:mt-4"
          >
            {loading ? "Sending..." : "Submit Request"}
          </button>
        </form>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-center text-gray-600 [[data-theme=dark]_&]:text-gray-400">
          Our team will review your request and contact you within 24-48 hours
        </p>
      </motion.div>
    </div>
  );
};

export default SendCorporateRequest;