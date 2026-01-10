import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createOrderApi, verifyPaymentApi } from "../utils/apiClientPayment";
import apiClient from "../utils/apiClient";

const CheckoutSection = ({ tripData, car }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const distance = Number(tripData?.distanceKm || 0);

    const baseFare = Number(car?.baseFare || 0);
    const serviceCharge = Number(car?.serviceCharge || 0);
    const originalGst = Number(car?.gst || 0);

    const baseAmount = baseFare + serviceCharge;
    const appliedPriceType = car?.appliedPriceType || "local";

    const [couponCode, setCouponCode] = useState("");
    const [couponData, setCouponData] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    useEffect(() => {
        setCouponCode("");
        setCouponData(null);
    }, [car?.carId, tripData?.pickup, tripData?.drop, tripData?.date, tripData?.time]);

    let discountPercent = 0;
    let discountAmount = 0;
    let discountSource = "none";

    if (couponData) {
        discountSource = "coupon";
        discountPercent = Number(couponData.discountPercent || 0);
        discountAmount = Math.round((baseAmount * discountPercent) / 100);
    } else if (user?.role) {
        discountSource = "role";
        discountPercent = user.role === "corporate" ? 10 : 5;
        discountAmount = Math.round((baseAmount * discountPercent) / 100);
    }

    const discountedBase = baseAmount - discountAmount;
    const gst = Math.round((discountedBase * 18) / 100);
    let finalFare = discountedBase + gst;

    if (finalFare < 0) finalFare = 0;

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [passengers, setPassengers] = useState(1);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.name || "");
            setPhone(user.phone || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const formatDate = d => {
        if (!d) return "";
        const [y, m, day] = d.split("-");
        return `${day}-${m}-${y}`;
    };

    const formatTime = t => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const hr = parseInt(h, 10);
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
    };

    const validate = () => {
        if (!fullName.trim()) return toast.error("Enter full name");
        if (!/^[0-9]{10}$/.test(phone))
            return toast.error("Enter valid phone number");
        if (!email.includes("@")) return toast.error("Enter valid email");
        if (passengers < 1) return toast.error("Passengers must be at least 1");
        return true;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        if (user?.role === "corporate") {
            return toast.info("Coupons are not applicable for corporate bookings");
        }

        try {
            setApplyingCoupon(true);

            const res = await apiClient.post("/api/v1/admin/coupons/validate", {
                code: couponCode.trim(),
                baseFare: baseAmount,
            });

            if (!res.data.success) {
                setCouponData(null);
                return toast.error(res.data.message || "Invalid coupon");
            }

            setCouponData(res.data.coupon);
            toast.success(`Coupon ${res.data.coupon.code} applied`);
        } catch (err) {
            setCouponData(null);
            toast.error("Failed to apply coupon");
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handlePayment = async () => {
        if (!validate()) return;
        setIsPaying(true);

        try {
            const userId = user?._id || user?.id;
            if (!userId) {
                setIsPaying(false);
                return toast.error("Login required");
            }

            if (user?.role === "corporate") {
                await apiClient.post("/api/v1/corporate/ride/init", {
                    rideDetails: {
                        pickup: tripData.pickup,
                        drop: tripData.drop,
                        distanceKm: tripData.distanceKm,
                        durationMinutes: tripData.durationMinutes,
                        date: tripData.date,
                        time: tripData.time,
                        rideType: tripData.tripType,
                        passengers,
                        carId: car?.carId,
                        carName: car?.name,
                        expectedFare: finalFare,
                    },
                });

                setTimeout(() => {
                    toast.info("Please contact admin for final pricing.");
                }, 500);
                return navigate("/corporate-negotiation");
            }

            const amount = Math.round(finalFare * 100);

            const rideDetails = {
                userId,
                pickup: tripData.pickup,
                drop: tripData.drop,
                distanceKm: tripData.distanceKm,
                durationMinutes: tripData.durationMinutes,
                date: tripData.date,
                time: tripData.time,
                rideType: tripData.tripType,
                passengers,
                fare: discountedBase,
                finalFare: finalFare,
                gst: gst,
                discount: discountAmount,
                carName: car?.name,
                carId: car?.carId,
                coupon: couponData
                    ? {
                        code: couponData.code,
                        discountPercent,
                        discountAmount,
                    }
                    : null,
            };

            const orderRes = await createOrderApi({
                amount,
                userId,
                rideDetails,
            });

            if (!orderRes.data.success) {
                setIsPaying(false);
                return toast.error("Failed to start payment");
            }

            const { order, key } = orderRes.data;

            const razor = new window.Razorpay({
                key,
                amount: order.amount,
                currency: "INR",
                name: "Durdarshan Travels",
                description: "Ride Payment",
                order_id: order.id,
                handler: async response => {

                    const verifyRes = await verifyPaymentApi({
                        ...response,
                        userId,
                    });

                    if (verifyRes.data.success) {
                        toast.success("Payment Successful!");
                        navigate("/bookings");
                    } else {
                        toast.error("Payment verification failed");
                        setIsPaying(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.info("Payment cancelled");
                        setIsPaying(false);
                    },
                },
                prefill: { name: fullName, contact: phone, email },
                theme: { color: "#FACC15" },
            });

            razor.open();
            toast.success("Redirecting to payment...");
        } catch (err) {
            toast.error("Payment Failed");
            setIsPaying(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="
                max-w-6xl mx-auto my-6 sm:my-8 md:my-10 lg:my-12
                p-3 sm:p-4 md:p-6 lg:p-8
                rounded-2xl sm:rounded-3xl
                bg-white [[data-theme=dark]_&]:bg-gray-900
                border border-gray-200 [[data-theme=dark]_&]:border-gray-700
                shadow-lg
            "
        >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-4 sm:mb-5 md:mb-6">
                Confirm Your Booking
            </h2>

            <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-yellow-100 text-black [[data-theme=dark]_&]:text-gray-200
                [[data-theme=dark]_&]:from-gray-700 [[data-theme=dark]_&]:to-gray-800 mb-5 sm:mb-6 md:mb-7 text-sm sm:text-base space-y-1 sm:space-y-2">
                <p className="break-words"><strong>From:</strong> {tripData.pickup.name}</p>
                <p className="break-words"><strong>To:</strong> {tripData.drop.name}</p>
                <p className="flex flex-wrap gap-1">
                    <span><strong>Date:</strong> {formatDate(tripData.date)}</span>
                    <span>•</span>
                    <span><strong>Time:</strong> {formatTime(tripData.time)}</span>
                </p>
                <p className="flex flex-wrap gap-1 mt-1">
                    <span><strong>Distance:</strong> {distance} km</span>
                    <span>•</span>
                    <span><strong>Type:</strong> <span className="capitalize">{appliedPriceType}</span></span>
                </p>
            </div>

            <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-yellow-100 to-white text-black [[data-theme=dark]_&]:text-gray-200
                [[data-theme=dark]_&]:from-gray-700 [[data-theme=dark]_&]:to-gray-800 mb-5 sm:mb-6 md:mb-7 text-sm sm:text-base">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Base Fare</span>
                        <span className="font-medium">₹{baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Service Charge</span>
                        <span className="font-medium">₹{serviceCharge}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-300 [[data-theme=dark]_&]:border-gray-600">
                        <span>Subtotal (Before Tax)</span>
                        <span>₹{baseAmount}</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium flex-wrap gap-1">
                            <span className="break-words">
                                {discountSource === "coupon"
                                    ? `Coupon Discount (${couponData.code}) - ${discountPercent}%`
                                    : `${discountPercent}% Discount`}
                            </span>
                            <span className="whitespace-nowrap">- ₹{discountAmount}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-semibold">
                        <span>Subtotal After Discount</span>
                        <span>₹{discountedBase}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-300 [[data-theme=dark]_&]:border-gray-600">
                        <span>GST (18%)</span>
                        <span className="font-medium">₹{gst}</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-400 [[data-theme=dark]_&]:border-gray-500">
                    <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold">Final Amount</span>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-500">
                            ₹{finalFare}
                        </span>
                    </div>
                </div>
            </div>

            {user?.role !== "corporate" && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5 sm:mb-6">
                    <input
                        className="checkout-input flex-1 text-sm sm:text-base"
                        placeholder="Enter coupon code (optional)"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        disabled={couponData !== null}
                    />
                    <button
                        onClick={applyCoupon}
                        disabled={applyingCoupon || couponData !== null}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base whitespace-nowrap
                            ${couponData !== null
                                ? 'bg-green-500 text-white cursor-default'
                                : 'bg-gray-200 hover:bg-gray-300 text-black'
                            }`}
                    >
                        {couponData !== null ? "Applied ✓" : (applyingCoupon ? "Applying..." : "Apply")}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <input
                    className="checkout-input text-sm sm:text-base"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                />
                <input
                    className="checkout-input text-sm sm:text-base"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
                <input
                    className="checkout-input text-sm sm:text-base"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="number"
                    className="checkout-input text-sm sm:text-base"
                    min="1"
                    placeholder="Passengers"
                    value={passengers}
                    onChange={e => setPassengers(e.target.value)}
                />
            </div>

            <button
                onClick={handlePayment}
                disabled={isPaying}
                className={`mt-6 sm:mt-7 md:mt-8 w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg ${isPaying ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
            >
                {isPaying ? "Processing..." : "Proceed to Pay"}
            </button>
        </motion.section>
    );
};

export default CheckoutSection;