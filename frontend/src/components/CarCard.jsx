import { motion } from "framer-motion";
import { Users, Luggage, Info, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CarCard = ({ car, distance, finalPrice, onBook, onShowSummary }) => {
  if (!distance) distance = 0;

  const { user } = useAuth();

  const price = Number(finalPrice || 0);

  const discounted =
    user?.role === "corporate"
      ? Math.round(price * 0.9)
      : Math.round(price * 0.95);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        bg-white 
        [[data-theme=dark]_&]:bg-gray-800 
        rounded-2xl sm:rounded-3xl overflow-hidden
        border border-gray-200 [[data-theme=dark]_&]:border-gray-700
        shadow-md hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        w-full
      "
    >
      <div className="w-full h-36 sm:h-44 md:h-48 lg:h-52 xl:h-56 relative bg-gradient-to-l from-gray-100 to-gray-400 [[data-theme=dark]_&]:from-gray-700 [[data-theme=dark]_&]:to-gray-900 flex items-center justify-center">
        <img
          src={car.images?.[0] || placeholder}
          alt={car.name}
          className="w-4/5 h-full object-contain drop-shadow-xl"
        />
      </div>

      <div className="px-4 sm:px-5 md:px-6 pb-5 sm:pb-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 [[data-theme=dark]_&]:text-gray-100 tracking-wide">
          {car.name}
        </h3>

        <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm md:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300 flex-wrap">
          <span className="flex items-center gap-1">
            <Users size={14} className="sm:w-4 sm:h-4" /> {car.seats ?? 4} Seats
          </span>

          <span className="flex items-center gap-1">
            <Luggage size={14} className="sm:w-4 sm:h-4" /> {car.luggage ?? 4} Bags
          </span>

          <span>AC</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400">
          <p className="text-xs sm:text-sm">
            Category: <span className="font-medium">{car.category.toUpperCase()}</span>
          </p>

          <button
            onClick={() => onShowSummary(car)}
            className="flex items-center gap-1 text-blue-600 [[data-theme=dark]_&]:text-yellow-300 hover:underline cursor-pointer text-xs sm:text-sm"
          >
            <Info size={12} className="sm:w-3.5 sm:h-3.5" /> Fare Summary
          </button>
        </div>

        {user?.role === "corporate" ? (
          <div className="text-xs sm:text-sm md:text-base text-gray-500 [[data-theme=dark]_&]:text-white font-semibold">
            Corporate price: 5% + extra 5% applied
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-gray-500">
            Corporate members see special prices
          </div>
        )}

        <div className="space-y-1 bg-gradient-to-b from-yellow-100 to-white [[data-theme=dark]_&]:from-gray-600 [[data-theme=dark]_&]:to-gray-800 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-200 [[data-theme=dark]_&]:border-gray-600">

          <p className="text-xs sm:text-sm line-through text-gray-500 [[data-theme=dark]_&]:text-gray-400">
            ₹{price}
          </p>

          <p className="text-xs font-semibold text-green-600 [[data-theme=dark]_&]:text-green-400 tracking-wide">
            {user?.role === "corporate" ? ("10%") : ("5%")} INSTANT DISCOUNT APPLIED
          </p>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-500">
            ₹{discounted}
          </p>
        </div>

        <button
          onClick={onBook}
          className="
            w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl 
            font-semibold text-sm sm:text-base text-black
            bg-yellow-400 
            hover:bg-yellow-500 
            transition-all
            flex items-center justify-center gap-2
            hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]
            cursor-pointer
          "
        >
          Book Now <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </motion.div>
  );
};

export default CarCard;