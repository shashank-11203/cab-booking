import { motion } from "framer-motion";

export default function CarLoader() {
  return (
    <div className="flex items-center justify-center">
      <motion.svg
        width="160"
        height="80"
        viewBox="0 0 320 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-yellow-500 [[data-theme=dark]_&]:text-yellow-400"
      >
        {/* Road */}
        <motion.line
          x1="0"
          y1="120"
          x2="320"
          y2="120"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="20 12"
          animate={{ strokeDashoffset: [0, -64] }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          opacity="0.4"
        />

        {/* Car Body */}
        <motion.rect
          x="80"
          y="60"
          rx="14"
          ry="14"
          width="160"
          height="40"
          fill="currentColor"
        />

        {/* Roof */}
        <motion.path
          d="M110 60 L140 40 H180 L210 60"
          fill="currentColor"
        />

        {/* Wheels */}
        {[120, 200].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="110"
            r="14"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            animate={{ rotate: 360 }}
            transform={`rotate(0 ${x} 110)`}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear",
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}