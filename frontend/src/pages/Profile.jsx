import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { updateProfileApi } from "../utils/authApiClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getMe } from "../utils/authApiClient";

const Profile = () => {
  const { theme } = useTheme();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [state, setState] = useState(user?.state || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function reloadUser() {
      try {
        const { data } = await getMe();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (error){ 
        console.log("reload user error:", error);
      }
    }
    if (!user) return;
    reloadUser();
  }, []);

  const handleSave = async () => {
    if (name.length < 3) return toast.error("Name must be at least 3 characters");
    if (!/^[0-9]{10}$/.test(phone)) return toast.error("Enter valid phone number");
    if (!/^[0-9]{6}$/.test(pincode)) return toast.error("Enter valid pincode");
    if (state.length < 2) return toast.error("State must be at least 2 characters");
    if (address.length < 10) return toast.error("Address must be at least 10 characters");

    setSaving(true);

    try {
      const { data } = await updateProfileApi({ name, phone, address, state, pincode });

      if (!data.success) {
        return toast.error(data.message);
      }

      setUser(data.user);
      toast.success("Profile Updated!");

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");

      if (redirectTo) {
        setTimeout(() => navigate("/" + redirectTo), 600);
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    }

    setSaving(false);
  };


  return (
    <div
      className={`min-h-screen 
                  px-4 sm:px-6 md:px-8 lg:px-10
                  py-6 sm:py-8 md:py-10
                  transition-colors duration-500 ${theme === "dark"
        ? "bg-gray-900 text-white"
        : "bg-yellow-50 text-gray-900"
        }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto 
                   bg-white/80 dark:bg-gray-800/50 
                   p-5 sm:p-6 md:p-8 lg:p-10
                   rounded-2xl sm:rounded-3xl 
                   shadow-xl backdrop-blur-md 
                   border border-yellow-400/30"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center 
                       text-2xl sm:text-3xl font-bold flex-shrink-0"
            style={{
              background: theme === "dark" ? "#FFD84C" : "#1F2937",
              color: theme === "dark" ? "#000" : "#FFD84C",
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
              Your Profile
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 break-all">
              Email: {user?.email}
            </p>

            {user?.role === "corporate" && (
              <p className="mt-2 px-3 py-1 bg-yellow-100 text-blue-700 rounded-full text-xs sm:text-sm inline-block">
                Corporate User
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">
              Full Name
            </label>
            <input
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                         border border-gray-300 dark:border-gray-700 
                         bg-transparent
                         text-sm sm:text-base
                         focus:ring-2 focus:ring-yellow-400 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                         border border-gray-300 dark:border-gray-700 
                         bg-transparent
                         text-sm sm:text-base
                         focus:ring-2 focus:ring-yellow-400 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">
              State
            </label>
            <input
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                         border border-gray-300 dark:border-gray-700 
                         bg-transparent
                         text-sm sm:text-base
                         focus:ring-2 focus:ring-yellow-400 outline-none"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
          </div>

          <div>
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">
              Pincode
            </label>
            <input
              type="text"
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                         border border-gray-300 dark:border-gray-700 
                         bg-transparent
                         text-sm sm:text-base
                         focus:ring-2 focus:ring-yellow-400 outline-none"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              maxLength={6}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1.5 sm:mb-2 text-sm sm:text-base font-medium">
              Address
            </label>
            <textarea
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                         border border-gray-300 dark:border-gray-700 
                         bg-transparent
                         text-sm sm:text-base
                         focus:ring-2 focus:ring-yellow-400 outline-none
                         resize-none"
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House No, Area, etc."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer mt-5 sm:mt-6 w-full 
                     py-2.5 sm:py-3 
                     rounded-lg sm:rounded-xl 
                     bg-yellow-400 text-black font-semibold
                     hover:bg-yellow-500 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-sm sm:text-base"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="bg-yellow-400 text-black 
                   px-5 sm:px-6 
                   py-2.5 sm:py-3 
                   rounded-full font-semibold
                   flex items-center justify-center gap-2 cursor-pointer
                   hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
                   transition-all 
                   mx-auto my-4 sm:my-5
                   text-sm sm:text-base
                   w-full sm:w-auto
                   max-w-xs sm:max-w-none"
        onClick={() => navigate("/#booking-section")}
      >
        Book Your Ride Now
      </motion.button>
    </div>
  );
};

export default Profile;