import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Hero = ({ onBookNow }) => {
  return (
    <section
      className="
        w-full 
        flex flex-col md:flex-row 
        items-center justify-between 
        max-w-6xl mx-auto 
        px-4 sm:px-6 
        py-12 sm:py-16 md:py-20
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900
        [[data-theme=dark]_&]:text-gray-100
        transition-colors duration-500
      "
    >
      {/* LEFT TEXT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Your <span className="text-yellow-400">Journey</span>,<br />
          Our <span className="text-yellow-400">Drive</span>.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 [[data-theme=dark]_&]:text-gray-300 max-w-lg mx-auto md:mx-0">
          Seamless cab bookings, trusted drivers, and comfortable rides all in one click.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-yellow-400 text-black 
                     px-5 sm:px-6 
                     py-2.5 sm:py-3 
                     rounded-full 
                     font-semibold
                     text-sm sm:text-base
                     flex items-center gap-2 
                     cursor-pointer
                     hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
                     transition-all
                     mx-auto md:mx-0"
          onClick={onBookNow}
        >
          Book Now <ArrowRight size={18} className="sm:w-5 sm:h-5" />
        </motion.button>
      </motion.div>

      {/* RIGHT ANIMATION */}
      <div className="flex-1 flex justify-center mt-8 sm:mt-10 md:mt-0">
        <DotLottieReact
          src="/animations/heroAnimation.lottie"
          loop
          autoplay
          className="
            w-96 sm:w-96 md:w-96 lg:w-[34rem] xl:w-[40rem] 2xl:w-[48rem]
          "
        />
      </div>

    </section>
  );
};

export default Hero;