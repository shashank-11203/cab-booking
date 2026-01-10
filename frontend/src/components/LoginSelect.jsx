import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LoginSelect() {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen flex items-center justify-center 
        px-4 sm:px-6
        bg-yellow-50 text-gray-900
        [[data-theme=dark]_&]:bg-gray-900 
        [[data-theme=dark]_&]:text-gray-100
        transition-colors duration-500
      ">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="
          w-full max-w-3xl 
          p-6 sm:p-8 md:p-10 
          rounded-2xl sm:rounded-3xl 
          shadow-2xl 
          bg-white [[data-theme=dark]_&]:bg-gray-800/90
          border border-yellow-300/40 [[data-theme=dark]_&]:border-gray-700
        "
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-500">
          Login
        </h1>

        <p className="mt-2 text-sm sm:text-base text-gray-700 [[data-theme=dark]_&]:text-gray-300">
          Select how you want to continue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8 md:mt-10">

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="
              p-5 sm:p-6 
              rounded-xl sm:rounded-2xl 
              cursor-pointer
              bg-yellow-100 text-gray-900
              [[data-theme=dark]_&]:bg-gray-700 
              [[data-theme=dark]_&]:text-gray-100
              border border-yellow-300 [[data-theme=dark]_&]:border-gray-600
              hover:shadow-xl transition-all 
              flex justify-between items-center
            "
          >
            <span className="font-semibold text-base sm:text-lg">Customer</span>
            <ArrowRight className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/partner/login")}
            className="
              p-5 sm:p-6 
              rounded-xl sm:rounded-2xl 
              cursor-pointer
              bg-yellow-100 text-gray-900
              [[data-theme=dark]_&]:bg-gray-700 
              [[data-theme=dark]_&]:text-gray-100
              border border-yellow-300 [[data-theme=dark]_&]:border-gray-600
              hover:shadow-xl transition-all 
              flex justify-between items-center
            "
          >
            <span className="font-semibold text-base sm:text-lg">Travel Partner</span>
            <ArrowRight className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/corporate/login")}
            className="
              p-5 sm:p-6 
              rounded-xl sm:rounded-2xl 
              cursor-pointer
              bg-yellow-100 text-gray-900
              [[data-theme=dark]_&]:bg-gray-700 
              [[data-theme=dark]_&]:text-gray-100
              border border-yellow-300 [[data-theme=dark]_&]:border-gray-600
              hover:shadow-xl transition-all 
              flex justify-between items-center
              sm:col-span-2 md:col-span-1
            "
          >
            <span className="font-semibold text-base sm:text-lg">Corporate</span>
            <ArrowRight className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}