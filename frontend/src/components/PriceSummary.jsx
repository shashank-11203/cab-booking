import { motion } from "framer-motion";
import { X } from "lucide-react";

const PriceSummary = ({ car, distance, onClose }) => {
  if (!car) return null;

  const baseFare = car.baseFare || 0;
  const serviceCharge = car.serviceCharge || 0;
  const gst = car.gst || 0;
  const total = car.total || 0;
  const finalFare = car.finalFare || 0;
  const appliedPriceType = car.appliedPriceType || "local";

  const combinedBaseFare = baseFare + serviceCharge;

  const discountAmount = total - finalFare;
  const discountPercentage = total > 0 ? Math.round((discountAmount / total) * 100) : 5;

  return (
    <div
      className="
        fixed inset-0 bg-black/40 backdrop-blur-sm 
        flex items-center justify-center z-50 p-4
      "
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[450px]
          max-h-[90vh] overflow-y-auto
          bg-white 
          [[data-theme=dark]_&]:bg-gray-900 
          rounded-xl shadow-2xl 
          p-4 sm:p-5 md:p-6
          relative
          border border-gray-200 [[data-theme=dark]_&]:border-gray-700
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 
            text-gray-600 [[data-theme=dark]_&]:text-gray-300 
            hover:text-red-500 transition z-10
          "
        >
          <X size={20} />
        </button>

        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 [[data-theme=dark]_&]:text-gray-100 pr-8">
          Fare Breakdown
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span className="font-semibold">Vehicle</span>
            <span className="font-semibold">{car.name}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span>Ride Type</span>
            <span className="font-semibold capitalize">{appliedPriceType}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span>Distance</span>
            <span className="font-semibold">{distance} km</span>
          </div>

          <hr className="border-gray-300 [[data-theme=dark]_&]:border-gray-700" />
          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span>Base Fare</span>
            <span className="font-semibold">₹{combinedBaseFare}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span>GST (18%)</span>
            <span className="font-semibold">₹{gst}</span>
          </div>

          <hr className="border-gray-300 [[data-theme=dark]_&]:border-gray-700" />

          <div className="flex justify-between text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
            <span>Subtotal</span>
            <span className="font-semibold">₹{total}</span>
          </div>

          <div className="flex justify-between text-sm text-green-600 [[data-theme=dark]_&]:text-green-400">
            <span>Instant Discount ({discountPercentage}%)</span>
            <span className="font-semibold">- ₹{discountAmount}</span>
          </div>

          <hr className="border-gray-300 [[data-theme=dark]_&]:border-gray-700" />

          <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 [[data-theme=dark]_&]:text-gray-100">
            <span>Final Amount</span>
            <span className="text-yellow-500">₹{finalFare}</span>
          </div>

          <div className="mt-4 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-800 p-3 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-800 [[data-theme=dark]_&]:text-gray-200 mb-1.5">
              Additional Charges
            </h3>
            <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400 text-xs leading-relaxed">
              Fuel surcharge may apply for extended routes or waiting time.
            </p>
          </div>

          <div className="mt-3">
            <h3 className="font-semibold text-sm text-gray-800 [[data-theme=dark]_&]:text-gray-200 mb-1.5">
              Included
            </h3>
            <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400 text-xs leading-relaxed">
              Base fare, vehicle charges, GST, and driver allowance.
            </p>
          </div>

          <div className="mt-3">
            <h3 className="font-semibold text-sm text-gray-800 [[data-theme=dark]_&]:text-gray-200 mb-1.5">
              Not Included
            </h3>
            <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-400 text-xs leading-relaxed">
              Parking, airport entry fees, tolls, and state permit charges (if applicable).
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceSummary;