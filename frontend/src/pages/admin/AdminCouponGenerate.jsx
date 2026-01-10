import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    Edit,
    X,
    Tag,
    Calendar,
    Percent,
    Eye,
    Car,
    TrendingUp,
    Users,
} from "lucide-react";
import apiClient from "../../utils/apiClient";
import { useTheme } from "../../context/ThemeContext";

export default function AdminCoupons() {
    const { theme } = useTheme();

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [isRidesModalOpen, setIsRidesModalOpen] = useState(false);
    const [selectedCouponCode, setSelectedCouponCode] = useState(null);
    const [ridesData, setRidesData] = useState(null);
    const [loadingRides, setLoadingRides] = useState(false);

    const [form, setForm] = useState({
        name: "",
        code: "",
        expiresAt: "",
        isActive: true,
    });


    useEffect(() => {
        let intervalId = null;

        const startPolling = () => {
            if (intervalId) return; 

            fetchCoupons(true); 
            intervalId = setInterval(() => {
                fetchCoupons(false);
            }, 30000);
        };

        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                startPolling();
            } else {
                stopPolling();
            }
        };

        if (document.visibilityState === "visible") {
            startPolling();
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    async function fetchCoupons() {
        try {
            setLoading(true);
            const res = await apiClient.get("/api/v1/admin/coupons");
            setCoupons(res.data.coupons || []);
            console.log("Fetched coupons:", res.data.coupons);
        } catch (err) {
            console.error("Fetch coupons error", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCouponRides(code) {
        try {
            setLoadingRides(true);
            const res = await apiClient.get(`/api/v1/admin/coupons/${code}/rides`);
            setRidesData(res.data);
        } catch (err) {
            console.error("Fetch rides error", err);
        } finally {
            setLoadingRides(false);
        }
    }

    const formatTime = time24 => {
        if (!time24) return "";
        const [hr, mn] = time24.split(":");
        const h = parseInt(hr, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${mn} ${ampm}`;
    };

    function openRidesModal(code) {
        setSelectedCouponCode(code);
        setIsRidesModalOpen(true);
        fetchCouponRides(code);
    }

    function closeRidesModal() {
        setIsRidesModalOpen(false);
        setSelectedCouponCode(null);
        setRidesData(null);
    }

    function openCreateModal() {
        setEditingCoupon(null);
        setForm({ name: "", code: "", expiresAt: "", isActive: true });
        setIsModalOpen(true);
    }

    function openEditModal(coupon) {
        setEditingCoupon(coupon);
        setForm({
            name: coupon.name,
            code: coupon.code,
            expiresAt: coupon.expiresAt?.slice(0, 10),
            isActive: coupon.isActive,
        });
        setIsModalOpen(true);
    }



    function generateCode() {
        const base = form.name
            .replace(/\s+/g, "")
            .toUpperCase()
            .slice(0, 6);
        const percent = Math.floor(Math.random() * 40) + 10;
        setForm(prev => ({
            ...prev,
            code: `${base}${percent}`,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                isActive: form.isActive,
                expiresAt: form.expiresAt
                    ? new Date(form.expiresAt).toISOString()
                    : null,
            };

            if (editingCoupon) {
                await apiClient.put(
                    `/api/v1/admin/coupons/${editingCoupon._id}`,
                    payload
                );
            } else {
                await apiClient.post("/api/v1/admin/coupons", payload);
            }

            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            console.error("Save coupon error", err);
            alert("Failed to save coupon");
        }
    }

    async function deleteCoupon(id) {
        if (!window.confirm("Delete this coupon?")) return;

        try {
            await apiClient.delete(`/api/v1/admin/coupons/${id}`);
            fetchCoupons();
        } catch (err) {
            console.error("Delete coupon error", err);
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                            Coupon Management
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400 mt-1">
                            Create, manage and track coupon usage
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl shadow text-sm sm:text-base"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create Coupon</span>
                        <span className="sm:hidden">Create</span>
                    </motion.button>
                </div>

                {loading ? (
                    <p className="text-center py-20 text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading coupons...</p>
                ) : coupons.length === 0 ? (
                    <p className="text-center py-20 text-gray-500 [[data-theme=dark]_&]:text-gray-400">
                        No coupons created yet
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                        {coupons.map(coupon => {
                            const discount = Number(coupon.code.slice(-2));

                            return (
                                <motion.div
                                    key={coupon._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="
                                        bg-white [[data-theme=dark]_&]:bg-gray-800
                                        rounded-2xl p-4 sm:p-5 shadow border
                                        border-gray-200 [[data-theme=dark]_&]:border-gray-700
                                        hover:shadow-lg transition-shadow
                                    "
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 [[data-theme=dark]_&]:text-white truncate">
                                                {coupon.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 mt-0.5">
                                                Code: <span className="font-semibold">{coupon.code}</span>
                                            </p>
                                        </div>

                                        <span
                                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${coupon.isActive
                                                ? "bg-green-100 text-green-700 [[data-theme=dark]_&]:bg-green-900 [[data-theme=dark]_&]:text-green-300"
                                                : "bg-red-100 text-red-700 [[data-theme=dark]_&]:bg-red-900 [[data-theme=dark]_&]:text-red-300"
                                                }`}
                                        >
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                                        <p className="flex items-center gap-2">
                                            <Percent size={14} className="text-yellow-500" />
                                            <span className="font-semibold">{discount}%</span> Discount
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar size={14} className="text-blue-500" />
                                            {coupon.expiresAt
                                                ? new Date(coupon.expiresAt).toLocaleDateString()
                                                : "No expiry"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Users size={14} className="text-green-500" />
                                            Used: <strong>{coupon.usedCount || 0}</strong> times
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <TrendingUp size={14} className="text-purple-500" />
                                            Total Discount: ₹<strong>{coupon.totalDiscountAmount || 0}</strong>
                                        </p>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => openRidesModal(coupon.code)}
                                            className="flex-1 px-2 sm:px-3 py-2 bg-yellow-500 hover:bg-yellow-600 [[data-theme=dark]_&]:bg-yellow-600 [[data-theme=dark]_&]:hover:bg-yellow-700 text-white rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors"
                                            title="View Rides"
                                        >
                                            <Eye size={14} />
                                            <span className="hidden sm:inline">Rides</span>
                                        </button>

                                        <button
                                            onClick={() => openEditModal(coupon)}
                                            className="flex-1 px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 [[data-theme=dark]_&]:bg-blue-600 [[data-theme=dark]_&]:hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors"
                                        >
                                            <Edit size={14} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>

                                        <button
                                            onClick={() => deleteCoupon(coupon._id)}
                                            className="px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 [[data-theme=dark]_&]:bg-red-600 [[data-theme=dark]_&]:hover:bg-red-700 text-white rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onSubmit={handleSubmit}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl bg-white [[data-theme=dark]_&]:bg-gray-800 border border-gray-200 [[data-theme=dark]_&]:border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-5 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                                    {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700 transition-colors"
                                >
                                    <X size={20} className="text-gray-600 [[data-theme=dark]_&]:text-gray-300" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                                        Coupon Name
                                    </label>
                                    <input
                                        className="checkout-input w-full"
                                        placeholder="e.g. New Year Offer"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                                        Coupon Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            className="checkout-input flex-1"
                                            placeholder="AUTO25"
                                            value={form.code}
                                            onChange={e =>
                                                setForm({ ...form, code: e.target.value.toUpperCase() })
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCode}
                                            className="px-3 sm:px-4 py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 [[data-theme=dark]_&]:bg-gray-700 [[data-theme=dark]_&]:hover:bg-gray-600 text-gray-900 [[data-theme=dark]_&]:text-white transition-colors"
                                            title="Generate Code"
                                        >
                                            <Tag size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 mt-1.5">
                                        Last 2 digits define discount % (e.g., SAVE20 = 20% off)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 [[data-theme=dark]_&]:text-gray-300">
                                        Expiry Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        className="checkout-input w-full"
                                        value={form.expiresAt || ""}
                                        onChange={e =>
                                            setForm({ ...form, expiresAt: e.target.value })
                                        }
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-gray-700 [[data-theme=dark]_&]:text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={e =>
                                            setForm({ ...form, isActive: e.target.checked })
                                        }
                                        className="w-4 h-4"
                                    />
                                    Coupon is active
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 rounded-xl font-semibold bg-yellow-400 hover:bg-yellow-500 text-black transition-colors text-sm sm:text-base"
                            >
                                {editingCoupon ? "Update Coupon" : "Create Coupon"}
                            </button>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRidesModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closeRidesModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl rounded-2xl p-5 sm:p-6 shadow-2xl bg-white [[data-theme=dark]_&]:bg-gray-800 border border-gray-200 [[data-theme=dark]_&]:border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-5 sm:mb-6">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                                        Rides with {selectedCouponCode}
                                    </h2>
                                    {ridesData && (
                                        <p className="text-xs sm:text-sm text-gray-600 [[data-theme=dark]_&]:text-gray-400 mt-1">
                                            {ridesData.totalRides} total rides
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={closeRidesModal}
                                    className="p-1 rounded-full hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700 transition-colors"
                                >
                                    <X size={20} className="text-gray-600 [[data-theme=dark]_&]:text-gray-300" />
                                </button>
                            </div>

                            {loadingRides ? (
                                <p className="text-center py-10 text-gray-600 [[data-theme=dark]_&]:text-gray-400">Loading rides...</p>
                            ) : ridesData ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 [[data-theme=dark]_&]:from-blue-900/20 [[data-theme=dark]_&]:to-blue-800/20 rounded-xl p-3 sm:p-4 border border-blue-200 [[data-theme=dark]_&]:border-blue-800">
                                            <p className="text-xs sm:text-sm text-blue-600 [[data-theme=dark]_&]:text-blue-400 font-medium">Total Rides</p>
                                            <p className="text-xl sm:text-2xl font-bold text-blue-900 [[data-theme=dark]_&]:text-blue-100 mt-1">
                                                {ridesData.totalRides}
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 [[data-theme=dark]_&]:from-green-900/20 [[data-theme=dark]_&]:to-green-800/20 rounded-xl p-3 sm:p-4 border border-green-200 [[data-theme=dark]_&]:border-green-800">
                                            <p className="text-xs sm:text-sm text-green-600 [[data-theme=dark]_&]:text-green-400 font-medium">Total Discount</p>
                                            <p className="text-xl sm:text-2xl font-bold text-green-900 [[data-theme=dark]_&]:text-green-100 mt-1">
                                                ₹{ridesData.totalDiscount}
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 [[data-theme=dark]_&]:from-purple-900/20 [[data-theme=dark]_&]:to-purple-800/20 rounded-xl p-3 sm:p-4 border border-purple-200 [[data-theme=dark]_&]:border-purple-800">
                                            <p className="text-xs sm:text-sm text-purple-600 [[data-theme=dark]_&]:text-purple-400 font-medium">Total Revenue</p>
                                            <p className="text-xl sm:text-2xl font-bold text-purple-900 [[data-theme=dark]_&]:text-purple-100 mt-1">
                                                ₹{ridesData.totalRevenue}
                                            </p>
                                        </div>
                                    </div>

                                    {ridesData.rides.length === 0 ? (
                                        <p className="text-center py-10 text-gray-500 [[data-theme=dark]_&]:text-gray-400">
                                            No rides found with this coupon
                                        </p>
                                    ) : (
                                        <div className="space-y-3 sm:space-y-4">
                                            {ridesData.rides.map((ride, idx) => (
                                                <div
                                                    key={ride._id || idx}
                                                    className="bg-gray-50 [[data-theme=dark]_&]:bg-gray-700/50 rounded-xl p-3 sm:p-4 border border-gray-200 [[data-theme=dark]_&]:border-gray-600"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Car size={16} className="text-yellow-500 flex-shrink-0" />
                                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 [[data-theme=dark]_&]:text-white truncate">
                                                                    {ride.carName || "N/A"}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-600 [[data-theme=dark]_&]:text-gray-400 truncate">
                                                                {ride.pickupName || ride.pickup} → {ride.dropName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-500 mt-0.5">
                                                                {new Date(ride.date || ride.createdAt).toLocaleDateString()} - {formatTime(ride.time) || ""}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-600 [[data-theme=dark]_&]:text-gray-400">Discount</p>
                                                                <p className="text-sm font-bold text-green-600 [[data-theme=dark]_&]:text-green-400">
                                                                    -₹{ride.coupon?.discountAmount || 0}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-600 [[data-theme=dark]_&]:text-gray-400">Paid</p>
                                                                <p className="text-sm font-bold text-gray-900 [[data-theme=dark]_&]:text-white">
                                                                    ₹{ride.finalFare || ride.fare || 0}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}