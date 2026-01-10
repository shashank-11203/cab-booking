import React from "react";
import { motion } from "framer-motion";

export default function CorporateBanner({ onOpenForm }) {
    return (
        <section className="
            w-full mx-auto 
            mb-12 sm:mb-16 md:mb-20 
            p-5 sm:p-7 md:p-10 
            bg-gradient-to-r from-yellow-500 to-yellow-400
            [[data-theme=dark]_&]:from-gray-800 [[data-theme=dark]_&]:to-gray-700
            shadow-xl 
            grid grid-cols-1 md:grid-cols-2 
            gap-6 sm:gap-8 md:gap-10 
            items-center
        ">

            <div className="text-center md:text-left space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                    Corporate & Bulk Travel Solutions
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-gray-800 [[data-theme=dark]_&]:text-gray-300 max-w-xl mx-auto md:mx-0">
                    Need reliable cabs for your employees, events, delegates or company travel?
                    We offer special rates, priority support & premium vehicles.
                </p>

                <button
                    onClick={onOpenForm}
                    className="
                        mt-4 sm:mt-5 md:mt-6 
                        px-6 sm:px-7 md:px-8 
                        py-2.5 sm:py-3 
                        bg-black text-white 
                        [[data-theme=dark]_&]:bg-yellow-400 [[data-theme=dark]_&]:text-black
                        rounded-lg sm:rounded-xl 
                        text-sm sm:text-base
                        font-semibold 
                        hover:opacity-90 
                        transition 
                        cursor-pointer
                    "
                >
                    Request Callback
                </button>
            </div>

            <div className="flex justify-center">
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 sm:w-40 md:w-48 lg:w-64"
                >
                    <svg
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-xl"
                    >
                        <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
                            <motion.rect
                                x="40"
                                y="80"
                                width="120"
                                height="40"
                                rx="10"
                                className="text-black [[data-theme=dark]_&]:text-yellow-300"
                            />
                            <motion.rect
                                x="30"
                                y="100"
                                width="140"
                                height="30"
                                rx="12"
                                className="text-yellow-600 [[data-theme=dark]_&]:text-yellow-500"
                            />
                            <circle cx="70" cy="140" r="12" className="text-black [[data-theme=dark]_&]:text-white" />
                            <circle cx="130" cy="140" r="12" className="text-black [[data-theme=dark]_&]:text-white" />

                            <motion.line
                                x1="55"
                                y1="90"
                                x2="85"
                                y2="90"
                                className="text-white [[data-theme=dark]_&]:text-yellow-500"
                            />
                            <motion.line
                                x1="115"
                                y1="90"
                                x2="145"
                                y2="90"
                                className="text-white [[data-theme=dark]_&]:text-yellow-500"
                            />
                        </g>
                    </svg>
                </motion.div>
            </div>

        </section>
    );
}