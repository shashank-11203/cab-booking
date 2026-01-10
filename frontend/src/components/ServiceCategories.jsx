import { motion } from "framer-motion";
import { Plane, Clock, Users } from "lucide-react";

const categories = [
  {
    icon: <Plane size={20} />,
    title: "Airport Transfers",
    desc: "Timely pickups & flight tracking.",
  },
  {
    icon: <Clock size={20} />,
    title: "Outstation Trips",
    desc: "Comfortable long-distance travel.",
  },
  {
    icon: <Users size={20} />,
    title: "Corporate Bookings",
    desc: "Priority support & corporate invoicing.",
  },
];

export default function ServiceCategories() {
  return (
    <section
      className="
        max-w-6xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-8 lg:py-10
      "
    >
      <h2
        className="
          text-2xl sm:text-3xl lg:text-4xl
          font-extrabold
          text-yellow-500
          text-center
          mb-6 sm:mb-8
        "
      >
        Our Services
      </h2>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-4 sm:gap-6
        "
      >
        {categories.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{
              translateY: -6,
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
            }}
            transition={{ type: "spring", stiffness: 260 }}
            className="
              bg-white
              [[data-theme=dark]_&]:bg-gray-800
              border border-yellow-200/30
              [[data-theme=dark]_&]:border-yellow-300/10
              rounded-2xl
              p-5 sm:p-6
              transition-colors duration-300
            "
          >
            <div
              className="
                w-11 h-11 sm:w-12 sm:h-12
                flex items-center justify-center
                rounded-lg
                bg-yellow-50
                [[data-theme=dark]_&]:bg-gray-700
                text-yellow-500
                mb-3 sm:mb-4
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}
