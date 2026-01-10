import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactUs() {
    return (
        <div
            className="
        min-h-screen 
        pt-6 sm:pt-8 md:pt-10 
        pb-12 sm:pb-16 md:pb-20 
        px-4 sm:px-6 md:px-8 lg:px-10
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900
        transition-colors duration-500
      "
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto px-4"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-500">
                    Get in Touch
                </h1>
                <p className="text-gray-700 [[data-theme=dark]_&]:text-gray-300 
                              mt-2 sm:mt-3 text-base sm:text-lg md:text-xl">
                    We're always here to help. Connect with us through call, WhatsApp or email.
                </p>
            </motion.div>

            <div className="max-w-5xl mx-auto 
                            mt-10 sm:mt-14 md:mt-20 
                            grid grid-cols-1 md:grid-cols-2 
                            gap-8 sm:gap-10 md:gap-12
                            px-4">

                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center"
                >
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                        <DotLottieReact
                            src="/animations/contactAnimation.lottie"
                            loop
                            autoplay
                        />
                    </div>

                    <a
                        href={`https://wa.me/${import.meta.env.VITE_ADMIN_WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            w-full sm:w-auto
                            px-6 sm:px-8 
                            py-2.5 sm:py-3 
                            rounded-xl 
                            bg-green-500 text-white 
                            font-semibold 
                            flex items-center justify-center gap-2
                            hover:bg-green-600 transition-all shadow-lg cursor-pointer
                            text-sm sm:text-base
                            mt-4 sm:mt-6
                        "
                    >
                        <MessageCircle size={20} className="sm:w-[22px] sm:h-[22px]" /> 
                        Chat on WhatsApp
                    </a>

                    <style>
                        {`
            @keyframes float {
              0% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0); }
            }
            `}
                    </style>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-5 sm:space-y-6 md:space-y-8"
                >
                    <div
                        className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl 
                                   bg-white shadow-lg 
                                   border border-yellow-200 
                                   [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:border-gray-700"
                    >
                        <div className="flex gap-3 sm:gap-4 items-start">
                            <MapPin size={24} className="text-yellow-500 flex-shrink-0 sm:w-7 sm:h-7" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold 
                                              [[data-theme=dark]_&]:text-gray-200">
                                    Our Office
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700 
                                             [[data-theme=dark]_&]:text-gray-300 mt-1 break-words">
                                    Raja complex, Vathan chowk,
                                    M.S.V. High School road, Navavas,
                                    Madhapar, Bhuj - Kutch
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl 
                                   bg-white shadow-lg 
                                   border border-yellow-200 
                                   [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:border-gray-700"
                    >
                        <div className="flex gap-3 sm:gap-4 items-center">
                            <Phone size={24} className="text-yellow-500 flex-shrink-0 sm:w-7 sm:h-7" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold 
                                              [[data-theme=dark]_&]:text-gray-200">
                                    Call Us
                                </h3>
                                <a
                                    href="tel:+919876543210"
                                    className="text-sm sm:text-base text-yellow-600 
                                              [[data-theme=dark]_&]:text-yellow-400 
                                              font-semibold hover:underline"
                                >
                                    +91 98765 43210
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl 
                                   bg-white shadow-lg 
                                   border border-yellow-200 
                                   [[data-theme=dark]_&]:bg-gray-800 [[data-theme=dark]_&]:border-gray-700"
                    >
                        <div className="flex gap-3 sm:gap-4 items-center">
                            <Mail size={24} className="text-yellow-500 flex-shrink-0 sm:w-7 sm:h-7" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold 
                                              [[data-theme=dark]_&]:text-gray-200">
                                    Email Us
                                </h3>
                                <Link
                                    to="mailto:support@doordarshantravels.com"
                                    className="text-sm sm:text-base text-yellow-600 
                                              [[data-theme=dark]_&]:text-yellow-400 
                                              font-semibold hover:underline break-all"
                                >
                                    doordarshantcabs@gmail.com
                                </Link>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}