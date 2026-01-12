import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
    {
        name: "Rohit Patel",
        city: "Ahmedabad",
        rating: 5,
        text: "Very smooth booking experience. Driver arrived on time and the car was extremely clean. Best cab service I’ve used in Ahmedabad.",
    },
    {
        name: "Neha Shah",
        city: "Surat",
        rating: 5,
        text: "Early morning airport transfer was perfectly handled. Professional driver and zero stress.",
    },
    {
        name: "Amit Desai",
        city: "Vadodara",
        rating: 4,
        text: "Transparent pricing and comfortable ride. Everything was clear and well managed.",
    },
    {
        name: "Kunal Mehta",
        city: "Rajkot",
        rating: 5,
        text: "Tempo Traveller was clean and spacious. Family trip went smoothly.",
    },
    {
        name: "Pooja Trivedi",
        city: "Gandhinagar",
        rating: 5,
        text: "Premium experience from booking to drop off. Support team was responsive.",
    },
    {
        name: "Harsh Vora",
        city: "Bhavnagar",
        rating: 4,
        text: "Good service and polite driver. Routes were efficient.",
    },
    {
        name: "Sagar Joshi",
        city: "Jamnagar",
        rating: 5,
        text: "Outstation ride was peaceful and comfortable. Sure will book again.",
    },
    {
        name: "Nisha Patel",
        city: "Anand",
        rating: 5,
        text: "Booked for parents. Felt safe and reliable. Highly recommended.",
    },
];

export default function PremiumReviewsCarousel() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % reviews.length);
        }, 4800);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-20 px-4 sm:px-6 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900 overflow-hidden">

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto mb-14"
            >
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 [[data-theme=dark]_&]:text-white">
                    See what our customers say
                </h2>
                <p className="mt-2 text-gray-600 [[data-theme=dark]_&]:text-gray-400 text-base sm:text-lg">
                    Loved by travellers
                </p>
                <p className="mt-2 text-gray-600 [[data-theme=dark]_&]:text-gray-400 text-base sm:text-lg">
                    Real stories from customers across Gujarat
                </p>
            </motion.div>

            {/* Carousel */}
            <div className="relative max-w-6xl mx-auto overflow-hidden">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    className="flex gap-6 cursor-grab active:cursor-grabbing"
                    animate={{
                        x: `-${typeof window !== "undefined" && window.innerWidth < 640
                            ? index * (window.innerWidth * 0.78 + 24)
                            : index * 360
                            }px`
                    }}

                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                >
                    {reviews.map((r, i) => {
                        const isActive = i === index;
                        return (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: isActive ? 1 : 0.94,
                                    opacity: isActive ? 1 : 0.45,
                                    filter:
                                        typeof window !== "undefined" && window.innerWidth < 640 && !isActive
                                            ? "blur(1.5px)"
                                            : "blur(0px)",
                                }}
                                transition={{ duration: 0.4 }}
                                className="
                  min-w-[78vw] sm:min-w-[340px]
                  rounded-3xl
                  backdrop-blur-xl
                  bg-white/80
                  [[data-theme=dark]_&]:bg-gray-800/70
                  border border-white/40
                  [[data-theme=dark]_&]:border-gray-700
                  shadow-xl
                  p-7
                "
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, s) => (
                                        <Star
                                            key={s}
                                            size={16}
                                            className={
                                                s < r.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300"
                                            }
                                        />
                                    ))}
                                </div>

                                {/* Review */}
                                <p className="text-gray-700 [[data-theme=dark]_&]:text-gray-300 text-sm sm:text-base leading-relaxed">
                                    “{r.text}”
                                </p>

                                {/* User */}
                                <div className="mt-6">
                                    <p className="font-semibold text-gray-900 [[data-theme=dark]_&]:text-white">
                                        {r.name}
                                    </p>
                                    <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400">
                                        {r.city}, Gujarat
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Progress Bar */}
                <div className="mt-8 h-1 w-full bg-gray-200 [[data-theme=dark]_&]:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        key={index}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.6, ease: "linear" }}
                        className="h-full bg-yellow-400"
                    />
                </div>
            </div>
        </section>
    );
}