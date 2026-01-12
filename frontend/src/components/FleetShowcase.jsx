import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTheme } from "../context/ThemeContext";

const FleetShowcase = () => {
  const { theme } = useTheme();

  const fleetData = [
    {
      id: 1,
      name: "Sedan",
      tagline: "City Comfort Redefined",
      description:
        "Experience premium city travel with our well-maintained sedans. Perfect for business meetings, airport transfers, and daily commutes. Enjoy smooth rides with professional chauffeurs who prioritize your comfort and punctuality.",
      capacity: "4 Passengers",
      luggage: "3 Large Bags",
      image: "/assets/marutiDzire.png",
      imageClass: "scale-140",

      gradient:
        "from-[#FAF9F7] via-[#EEECE6] to-[#D8D5CB] [[data-theme=dark]_&]:from-[#1F2933] [[data-theme=dark]_&]:via-[#111827] [[data-theme=dark]_&]:to-[#020617]",

      bgAccent: "bg-yellow-400/10",
      borderAccent: "border-gray-500/40",
      accentColor: "from-yellow-400 to-amber-500",
      slideFrom: "left",
    },
    {
      id: 2,
      name: "SUV",
      tagline: "Luxury Meets Adventure",
      description:
        "Travel in style and comfort with our premium SUVs. Spacious interiors, advanced safety features, and powerful performance make every journey memorable. Ideal for family trips, weekend getaways, and long-distance travel with extra luggage space.",
      capacity: "6-7 Passengers",
      luggage: "5 Large Bags",
      image: "/assets/suv.png",
      imageClass: "scale-130",

      gradient:
        "from-[#FAF9F7] via-[#EEECE6] to-[#D8D5CB] [[data-theme=dark]_&]:from-[#1F2933] [[data-theme=dark]_&]:via-[#111827] [[data-theme=dark]_&]:to-[#020617]",

      bgAccent: "bg-gray-400/10",
      borderAccent: "border-gray-500/40",
      accentColor: "from-yellow-400 to-amber-500",
      slideFrom: "right",
    },
    {
      id: 3,
      name: "Tempo Traveller",
      tagline: "Group Travel Excellence",
      description:
        "The ultimate solution for group outings and corporate events. Our tempo travellers offer unmatched comfort with pushback seats, ample legroom, and modern amenities. Perfect for pilgrimages, team outings, wedding parties, and tourist groups exploring Gujarat.",
      capacity: "12-17 Passengers",
      luggage: "15+ Bags",
      image: "/assets/tempotraveller.png",
      imageClass: "scale-90",

      gradient:
        "from-[#FAF9F7] via-[#EEECE6] to-[#D8D5CB] [[data-theme=dark]_&]:from-[#1F2933] [[data-theme=dark]_&]:via-[#111827] [[data-theme=dark]_&]:to-[#020617]",

      bgAccent: "bg-yellow-400/10",
      borderAccent: "border-gray-500/40",
      accentColor: "from-yellow-400 to-amber-500",
      slideFrom: "left",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 216, 76, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 216, 76, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-12 sm:mb-16 md:mb-20 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          viewport={{ once: true }}
          className="inline-block px-5 py-2 rounded-full bg-yellow-400/20 [[data-theme=dark]_&]:bg-yellow-400/10 border border-yellow-400 mb-6"
        >
          <span className="text-yellow-600 [[data-theme=dark]_&]:text-yellow-400 font-bold text-sm sm:text-base">
            Our Premium Fleet
          </span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 [[data-theme=dark]_&]:text-white mb-4">
          Choose Your
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="block text-yellow-500 [[data-theme=dark]_&]:text-yellow-400"
          >
            Perfect Ride
          </motion.span>
        </h2>
        <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
          Premium travel solutions designed for your comfort and convenience
        </p>
      </motion.div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-28">
        {fleetData.map((vehicle, index) => (
          <FleetCard
            key={vehicle.id + "-" + theme}
            vehicle={vehicle}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

function FleetCard({ vehicle, index }) {
  const { ref, inView } = useInView({
    threshold: 0.25,
    triggerOnce: false,
  });

  const slideVariants = {
    hidden: {
      x: vehicle.slideFrom === "left" ? -100 : 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={slideVariants}
      className="group relative"
    >
      <div
        className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
          } gap-8 items-center`}
      >
        {/* Image Section */}
        <div className="w-full lg:w-1/2 relative">
          <div
            className={`relative rounded-3xl bg-gradient-to-br ${vehicle.gradient} p-8 sm:p-10 shadow-2xl border ${vehicle.borderAccent} transition-colors duration-500 overflow-hidden`}
          >
            <div className="relative aspect-[4/3] flex items-center justify-center">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className={`
    w-full h-full
    object-contain
    drop-shadow-2xl
    transition-transform duration-300
    ${vehicle.imageClass || ""}
  `}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-1/2 space-y-6 px-4">
          <h3 className="text-4xl sm:text-5xl font-black text-gray-900 [[data-theme=dark]_&]:text-white">
            {vehicle.name}
          </h3>

          <p
            className={`text-xl font-semibold bg-gradient-to-r ${vehicle.accentColor} bg-clip-text text-transparent`}
          >
            {vehicle.tagline}
          </p>

          <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-300 leading-relaxed">
            {vehicle.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Capacity" value={vehicle.capacity} icon="👥" />
            <InfoCard label="Luggage" value={vehicle.luggage} icon="🧳" />
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 1,
              delay: 0.2,
              ease: "easeInOut",
            }}
            className={`
    h-1.5
    rounded-full
    origin-left
    mt-4 sm:mt-6
    bg-gradient-to-r
    ${vehicle.accentColor}
  `}
          />
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white [[data-theme=dark]_&]:bg-gray-700 border border-gray-200 [[data-theme=dark]_&]:border-gray-600 p-4 shadow-sm">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
        {value}
      </p>
    </div>
  );
}

export default FleetShowcase;
