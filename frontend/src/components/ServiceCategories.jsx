import { motion } from "framer-motion";
import { Plane, Clock, Users } from "lucide-react";

const categories = [
  {
    icon: <Plane size={20} />,
    title: "Airport Transfers",
    desc: "Seamless airport pickups and drops with real time flight tracking, professional chauffeurs, and zero waiting time.",
    note: "Available 24×7 for all major airports",
  },
  {
    icon: <Clock size={20} />,
    title: "Outstation Trips",
    desc: "Relaxed and reliable long distance journeys with well-maintained vehicles, experienced drivers, and transparent pricing.",
    note: "Ideal for family trips & weekend travel",
  },
  {
    icon: <Users size={20} />,
    title: "Corporate Bookings",
    desc: "Premium corporate travel solutions with priority support, centralized billing, and GST ready invoicing.",
    note: "Trusted by growing teams & enterprises",
  },
];

export default function ServiceCategories() {
  return (
    <section
      className="
        max-w-6xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-8 sm:py-10 lg:py-12
      "
    >
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          text-2xl sm:text-3xl lg:text-4xl
          font-extrabold
          text-yellow-500
          text-center
          mb-6 sm:mb-8
        "
      >
        Our Services
      </motion.h2>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-5 sm:gap-6
        "
      >
        {categories.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              amount: 0.3,
              margin: "-60px",
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.1,
            }}
            whileHover={{
              y: -8,
              boxShadow: "0 16px 36px rgba(0,0,0,0.10)",
            }}
            className="
    bg-white
    [[data-theme=dark]_&]:bg-gray-800
    border border-yellow-200/30
    [[data-theme=dark]_&]:border-yellow-300/10
    rounded-2xl
    p-5 sm:p-6
    transition-all duration-300
  "
          >


            <div
              className="
                w-11 h-11 sm:w-12 sm:h-12
                flex items-center justify-center
                rounded-xl
                bg-yellow-50
                [[data-theme=dark]_&]:bg-gray-700
                text-yellow-500
                mb-4
              "
            >
              {c.icon}
            </div>

            <h3
              className="
                font-semibold
                text-base sm:text-lg
                text-gray-900
                [[data-theme=dark]_&]:text-gray-100
              "
            >
              {c.title}
            </h3>

            <p
              className="
                mt-2
                text-sm sm:text-base
                text-gray-600
                [[data-theme=dark]_&]:text-gray-300
                leading-relaxed
              "
            >
              {c.desc}
            </p>

            {/* subtle divider */}
            <div
              className="
                mt-4
                h-px
                w-10
                bg-yellow-400/60
              "
            />

            <p
              className="
                mt-2
                text-xs sm:text-sm
                text-gray-500
                [[data-theme=dark]_&]:text-gray-400
              "
            >
              {c.note}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}