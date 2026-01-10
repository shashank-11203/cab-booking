import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Car, Clock, ShieldCheck, Crown } from "lucide-react";

const features = [
    {
        icon: Car,
        title: "Wide Coverage",
        desc: "We cover every major destination in Kutch & Gujarat.",
    },
    {
        icon: Clock,
        title: "Always On Time",
        desc: "Professional punctuality guaranteed for every ride.",
    },
    {
        icon: ShieldCheck,
        title: "Safe & Secure",
        desc: "Verified drivers & fully inspected vehicles.",
    },
    {
        icon: Crown,
        title: "Premium Experience",
        desc: "Comfort & class blended into every ride.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(255, 216, 76, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 216, 76, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-[120px] [[data-theme=dark]_&]:opacity-20"
            />
            <motion.div
                animate={{
                    scale: [1.15, 1, 1.15],
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ willChange: "transform, opacity" }}
                className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-400 rounded-full blur-[120px] [[data-theme=dark]_&]:opacity-20"
            />

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
                        ⭐ Why Choose Us
                    </span>
                </motion.div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 [[data-theme=dark]_&]:text-white mb-4">
                    What Makes Us
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="block text-yellow-500 [[data-theme=dark]_&]:text-yellow-400"
                    >
                        Different
                    </motion.span>
                </h2>
                <p className="text-gray-600 [[data-theme=dark]_&]:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                    Premium travel solutions designed for your comfort and convenience
                </p>
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} feature={feature} index={index} />
                ))}
            </div>

            <div className="mt-16 sm:mt-20 flex justify-center items-center gap-3">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            delay: i * 0.1,
                        }}
                        style={{ willChange: "transform" }}
                        className="relative"
                    >
                        <motion.div
                            animate={{
                                y: [0, -12, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.25,
                                ease: [0.45, 0.05, 0.55, 0.95],
                                repeatType: "loop"
                            }}
                            style={{ willChange: "transform" }}
                            className="w-3 h-3 rounded-full bg-yellow-400 [[data-theme=dark]_&]:bg-yellow-500 shadow-lg shadow-yellow-400/50"
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function FeatureCard({ feature, index }) {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: false,
    });

    const Icon = feature.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={inView ? {
                opacity: 1,
                y: 0,
                scale: 1
            } : {
                opacity: 0,
                y: 50,
                scale: 0.95
            }}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
            }}
            className="group relative"
        >
            <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ willChange: "transform" }}
                className="relative h-full"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 [[data-theme=dark]_&]:group-hover:opacity-25" />

                <div className="relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white [[data-theme=dark]_&]:bg-gray-800 border-2 border-gray-200 [[data-theme=dark]_&]:border-gray-700 shadow-lg hover:shadow-2xl hover:border-yellow-400 [[data-theme=dark]_&]:hover:border-yellow-500 transition-all duration-300 overflow-hidden">

                    <motion.div
                        initial={{ width: 0, height: 0 }}
                        animate={inView ? { width: "40px", height: "40px" } : { width: 0, height: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                        className="absolute top-0 right-0 border-t-4 border-r-4 border-yellow-400 rounded-tr-2xl"
                    />
                    <motion.div
                        initial={{ width: 0, height: 0 }}
                        animate={inView ? { width: "40px", height: "40px" } : { width: 0, height: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                        className="absolute bottom-0 left-0 border-b-4 border-l-4 border-yellow-400 rounded-bl-2xl"
                    />

                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{ willChange: "transform" }}
                        className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/5 [[data-theme=dark]_&]:bg-yellow-400/10 rounded-full blur-2xl"
                    />

                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1 + 0.15,
                            type: "spring",
                            stiffness: 200
                        }}
                        whileHover={{
                            scale: 1.15,
                            rotate: [0, -5, 5, -5, 0],
                            transition: {
                                scale: { duration: 0.3 },
                                rotate: { duration: 0.5 }
                            }
                        }}
                        style={{ willChange: "transform" }}
                        className="relative inline-flex items-center justify-center mb-5 sm:mb-6"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-yellow-400 blur-xl"
                        />
                        <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-xl group-hover:shadow-2xl group-hover:shadow-yellow-400/50 transition-all duration-300">
                            <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-black" strokeWidth={2.5} />
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            style={{ willChange: "transform" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2"
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="relative">
                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                            className="text-xl sm:text-2xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white mb-3 group-hover:text-yellow-600 [[data-theme=dark]_&]:group-hover:text-yellow-400 transition-colors duration-300"
                        >
                            {feature.title}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 + 0.35, ease: "easeOut" }}
                            className="text-sm sm:text-base text-gray-600 [[data-theme=dark]_&]:text-gray-300 leading-relaxed"
                        >
                            {feature.desc}
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                        transition={{
                            scaleX: { duration: 1, delay: index * 0.1 + 0.5, ease: "easeInOut" },
                            opacity: { duration: 0.6, delay: index * 0.1 + 0.5 }
                        }}
                        className="mt-5 sm:mt-6 h-1.5 bg-gray-200 [[data-theme=dark]_&]:bg-gray-700 rounded-full overflow-hidden origin-left relative"
                    >
                        <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
                        {inView && (
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{
                                    x: ["100%", "200%"],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatDelay: 0.5
                                }}
                                style={{ willChange: "transform" }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        )}
                    </motion.div>

                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [0, 1.2, 0],
                                opacity: [0, 1, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 1.2,
                                ease: "easeInOut"
                            }}
                            style={{
                                willChange: "transform, opacity",
                                top: `${20 + i * 25}%`,
                                right: `${15 + i * 10}%`,
                            }}
                            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}