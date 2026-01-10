import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from "framer-motion";
import { Car, ShieldCheck, Clock, Globe2, HeartHandshake } from "lucide-react";

export default function AboutUs() {
    return (
        <div
            className="
                min-h-screen pt-6 sm:pt-8 md:pt-10 pb-20 sm:pb-24 md:pb-28 
                px-4 sm:px-6 md:px-8 lg:px-10
                bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900
                transition-colors duration-500
            "
        >
            <section className="text-center max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yellow-500 px-4"
                >
                    Our Journey, Your Comfort
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl 
                               text-gray-700 [[data-theme=dark]_&]:text-gray-300 
                               leading-relaxed px-4"
                >
                    DoorDarshan Travels was built on a simple belief 
                    <span className="font-semibold text-yellow-600 [[data-theme=dark]_&]:text-yellow-400 ml-2 block sm:inline">
                        travel should feel effortless, premium, and trustworthy.
                    </span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mx-auto mt-6 sm:mt-8 md:mt-10 
                               drop-shadow-xl animate-[float_5s_infinite]
                               max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                >
                    <DotLottieReact
                        src="/animations/aboutAnimation.lottie"
                        loop
                        autoplay
                    />
                </motion.div>
            </section>

            <section className="max-w-6xl mx-auto mt-16 sm:mt-20 md:mt-24">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center 
                               text-gray-900 [[data-theme=dark]_&]:text-white 
                               mb-8 sm:mb-10 md:mb-14 px-4">
                    What Defines Us
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 px-4">
                    {[
                        {
                            icon: <ShieldCheck size={34} className="w-8 h-8 sm:w-9 sm:h-9" />,
                            title: "Safety First",
                            desc: "Verified drivers, sanitized cars & a service built on trust.",
                        },
                        {
                            icon: <Clock size={34} className="w-8 h-8 sm:w-9 sm:h-9" />,
                            title: "Always On Time",
                            desc: "We value punctuality your time matters as much as ours.",
                        },
                        {
                            icon: <Globe2 size={34} className="w-8 h-8 sm:w-9 sm:h-9" />,
                            title: "Expanding Horizons",
                            desc: "Serving Kutch & Gujarat with rapidly growing routes.",
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="
                p-6 sm:p-7 md:p-8 rounded-2xl 
                bg-white shadow-lg border border-yellow-200 
                [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:border-gray-700
                text-center
                hover:shadow-xl transition-shadow duration-300
              "
                        >
                            <div className="mx-auto text-yellow-500 mb-3 sm:mb-4 flex justify-center">
                                {item.icon}
                            </div>

                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold 
                                          text-gray-900 [[data-theme=dark]_&]:text-white">
                                {item.title}
                            </h3>

                            <p className="text-sm sm:text-base text-gray-600 
                                         [[data-theme=dark]_&]:text-gray-300 mt-2 sm:mt-3">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="max-w-6xl mx-auto mt-16 sm:mt-20 md:mt-28 px-4">

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center 
                               text-gray-900 [[data-theme=dark]_&]:text-white 
                               mb-8 sm:mb-10 md:mb-14">
                    Why People Trust DoorDarshan
                </h2>

                <div className="
                    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                    gap-6 sm:gap-8 md:gap-10 
                    p-6 sm:p-8 md:p-10 rounded-3xl  
                    bg-yellow-400 [[data-theme=dark]_&]:bg-yellow-600 
                    shadow-xl text-black
                ">

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full 
                                        bg-white flex items-center justify-center shadow-md">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/7435/7435823.png"
                                alt="Cabs"
                                className="w-12 sm:w-14 opacity-90"
                            />
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 sm:mt-4">
                            10K+
                        </h3>
                        <p className="text-sm sm:text-base md:text-md font-medium">
                            Successful Rides
                        </p>
                        <p className="text-xs sm:text-sm mt-1 opacity-80">
                            Local, Outstation & Airport Transfers
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full 
                                        bg-white flex items-center justify-center shadow-md">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
                                alt="Cities"
                                className="w-12 sm:w-14 opacity-90"
                            />
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 sm:mt-4">
                            250+
                        </h3>
                        <p className="text-sm sm:text-base md:text-md font-medium">
                            Cities Covered
                        </p>
                        <p className="text-xs sm:text-sm mt-1 opacity-80">
                            Serving Kutch & major cities in Gujarat
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full 
                                        bg-white flex items-center justify-center shadow-md">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/3202/3202926.png"
                                alt="Premium rides"
                                className="w-12 sm:w-14 opacity-90"
                            />
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 sm:mt-4">
                            Premium
                        </h3>
                        <p className="text-sm sm:text-base md:text-md font-medium">
                            Ride Network
                        </p>
                        <p className="text-xs sm:text-sm mt-1 opacity-80">
                            Corporate-grade vehicles & comfort
                        </p>
                    </div>

                </div>
            </section>
        </div>
    );
}