import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import apiClient from "../utils/apiClient";

export default function CorporateFormPopup({ open, onClose }) {
  if (!open) return null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [travelRoute, setTravelRoute] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Enter your name");
    if (!/^[0-9]{10}$/.test(phone)) return alert("Enter a valid phone number");

    const res = await apiClient.post("/api/v1/corporate/inquiry", {
      name,
      phone,
      message,
      travelRoute,
    });

    if (res.data.success) {
      window.open(res.data.url, "_blank");
      onClose();
      setName("");
      setPhone("");
      setMessage("");
      setTravelRoute("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white [[data-theme=dark]_&]:bg-gray-900 
                   p-5 sm:p-6 md:p-8 
                   rounded-xl sm:rounded-2xl 
                   shadow-2xl 
                   w-full max-w-sm sm:max-w-md md:max-w-lg
                   max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-4 top-3 sm:top-4 
                     text-gray-500 hover:text-black 
                     [[data-theme=dark]_&]:text-gray-400 
                     [[data-theme=dark]_&]:hover:text-white
                     transition-colors"
        >
          <X size={20} className="sm:w-6 sm:h-6 cursor-pointer" />
        </button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold 
                       text-gray-900 [[data-theme=dark]_&]:text-gray-100 
                       mb-4 sm:mb-5 md:mb-6 pr-8">
          Corporate Travel Inquiry
        </h2>

        <form className="space-y-3 sm:space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 sm:p-3 
                       text-sm sm:text-base
                       rounded-lg bg-gray-100 
                       [[data-theme=dark]_&]:bg-gray-800 
                       border border-gray-300 
                       [[data-theme=dark]_&]:border-gray-700
                       [[data-theme=dark]_&]:text-gray-50
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 sm:p-3 
                       text-sm sm:text-base
                       rounded-lg bg-gray-100 
                       [[data-theme=dark]_&]:bg-gray-800 
                       border border-gray-300 
                       [[data-theme=dark]_&]:border-gray-700
                       [[data-theme=dark]_&]:text-gray-50
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="text"
            placeholder="Where are you planning to travel? (e.g. Bhuj to Surat)"
            value={travelRoute}
            onChange={(e) => setTravelRoute(e.target.value)}
            className="w-full p-2.5 sm:p-3 
                       text-sm sm:text-base
                       rounded-lg bg-gray-100 
                       [[data-theme=dark]_&]:bg-gray-800 
                       border border-gray-300 
                       [[data-theme=dark]_&]:border-gray-700
                       [[data-theme=dark]_&]:text-gray-50
                       focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <textarea
            placeholder="Your Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2.5 sm:p-3 
                       h-24 sm:h-28 
                       text-sm sm:text-base
                       rounded-lg bg-gray-100 
                       [[data-theme=dark]_&]:bg-gray-800 
                       border border-gray-300 
                       [[data-theme=dark]_&]:border-gray-700
                       [[data-theme=dark]_&]:text-gray-50
                       focus:outline-none focus:ring-2 focus:ring-yellow-400
                       resize-none"
          />

          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-2.5 sm:py-3 
                       text-sm sm:text-base
                       bg-yellow-400 hover:bg-yellow-500 
                       text-black font-semibold 
                       rounded-lg shadow-md
                       transition-all cursor-pointer
                       active:scale-95"
          >
            Submit Inquiry
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}